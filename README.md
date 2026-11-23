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


## Four-client-capability website (23 November 2026)

The first-level Services menu and homepage present four **client-readable**
capabilities: Workplace Design; Office Fit-Out & Refurbishment; Landlord &
Cat A+ Works; and Furniture & Technology. These lead to actual service pages.
Construction management, occupied refurbishment, AV and aftercare remain
accessible on the Services page and through contextual links. Do not hide
technical content or replace the existing sketches and interactive processes.

Audience pages address occupiers, landlords and flexible operators directly.
Lead with the client problem, not a list of internal workstreams. Restrict
duplicated generic planning-resource panels on core service pages; keep their
technical notes and the shared, contextual footer links.

The contact page uses a concise email-draft route with optional details. **Do
not describe this as website submission or promise a received lead**. Direct
submission requires an authorised outbound email service or a secure backend
and a confirmed notification destination, with anti-spam, privacy and delivery
tests. Cloudflare Email Sending access was not authorised during this pass.
Avoid exposing any third-party mail or CRM API credentials in browser code.


## BAMBU organic blue system (23 November 2026)

Approved visual direction: electric BAMBU Blue (#00B9EB) as a selective,
playful counterpoint to charcoal, bronze, ivory and technical architectural
linework. Three original transparent vector studies in assets/brand:
bambu-organic-ribbon.svg, bambu-organic-contours.svg, bambu-organic-fold.svg.
They are **decorative design assets**, never project images or photographs.
Site-wide styling: bambu-organic.css; optional DOM decorations:
bambu-organic.js. All visible pages include both in the document head.

Use the sculptural forms selectively, primarily in the homepage, capabilities,
About, Approach, contact, audience technical sections and footer. Keep content
legible, navigation controls unobstructed and the hero within the standard
phone opening height. Blue works best as a distinctive call-to-action accent,
an organic counterpoint to grids and small hover/focus details. Never fill
every section with blobs, and never substitute these shapes for architectural
sketches. No animation for reduced-motion users; decorative visuals should
remain off the accessibility tree and ignore pointer events.

## BAMBU organic direction refined (23 November 2026)
Client feedback favours the folded sculptural blue edge shown on Services, not squiggles, ribbons or contour overlays on architectural sketches. The current bambu-organic.js only places folded shapes at the edges of the Services, About, homepage capability and Contact panels, with small folded details on capability cards. Footer CTA is a restrained bronze-outline/translucent link with a small blue arrow disc, not a large cyan rectangle. Retain the original illustration artworks and avoid reintroducing worm-like overlays. The previous ribbon/contours SVGs remain archived in the repository but are no longer rendered.


## Controlled expressive card geometry (23 November 2026)

The organic design is expressed **in the edges of text and capability cards**, not by adding separate blobs to sketches. The final `bambu-organic.css` layer gives homepage capabilities, Services tiles, audience links and selected About, Occupier, Operator, Landlord and Approach cards an alternating asymmetric corner: a stronger curved fold at one corner and a smaller counter-curve at the opposite corner. Quiet blue surface washes, edge trims and focus/hover treatments reinforce the approved #00B9EB without flooding the layout or replacing bronze and the four existing workstream colours. Linked galleries, technical artwork, the hero, typography and navigation retain their existing composition. Mobile corners scale down and reduced-motion preferences remain respected.

## Editorial rhythm improvements (23 November 2026)

Following mobile review, the site now uses distinct interactions where useful instead of forcing every section into an identical stack of cards. `bambu-rhythm.js` and `bambu-rhythm.css` are currently loaded by Approach, Materials & Specification and Commercial Fit-Out. Approach services use a labelled image-led horizontal gallery with previous/next arrows, snap points and keyboard access. Materials uses a focused three-stage selector, an expandable standards list that preserves official source links, and a horizontally browseable four-part responsibility section. Commercial Fit-Out presents its eight-stage construction programme one step at a time, with all original copy retained. JavaScript failure leaves the source HTML available; reduced-motion preferences remain respected.

The dated Approach service-gallery office photographs were replaced with more aspirational openly licensed illustrative reference images. The Commercial Fit-Out hero supporting image is also an illustrative workplace concept, explicitly not a BAMBU delivery. Do not describe any of these reference images as BAMBU-built projects. Do not repurpose competitor project photographs without permission. Keep the site’s architectural and commercial information readable and avoid creating more sliders simply for visual movement. A full visual QA is still required at mobile/tablet/desktop sizes before calling the deployed result verified.


## Furniture, AV and service-page visual openings (23 November 2026)

The Furniture & FF&E, AV & Workplace Technology, Workplace Design and Commercial Fit-Out pages now use `bambu-service-visuals.css` with dedicated editorial split-layout heroes rather than technical SVG drawings beneath the hero typography. Mobile puts short copy above a relevant, full-width photographic reference in the opening viewport. Each reference is explicitly labelled as illustrative rather than a BAMBU project.

Furniture prominently shows contemporary office task seating, collaborative lounges and coordinated FF&E. AV leads with a meeting-room installation that visibly includes a large screen and follows with conferencing and systems-integration examples. Both pages use responsive image-led galleries with touch scrolling and accessible arrows via `bambu-service-visuals.js`. They cross-link to one another. Workplace Design moves the illustrative floorplate to its dedicated study section below the photographic hero; Commercial Fit-Out keeps its eight-stage process navigator and avoids duplicating the same photo in a second figure.

Preserve the approved logo, charcoal, bronze and #00B9EB accent, existing guides and enquiry routes. Keep external Unsplash images labelled as illustrative references and verify their free-use license; brand/manufacturer names in a photograph do not imply endorsement. Responsive tests should include compact mobile (390px), tablet (768px) and desktop (1440px), checking menu, gallery arrows, content and photo crop. Cloudflare Browser Rendering was used for mobile checks on Furniture, AV and Workplace; a later additional screenshot request reached a provider rate limit. Keep deploy checks separate from GitHub commit verification.
