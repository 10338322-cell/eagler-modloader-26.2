package eaglermodloader.weaver;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.tree.AnnotationNode;
import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.MethodNode;

/**
 * Turns off individual mixin injectors that don't fit Eaglercraft's version of the game.
 *
 * Eaglercraft changes some of Minecraft's code, so a few injections that work on vanilla 26.2 find no
 * target, or a target with a different shape. Fabric would refuse to start; here the build disables
 * just that injector (removes its annotation so it becomes an ordinary unused method), reports it,
 * and weaves again. Everything else in the mod keeps working.
 *
 * Entries (one per line in the disable file): "mixin.class.Name#handlerMethod", or "mixin.class.Name#*"
 * to drop every injector of that mixin.
 */
final class MixinDisabler {
	private final Map<String, Set<String>> disabled = new HashMap<>(); // internal class name -> methods ("*" = all)

	MixinDisabler(List<String> entries) {
		for (String e : entries) {
			e = e.trim();
			if (e.isEmpty() || e.startsWith("#")) continue;
			int i = e.indexOf('#');
			if (i < 0) continue;
			disabled.computeIfAbsent(e.substring(0, i).replace('.', '/'), k -> new HashSet<>()).add(e.substring(i + 1));
		}
	}

	boolean isEmpty() {
		return disabled.isEmpty();
	}

	/** Copies every jar in from/ to to/, with the disabled injectors removed (also inside nested jars). */
	void patchMods(Path from, Path to) throws IOException {
		Files.createDirectories(to);
		try (Stream<Path> s = Files.list(from)) {
			for (Path jar : (Iterable<Path>) s::iterator) {
				if (!jar.toString().endsWith(".jar")) continue;
				Files.write(to.resolve(jar.getFileName()), patchJar(Files.readAllBytes(jar)));
			}
		}
	}

	private byte[] patchJar(byte[] jar) throws IOException {
		ByteArrayOutputStream bo = new ByteArrayOutputStream(jar.length);
		try (ZipInputStream in = new ZipInputStream(new ByteArrayInputStream(jar)); ZipOutputStream out = new ZipOutputStream(bo)) {
			ZipEntry e;
			while ((e = in.getNextEntry()) != null) {
				byte[] data = readAll(in);
				String n = e.getName();
				if (n.endsWith(".class")) {
					Set<String> methods = disabled.get(n.substring(0, n.length() - 6));
					if (methods != null) data = patchClass(data, methods);
				} else if (n.startsWith("META-INF/jars/") && n.endsWith(".jar")) {
					data = patchJar(data);
				}
				out.putNextEntry(new ZipEntry(n));
				out.write(data);
				out.closeEntry();
			}
		}
		return bo.toByteArray();
	}

	private static byte[] patchClass(byte[] data, Set<String> methods) {
		ClassNode cn = new ClassNode();
		new ClassReader(data).accept(cn, 0);
		boolean all = methods.contains("*");
		for (MethodNode m : cn.methods) {
			if (all || methods.contains(m.name)) {
				m.visibleAnnotations = strip(m.visibleAnnotations);
				m.invisibleAnnotations = strip(m.invisibleAnnotations);
				// MixinExtras sugar on the parameters (@Local, @Share) only makes sense on an injector
				m.visibleParameterAnnotations = stripParams(m.visibleParameterAnnotations);
				m.invisibleParameterAnnotations = stripParams(m.invisibleParameterAnnotations);
			}
		}
		ClassWriter cw = new ClassWriter(0);
		cn.accept(cw);
		return cw.toByteArray();
	}

	/** Removes injector annotations and MixinExtras ones (@Definition, @Expression, ...); null if none are left. */
	private static List<AnnotationNode> strip(List<AnnotationNode> list) {
		if (list == null) return null;
		for (Iterator<AnnotationNode> it = list.iterator(); it.hasNext(); ) {
			String d = it.next().desc;
			if (d.startsWith("Lorg/spongepowered/asm/mixin/injection/") || d.startsWith("Lcom/llamalad7/mixinextras/")) {
				it.remove();
			}
		}
		return list.isEmpty() ? null : list;
	}

	private static List<AnnotationNode>[] stripParams(List<AnnotationNode>[] params) {
		if (params == null) return null;
		boolean any = false;
		for (int i = 0; i < params.length; i++) {
			params[i] = strip(params[i]);
			any |= params[i] != null;
		}
		return any ? params : null;
	}

	private static byte[] readAll(InputStream in) throws IOException {
		ByteArrayOutputStream bo = new ByteArrayOutputStream();
		byte[] buf = new byte[16384];
		int n;
		while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
		return bo.toByteArray();
	}

	static List<String> readList(Path file) throws IOException {
		return Files.exists(file) ? new ArrayList<>(Files.readAllLines(file, StandardCharsets.UTF_8)) : new ArrayList<>();
	}
}
