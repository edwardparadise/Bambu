"""Regenerate Journal pages and discovery files with Python 3."""
import json
import re
from datetime import date
from email.utils import formatdate
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://bambu.edwardparadise.workers.dev/'
posts = sorted(json.loads((ROOT/'editorial/posts.json').read_text()), key=lambda p:p['date'], reverse=True)
index = ROOT/'journal.html'
template = index.read_text()
feed_tag = '<link rel="alternate" type="application/rss+xml" title="BAMBU Journal" href="journal.xml">'
if feed_tag not in template:
    template = template.replace('</head>', feed_tag+'</head>')

def page(main, title, description, url):
    result = re.sub(r'<main\b.*?</main>', lambda _:main, template, flags=re.S)
    result = re.sub(r'<title>.*?</title>', lambda _:'<title>'+escape(title)+'</title>', result)
    result = re.sub(r'<meta name="description" content="[^"]*">', lambda _:'<meta name="description" content="'+escape(description)+'">', result)
    for key, value in [('title',title),('description',description),('type','website' if url=='journal.html' else 'article')]:
        result = re.sub(f'<meta property="og:{key}" content="[^"]*">',lambda _:f'<meta property="og:{key}" content="{escape(value)}">',result)
    return re.sub(r'<link rel="canonical" href="[^"]*">',lambda _:'<link rel="canonical" href="'+BASE+url+'">',result)

cards = []
routes = []
rss = ET.Element('rss',version='2.0')
channel = ET.SubElement(rss,'channel')
for tag,value in [('title','BAMBU Journal'),('link',BASE+'journal.html'),('description','News and field notes from BAMBU Interiors.')]:
    ET.SubElement(channel,tag).text=value
for post in posts:
    slug = post['slug']
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',slug):
        raise ValueError('Invalid Journal slug')
    url = 'journal-'+slug+'.html'
    if url in routes:
        raise ValueError('Duplicate Journal slug')
    routes.append(url)
    day = date.fromisoformat(post['date'])
    title, summary, category = (escape(post[k]) for k in ('title','summary','category'))
    stamp = f'<time datetime="{day}">{day.day} {day:%B %Y}</time>'
    cards.append(f'<article><span>{category} · {stamp}</span><h2><a href="{url}">{title}</a></h2><p>{summary}</p></article>')
    body = ''.join(f'<h2>{escape(h)}</h2><p>{escape(p)}</p>' for h,p in post['sections'])
    main = f'<main id="main" class="wrap"><article class="news-entry"><a href="journal.html">Journal</a><p class="kicker">{category} · {stamp}</p><h1>{title}</h1><p class="lead">{summary}</p>{body}<p><a href="journal.html">All news and insights</a></p></article></main>'
    (ROOT/url).write_text(page(main,post['title']+' | BAMBU Journal',post['summary'],url))
    item = ET.SubElement(channel,'item')
    for tag,value in [('title',post['title']),('description',post['summary']),('link',BASE+url),('guid',BASE+url),('category',post['category']),('pubDate',formatdate(datetime.combine(day,datetime.min.time(),tzinfo=timezone.utc).timestamp(),usegmt=True))]:
        ET.SubElement(item,tag).text=value
main='<main id="main" class="wrap editorial-about"><section class="about-hero"><p class="kicker">BAMBU Journal</p><h1>News and field notes.</h1><p>Business updates and practical notes on designing, costing and building workplaces.</p><a href="journal.xml">Subscribe via RSS</a></section><section class="about-articles" aria-label="Journal articles">'+''.join(cards)+'</section></main>'
index.write_text(page(main,'Journal | BAMBU Interiors','Business updates and practical workplace design notes from BAMBU Interiors.','journal.html'))
ET.ElementTree(rss).write(ROOT/'journal.xml',encoding='utf-8',xml_declaration=True)
sitemap=ROOT/'sitemap.xml'
content=re.sub(r'\s*<url><loc>[^<]*/journal-[^<]*</loc></url>', '',sitemap.read_text())
sitemap.write_text(content.replace('</urlset>',''.join('  <url><loc>'+BASE+u+'</loc></url>\n' for u in routes)+'</urlset>'))
