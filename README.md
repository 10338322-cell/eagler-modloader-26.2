# eagler-modloader-26.2

**Work in progress.** Fabric mods, built into Eaglercraft 26.2.

Eaglercraft is Minecraft compiled to run in a web browser. A browser can't load a mod `.jar` while the game is running: the game is no longer Java code once it is in the browser. So this project does what Fabric does at startup **once, during the build**. It takes the Fabric mods in [`mods/`](mods), applies them to the game, and compiles one standalone HTML file with those mods built in. Mod Menu lists them in-game.

## Adding your own mods

1. Fork or copy this repository (keep it **public**; see *Build machines* below).
2. Drop Fabric mod jars for **Minecraft 26.2** into `mods/`, with any mods they depend on.
3. Commit. The **Build** action starts by itself (or run it from the *Actions* tab).
4. After it finishes (about 40-60 minutes), download the HTML from **Releases**.

To remove a mod, delete its jar and build again.

## What works

| Works well | Needs patching or won't work |
|---|---|
| Client-side mods: HUD, zoom, tooltips, menus, keybinds | Mods with native libraries (`.dll` / `.so`) |
| Libraries: Fabric API, Mod Menu, Placeholder API, Cloth Config | Mods that read and write arbitrary files |
| Mixin-based tweaks to rendering and the GUI | Mods that start their own threads or network sockets |
| | Mods that replace the whole renderer (Sodium-type mods need a dedicated port) |

The build reports mods it could not apply.

## Status

- [ ] Build plain Eaglercraft 26.2 on GitHub Actions
- [ ] Apply Fabric mods (mixins, entrypoints, assets) during the build
- [ ] Fabric API, Placeholder API, Mod Menu
- [ ] Report unsupported mods clearly

## Build machines

The build needs at least 10 GB of memory. GitHub's free machines for **public** repositories have 16 GB; private repositories only get 7 GB, which is not enough. A private fork can still build on your own PC (16 GB+ RAM) as a [self-hosted runner](https://docs.github.com/actions/hosting-your-own-runners).

## Credits

- **Eaglercraft 26.2**: the browser port of Minecraft 26.2 and its Eagler runtime.
- **[Eaglercraft 26.2 Workspace](https://github.com/kingjoeishere/Eaglercraft-26.2-Workspace)** by kingjoeishere, the source workspace each build downloads.
- **[Eaglercraft 26.2 patcher](https://github.com/melonman106/eagler26source)** by melonman106.
- **[Fabric](https://fabricmc.net)** (loader and API) by FabricMC: Apache-2.0.
- **[Mod Menu](https://github.com/TerraformersMC/ModMenu)** by TerraformersMC: MIT.
- **[Placeholder API](https://github.com/Patbox/TextPlaceholderAPI)** by Patbox: LGPL-3.0.
- **Chromium Client** by maz_35, which first showed that Fabric mods can be compiled into Eaglercraft 26.2.

Each mod in `mods/` keeps its own license.

## License and disclaimer

This project's own code is under the [Apache-2.0 license](LICENSE). That license does not cover Minecraft, the Eaglercraft runtime, or the mods in `mods/`.

Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft. This repository contains no Minecraft code or assets; each build downloads what it needs.
