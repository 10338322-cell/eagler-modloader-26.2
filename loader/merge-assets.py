#!/usr/bin/env python3
"""Copy the assets/ and data/ of every mod (including jar-in-jar mods) into the game's resources,
so they are packed into assets.epk with the vanilla files.

Usage: merge-assets.py RESOURCES_DIR MOD_JAR...
Mod files are layered over vanilla ones, like a mod resource pack sits above the vanilla pack.
"""
import io, os, sys, zipfile

def walk(zf, label, out, stats):
    for info in zf.infolist():
        n = info.filename
        if n.endswith("/"):
            continue
        if n.startswith("META-INF/jars/") and n.endswith(".jar"):
            with zipfile.ZipFile(io.BytesIO(zf.read(n))) as inner:
                walk(inner, label + "!" + os.path.basename(n), out, stats)
            continue
        if not (n.startswith("assets/") or n.startswith("data/")):
            continue
        dest = os.path.join(out, n)
        stats["replaced" if os.path.exists(dest) else "added"] += 1
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "wb") as f:
            f.write(zf.read(n))

def main():
    out = sys.argv[1]
    stats = {"added": 0, "replaced": 0}
    for jar in sys.argv[2:]:
        with zipfile.ZipFile(jar) as zf:
            walk(zf, os.path.basename(jar), out, stats)
    print("[assets] %d mod files added, %d vanilla files replaced" % (stats["added"], stats["replaced"]))

if __name__ == "__main__":
    main()
