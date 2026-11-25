"""Cross-engine responsive smoke checks for all public HTML pages."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import os

ROOT = Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path != '/' and not Path(path).suffix and (ROOT / (path.lstrip('/') + '.html')).is_file():
            self.path = path + '.html'
        return super().do_GET()
    def log_message(self, *args): pass

def main():
    routes = sorted(p.name for p in ROOT.glob('*.html') if p.name not in {'404.html','experience.html','our-work.html'})
    failures = []
    with ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=ROOT)) as server:
        Thread(target=server.serve_forever, daemon=True).start()
        base = os.getenv('BAMBU_TEST_URL') or f'http://127.0.0.1:{server.server_port}/'
        with sync_playwright() as pw:
            profiles = [(pw.webkit,375,667,True),(pw.webkit,390,844,True),(pw.chromium,360,800,True),(pw.chromium,412,915,True),(pw.webkit,768,1024,True),(pw.webkit,1440,900,False),(pw.chromium,1366,768,False),(pw.chromium,1920,1080,False),(pw.firefox,1440,900,False)]
            for engine,w,h,mobile in profiles:
                browser = engine.launch()
                context = browser.new_context(viewport={'width':w,'height':h},has_touch=mobile,is_mobile=mobile,reduced_motion='reduce')
                page = context.new_page()
                for route in routes:
                    try:
                        response=page.goto(base+route,wait_until='domcontentloaded',timeout=15000)
                        if not response or response.status>=400: raise AssertionError('HTTP failure')
                        page.evaluate("document.fonts.ready")
                        metrics=page.evaluate("() => ({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})")
                        if metrics['scroll']>metrics['width']+2: raise AssertionError(f'horizontal overflow {metrics}')
                        if route=='contact.html':
                            cue=page.locator('a[href="#project-enquiry"]').first.bounding_box()
                            if not cue or cue['y']+cue['height']>h: raise AssertionError(f'enquiry CTA outside viewport: {cue}')
                    except Exception as exc:
                        failures.append(f'{engine.name} {w}x{h} {route}: {exc}')
                browser.close()
                print(f'Checked {len(routes)} routes: {engine.name} {w}x{h}',flush=True)
    if failures: raise SystemExit('\n'.join(failures))
    print('PASS: cross-engine responsive checks')
if __name__=='__main__': main()
