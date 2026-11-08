#!/usr/bin/env python3
"""Insert every addons/*.js into a built Eaglercraft HTML, before the game's own scripts.

Usage: inject-addons.py ADDONS_DIR HTML_FILE   (the HTML is rewritten in place)
"""
import os, sys

def main():
    addons, html_path = sys.argv[1], sys.argv[2]
    files = sorted(f for f in os.listdir(addons) if f.endswith(".js")) if os.path.isdir(addons) else []
    if not files:
        print("[addons] none"); return
    html = open(html_path, encoding="utf-8").read()
    tags = []
    for f in files:
        js = open(os.path.join(addons, f), encoding="utf-8").read().replace("</script", "<\\/script")
        tags.append('<script type="text/javascript" data-addon="%s">\n%s\n</script>\n' % (f, js))
    low = html.lower()
    i = low.find("<head>")
    if i >= 0:
        i += len("<head>")
    else:  # no <head>: put them right after the doctype, before anything else
        j = low.find("<!doctype")
        i = low.find(">", j) + 1 if j >= 0 else 0
    html = html[:i] + "\n" + "".join(tags) + html[i:]
    open(html_path, "w", encoding="utf-8").write(html)
    print("[addons] inserted: " + ", ".join(files))

if __name__ == "__main__":
    main()
