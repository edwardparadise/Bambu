# BAMBU Interiors

Static HTML, CSS and JavaScript. The production branch is main. Cloudflare serves the site at https://bambuinteriors.co.uk/.

## Publish a Journal entry

Add an entry to editorial/posts.json with a unique permanent slug, publication date (YYYY-MM-DD), category, title, summary and section pairs containing a heading and a paragraph. Set published to false for drafts; drafts remain out of the Journal index, RSS feed and sitemap. Optional lead, closing and image fields preserve the approved illustrated article layout. Use Business news for company announcements. Use the date on which the entry will be published.

Run `python3 editorial/publish.py` from the repository. Open journal.html and follow the article link. Commit the editorial data, generated Journal index, article pages, journal.xml RSS feed and sitemap.xml together. For a withdrawal, remove the entry and its generated article file in the same commit. After deployment, check the index, article permalink and feed on the public URL.

## Quality gate before release

Run `python3 editorial/publish.py --check` and `python3 tools/audit_site.py` from the repository root. The dependency-free check validates local page and asset links, fragment anchors, CSS image URLs, main landmarks, page headings, image alternative text and meta descriptions. Fix any reported errors before publishing.

Review the site at **390px, 768px and 1440px** widths, including the expanded mobile menu, the sketch-to-CGI control, project enquiry email preparation, long-form service guides and footer navigation. Confirm the public Cloudflare deployment includes the latest GitHub changes; a commit to `main` is not proof of deployment.

## Editorial principles

BAMBU is an independent London commercial interiors business. Maintain useful, specific guidance about feasibility, landlord approvals, design coordination, budgets, materials and delivery. Preserve the architectural visual language and deliberate whitespace, but do not remove substantive educational explanations just to shorten a page. Avoid invented client work, case studies, testimonials or claims of BAMBU-delivered projects from previous employment. Introduce the founder only in the homepage founder section. Use British English and accurate link labels.

The browser checks run on GitHub Actions at 390, 768 and 1440 pixels. They check for horizontal overflow, decode images, exercise navigation and the design viewer, and test form validation, clipboard output and checklist resets with sample data. On production pushes the workflow also compares the published files with GitHub, repeats the checks against the live site and saves full-page review images for seven days.

To run the tests on a development machine, install Python Playwright, run `python -m playwright install chromium`, then `python tools/test_layouts.py`. To capture screenshots, set `BAMBU_SCREENSHOTS` to an output directory outside the checkout.

## Visual design sign-off

Use [the unlisted visual direction review](brand-review.html) to inspect the current logo variants, original architectural illustrations, the same-space Sketch → Model → CGI sequence, the conceptual workplace plan and supporting material/product reference imagery in one place. This URL has a `noindex,nofollow` directive and is deliberately absent from the public navigation and sitemap. Option 02 is a proposal, not an approved rebrand. The existing header identity is unchanged.

The concept floorplate is an illustrative communication asset, not a measured layout or evidence of completed BAMBU work. Do not publish client-specific project claims or previous-employer case studies without verified permission and attribution.

## Terracotta pencil wallpapers (19 November 2026)

The homepage uses the approved colour-changing vector sketch. Secondary pages use transparent terracotta architectural perspective drawings as subtle backgrounds on warm white and stone sections. About retains a darker linework overlay rather than a blank black hero. Card padding is standardised. Experience uses a full-width outline-sketch sequence, while Operators retains its image-backed introduction; no fictional completed works or measured test fits are implied. The numbered mobile navigation indexes are hidden in CSS and removed from the document by site.js.

## Focused navigation and design studies (22 November 2026)

The primary navigation focuses on what BAMBU does, experience, people and contact. The Journal remains in the footer. Materials Lab is intentionally unlisted and marked noindex while the imagery is reviewed. Do not republish generic or AI-generated product images as installed manufacturer examples; obtain reproduction permission, confirm product attribution and label manufacturer work honestly before relaunching this section.

The homepage and Experience page have horizontally scrollable study galleries. They use existing illustrative assets, never imply BAMBU completed the pictured concepts, and must work with swipe, trackpad, keyboard, reduced motion, visible arrow controls and no page-level horizontal overflow. Maintain the site's simple enquiry email-draft and copy flow until a secure, privacy-reviewed server-side submission endpoint has been configured and tested; never expose Pipedrive credentials to client-side code.


### Public brand and experience policy (November 2026)

BAMBU Interiors launched as an independent brand in 2026. The legal entity may
have an earlier incorporation date; **never present that date as the brand's
trading history**. The founder has more than 15 years of earlier professional
experience, which must remain clearly distinct from BAMBU's own contracts.

There is no public BAMBU project portfolio yet. Do not invent case studies,
outcomes, testimonials, project statistics or client endorsements. Do not use
former employers' client names or logos as a BAMBU client list. If examples are
shown, label unbuilt renders and reference photography accurately as concepts
or design references. Reserved credentials belong in a separately authorised
private presentation, not on the public site.

The homepage's "Who we work with" section refers to **audience categories**,
not a list of customers. The 2026 launch context belongs on About and the
launch Journal article; do not force apologetic new-business copy onto every
service page. Company-number and legal-entity disclosures must be verified
after the planned name change, never guessed.
