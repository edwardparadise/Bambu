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
    expect(page.locator('.approach-process-grid article')).to_have_count(5)
    expect(page.locator('.approach-decision-grid article')).to_have_count(2)
    expect(page.locator('.approach-service-grid > a')).to_have_count(6)
    assert page.locator('.approach-process details').count() == 0
    for image in page.locator('.approach-hero-visual img, .approach-service-grid img').all():
        assert image.evaluate('(img) => img.complete && img.naturalWidth > 0')
    page.goto(base + 'about.html')
    expect(page.locator('.about-principles-grid article')).to_have_count(4)
    expect(page.locator('.about-conversation-image img')).to_be_visible()
    assert page.locator('.startup-manifesto').count() == 0


def test_design_review(page, base):
    # Owner-only preview must stay discoverable by URL, not search engines.
    page.goto(base + 'brand-review.html')
    expect(page.locator('meta[name=robots]')).to_have_attribute('content', 'noindex,nofollow')
    expect(page.locator('#brand-options img')).to_have_attribute('src', 'assets/brand/bambu-logo-options.svg')
    assert page.locator('.review-stages').first.locator('img').count() == 3
    expect(page.locator('img[src="assets/studies/workplace-plan.svg"]')).to_be_visible()

    # The explanatory study is published on a real service page.
    page.goto(base + 'workplace-design.html#layout-study')
    expect(page.locator('#layout-study-heading')).to_be_visible()
    expect(page.locator('#layout-study img')).to_have_attribute('src', 'assets/studies/workplace-plan.svg')
    # Old specialist pages used to send Expertise to the occupier page.
    expect(page.locator('.desktop-nav .nav-dropdown > a')).to_have_attribute('href', 'approach.html')

    page.goto(base + 'operators.html')
    expect(page.locator('a[href="workplace-design.html#layout-study"]')).to_be_visible()

def check_pages(page, width, base, output):
    for file in sorted(ROOT.glob('*.html')):
        page.goto(base + file.name, wait_until='load')
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
        if output:
            page.evaluate('window.scrollTo(0, 0)')
            page.screenshot(path=output / f'{width}-{file.stem}.jpg', type='jpeg', quality=58, full_page=True)
    print(f'{width}px: all page widths, images and navigation passed.', flush=True)


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
            returning = browser.new_context(storage_state=first_visit.storage_state())
            repeat = returning.new_page()
            repeat.goto(base)
            expect(repeat.locator('.bambu-opening')).to_be_hidden()
            returning.close()
            first_visit.close()
            for w,h in [(390,844),(768,1024),(1440,900)]:
                ctx = browser.new_context(viewport={'width':w,'height':h}, reduced_motion='reduce',
                                          permissions=['clipboard-read','clipboard-write'])
                page = ctx.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                check_pages(page,w,base,output)
                test_forms(page,base)
                test_design_review(page,base)
                test_editorial_redesign(page,base)
                page.goto(base)
                expect(page.locator('.bambu-opening')).to_be_hidden()
                for value in ['0','50','100']:
                    page.locator(f'button[data-reveal-stage="{value}"]').first.click()
                    expect(page.locator('.reveal-range')).to_have_value(value)
                assert not errors, errors
                ctx.close()
            browser.close()
        server.shutdown()


if __name__ == '__main__':
    main()
