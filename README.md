# BAMBU Interiors

Static HTML, CSS and JavaScript. The production branch is main. Cloudflare serves the site at https://bambu.edwardparadise.workers.dev/.

## Publish a Journal entry

Add an entry to editorial/posts.json with a unique permanent slug, publication date (YYYY-MM-DD), category, title, summary and section pairs containing a heading and a paragraph. Use Business news for company announcements. Use the date on which the entry will be published.

Run `python3 editorial/publish.py` from the repository. Open journal.html and follow the article link. Commit the editorial data, generated Journal index, article pages, journal.xml RSS feed and sitemap.xml together. For a withdrawal, remove the entry and its generated article file in the same commit. After deployment, check the index, article permalink and feed on the public URL.

## Quality gate before release

Run `python3 tools/audit_site.py` from the repository root. The dependency-free check validates local page and asset links, fragment anchors, CSS image URLs, main landmarks, page headings, image alternative text and meta descriptions. Fix any reported errors before publishing.

Review the site at **390px, 768px and 1440px** widths, including the expanded mobile menu, the sketch-to-CGI control, project enquiry email preparation, long-form service guides and footer navigation. Confirm the public Cloudflare deployment includes the latest GitHub changes; a commit to `main` is not proof of deployment.

## Editorial principles

BAMBU is an independent London commercial interiors business. Maintain useful, specific guidance about feasibility, landlord approvals, design coordination, budgets, materials and delivery. Preserve the architectural visual language and deliberate whitespace, but do not remove substantive educational explanations just to shorten a page. Avoid invented client work, case studies, testimonials or claims of BAMBU-delivered projects from previous employment. Introduce the founder only in the homepage founder section. Use British English and accurate link labels.

The browser checks run on GitHub Actions at 390, 768 and 1440 pixels. They check for horizontal overflow, decode images, exercise navigation and the design viewer, and test form validation, clipboard output and checklist resets with sample data. On production pushes the workflow also compares the published files with GitHub, repeats the checks against the live site and saves full-page review images for seven days.

To run the tests on a development machine, install Python Playwright, run `python -m playwright install chromium`, then `python tools/test_layouts.py`. To capture screenshots, set `BAMBU_SCREENSHOTS` to an output directory outside the checkout.

## Visual design sign-off

Use [the unlisted visual direction review](brand-review.html) to inspect the current logo variants, original architectural illustrations, the same-space Sketch → Model → CGI sequence, the conceptual workplace plan and supporting material/product reference imagery in one place. This URL has a `noindex,nofollow` directive and is deliberately absent from the public navigation and sitemap. Option 02 is a proposal, not an approved rebrand. The existing header identity is unchanged.

The concept floorplate is an illustrative communication asset, not a measured layout or evidence of completed BAMBU work. Do not publish client-specific project claims or previous-employer case studies without verified permission and attribution.
