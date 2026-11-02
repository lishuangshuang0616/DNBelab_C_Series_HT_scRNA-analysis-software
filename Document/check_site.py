#!/usr/bin/env python3
"""Validate both manuals, local links/assets, anchors and frozen source hashes."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if attributes.get('id'):
            self.ids.add(attributes['id'])
        if tag == 'a' and attributes.get('name'):
            self.ids.add(attributes['name'])
        for key in ('href', 'src'):
            if attributes.get(key):
                self.links.append(attributes[key])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site-dir', type=Path, default=ROOT / 'site')
    site = parser.parse_args().site_dir.resolve()
    manifest = json.loads((site / 'versions.json').read_text())
    assert manifest['default'] == '3.2'
    assert [entry['version'] for entry in manifest['versions']] == ['3.2', '3.1']
    for entry in manifest['versions']:
        base = site / entry['path']
        assert 'index.html' in entry['pages'] and 'en/index.html' in entry['pages']
        for page in entry['pages']:
            assert (base / page).is_file(), (entry['version'], page)
        script = (base / 'javascripts/doc-controls.js').read_text().splitlines()[0]
        settings = json.loads(script.removeprefix('window.DNBC_DOCS = ').removesuffix(';'))
        assert settings['current'] == entry['version']
    parsed = {}
    for path in site.rglob('*.html'):
        page = Page()
        page.feed(path.read_text())
        parsed[path] = page
    errors = set()
    for path, page in parsed.items():
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc or url.path.startswith('/'):
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if target.is_dir():
                target /= 'index.html'
            if not target.exists():
                errors.add((str(path.relative_to(site)), link, 'missing file'))
            elif url.fragment and target in parsed and unquote(url.fragment) not in parsed[target].ids:
                errors.add((str(path.relative_to(site)), link, 'missing anchor'))
    for error in sorted(errors):
        print(*error, sep=': ')
    assert not errors, f'{len(errors)} broken local links'
    archive = ROOT / 'versions/3.1'
    snapshot = json.loads((archive / 'snapshot.json').read_text())
    for name, digest in snapshot['sha256'].items():
        assert hashlib.sha256((archive / name).read_bytes()).hexdigest() == digest, name
    print(f'PASS: {len(parsed)} HTML pages; all local links/assets/anchors; '
          f'both version manifests; {len(snapshot["sha256"])} archived source hashes.')


if __name__ == '__main__':
    main()
