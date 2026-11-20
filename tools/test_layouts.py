"""Browser regression tests for the static website. Serve the checkout locally."""
import os
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
    expect(page.locator('.r2-tube > li')).to_have_count(5)
    expect(page.locator('.approach-decision-grid article')).to_have_count(2)
    expect(page.locator('.approach-service-grid > a')).to_have_count(6)
    assert page.locator('.approach-process details').count() == 5
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
    expect(page.locator('.about-principles-grid article')).to_have_count(4)
    expect(page.locator('.r2-relocated .relaunch-method-grid article')).to_have_count(4)
    expect(page.locator('.about-practice-facts dt')).to_have_count(4)
    expect(page.locator('.about-conversation-image img')).to_have_count(0)
    assert page.locator('.startup-manifesto').count() == 0



def test_terracotta_visual_layers(page, base):
    """Sketch backgrounds are present; the homepage remains the approved benchmark."""
    page.goto(base + 'about.html')
    assert page.locator('.about-intro-art').evaluate("(el) => getComputedStyle(el).position === 'absolute'")
    assert page.locator('.about-conversation-copy').evaluate(
        "(el) => getComputedStyle(el, '::before').backgroundImage.includes('terracotta-workplace-line.svg')")
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
    expect(page.locator('.r2-tube > li')).to_have_count(5)
    assert not page.locator('.approach-hero-visual img[src="render.jpg"]').count()

    page.goto(base + 'our-work.html')
    expect(page.locator('.exp-lead-image .process-frame').first.locator('img')).to_have_attribute('src', 'assets/process/outline-cad-hd.webp')
    expect(page.locator('.exp-capabilities article')).to_have_count(3)
    expect(page.locator('.exp-capabilities figure')).to_have_count(0)
    expect(page.locator('.capability-icon')).to_have_count(3)
    expect(page.locator('.experience-timeline time')).to_have_text(['2022', '2026'])
    assert page.locator('main > section').first.get_attribute('class') == 'exp-lead'

    page.goto(base + 'journal.html')
    expect(page.locator('.journal-feature a')).to_have_attribute('href', 'journal-introducing-bambu.html')
    expect(page.locator('main article')).to_have_count(1)
    assert page.locator('.about-hero').count() == 0

    page.goto(base + 'operators.html')
    expect(page.locator('.operator-plan-intro img')).to_have_attribute('src', 'assets/studies/expertise/operators.svg')
    expect(page.locator('.operator-plan-intro figcaption')).to_have_count(0)
    assert page.locator('.operator-image-opening .expertise-scene').evaluate("el => getComputedStyle(el).position === 'absolute'")
    expect(page.locator('.operator-visual-story img')).to_have_count(0)
    expect(page.locator('.operator-roadmap > li')).to_have_count(5)
    expect(page.locator('.operator-plan-download')).to_have_count(0)

    page.goto(base + 'about.html')
    expect(page.locator('.about-feature img')).to_have_attribute('src', 'assets/r3/reception.webp')
    expect(page.locator('.about-intro-art img')).to_have_attribute('src', 'assets/visuals/white-box-reference.webp')
    assert page.locator('main .about-intro-hero').count() == 1


def test_design_review(page, base):
    # Owner-only preview must stay discoverable by URL, not search engines.
    page.goto(base + 'brand-review.html')
    expect(page.locator('meta[name=robots]')).to_have_attribute('content', 'noindex,nofollow')
    expect(page.locator('#brand-options img').first).to_have_attribute('src', 'assets/brand/bambu-rounded-blue.svg')
    assert page.locator('.review-stages').first.locator('img').count() == 3
    expect(page.locator('img[src="tenant-pencil-cutaway.jpg"]')).to_be_visible()

    # The explanatory study is published on a real service page.
    page.goto(base + 'workplace-design.html#layout-study')
    expect(page.locator('#layout-study-heading')).to_be_visible()
    expect(page.locator('#layout-study img')).to_have_count(0)
    assert page.locator('#layout-study').evaluate("el => getComputedStyle(el, '::after').backgroundImage.includes('floor-build-up.svg')")
    # Old specialist pages used to send Expertise to the occupier page.
    expect(page.locator('.desktop-nav .nav-dropdown > a')).to_have_attribute('href', 'approach.html')

    page.goto(base + 'operators.html')
    expect(page.locator('.operator-plan-download')).to_have_count(0)


def test_process_story(page, base):
    page.goto(base + 'our-work.html')
    reel = page.locator('[data-process-reel]')
    expect(reel.locator('.process-frame')).to_have_count(5)
    expect(reel.locator('.process-frame:not([hidden])')).to_have_count(1)
    expect(reel.locator('[data-reel-toggle]')).to_have_count(0)
    expect(reel.locator('[data-reel-slide]')).to_have_count(0)
    expect(reel.locator('figcaption')).to_have_count(0)
    image = page.locator('.exp-lead-image')
    assert image.evaluate("el => getComputedStyle(el).position === 'absolute' && getComputedStyle(el).borderTopWidth === '0px'")
    bounds, hero = image.bounding_box(), page.locator('.exp-lead').bounding_box()
    assert abs(bounds['width'] - hero['width']) <= 1 and abs(bounds['height'] - hero['height']) <= 1, (bounds, hero)
    page.goto(base + 'tenants.html')
    expect(page.locator('[data-process-reel]')).to_have_count(0)
    expect(page.locator('.tube-stations > li')).to_have_count(5)
    expect(page.locator('.occupier-phases > li')).to_have_count(5)
    expect(page.locator('.tube-lines-mobile' if page.viewport_size['width'] <= 800 else '.tube-lines-desktop')).to_be_visible()
    page.locator('.tube-stop[href="approach.html#phase-develop"]').click()
    expect(page.locator('#phase-develop details')).to_have_attribute('open', '')
    page.goto(base + 'approach.html')
    expect(page.locator('.process-welcome')).to_contain_text('inner workings of our mind')
    expect(page.locator('.approach-service-grid a').first.locator('img')).to_have_attribute('src', 'assets/r3/materials.webp')

def check_pages(page, width, base, output):
    for file in sorted(ROOT.glob('*.html')):
        page.goto(base + file.name, wait_until='load')
        if file.stem != 'concept':
            expect(page.locator('footer.site-footer')).to_have_count(1)
            expect(page.locator('body > header')).to_have_count(1)
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
        assert overflow <= 1, f'{file.name} at {width}px overflows by {overflow}px'
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
        expect(page).to_have_url(base + route + '.html')
        expect(page.locator('h1')).to_be_visible()
        expect(page.locator('.expertise-opening .expertise-scene img')).to_have_count(1)
    if page.viewport_size['width'] > 950:
        for service in ['workplace-design','commercial-fit-out','construction-management','furniture-ff-e','av-technology','maintenance-aftercare']:
            page.goto(base + 'index.html')
            page.locator('.expertise-toggle').click()
            page.locator('.mega-services a[href="' + service + '.html"]').click()
            expect(page).to_have_url(base + service + '.html')
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
    expect(page.locator('.masthead img.unified-wordmark')).to_have_attribute('src', 'assets/brand/bambu-rounded-blue.svg')
    expect(page.locator('.bambu-connect-launch img')).to_have_attribute('src', 'assets/brand/bambu-b-blue.svg')
    if page.viewport_size['width'] in [390, 402, 440]:
        study = page.locator('.hero-study-link').bounding_box()
        assert study['y'] + study['height'] <= page.viewport_size['height'] + 1, study
    assert page.locator('.home-scene .relaunch-actions .cta').evaluate("el => getComputedStyle(el).borderTopWidth") == '0px'
    expect(page.locator('.page-position')).to_be_visible()
    page.evaluate('scrollTo(0, document.documentElement.scrollHeight)')
    page.wait_for_timeout(60)
    assert page.locator('.page-position-thumb').evaluate("el => parseFloat(el.style.top)") > 0
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
            first_visit = browser.new_context()
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
            reel = intro.locator('[data-process-reel]')
            reel.scroll_into_view_if_needed()
            expect(reel.locator('.process-frame').first).to_be_hidden(timeout=5500)
            returning = browser.new_context(storage_state=first_visit.storage_state())
            repeat = returning.new_page()
            repeat.goto(base)
            expect(repeat.locator('.bambu-opening')).to_be_hidden()
            returning.close()
            first_visit.close()
            for w,h in [(375,667),(390,844),(402,760),(440,956),(768,1024),(1440,900)]:
                ctx = browser.new_context(viewport={'width':w,'height':h}, reduced_motion='reduce',
                                          permissions=['clipboard-read','clipboard-write'])
                page = ctx.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                check_pages(page,w,base,output)
                test_expertise_destinations(page,base)
                test_mobile_edition(page,base)
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
