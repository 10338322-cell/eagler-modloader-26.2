package eaglermodloader.runtime;

import java.util.function.Supplier;

/** One entrypoint of a built-in mod. Created lazily and once, like Fabric's default language adapter. */
public final class EmlEntrypoint {
	public final String modId;
	public final String value;
	private final Supplier<Object> factory;
	private Object instance;
	private boolean made;
	/** For "main" entrypoints: already run (see EmlHooks). */
	public boolean ran;

	public EmlEntrypoint(String modId, String value, Supplier<Object> factory) {
		this.modId = modId;
		this.value = value;
		this.factory = factory;
	}

	public synchronized Object get() {
		if (!made) {
			instance = factory.get();
			made = true;
		}
		return instance;
	}
}
