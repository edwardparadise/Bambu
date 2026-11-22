# BAMBU Interiors — critical artistic review and connected colour system
Date: 23 November 2026

## Basis
Reviewed the repository's actual source for the live Homepage, Occupiers, Approach, Landlords & agents, Workspace operators, About, and Materials & specification pages, the existing four-path Tube diagrams, the site-wide design refinements, and the interactive slider scripts.

## Core diagnosis
BAMBU's strongest asset is the tension between *light, sometimes unfinished architectural pencil work* and *precise typographic systems*. Earlier revisions repeatedly treated every section as either an ivory panel or a dark technical dashboard. That solved a consistency problem but flattened the emotional and navigational range. The Tube diagrams already contain the more expressive, structured vocabulary that can make different pages feel connected.

## The four existing disciplines
- **People & brief / cyan** — the blue line already used in the route diagram (#00B9EB). Use for client discovery, briefing and connectivity.
- **Design & decisions / terracotta** — existing warm design line (#AF4F39). Use for layouts, finishes and alternatives.
- **Cost & coordination / bronze** — existing neutral gold (#B89B68). Use for budgets, approvals and commercial decisions.
- **Construction & handover / botanical green** — original muted #617D79, brought to a clearer green #527E68. Use for services, construction, maintenance and long-term operation.

These are semantic *accent* colours. They are not to become four competing backgrounds, and colour alone must never communicate a stage.

## Compositional interventions
1. **Homepage: the six real service links become a connected schematic route**, preserving destinations and complete text. The short colour key explains the four workstreams.
2. **Approach: an explicit interchange graphic**, showing four disciplines converging on a coordinated plan. It retains the earlier five-phase Tube diagram instead of replacing or duplicating it.
3. **Landlords: the existing five-decision list becomes an interconnected roadmap**, horizontal on wide screens and vertical on phones, with the full text in normal DOM content.
4. **Workspace operators: add selectable route stops** in front of the existing five-slide carousel. The route synchronises with touch, arrow and keyboard scrolling, using the existing slider rather than a competing control.
5. **Occupiers: preserve the newly approved ivory technical coordination cards** but introduce a distinct coloured top rule per workstream, including green for environmental and sustainability-related content.
6. **About: the four published principles** are identified by four complementary route colours while keeping editorial copy untouched.
7. **Materials: the four responsibility dimensions become a restrained four-point compass** with colour at the borders and a small central ring on large screens; mobile becomes one column without the ring.
8. **Existing Tube maps:** refine the legibility of all four legend entries and make the green route unambiguously green.

## Explicit constraints
- Do not change the BAMBU logo, approved sketch illustrations or their sequence, user photos, project claims, branding wording, forms, or page hierarchy outside the listed components.
- No thick neon glows, full-page grid wallpaper, flashing routes, heavy multi-colour card fills or fake analytics.
- The people in any existing or new illustrations retain the approved professional, faceless and minimal style. This change introduces no new people illustrations.
- Illustrative SVG paths are decorative; the route meaning and all calls to action remain in semantic HTML.
- Native swipe continues to work, no mouse-only destinations, buttons are at least 40–44px, keyboard focus remains distinct, and reduced-motion preference is honoured.
- The Contact, Journal and footer refinements from the previous pass are retained.

## Quality criteria
- 360/375/390/402/430/440/768/1440px tested by GitHub browser regression.
- Five operator station buttons move to correct carousel card and synchronise `aria-pressed` and the accessible numeric counter.
- Landlord roadmap numbers render 01–05 in both orientations.
- No horizontal overflow, no text collisions, no footer gap.
- All original links and content survive; four new disciplines guide the existing narrative rather than turning it into decoration.

## Contrast guardrail
The route hues are used for strokes, markers and broad decorative accents. On warm ivory, the original cyan (#00B9EB) and bronze (#B89B68) have text contrast below 3:1; they must not carry small explanatory copy. Small legends and labels use darkened neutral ink instead. Selected controls use a dark active fill with light text and clear keyboard focus.
