"""Generate the approved Journal layout, article pages, RSS and sitemap. Use --check for CI."""
import argparse
import json
import re
from datetime import date, datetime, timezone
from email.utils import format_datetime
from html import escape
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://bambu.edwardparadise.workers.dev/'


def generate():
    posts = sorted((p for p in json.loads((ROOT / 'editorial/posts.json').read_text())
                    if p.get('published', True)), key=lambda p: p['date'], reverse=True)
    template = (ROOT / 'journal.html').read_text()
    if len(re.findall(r'<footer\b', template)) != 1:
        raise ValueError('The Journal template must contain exactly one footer before publishing.')
    feed_tag = '<link rel="alternate" type="application/rss+xml" title="BAMBU Journal" href="journal.xml">'
    if feed_tag not in template:
        template = template.replace('</head>', feed_tag + '</head>')

    def page(main, title, description, url, image=None):
        result = re.sub(r'<main\b.*?</main>', lambda _: main, template, flags=re.S)
        result = re.sub(r'<title>.*?</title>', lambda _: '<title>' + escape(title) + '</title>', result)
        result = re.sub(r'<meta name="description" content="[^"]*">',
                        lambda _: '<meta name="description" content="' + escape(description) + '">', result)
        for key, value in [('title', title), ('description', description),
                           ('type', 'website' if url == 'journal.html' else 'article')]:
            result = re.sub(f'<meta property="og:{key}" content="[^"]*">',
                            lambda _, k=key, v=value: f'<meta property="og:{k}" content="{escape(v)}">', result)
        if image:
            for key, value in [('image', BASE + image['src']), ('image:alt', image['alt'])]:
                tag = f'<meta property="og:{key}" content="{escape(value)}">'
                pattern = f'<meta property="og:{key}" content="[^"]*">'
                if re.search(pattern, result): result = re.sub(pattern, lambda _: tag, result)
                else: result = result.replace('</head>', tag + '</head>')
        result = re.sub(r'<link rel="canonical" href="[^"]*">',
                        lambda _: '<link rel="canonical" href="' + BASE + url + '">', result)
        return result

    def picture(image, css='journal-launch-visual', lazy=True):
        loading = ' loading="lazy"' if lazy else ' fetchpriority="high"'
        figure_class = f' class="{css}"' if css else ''
        return (f'<figure{figure_class}><img src="{escape(image["src"])}" width="{image["width"]}" '
                f'height="{image["height"]}" decoding="async"{loading} alt="{escape(image["alt"])}">'
                + (f'<figcaption>{escape(image["caption"])}</figcaption>' if css == 'journal-launch-visual' else '')
                + '</figure>')

    outputs = {}
    routes = []
    cards = []
    rss = ET.Element('rss', version='2.0')
    channel = ET.SubElement(rss, 'channel')
    for tag, value in [('title', 'BAMBU Journal'), ('link', BASE + 'journal.html'),
                       ('description', 'News from BAMBU Interiors.')]: ET.SubElement(channel, tag).text = value
    for i, post in enumerate(posts):
        slug = post['slug']
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug): raise ValueError('Invalid Journal slug')
        url = 'journal-' + slug + '.html'
        if url in routes: raise ValueError('Duplicate Journal slug')
        routes.append(url)
        day = date.fromisoformat(post['date'])
        title, summary = escape(post['title']), escape(post['summary'])
        body = ''.join(f'<h2>{escape(h)}</h2><p>{escape(p)}</p>' for h, p in post['sections'])
        image = post.get('image')
        if image: body += picture(image)
        if post.get('closing'): body += '<p>' + escape(post['closing']) + ' <a href="contact.html">Get in touch</a>.</p>'
        main = ('<main id="main" class="wrap"><article class="news-entry journal-launch-entry">'
                '<a href="journal.html">Back to the Journal</a><h1>' + title + '</h1><p class="lead">'
                + escape(post.get('lead', post['summary'])) + '</p>' + body + '</article></main>')
        outputs[url] = page(main, post['title'] + ' | BAMBU Journal', post['summary'], url, image)
        cards.append('<article class="journal-feature" aria-labelledby="journal-post-' + slug + '">'
                     '<div class="journal-feature-copy"><p class="kicker">' + escape(post.get('eyebrow', post['category']))
                     + '</p><h2 id="journal-post-' + slug + '">' + title + '</h2><p>' + summary
                     + '</p><a class="text-link" href="' + url + '">'
                     + ('Read the launch story' if slug == 'introducing-bambu' else 'Read the story')
                     + '</a></div>' + (picture(image, '', False) if image else '') + '</article>')
        item = ET.SubElement(channel, 'item')
        for tag, value in [('title', post['title']), ('link', BASE + url), ('guid', BASE + url),
                           ('description', post['summary']), ('pubDate', format_datetime(datetime.combine(day, datetime.min.time(), tzinfo=timezone.utc), usegmt=True))]:
            ET.SubElement(item, tag).text = value
    main = ('<main id="main" class="wrap journal-redesign"><section class="journal-intro" aria-labelledby="journal-heading">'
            '<h1 id="journal-heading">Journal</h1></section>' + ''.join(cards) + '</main>')
    outputs['journal.html'] = page(main, 'Journal | BAMBU Interiors',
                                  'Business updates and practical workplace design notes from BAMBU Interiors.',
                                  'journal.html', posts[0].get('image') if posts else None)
    ET.indent(rss, space='  ')
    outputs['journal.xml'] = '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(rss, encoding='unicode') + '\n'
    sitemap = re.sub(r'\s*<url>\s*<loc>[^<]*/journal-[^<]*</loc>\s*</url>', '', (ROOT / 'sitemap.xml').read_text())
    outputs['sitemap.xml'] = sitemap.replace('</urlset>', ''.join('  <url><loc>' + BASE + u + '</loc></url>\n' for u in routes) + '</urlset>')
    return outputs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='Verify generated files without writing changes.')
    args = parser.parse_args()
    outputs = generate()
    changed = [name for name, text in outputs.items() if not (ROOT / name).exists() or (ROOT / name).read_text() != text]
    if args.check:
        if changed: raise SystemExit('Journal generated files differ: ' + ', '.join(changed))
        print('PASS: Journal source, pages, RSS and sitemap are consistent.')
    else:
        for name, text in outputs.items(): (ROOT / name).write_text(text)
        print('Journal pages and discovery files updated.')


if __name__ == '__main__': main()
