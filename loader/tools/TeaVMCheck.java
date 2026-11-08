import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

import org.teavm.asm.ClassReader;
import org.teavm.asm.tree.ClassNode;
import org.teavm.asm.tree.MethodNode;
import org.teavm.model.MethodDescriptor;
import org.teavm.model.MethodReference;
import org.teavm.model.Program;
import org.teavm.model.ReferenceCache;
import org.teavm.model.transformation.NullCheckFilter;
import org.teavm.model.transformation.NullCheckInsertion;
import org.teavm.parsing.Parser;

/**
 * Diagnostic: runs the browser compiler's (TeaVM's) bytecode parser and null-check pass over each
 * method of the given classes, and names the methods it chokes on. The full link only reports
 * "Variable used before definition" without saying where.
 * Usage: java -cp teavm-tool-classpath:. TeaVMCheck CLASSES_DIR [all]
 */
public class TeaVMCheck {
	public static void main(String[] args) throws Exception {
		Path dir = Paths.get(args[0]);
		boolean all = args.length > 1 && args[1].equals("all");
		ReferenceCache cache = new ReferenceCache();
		int classes = 0, methods = 0, bad = 0;
		try (Stream<Path> s = Files.walk(dir)) {
			for (Path p : (Iterable<Path>) s.filter(x -> x.toString().endsWith(".class"))::iterator) {
				byte[] b = Files.readAllBytes(p);
				if (!all && !new String(b, java.nio.charset.StandardCharsets.ISO_8859_1).contains("MixinMerged")) continue;
				ClassNode cn = new ClassNode();
				new ClassReader(b).accept(cn, 0);
				classes++;
				for (MethodNode m : cn.methods) {
					if (m.instructions == null || m.instructions.size() == 0) continue;
					methods++;
					try {
						org.teavm.model.MethodHolder mh = new Parser(cache).parseMethod(m, cn.name.replace('/', '.'));
						Program prog = mh.getProgram();
						if (prog == null) continue;
						new NullCheckInsertion(NullCheckFilter.EMPTY).transformProgram(prog,
								new MethodReference(cn.name.replace('/', '.'), MethodDescriptor.parse(m.name + m.desc)));
					} catch (Throwable t) {
						if (bad++ < 60) System.out.println("[teavm-check] " + cn.name.replace('/', '.') + "." + m.name + m.desc + ": " + t);
					}
				}
			}
		}
		System.out.println("[teavm-check] " + classes + " classes, " + methods + " methods, " + bad + " problems");
	}
}
