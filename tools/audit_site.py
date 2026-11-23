#!/usr/bin/env python3
"""Static BAMBU site checks. Run from the repository root: python3 tools/audit_site.py"""
from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys
import subprocess

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
        self.landmarks = Counter()
        self.redirect = False
        self.in_title = False
        self.title_parts = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        self.landmarks[tag] += 1
        if tag == "title": self.in_title = True
        if tag == "meta" and d.get("http-equiv", "").lower() == "refresh": self.redirect = True
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


    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False

    def handle_data(self, data):
        if self.in_title: self.title_parts.append(data)


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
        for landmark in ("html", "head", "body") + (() if page.redirect else ("header", "footer")):
            if page.landmarks[landmark] != 1:
                errors.append(f"{file.relative_to(ROOT)}: expected one {landmark}, found {page.landmarks[landmark]}")
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

    titles = Counter("".join(page.title_parts).strip() for page in pages.values())
    for title, count in titles.items():
        if not title or count > 1:
            errors.append(f"Page title missing or repeated: {title!r} ({count} pages)")

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

    editorial = subprocess.run([sys.executable, str(ROOT / "editorial/publish.py"), "--check"], capture_output=True, text=True)
    if editorial.returncode:
        errors.append(editorial.stderr.strip() or editorial.stdout.strip() or "Journal source is out of sync")

    # Public credibility must describe a 2026 brand launch, never a
    # construction track record assigned to a newly launched business.
    about = (ROOT / "about.html").read_text(encoding="utf-8")
    home = (ROOT / "index.html").read_text(encoding="utf-8")
    journal = (ROOT / "journal.html").read_text(encoding="utf-8")
    glossary = (ROOT / "project-glossary.html").read_text(encoding="utf-8")
    if "Launched in 2026" not in about or "15+ YEARS" not in about:
        errors.append("About: brand launch and prior professional experience must both be explicit")
    if "Our clients / 001" in home or "Explore our clients" in home:
        errors.append("Homepage: audiences must not be presented as an existing BAMBU client list")
    if "why we rebranded" in journal:
        errors.append("Journal: launch language is out of date")
    if "<h2>Cat A+</h2>" not in glossary:
        errors.append("Glossary: Cat A+ definition missing")
    for draft in ("journal-read-a-test-fit.html", "journal-materials-in-use.html"):
        if 'name="robots" content="noindex,follow"' not in (ROOT / draft).read_text(encoding="utf-8"):
            errors.append(f"{draft}: unpublished Journal draft must remain noindex")
    for page_file in ROOT.glob("*.html"):
        raw = page_file.read_text(encoding="utf-8")
        if re.search(r"\b2022\b", raw):
            errors.append(f"{page_file.name}: do not present the legal company's 2022 history as BAMBU's brand launch")
        if 'bambu-editorial-overhaul.css?v=20261123d' in raw:
            errors.append(f"{page_file.name}: old cached editorial stylesheet URL")

    # Visitor-first capability hierarchy. Preserve the depth of the service
    # library while presenting four recognisable reasons to contact BAMBU.
    services = (ROOT / "services.html").read_text(encoding="utf-8")
    contact = (ROOT / "contact.html").read_text(encoding="utf-8")
    nav = (ROOT / "site.js").read_text(encoding="utf-8")
    if 'class="bambu-home-services__links bambu-four-capabilities"' not in home:
        errors.append("Homepage must expose four buyer-led capabilities")
    if len(re.findall(r'class="service-tile"', services)) != 4:
        errors.append("Services: expected four primary capability cards")
    if 'class="bambu-specialist-support"' not in services:
        errors.append("Services: keep specialist delivery pages discoverable")
    if 'id="copy-enquiry"' not in contact or 'class="bambu-optional-details bambu-enquiry-more"' not in contact:
        errors.append("Contact: simple enquiry and mail-app fallback must remain available")
    if "Landlord & Cat A+ Works" not in nav:
        errors.append("Navigation: landlord Cat A+ capability not discoverable")
    if "bambu-editorial-overhaul.css?v=20261123e" in home:
        errors.append("Homepage: cached clarity stylesheet")

    # Organic blue identity is a consistent, accessible decorative layer.
    # Assets must be local and the same version must load on every page.
    for asset in ("bambu-organic-ribbon.svg", "bambu-organic-contours.svg", "bambu-organic-fold.svg"):
        if not (ROOT / "assets" / "brand" / asset).is_file():
            errors.append(f"Missing vector art direction asset: {asset}")
    for page_file in ROOT.glob("*.html"):
        raw = page_file.read_text(encoding="utf-8")
        if raw.count("bambu-organic.css?v=20261123o") != 1:
            errors.append(f"{page_file.name}: expected one organic stylesheet reference")
        if raw.count("bambu-organic.js?v=20261123o1") != 1:
            errors.append(f"{page_file.name}: expected one organic visual script")
    organic_js = (ROOT / "bambu-organic.js").read_text(encoding="utf-8")
    if "aria-hidden" not in organic_js or "pointer-events:none" not in (ROOT / "bambu-organic.css").read_text(encoding="utf-8"):
        errors.append("Organic shapes must remain decorative and non-interactive")

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
