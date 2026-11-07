#!/usr/bin/env bash
# Stage the files the site actually serves into dist/ for Cloudflare Pages.
# Used by .github/workflows/deploy-cloudflare-pages.yml and available locally:
#   bash scripts/build-site.sh
set -euo pipefail

cd "$(dirname "$0")/.."

rm -rf dist
mkdir -p dist

FILES=(
    index.html
    home.html
    updates.html
    games.html
    ghostlink.html
    TextNexus.html
    feedback.html
    admin.html
    owner.html
    creator.html
    settings.html
    notifications.html
    suggestions.html
    signup.html
    email-manager.html
    jeoweb.html
    secret1.html
    nexus_maintenance.html
    system_analytics_health.html
    nexus_admin_control_center.html
    404.html
    Style.css
    thanksgiving.css
    logo.svg
    og-image.png
    sw.js
    app.js
    bareworker.js
    database.rules.json
    _headers
    robots.txt
    sitemap.xml
    site.webmanifest
)

missing=0
for f in "${FILES[@]}"; do
    if [ -e "$f" ]; then
        cp "$f" dist/
    else
        echo "missing: $f" >&2
        missing=1
    fi
done

if [ "$missing" -ne 0 ]; then
    echo "build failed: expected site files are missing" >&2
    exit 1
fi

# Cloudflare Web Analytics is injected only when the build supplies a token,
# so the value never lives in the repository.
if [ -n "${CF_ANALYTICS_TOKEN:-}" ]; then
    python3 scripts/inject-analytics.py dist "$CF_ANALYTICS_TOKEN"
fi

echo "staged $(find dist -type f | wc -l) files in dist/"
