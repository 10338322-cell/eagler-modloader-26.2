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
		FabricLoaderImpl.INSTANCE.invokeEntrypoints("main", ModInitializer.class, ModInitializer::onInitialize);
	}

	public static void startClient(File runDir, Object game) {
		if (client) return;
		client = true;
		FabricLoaderImpl.INSTANCE.setGameInstance(game);
		startCommon();
		FabricLoaderImpl.INSTANCE.invokeEntrypoints("client", ClientModInitializer.class, ClientModInitializer::onInitializeClient);
	}
}
