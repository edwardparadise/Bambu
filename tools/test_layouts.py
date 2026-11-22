"""Browser regression tests for the static website. Serve the checkout locally."""
import os
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class StaticFiles(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def test_forms(page, base):
    page.goto(base + 'contact.html?type=Landlord%20refurbishment')
    expect(page.locator('select[name=type]')).to_have_value('Landlord refurbishment')
    page.locator('#copy-enquiry').click()
    assert not page.locator('#project-enquiry').evaluate('(form) => form.checkValidity()')
    page.locator('[name=name]').fill('Test Visitor')
    page.locator('[name=email]').fill('qa@example.invalid')
    page.locator('#copy-enquiry').click()
    expect(page.locator('#enquiry-help')).to_contain_text('copied')
    assert 'Landlord refurbishment' in page.evaluate('navigator.clipboard.readText()')
    copied = page.evaluate('navigator.clipboard.readText()')
    assert 'ed@bambuinteriors.co.uk' in copied and 'joe@bambuinteriors.co.uk' in copied
    page.goto(base + 'space-brief.html')
    page.locator('[name=area]').fill('-1')
    page.locator('[data-copy]').click()
    expect(page.locator('[name=area]')).to_be_focused()
    page.locator('[name=area]').fill('2500')
    page.locator('[data-copy]').click()
    expect(page.locator('.tool-status')).to_contain_text('copied')
    assert '2500' in page.evaluate('navigator.clipboard.readText()')
    with page.expect_download() as captured:
        page.locator('[data-download]').click()
    assert '2500' in captured.value.path().read_text()
    for route in ['fitout-readiness', 'landlord-readiness']:
        page.goto(base + route + '.html')
        page.get_by_role('checkbox').first.check()
        expect(page.locator('[data-count]')).to_have_text('1')
        page.locator('[data-reset]').click()
        expect(page.locator('[data-count]')).to_have_text('0')



def test_editorial_redesign(page, base):
    """Reject regression to empty disclosure-only layouts on the two key pages."""
    page.goto(base + 'approach.html')
    expect(page.locator('.approach-process .tube-stations > li')).to_have_count(5)
    expect(page.locator('.approach-decision-grid article')).to_have_count(2)
    expect(page.locator('.approach-service-grid > a')).to_have_count(6)
    assert page.locator('.approach-process details').count() == 0
    # Force loading of below-the-fold service images before checking decode.
    broken = page.evaluate("""async () => {
        const imgs = [...document.querySelectorAll('.approach-hero-visual img, .approach-service-grid img')];
        const checks = await Promise.allSettled(imgs.map(img => {
            img.loading = 'eager';
            return img.decode();
        }));
        return checks.flatMap((check, i) =>
            check.status === 'rejected' ? [imgs[i].getAttribute('src')] : []);
    }""")
    assert not broken, f'Approach images cannot be decoded: {broken}'
    page.goto(base + 'about.html')
    expect(page.locator('.bambu-founder-timeline time')).to_have_text(['2022', '2026'])
    expect(page.locator('.bambu-founder-letter img')).to_have_attribute('src', 'ed-paradise.webp')
    expect(page.locator('.bambu-havas-placeholder')).to_be_visible()
    expect(page.locator('.about-feature, .about-principles')).to_have_count(0)
    assert page.locator('.startup-manifesto').count() == 0



def test_terracotta_visual_layers(page, base):
    """Sketch backgrounds are present; the homepage remains the approved benchmark."""
    page.goto(base + 'about.html')
    assert page.locator('.about-intro-art.bambu-havas-placeholder').evaluate(
        "(el) => getComputedStyle(el).position === 'relative'")
    expect(page.locator('.bambu-founder-story')).to_be_visible()
    page.goto(base + 'journal.html')
    assert page.locator('.journal-intro').evaluate(
        "(el) => getComputedStyle(el, '::before').content === 'none'")
    if page.viewport_size['width'] <= 950:
        page.locator('.mobile-nav > summary').click()
        assert page.locator('.mobile-expertise > summary > small').count() == 0
        page.keyboard.press('Escape')


def test_page_rhythm_and_original_studies(page, base):
    """Keep the homepage intact and give each principal page a distinct opening."""
    page.goto(base + 'index.html')
    expect(page.locator('.home-scene-principles, .home-scene-question')).to_have_count(0)
    expect(page.locator('.home-colour-sketch use')).to_have_attribute('href', 'assets/studies/brand-colour-sketch.svg#brand-workplace-sketch')
    expect(page.locator('[data-colour-toggle]')).to_have_count(0)
    expect(page.locator('.relaunch-belief h2')).to_contain_text('The discipline of a builder.')
    expect(page.locator('.bambu-founder img[src="ed-paradise.webp"]')).to_have_count(1)
    expect(page.locator('.r2-audience-grid > a')).to_have_count(3)
    assert page.locator('.bambu-home .bambu-material-story').count() == 0
    assert page.locator('.bambu-home .relaunch-standards').count() == 0
    expect(page.locator('.reveal-range')).to_have_value('0')

    home = 'render.jpg'
    page.goto(base + 'approach.html')
    expect(page.locator('.approach-sketch-visual img')).to_have_count(0)
    expect(page.locator('.approach-process .tube-stations > li')).to_have_count(5)
    assert not page.locator('.approach-hero-visual img[src="render.jpg"]').count()

    page.goto(base + 'our-work.html')
    expect(page.locator('.exp-lead-image.bambu-exp-proof')).to_be_visible()
    expect(page.locator('.bambu-project-detail')).to_have_count(3)
    expect(page.locator('.bambu-project-detail__visual img')).to_have_count(0)
    expect(page.locator('.experience-timeline')).to_have_count(0)
    assert page.locator('main > section').first.get_attribute('class') == 'exp-lead'

    page.goto(base + 'journal.html')
    expect(page.locator('.journal-feature a')).to_have_attribute('href', 'journal-introducing-bambu.html')
    expect(page.locator('main article')).to_have_count(1)
    assert page.locator('.about-hero').count() == 0

    page.goto(base + 'operators.html')
    expect(page.locator('.operator-plan-intro img').first).to_have_attribute('src', 'assets/process/outline-tour-hd.webp')
    expect(page.locator('.operator-plan-intro figcaption')).to_have_count(0)
    assert page.locator('.operator-image-opening .expertise-scene').evaluate("el => getComputedStyle(el).position === 'absolute'")
    expect(page.locator('.operator-visual-story img')).to_have_count(0)
    expect(page.locator('.operator-roadmap > li')).to_have_count(5)
    expect(page.locator('.operator-plan-download')).to_have_count(0)

    page.goto(base + 'about.html')
    expect(page.locator('.about-intro-art img')).to_have_count(0)
    expect(page.locator('.bambu-founder-letter img')).to_have_attribute('src', 'ed-paradise.webp')
    expect(page.locator('main .about-intro-hero')).to_have_count(1)


def test_design_review(page, base):
    # Owner-only preview must stay discoverable by URL, not search engines.
    page.goto(base + 'brand-review.html')
    expect(page.locator('meta[name=robots]')).to_have_attribute('content', 'noindex,nofollow')
    expect(page.locator('#brand-options img').first).to_have_attribute('src', 'assets/brand/bambu-original-blue.svg')
    assert page.locator('.review-stages').first.locator('img').count() == 3
    expect(page.locator('img[src="tenant-pencil-cutaway.jpg"]')).to_be_visible()

    page.goto(base + 'approach.html')
    cards = page.locator('.approach-service-grid > a').evaluate_all("els => els.map(el => ({href:el.getAttribute('href'),src:el.querySelector('img').getAttribute('src')}))")
    for card in cards:
        page.goto(base + card['href'])
        expect(page.locator('.service-story-image img')).to_have_attribute('src', card['src'])

    # The explanatory study is published on a real service page.
    page.goto(base + 'workplace-design.html#layout-study')
    expect(page.locator('#layout-study-heading')).to_be_visible()
    expect(page.locator('#layout-study img')).to_have_count(0)
    assert page.locator('#layout-study').evaluate("el => getComputedStyle(el, '::after').backgroundImage.includes('floor-build-up.svg')")
    # Old specialist pages used to send Expertise to the occupier page.
    expect(page.locator('.desktop-nav .nav-dropdown > a')).to_have_attribute('href', 'approach.html')

    page.goto(base + 'operators.html')
    expect(page.locator('.operator-plan-download')).to_have_count(0)



def test_mobile_menu_spacing_and_audience_carousel(page, base):
    """Prevent the 44px nested-summary regression and verify native sideways navigation."""
    page.goto(base + 'index.html')
    rail = page.locator('#audience-bambu-rail')
    expect(rail.locator('[data-bambu-slide]')).to_have_count(3)
    assert rail.evaluate("""el =>
        getComputedStyle(el).display === 'flex' &&
        getComputedStyle(el).overflowX === 'auto' &&
        el.scrollWidth > el.clientWidth + 30"""), "Audience cards must be horizontally scrollable"
    controls = page.locator('[data-bambu-controls="audience-bambu-rail"]')
    previous = controls.locator('[data-bambu-prev]')
    following = controls.locator('[data-bambu-next]')
    expect(previous).to_be_disabled()
    expect(following).to_be_enabled()
    following.click()
    page.wait_for_function("document.querySelector('#audience-bambu-rail').scrollLeft > 10")
    expect(previous).to_be_enabled()
    if page.viewport_size['width'] <= 950:
        page.locator('.mobile-nav > summary').click()
        menu = page.locator('.mobile-nav > nav')
        expect(menu).to_be_visible()
        geometry = menu.evaluate("""nav => {
            const els = [...nav.children].filter(el =>
                (el.tagName === 'A' || el.classList.contains('mobile-expertise')) &&
                getComputedStyle(el).display !== 'none');
            const boxes = els.map(el => el.getBoundingClientRect());
            const summary = nav.querySelector('.mobile-expertise > summary');
            const inner = summary.getBoundingClientRect();
            return {
                labels: els.map(el => el.textContent.trim()),
                boxes: boxes.map(r => ({top:r.top,bottom:r.bottom,height:r.height})),
                summaryWidth: inner.width,
                navigationWidth: nav.clientWidth,
                summaryHeight: inner.height,
                textFits: summary.scrollHeight <= summary.clientHeight + 2
            };
        }""")
        assert len(geometry['boxes']) >= 4, geometry
        assert all(box['height'] >= 70 for box in geometry['boxes']), geometry
        assert all(geometry['boxes'][i+1]['top'] >= geometry['boxes'][i]['bottom'] - 1
                   for i in range(len(geometry['boxes'])-1)), geometry
        assert geometry['summaryWidth'] >= geometry['navigationWidth'] * .75, geometry
        assert geometry['summaryHeight'] >= 70 and geometry['textFits'], geometry
        page.keyboard.press('Escape')
        expect(menu).to_be_hidden()


def test_real_project_story(page, base):
    """Only sourced client details and explicit image placeholders are presented as past work."""
    page.goto(base + 'index.html')
    gallery = page.locator('#home-bambu-rail')
    expect(gallery.locator('.bambu-project-card')).to_have_count(3)
    expect(gallery.locator('img')).to_have_count(0)
    expect(gallery.locator('.bambu-project-card').nth(0)).to_contain_text('Havas')
    expect(gallery.locator('.bambu-project-card').nth(1)).to_contain_text('Saga')
    expect(gallery.locator('.bambu-project-card').nth(2)).to_contain_text('MSCI')
    expect(page.locator('#home-projects-title')).to_have_text('Real clients. Real experience.')
    assert 'Design studies / A closer look' not in page.locator('#selected-experience').inner_text()
    assert 'not contracts delivered under the BAMBU Interiors name' in page.locator('#selected-experience').inner_text()
    page.goto(base + 'our-work.html')
    for project in ['havas', 'saga', 'msci']:
        expect(page.locator('#case-' + project)).to_be_visible()
        expect(page.locator('#case-' + project + ' .bambu-project-detail__visual img')).to_have_count(0)
    page.goto(base + 'about.html')
    expect(page.locator('.about-intro-hero')).to_contain_text('Small by design.')
    expect(page.locator('.bambu-havas-placeholder')).to_contain_text('Verified project photograph to follow')
    expect(page.locator('.bambu-founder-timeline time')).to_have_text(['2022', '2026'])
    expect(page.locator('.bambu-founder-letter__signature')).to_contain_text('Ed Paradise')
    assert page.locator('main > section').first.get_attribute('class') == 'about-intro-hero bambu-about-hero'
    assert page.locator('main > section').nth(1).get_attribute('class') == 'bambu-founder-story'
    assert page.locator('.about-feature, .about-principles, .about-practice').count() == 0

def test_process_story(page, base):
    page.goto(base + 'our-work.html')
    expect(page.locator('[data-process-reel]')).to_have_count(0)
    expect(page.locator('.exp-lead-image.bambu-exp-proof')).to_be_visible()
    expect(page.locator('#case-msci')).to_contain_text('Flooring works')
    expect(page.locator('#case-saga')).to_contain_text('5,000 sq ft')
    expect(page.locator('#case-havas')).to_contain_text('3,500 sq ft')
    page.goto(base + 'tenants.html')
    expect(page.locator('[data-process-reel]')).to_have_count(0)
    expect(page.locator('.tube-stations > li')).to_have_count(5)
    expect(page.locator('.occupier-phases > li')).to_have_count(5)
    expect(page.locator('.tube-lines-mobile' if page.viewport_size['width'] <= 800 else '.tube-lines-desktop')).to_be_visible()
    expect(page.locator('.workplace-tube-map a')).to_have_count(0)
    page.goto(base + 'approach.html#phase-develop')
    expect(page.locator('#phase-develop')).to_be_visible()
    expect(page.locator('#phase-develop details')).to_have_count(0)
    page.goto(base + 'approach.html')
    expect(page.locator('.process-welcome')).to_contain_text('inner workings of our mind')
    expect(page.locator('.approach-service-grid a').first.locator('img')).to_have_attribute('src', 'assets/r3/materials.webp')

def check_pages(page, width, base, output):
    for file in sorted(ROOT.glob('*.html')):
        page.goto(base + file.name, wait_until='load')
        if file.stem != 'concept':
            expect(page.locator('footer.site-footer')).to_have_count(1)
            expect(page.locator('body > header')).to_have_count(1)
            expect(page.locator('.masthead-signature')).to_have_count(0)
        if file.stem == 'concept':
            page.wait_for_function("location.hash === '#design-reveal' && !!document.querySelector('[data-reveal]')")
        bad_images = page.evaluate("""async () => {
            const imgs = [...document.images];
            const checks = await Promise.allSettled(imgs.map(img => {
                img.loading = 'eager';
                return img.decode();
            }));
            return checks.flatMap((check, i) =>
                check.status === 'rejected' ? [imgs[i].getAttribute('src')] : []);
        }""")
        assert not bad_images, f'{file.name} at {width}px: undecodable images: {bad_images}'
        assert not any(dash in page.locator('body').inner_text() for dash in ['—', '–']), f'{file.name}: long editorial dash remains'
        wrong_ratio = page.evaluate("""() => [...document.images].filter(img => {
            if (!/\.(webp|png|jpe?g)(\?|$)/i.test(img.getAttribute('src') || '')) return false;
            const w = Number(img.getAttribute('width')), h = Number(img.getAttribute('height'));
            return !w || !h || Math.abs(w / h - img.naturalWidth / img.naturalHeight) > .005;
        }).map(img => img.getAttribute('src'))""")
        assert not wrong_ratio, f'{file.name}: incorrect image dimensions: {wrong_ratio}'
        overflow = page.evaluate('document.documentElement.scrollWidth - innerWidth')
        if overflow > 1:
            offenders = page.evaluate("""() => [...document.querySelectorAll('body *')].flatMap(el => {
                const r = el.getBoundingClientRect();
                if (r.right <= innerWidth + 1 || r.left >= innerWidth) return [];
                const style = getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') return [];
                return [{tag:el.tagName, className:typeof el.className === 'string' ? el.className.slice(0,100) : '',
                    right:Math.round(r.right), left:Math.round(r.left), width:Math.round(r.width),
                    text:(el.innerText || '').slice(0,65)}];
            }).sort((a,b)=>b.right-a.right).slice(0,12)""")
            raise AssertionError(f'{file.name} at {width}px overflows by {overflow}px; offenders={offenders}')
        if width <= 950:
            toggle = page.locator('.mobile-nav > summary')
            expect(toggle).to_be_visible()
            toggle.click()
            expect(page.locator('.mobile-nav nav')).to_be_visible()
            page.keyboard.press('Escape')
            expect(page.locator('.mobile-nav nav')).to_be_hidden()
        else:
            expect(page.locator('.desktop-nav')).to_be_visible()
            trigger = page.locator('.expertise-toggle')
            page.mouse.move(5, 5)
            page.locator('.desktop-nav .nav-dropdown > a').hover()
            expect(trigger, file.name + ': desktop hover').to_have_attribute('aria-expanded', 'true')
            expect(page.locator('.desktop-nav .nav-submenu')).to_be_visible()
            page.mouse.move(5, page.viewport_size['height'] - 5)
            expect(page.locator('.desktop-nav .nav-submenu')).to_be_hidden()
            trigger.click()
            expect(trigger).to_have_attribute('aria-expanded', 'true')
            panel = page.locator('.desktop-nav .nav-submenu')
            expect(panel).to_be_visible()
            page.wait_for_timeout(220)
            covered = panel.locator('a').evaluate_all('''els => els.filter(el => {
                const r = el.getBoundingClientRect();
                const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
                return !hit || hit.closest('a') !== el;
            }).map(el => el.getAttribute('href'))''')
            assert not covered, f'{file.name}: covered desktop destinations: {covered}'
            page.keyboard.press('Escape')
            expect(trigger).to_have_attribute('aria-expanded', 'false')
            expect(panel).to_be_hidden()
        if output:
            page.evaluate('window.scrollTo(0, 0)')
            page.screenshot(path=output / f'{width}-{file.stem}.jpg', type='jpeg', quality=58, full_page=True)
    print(f'{width}px: all page widths, images and navigation passed.', flush=True)


def test_expertise_destinations(page, base):
    routes = ['tenants','landlords','operators','approach','delivery-network','material-innovation']
    for route in routes:
        page.goto(base + 'index.html')
        if page.viewport_size['width'] <= 950:
            page.locator('.mobile-nav > summary').click()
            page.locator('.mobile-expertise > summary').click()
            page.locator('.mobile-expertise a[href="' + route + '.html"]').click()
        else:
            page.locator('.expertise-toggle').click()
            page.locator('.mega-destinations a[href="' + route + '.html"]').click()
        expect(page).to_have_url(re.compile(re.escape(base + route) + r'(?:\.html)?$'))
        expect(page.locator('h1')).to_be_visible()
        expect(page.locator('.expertise-opening .expertise-scene img')).to_have_count(0 if route == 'tenants' else 3)
    if page.viewport_size['width'] > 950:
        for service in ['workplace-design','commercial-fit-out','construction-management','furniture-ff-e','av-technology','maintenance-aftercare']:
            page.goto(base + 'index.html')
            page.locator('.expertise-toggle').click()
            page.locator('.mega-services a[href="' + service + '.html"]').click()
            expect(page).to_have_url(re.compile(re.escape(base + service) + r'(?:\.html)?$'))
            expect(page.locator('h1')).to_be_visible()
        page.goto(base + 'journal.html')
        button = page.locator('.expertise-toggle')
        button.focus()
        page.keyboard.press('ArrowDown')
        expect(page.locator('.mega-destinations a').first).to_be_focused()
        page.keyboard.press('Escape')
        expect(button).to_be_focused()
        expect(page.locator('.nav-submenu')).to_be_hidden()


def test_mobile_edition(page, base):
    page.goto(base + 'index.html')
    expect(page.locator('.masthead img.unified-wordmark')).to_have_attribute('src', 'assets/brand/bambu-original-blue.svg')
    expect(page.locator('.bambu-connect-launch img')).to_have_attribute('src', 'assets/brand/bambu-b-blue.svg')
    if page.viewport_size['width'] in [390, 402, 440]:
        study = page.locator('.hero-study-link').bounding_box()
        assert study['y'] + study['height'] <= page.viewport_size['height'] + 1, study
    assert page.locator('.home-scene .relaunch-actions .cta').evaluate("el => getComputedStyle(el).borderTopWidth") == '0px'
    expect(page.locator('.home-scroll-cue')).to_be_visible()
    cue = page.locator('.home-scroll-cue').bounding_box()
    assert cue['y'] >= 0 and cue['y'] + cue['height'] <= page.viewport_size['height'], cue
    page.locator('.home-scroll-cue').click()
    expect(page.locator('#bambu-approach')).to_be_focused()
    expect(page.locator('#bambu-approach')).to_be_in_viewport()
    expect(page.locator('.home-scroll-cue')).to_be_hidden()
    expect(page.locator('.page-position')).to_be_visible()
    page.evaluate("scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'})")
    page.wait_for_function("scrollY > 0 && parseFloat(document.querySelector('.page-position-thumb').style.top) > 0")
    page.goto(base + 'journal.html')
    assert page.locator('.journal-label').evaluate("el => getComputedStyle(el).color") == 'rgb(128, 97, 47)'
    if page.viewport_size['width'] <= 800:
        assert page.locator('main').bounding_box()['x'] == 0
        assert page.locator('.journal-intro').bounding_box()['x'] == 0
        assert page.locator('.journal-feature').bounding_box()['x'] == 0
        assert abs(page.locator('main').bounding_box()['width'] - page.viewport_size['width']) < 1


def main():
    output = Path(os.environ['BAMBU_SCREENSHOTS']) if os.getenv('BAMBU_SCREENSHOTS') else None
    if output:
        output.mkdir(parents=True, exist_ok=True)
    with ThreadingHTTPServer(('127.0.0.1', 0), partial(StaticFiles, directory=ROOT)) as server:
        Thread(target=server.serve_forever, daemon=True).start()
        base = os.getenv('BAMBU_TEST_URL') or f'http://127.0.0.1:{server.server_port}/'
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=os.getenv('BAMBU_CHROMIUM'))
            first_visit = browser.new_context(viewport={'width':402,'height':760})
            intro = first_visit.new_page()
            intro.goto(base, wait_until='domcontentloaded')
            expect(intro.locator('.bambu-opening')).to_be_visible(timeout=2000)
            intro.keyboard.press('Escape')
            expect(intro.locator('.bambu-opening')).to_be_hidden(timeout=1500)
            expect(intro.locator('[data-colour-toggle]')).to_have_count(0)
            colours = intro.locator('.home-colour-sketch').evaluate('''async el => {
                const animation = el.getAnimations()[0];
                animation.pause();
                animation.currentTime = 0;
                await new Promise(requestAnimationFrame);
                const first = getComputedStyle(el).color;
                animation.currentTime = 14000;
                await new Promise(requestAnimationFrame);
                const second = getComputedStyle(el).color;
                animation.currentTime = 0;
                animation.play();
                return [first, second];
            }''')
            assert colours[0] != colours[1], colours
            assert colours[0] == 'rgb(0, 185, 235)', colours
            intro.goto(base + 'our-work.html')
            expect(intro.locator('[data-process-reel]')).to_have_count(0)
            expect(intro.locator('.bambu-project-detail')).to_have_count(3)
            returning = browser.new_context(storage_state=first_visit.storage_state())
            repeat = returning.new_page()
            repeat.goto(base)
            expect(repeat.locator('.bambu-opening')).to_be_hidden()
            original_seen = repeat.evaluate("localStorage.getItem('bambu-intro-last-shown-at')")
            repeat.goto(base + 'about.html')
            repeat.goto(base)
            expect(repeat.locator('.bambu-opening')).to_be_hidden()
            assert repeat.evaluate("localStorage.getItem('bambu-intro-last-shown-at')") == original_seen
            six_days_ago = repeat.evaluate('''() => {
                const timestamp = String(Date.now() - 6 * 24 * 60 * 60 * 1000);
                localStorage.setItem('bambu-intro-last-shown-at', timestamp);
                sessionStorage.setItem('bambu-intro-last-shown-at', timestamp);
                return timestamp;
            }''')
            repeat.reload()
            expect(repeat.locator('.bambu-opening')).to_be_hidden()
            assert repeat.evaluate("localStorage.getItem('bambu-intro-last-shown-at')") == six_days_ago
            repeat.evaluate('''() => {
                const timestamp = String(Date.now() - 8 * 24 * 60 * 60 * 1000);
                localStorage.setItem('bambu-intro-last-shown-at', timestamp);
                sessionStorage.setItem('bambu-intro-last-shown-at', timestamp);
            }''')
            repeat.reload()
            expect(repeat.locator('.bambu-opening')).to_be_visible()
            assert int(repeat.evaluate("localStorage.getItem('bambu-intro-last-shown-at')")) > int(six_days_ago)
            expect(repeat.locator('.opening-wordmark .intro-stage:not(.intro-pencil-echo) path')).to_have_count(15)
            expect(repeat.locator('.opening-wordmark text, .opening-interiors')).to_have_count(0)
            assert repeat.locator('.opening-flight').bounding_box()['width'] > repeat.viewport_size['width'] * .7
            expect(repeat.locator('.opening-wordmark filter, .opening-wordmark pattern, .intro-pencil-echo')).to_have_count(0)
            before_reveal = repeat.locator('.opening-flight').bounding_box()
            repeat.wait_for_function("document.documentElement.classList.contains('intro-revealing')", timeout=4500)
            fading = repeat.evaluate('''async () => {
                const overlay = document.querySelector('.bambu-opening');
                const animation = overlay.getAnimations()[0];
                await animation.ready;
                animation.pause();
                animation.currentTime = animation.effect.getTiming().duration / 2;
                await new Promise(requestAnimationFrame);
                const rect = document.querySelector('.opening-flight').getBoundingClientRect();
                return {opacity:Number(getComputedStyle(overlay).opacity),x:rect.x,y:rect.y,width:rect.width};
            }''')
            assert 0 < fading['opacity'] < 1, fading
            for value in ['x','y','width']:
                assert abs(fading[value] - before_reveal[value]) < 1, (fading,before_reveal)
            expect(repeat.locator('.intro-descriptor')).to_have_count(0)
            repeat.evaluate("document.querySelector('.bambu-opening').getAnimations()[0].play()")
            expect(repeat.locator('.bambu-opening')).to_be_hidden(timeout=3000)
            assert not repeat.locator('main').evaluate('el => el.inert')
            assert repeat.locator('.masthead .unified-wordmark').evaluate('el => getComputedStyle(el).opacity') == '1'
            returning.close()
            first_visit.close()
            for w,h in [(375,667),(390,844),(402,760),(440,956),(768,1024),(1440,900)]:
                ctx = browser.new_context(viewport={'width':w,'height':h}, reduced_motion='reduce',
                                          permissions=['clipboard-read','clipboard-write'])
                page = ctx.new_page()
                # Keep normal navigation tests focused on site UX after a visitor
                # rejects optional analytics. Consent itself is tested here too.
                page.goto(base + 'contact.html', wait_until='domcontentloaded')
                expect(page.locator('.bambu-analytics-consent')).to_be_visible(timeout=3000)
                expect(page.locator('script[data-bambu-analytics]')).to_have_count(0)
                page.get_by_role('button', name='Reject optional').click()
                expect(page.locator('.bambu-analytics-consent')).to_have_count(0)
                expect(page.locator('script[data-bambu-analytics]')).to_have_count(0)
                # With explicit opt-in, the GA4 library is requested and the
                # correct config command is placed on the tag data layer.
                page.locator('footer .bambu-cookie-settings').click()
                expect(page.locator('.bambu-analytics-consent')).to_be_visible()
                with page.expect_request(re.compile(r'googletagmanager.com/gtag/js\?id=G-KR7H49KVEQ')):
                    page.get_by_role('button', name='Accept analytics').click()
                expect(page.locator('script[data-bambu-analytics]')).to_have_attribute(
                    'src', 'https://www.googletagmanager.com/gtag/js?id=G-KR7H49KVEQ')
                assert page.evaluate("""() => window.dataLayer.some(command =>
                    command[0] === 'config' && command[1] === 'G-KR7H49KVEQ')""")
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                check_pages(page,w,base,output)
                test_expertise_destinations(page,base)
                test_mobile_edition(page,base)
                test_mobile_menu_spacing_and_audience_carousel(page,base)
                test_real_project_story(page,base)
                test_forms(page,base)
                test_process_story(page,base)
                test_design_review(page,base)
                test_editorial_redesign(page,base)
                test_page_rhythm_and_original_studies(page,base)
                test_terracotta_visual_layers(page,base)
                page.goto(base)
                expect(page.locator('.bambu-opening')).to_be_hidden()
                for value in ['0','50','100']:
                    page.locator(f'button[data-reveal-stage="{value}"]').first.click()
                    expect(page.locator('.reveal-range')).to_have_value(value)
                assert not errors, errors
                ctx.close()
            hd = browser.new_context(viewport={'width':1440,'height':900}, device_scale_factor=2, reduced_motion='reduce')
            quality = hd.new_page()
            for route in ['index.html', 'our-work.html', 'journal-introducing-bambu.html']:
                quality.goto(base + route, wait_until='load')
                expect(quality.locator('footer.site-footer')).to_have_count(1)
                assert quality.evaluate('devicePixelRatio') == 2
                assert quality.evaluate('document.documentElement.scrollWidth - innerWidth') <= 1
                if output:
                    quality.screenshot(path=output / ('2x-' + route.replace('.html','.jpg')), type='jpeg', quality=85)
            hd.close()
            browser.close()
        server.shutdown()


if __name__ == '__main__':
    main()
