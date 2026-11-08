package eaglermodloader.mixin;

import java.io.File;

import org.objectweb.asm.Opcodes;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import eaglermodloader.runtime.EmlHooks;

/** Starts client mods in the Minecraft constructor, right after the game directory is set (as Fabric does). */
@Mixin(targets = "net.minecraft.client.Minecraft")
public abstract class MinecraftMixin {
	@Shadow @Final public File gameDirectory;

	@Inject(method = "<init>", at = @At(value = "FIELD", target = "Lnet/minecraft/client/Minecraft;gameDirectory:Ljava/io/File;", opcode = Opcodes.PUTFIELD, shift = At.Shift.AFTER))
	private void eml$startClient(CallbackInfo ci) {
		EmlHooks.startClient(this.gameDirectory, this);
	}
}
