#!/usr/bin/env python3
"""Inject the Cloudflare Web Analytics beacon into staged HTML.

Only runs when CF_ANALYTICS_TOKEN is set for the build, so the token never
lands in the repository. The snippet is skipped if a page already has it.
"""

import json
import pathlib
import sys


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: inject-analytics.py <dist-dir> <token>", file=sys.stderr)
        return 2

    root = pathlib.Path(sys.argv[1])
    token = sys.argv[2].strip()
    if not token:
        print("analytics: empty token, skipped", file=sys.stderr)
        return 0

    beacon = (
        '<script defer src="https://static.cloudflareinsights.com/beacon.min.js" '
        f"data-cf-beacon='{json.dumps({'token': token})}'></script>"
    )

    injected = 0
    for page in sorted(root.glob("*.html")):
        text = page.read_text(encoding="utf-8")
        if "cloudflareinsights.com/beacon" in text or "</head>" not in text:
            continue
        page.write_text(text.replace("</head>", f"  {beacon}\n</head>", 1), encoding="utf-8")
        injected += 1

    print(f"analytics: injected into {injected} page(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
