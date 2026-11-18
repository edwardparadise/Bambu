#!/usr/bin/env python3
"""Static BAMBU site checks. Run from the repository root: python3 tools/audit_site.py"""
from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKIP = {"mailto", "tel", "javascript", "data"}
CSS_URL = re.compile(r"url\(\s*['\"]?([^)'\"]+)", re.I)


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.ids = set()
        self.duplicate_ids = []
        self.h1 = 0
        self.main = 0
        self.descriptions = 0
        self.images_without_alt = 0

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if "id" in d:
            if d["id"] in self.ids:
                self.duplicate_ids.append(d["id"])
            self.ids.add(d["id"])
        if tag == "h1":
            self.h1 += 1
        if tag == "main":
            self.main += 1
        if tag == "meta" and d.get("name", "").lower() == "description":
            self.descriptions += 1
        if tag == "img" and "alt" not in d:
            self.images_without_alt += 1
        for attr in ("href", "src", "poster"):
            if d.get(attr):
                self.links.append((attr, d[attr]))


def resolve(source: Path, url: str):
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc or url.startswith("//"):
        return None, None
    target = unquote(parsed.path).lstrip("/")
    if not target:
        file = source
    elif parsed.path.startswith("/"):
        file = ROOT / target
    else:
        file = source.parent / target
    if file.is_dir():
        file /= "index.html"
    if not file.suffix and not file.exists():
        file = file.with_suffix(".html")
    return file.resolve(), parsed.fragment


def main():
    pages = {}
    errors = []
    for file in sorted(ROOT.rglob("*.html")):
        if ".git" in file.parts:
            continue
        page = Page()
        page.feed(file.read_text(encoding="utf-8"))
        pages[file.resolve()] = page
        if page.h1 != 1:
            errors.append(f"{file.relative_to(ROOT)}: expected one h1, found {page.h1}")
        if page.main != 1:
            errors.append(f"{file.relative_to(ROOT)}: expected one main, found {page.main}")
        if page.descriptions != 1:
            errors.append(f"{file.relative_to(ROOT)}: expected one meta description, found {page.descriptions}")
        if page.images_without_alt:
            errors.append(f"{file.relative_to(ROOT)}: {page.images_without_alt} image(s) without alt")
        if page.duplicate_ids:
            errors.append(f"{file.relative_to(ROOT)}: duplicate ids: {page.duplicate_ids}")

    for file, page in pages.items():
        for kind, link in page.links:
            dest, fragment = resolve(file, link)
            if dest is None:
                continue
            if not dest.is_relative_to(ROOT):
                errors.append(f"{file.relative_to(ROOT)}: link escapes repository: {link}")
            elif not dest.exists():
                errors.append(f"{file.relative_to(ROOT)}: missing {kind} target: {link}")
            elif fragment and dest.suffix == ".html":
                other = pages.get(dest)
                if other and unquote(fragment) not in other.ids:
                    errors.append(f"{file.relative_to(ROOT)}: missing anchor: {link}")

    for file in ROOT.rglob("*.css"):
        for link in CSS_URL.findall(file.read_text(encoding="utf-8")):
            dest, _ = resolve(file, link)
            if dest and not dest.exists():
                errors.append(f"{file.relative_to(ROOT)}: missing CSS asset: {link}")

    print(f"Checked {len(pages)} HTML pages and {len(list(ROOT.rglob('*.css')))} stylesheets.")
    for error in errors:
        print("ERROR:", error)
    if errors:
        print(f"{len(errors)} issue(s) detected.")
        return 1
    print("PASS: local links, anchors, assets and baseline document structure.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
