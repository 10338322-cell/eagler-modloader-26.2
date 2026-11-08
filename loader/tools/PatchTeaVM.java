import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassVisitor;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.Label;
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;

/**
 * Makes TeaVM's NullCheckInsertion skip methods it can't handle instead of failing the whole build.
 * TeaVM's SSA update trips over some bytecode that mixins produce (e.g. a MixinExtras @Local written
 * back inside a try block) and reports only "Variable used before definition". Such methods are now
 * left without explicit null checks (a null dereference there traps instead of throwing an NPE) and
 * named in the build log.
 * Usage: java PatchTeaVM NullCheckInsertion.class (patched in place)
 */
public class PatchTeaVM {
	static final String CLS = "org/teavm/model/transformation/NullCheckInsertion";
	static final String DESC = "(Lorg/teavm/model/Program;Lorg/teavm/model/MethodReference;)V";

	public static void main(String[] args) throws Exception {
		Path p = Paths.get(args[0]);
		ClassReader cr = new ClassReader(Files.readAllBytes(p));
		ClassWriter cw = new ClassWriter(0);
		cr.accept(new ClassVisitor(Opcodes.ASM9, cw) {
			@Override
			public MethodVisitor visitMethod(int access, String name, String desc, String sig, String[] ex) {
				if (name.equals("transformProgram") && desc.equals(DESC)) name = "transformProgram$orig";
				return super.visitMethod(access, name, desc, sig, ex);
			}

			@Override
			public void visitEnd() {
				// transformProgram(p, m): try the real pass on a copy first; if TeaVM's own SSA update fails
				// on it, leave this method without explicit null checks instead of failing the whole build
				final String PROGRAM = "org/teavm/model/Program", REF = "org/teavm/model/MethodReference";
				MethodVisitor mv = super.visitMethod(Opcodes.ACC_PUBLIC, "transformProgram", DESC, null, null);
				mv.visitCode();
				Label start = new Label(), end = new Label(), handler = new Label(), after = new Label();
				mv.visitTryCatchBlock(start, end, handler, "java/lang/Throwable");
				mv.visitLabel(start);
				mv.visitVarInsn(Opcodes.ALOAD, 0);
				mv.visitVarInsn(Opcodes.ALOAD, 1);
				mv.visitMethodInsn(Opcodes.INVOKESTATIC, "org/teavm/model/util/ProgramUtils", "copy", "(Lorg/teavm/model/ProgramReader;)Lorg/teavm/model/Program;", false);
				mv.visitVarInsn(Opcodes.ALOAD, 2);
				mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, CLS, "transformProgram$orig", DESC, false);
				mv.visitLabel(end);
				mv.visitJumpInsn(Opcodes.GOTO, after);
				mv.visitLabel(handler);
				mv.visitFrame(Opcodes.F_FULL, 3, new Object[] { CLS, PROGRAM, REF }, 1, new Object[] { "java/lang/Throwable" });
				mv.visitVarInsn(Opcodes.ASTORE, 3);
				mv.visitFieldInsn(Opcodes.GETSTATIC, "java/lang/System", "err", "Ljava/io/PrintStream;");
				mv.visitTypeInsn(Opcodes.NEW, "java/lang/StringBuilder");
				mv.visitInsn(Opcodes.DUP);
				mv.visitLdcInsn("[eagler-modloader] TeaVM can't add null checks to ");
				mv.visitMethodInsn(Opcodes.INVOKESPECIAL, "java/lang/StringBuilder", "<init>", "(Ljava/lang/String;)V", false);
				mv.visitVarInsn(Opcodes.ALOAD, 2);
				mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(Ljava/lang/Object;)Ljava/lang/StringBuilder;", false);
				mv.visitLdcInsn(" (left without them): ");
				mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(Ljava/lang/String;)Ljava/lang/StringBuilder;", false);
				mv.visitVarInsn(Opcodes.ALOAD, 3);
				mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(Ljava/lang/Object;)Ljava/lang/StringBuilder;", false);
				mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/lang/StringBuilder", "toString", "()Ljava/lang/String;", false);
				mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/io/PrintStream", "println", "(Ljava/lang/String;)V", false);
				mv.visitInsn(Opcodes.RETURN);
				mv.visitLabel(after);
				mv.visitFrame(Opcodes.F_FULL, 3, new Object[] { CLS, PROGRAM, REF }, 0, new Object[0]);
				mv.visitVarInsn(Opcodes.ALOAD, 0);
				mv.visitVarInsn(Opcodes.ALOAD, 1);
				mv.visitVarInsn(Opcodes.ALOAD, 2);
				mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, CLS, "transformProgram$orig", DESC, false);
				mv.visitInsn(Opcodes.RETURN);
				mv.visitMaxs(4, 4);
				mv.visitEnd();
				super.visitEnd();
			}
		}, 0);
		Files.write(p, cw.toByteArray());
		System.out.println("[patch-teavm] NullCheckInsertion skips (and names) methods it can't handle");
	}
}
