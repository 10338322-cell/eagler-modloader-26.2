package eaglermodloader.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import eaglermodloader.runtime.EmlHooks;

/**
 * Runs the mods' "main" entrypoints before the game bootstraps its registries. This also covers the
 * singleplayer server, which runs in its own worker and calls Bootstrap.bootStrap() there.
 */
@Mixin(targets = "net.minecraft.server.Bootstrap")
public abstract class BootstrapMixin {
	@Inject(method = "bootStrap", at = @At("HEAD"))
	private static void eml$startCommon(CallbackInfo ci) {
		EmlHooks.startCommon();
	}
}
