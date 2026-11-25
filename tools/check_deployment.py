"""Verify the public static files against this checkout after Cloudflare deploys."""
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from subprocess import check_output
from time import sleep
from urllib.error import URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('BAMBU_TEST_URL', 'https://bambuinteriors.co.uk/').rstrip('/') + '/'
paths = check_output(['git','ls-files'],cwd=ROOT,text=True).splitlines()
public = [p for p in paths if p.endswith(('.css','.html','.jpg','.js','.png','.pdf','.svg','.txt','.webp','.xml','.json')) and not p.startswith(('.github/','tools/','editorial/'))]
revision = os.environ.get('GITHUB_SHA', check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip())


def matches(path):
    url = BASE + path + '?release=' + revision[:12]
    try:
        with urlopen(Request(url,headers={'User-Agent':'BAMBU deployment check'}),timeout=30) as response:
            return response.read() == (ROOT/path).read_bytes()
    except (OSError, URLError):
        return False


pending = public.copy()
for attempt in range(15):
    with ThreadPoolExecutor(max_workers=8) as workers:
        pending = [p for p,ok in zip(pending,workers.map(matches,pending)) if not ok]
    if not pending:
        break
    print('Awaiting deployment:', ', '.join(pending), flush=True)
    if attempt < 14:
        sleep(10)
if pending:
    raise SystemExit('Deployment differs: '+', '.join(pending))
print(f'{len(public)} public files match the checkout.')
