#!/usr/bin/env python3
"""Download Fabric Loader and the libraries it needs at build time (ASM, Mixin) into a folder.

Usage: fetch-deps.py OUT_DIR [LOADER_VERSION]
Without a version, the newest Fabric Loader release is used. Prints the loader version.
"""
import json, os, sys, urllib.request, zipfile, xml.etree.ElementTree as ET

MAVEN = "https://maven.fabricmc.net/"

def get(url):
    with urllib.request.urlopen(url, timeout=120) as r:
        return r.read()

def jar_url(base, coord):
    g, a, v = coord.split(":")[:3]
    return f"{base.rstrip('/')}/{g.replace('.', '/')}/{a}/{v}/{a}-{v}.jar", f"{a}-{v}.jar"

def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    ver = sys.argv[2] if len(sys.argv) > 2 else None
    if not ver:
        meta = ET.fromstring(get(MAVEN + "net/fabricmc/fabric-loader/maven-metadata.xml"))
        ver = meta.find("versioning/release").text
    url, name = jar_url(MAVEN, f"net.fabricmc:fabric-loader:{ver}")
    loader = os.path.join(out, name)
    if not os.path.exists(loader):
        open(loader, "wb").write(get(url))
    with zipfile.ZipFile(loader) as z:
        inst = json.loads(z.read("fabric-installer.json"))
    for lib in inst["libraries"].get("common", []) + inst["libraries"].get("development", []):
        url, fn = jar_url(lib.get("url", MAVEN), lib["name"])
        p = os.path.join(out, fn)
        if not os.path.exists(p):
            open(p, "wb").write(get(url))
    print(ver)

if __name__ == "__main__":
    main()
