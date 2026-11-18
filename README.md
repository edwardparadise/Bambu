# BAMBU Interiors

Static HTML, CSS and JavaScript. The production branch is main. Cloudflare serves the site at https://bambu.edwardparadise.workers.dev/.

## Publish a Journal entry

Add an entry to editorial/posts.json with a unique permanent slug, publication date (YYYY-MM-DD), category, title, summary and section pairs containing a heading and a paragraph. Use Business news for company announcements. Use the date on which the entry will be published.

Run `python3 editorial/publish.py` from the repository. Open journal.html and follow the article link. Commit the editorial data, generated Journal index, article pages, journal.xml RSS feed and sitemap.xml together. For a withdrawal, remove the entry and its generated article file in the same commit. After deployment, check the index, article permalink and feed on the public URL.
