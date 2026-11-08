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
 * Diagnostic: makes TeaVM's NullCheckInsertion.transformProgram say which method it failed on.
 * TeaVM otherwise reports only "Variable used before definition" for a broken method.
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
				MethodVisitor mv = super.visitMethod(Opcodes.ACC_PUBLIC, "transformProgram", DESC, null, null);
				mv.visitCode();
				Label start = new Label(), end = new Label(), handler = new Label();
				mv.visitTryCatchBlock(start, end, handler, "java/lang/Throwable");
				mv.visitLabel(start);
				mv.visitVarInsn(Opcodes.ALOAD, 0);
				mv.visitVarInsn(Opcodes.ALOAD, 1);
				mv.visitVarInsn(Opcodes.ALOAD, 2);
				mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, CLS, "transformProgram$orig", DESC, false);
				mv.visitLabel(end);
				mv.visitInsn(Opcodes.RETURN);
				mv.visitLabel(handler);
				mv.visitFrame(Opcodes.F_FULL, 3, new Object[] { CLS, "org/teavm/model/Program", "org/teavm/model/MethodReference" },
						1, new Object[] { "java/lang/Throwable" });
				mv.visitVarInsn(Opcodes.ASTORE, 3);
				mv.visitTypeInsn(Opcodes.NEW, "java/lang/RuntimeException");
				mv.visitInsn(Opcodes.DUP);
				mv.visitTypeInsn(Opcodes.NEW, "java/lang/StringBuilder");
				mv.visitInsn(Opcodes.DUP);
				mv.visitLdcInsn("TeaVM null-check insertion failed in ");
				mv.visitMethodInsn(Opcodes.INVOKESPECIAL, "java/lang/StringBuilder", "<init>", "(Ljava/lang/String;)V", false);
				mv.visitVarInsn(Opcodes.ALOAD, 2);
				mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/lang/StringBuilder", "append", "(Ljava/lang/Object;)Ljava/lang/StringBuilder;", false);
				mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/lang/StringBuilder", "toString", "()Ljava/lang/String;", false);
				mv.visitVarInsn(Opcodes.ALOAD, 3);
				mv.visitMethodInsn(Opcodes.INVOKESPECIAL, "java/lang/RuntimeException", "<init>", "(Ljava/lang/String;Ljava/lang/Throwable;)V", false);
				mv.visitInsn(Opcodes.ATHROW);
				mv.visitMaxs(6, 4);
				mv.visitEnd();
				super.visitEnd();
			}
		}, 0);
		Files.write(p, cw.toByteArray());
		System.out.println("[patch-teavm] NullCheckInsertion now names the failing method");
	}
}
