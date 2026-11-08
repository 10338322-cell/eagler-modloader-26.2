#!/usr/bin/env python3
"""Download Minecraft's sound files from Mojang for the build (they aren't in the workspace).

Usage: fetch-sounds.py VERSION SOUNDS_DIR MUSIC_DIR
Reads the official version manifest and asset index, then downloads every sound into
SOUNDS_DIR/assets/minecraft/sounds/... except music and music discs, which go to MUSIC_DIR the same
way (the game ships those as an optional resource pack). Nothing from Mojang is stored in the repo.
"""
import concurrent.futures, hashlib, json, os, sys, time, urllib.request

MANIFEST = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
OBJECTS = "https://resources.download.minecraft.net/"

def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return r.read()
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(2 * (i + 1))

def main():
    version, sounds_dir, music_dir = sys.argv[1:4]
    manifest = json.loads(get(MANIFEST))
    entry = next((v for v in manifest["versions"] if v["id"] == version), None)
    if entry is None:
        raise SystemExit("version %s not in Mojang's manifest" % version)
    index_url = json.loads(get(entry["url"]))["assetIndex"]["url"]
    objects = json.loads(get(index_url))["objects"]
    jobs = []
    for key, obj in objects.items():
        if not (key.startswith("minecraft/sounds/") and key.endswith(".ogg")):
            continue
        is_music = key.startswith("minecraft/sounds/music/") or key.startswith("minecraft/sounds/records/")
        dest = os.path.join(music_dir if is_music else sounds_dir, "assets", key)
        jobs.append((obj["hash"], dest))

    def fetch(job):
        h, dest = job
        if os.path.exists(dest):
            return 0
        data = get(OBJECTS + h[:2] + "/" + h)
        if hashlib.sha1(data).hexdigest() != h:
            raise RuntimeError("checksum mismatch for " + dest)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "wb") as f:
            f.write(data)
        return len(data)

    with concurrent.futures.ThreadPoolExecutor(16) as ex:
        total = sum(ex.map(fetch, jobs))
    music = sum(1 for _, d in jobs if d.startswith(music_dir))
    print("[sounds] %s: %d sounds, %d music files (%.1f MB downloaded)" % (version, len(jobs) - music, music, total / 1048576))

if __name__ == "__main__":
    main()
