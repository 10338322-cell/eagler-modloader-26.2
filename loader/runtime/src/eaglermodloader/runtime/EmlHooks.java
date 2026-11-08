package eaglermodloader.runtime;

import java.io.File;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.api.ModInitializer;
import net.fabricmc.loader.impl.FabricLoaderImpl;

/**
 * Where the game hands control to the mods. Called from mixins in the built-in "eaglermodloader" mod:
 * startCommon() at the start of Bootstrap.bootStrap() (client and singleplayer server worker), and
 * startClient() in the Minecraft constructor, the same place Fabric Loader starts client mods.
 */
public final class EmlHooks {
	private static boolean common, client;

	private EmlHooks() {
	}

	public static void startCommon() {
		if (common) return;
		common = true;
		System.out.println("[eagler-modloader] " + FabricLoaderImpl.INSTANCE.containers().size() + " built-in mods (Fabric Loader " + FabricLoaderImpl.VERSION + ")");
		runMain();
	}

	/**
	 * Runs every "main" entrypoint that hasn't run yet. The client bootstraps (and so runs the common
	 * ones) before the Minecraft constructor adds the client-only mods, whose "main" entrypoints then run here.
	 */
	private static void runMain() {
		RuntimeException err = null;
		for (EmlEntrypoint e : GeneratedMods.entrypoints("main")) {
			if (e.ran) continue;
			e.ran = true;
			try {
				Object o = e.get();
				if (o instanceof ModInitializer) ((ModInitializer) o).onInitialize();
			} catch (Throwable t) {
				if (err == null) err = new RuntimeException("Could not execute entrypoint stage 'main' due to errors, provided by '" + e.modId + "'", t);
				else err.addSuppressed(t);
			}
		}
		if (err != null) throw err;
	}

	public static void startClient(File runDir, Object game) {
		if (client) return;
		client = true;
		FabricLoaderImpl.INSTANCE.setGameInstance(game);
		GeneratedMods.enableClient();
		startCommon();
		runMain(); // client-only mods' "main" entrypoints
		FabricLoaderImpl.INSTANCE.invokeEntrypoints("client", ClientModInitializer.class, ClientModInitializer::onInitializeClient);
	}
}
