package eaglermodloader.runtime;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import net.fabricmc.loader.api.ModContainer;
import net.fabricmc.loader.api.metadata.ModMetadata;
import net.fabricmc.loader.api.metadata.ModOrigin;

/**
 * A built-in mod. Its classes were compiled into the game and its assets merged into the game's
 * resources, so it has no files of its own: getRootPaths() is empty and findPath() finds nothing.
 */
public final class EmlModContainer implements ModContainer {
	private final ModMetadata metadata;
	public final String parentId;
	public EmlModContainer parent;
	public final List<ModContainer> children = new ArrayList<>();

	public EmlModContainer(ModMetadata metadata, String parentId) {
		this.metadata = metadata;
		this.parentId = parentId;
	}

	@Override public ModMetadata getMetadata() { return metadata; }
	@Override public List<Path> getRootPaths() { return Collections.emptyList(); }
	@Override public Optional<Path> findPath(String file) { return Optional.empty(); }

	@Override
	public ModOrigin getOrigin() {
		return new ModOrigin() {
			@Override public Kind getKind() { return parent != null ? Kind.NESTED : Kind.UNKNOWN; }
			@Override public List<Path> getPaths() { throw new UnsupportedOperationException("built-in mod"); }
			@Override public String getParentModId() { return parentId; }
			@Override public String getParentSubLocation() { throw new UnsupportedOperationException("built-in mod"); }
			@Override public String toString() { return "built into the game"; }
		};
	}

	@Override public Optional<ModContainer> getContainingMod() { return Optional.ofNullable(parent); }
	@Override public Collection<ModContainer> getContainedMods() { return Collections.unmodifiableList(children); }
	@Override @Deprecated public Path getRootPath() { throw new UnsupportedOperationException("built-in mod " + metadata.getId() + " has no files"); }
	@Override @Deprecated public Path getPath(String file) { throw new UnsupportedOperationException("built-in mod " + metadata.getId() + " has no files"); }
	@Override public String toString() { return metadata.getId() + " " + metadata.getVersion(); }
}
