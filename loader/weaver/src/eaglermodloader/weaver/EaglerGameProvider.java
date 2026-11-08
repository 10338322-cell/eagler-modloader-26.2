package eaglermodloader.weaver;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import net.fabricmc.loader.impl.game.GameProvider;
import net.fabricmc.loader.impl.game.patch.GameTransformer;
import net.fabricmc.loader.impl.launch.FabricLauncher;
import net.fabricmc.loader.impl.metadata.BuiltinModMetadata;
import net.fabricmc.loader.impl.util.Arguments;

/**
 * Presents the compiled Eaglercraft 26.2 game to Fabric Loader as "minecraft 26.2".
 *
 * Only used at build time: Fabric Loader discovers the mods, resolves their dependencies, and applies
 * class tweakers, access wideners and mixins to the game exactly as it would at startup. The weaver
 * then writes the transformed classes out for TeaVM. The game is never launched, and no game patches
 * are made here (the source is patched to call our runtime hooks instead).
 *
 * System properties: eml.gameJar (compiled game classes jar), eml.gameLibs (its libraries,
 * path-separated), eml.gameVersion (default 26.2), eml.runDir.
 */
public final class EaglerGameProvider implements GameProvider {
	private final List<Path> gameJars = new ArrayList<>();
	private final List<Path> libs = new ArrayList<>();
	private Arguments arguments;

	@Override public String getGameId() { return "minecraft"; }
	@Override public String getGameName() { return "Minecraft (Eaglercraft)"; }
	@Override public String getRawGameVersion() { return System.getProperty("eml.gameVersion", "26.2"); }
	@Override public String getNormalizedGameVersion() { return getRawGameVersion(); }

	@Override
	public Collection<BuiltinMod> getBuiltinMods() {
		BuiltinModMetadata.Builder md = new BuiltinModMetadata.Builder(getGameId(), getNormalizedGameVersion()).setName("Minecraft");
		return Collections.singletonList(new BuiltinMod(gameJars, md.build()));
	}

	@Override public String getEntrypoint() { return "net.minecraft.client.main.Main"; }
	@Override public Path getLaunchDirectory() { return Paths.get(System.getProperty("eml.runDir", ".")); }
	@Override public boolean requiresUrlClassLoader() { return false; }

	private static final Set<BuiltinTransform> GAME = EnumSet.of(BuiltinTransform.WIDEN_ALL_PACKAGE_ACCESS, BuiltinTransform.CLASS_TWEAKS);
	private static final Set<BuiltinTransform> MOD = EnumSet.of(BuiltinTransform.STRIP_ENVIRONMENT);

	@Override
	public Set<BuiltinTransform> getBuiltinTransforms(String className) {
		// Same rule as Fabric's Minecraft provider: the game's own packages get package access widened
		// to public plus class tweakers; everything else (mods) gets environment stripping.
		boolean game = className.startsWith("net.minecraft.") || className.startsWith("com.mojang.blaze3d.")
				|| className.startsWith("com.mojang.math.") || className.startsWith("com.mojang.realmsclient.");
		return game ? GAME : MOD;
	}

	@Override public boolean isEnabled() { return System.getProperty("eml.gameJar") != null; }

	@Override
	public boolean locateGame(FabricLauncher launcher, String[] args) {
		arguments = new Arguments();
		arguments.parse(args);
		Path jar = Paths.get(System.getProperty("eml.gameJar")).toAbsolutePath().normalize();
		if (!Files.exists(jar)) return false;
		gameJars.add(jar);
		String l = System.getProperty("eml.gameLibs", "");
		for (String p : l.split(File.pathSeparator)) {
			if (p.isEmpty()) continue;
			Path lp = Paths.get(p).toAbsolutePath().normalize();
			if (Files.exists(lp)) libs.add(lp);
		}
		return true;
	}

	@Override
	public void initialize(FabricLauncher launcher) {
		List<Path> parent = new ArrayList<>();
		for (String p : System.getProperty("java.class.path").split(File.pathSeparator)) {
			Path cp = Paths.get(p).toAbsolutePath().normalize();
			if (Files.exists(cp)) parent.add(cp);
		}
		launcher.setValidParentClassPath(parent);
		transformer.locateEntrypoints(launcher, gameJars);
	}

	/** No game patches (the hooks are mixins in the built-in eaglermodloader mod), but Knot still needs an initialized transformer. */
	private final GameTransformer transformer = new GameTransformer();

	@Override public GameTransformer getEntrypointTransformer() { return transformer; }

	@Override
	public void unlockClassPath(FabricLauncher launcher) {
		for (Path p : gameJars) launcher.addToClassPath(p);
		for (Path p : libs) launcher.addToClassPath(p);
	}

	@Override
	public void launch(ClassLoader loader) {
		throw new UnsupportedOperationException("the Eaglercraft game provider is for build-time weaving only");
	}

	@Override public Arguments getArguments() { return arguments; }
	@Override public String[] getLaunchArguments(boolean sanitize) { return new String[0]; }
	@Override public boolean canOpenErrorGui() { return false; }
	@Override public boolean hasAwtSupport() { return false; }
}
