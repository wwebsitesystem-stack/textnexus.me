# Self-hosting TextNexus

This folder is everything you need to run the TextNexus site on your own server
instead of GitHub Pages. The site is a static front end: HTML, CSS and
JavaScript that talk to Firebase directly from the browser. There is no build
step and no application server to keep running.

## Hosting model

The site is published on **Cloudflare Pages** (project `textnexus`), not on
GitHub Pages. `.github/workflows/deploy-cloudflare-pages.yml` stages the served
files with `scripts/build-site.sh` into `dist/` and uploads them, which keeps the
repository private while the output stays public.

This folder is still the way to run the same files on your own server: the Docker
and plain-nginx instructions below work unchanged.

## Requirements

- Docker 24+ with Compose v2 (recommended), **or** nginx 1.24+ if you install it yourself.
- Outbound HTTPS from the browser to Firebase, Google Fonts, the Tailwind CDN,
  Cloudflare Turnstile and AdSense. Nothing is bundled locally.

## Quick start (Docker)

From the repository root:

```bash
docker compose -f "Self hosting/docker-compose.yml" up -d --build
```

Then open <http://localhost:8080>.

The image is built from the repository root, because the site files sit one
level above this folder. Only the files the site actually serves are copied in,
so documentation, archives and this folder never reach the final image.

Stop it with:

```bash
docker compose -f "Self hosting/docker-compose.yml" down
```

## Without Docker

Copy the site files and the server block into place:

```bash
sudo cp index.html 404.html home.html updates.html ghostlink.html TextNexus.html \
        feedback.html admin.html owner.html creator.html settings.html \
        notifications.html suggestions.html email-manager.html jeoweb.html \
        secret1.html nexus_maintenance.html system_analytics_health.html \
        nexus_admin_control_center.html Style.css logo.svg sw.js app.js \
        bareworker.js robots.txt sitemap.xml site.webmanifest /var/www/textnexus/
sudo cp "Self hosting/nginx.conf" /etc/nginx/sites-available/textnexus
sudo ln -s /etc/nginx/sites-available/textnexus /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

`python3 -m http.server` also works for a quick local look, but it is not a
real deployment: it serves the wrong MIME types for some assets and the
service-worker pages (Ghostlink, Jeoweb) will not behave correctly.

## What is in this folder

| File | Purpose |
| --- | --- |
| `Dockerfile` | nginx image containing the site files and the server block |
| `docker-compose.yml` | Builds the image from the repo root and publishes port 8080 |
| `nginx.conf` | Server block: gzip, cache headers, baseline security headers |
| `README.md` | This document |

The site also ships `404.html` at the repository root. GitHub Pages serves it
automatically for unknown paths, and `nginx.conf` wires it up with
`error_page 404 /404.html;` so nginx returns the same page with a real 404
status.

## Firebase

The Firebase web config is written into each page, pointing at the
`nexus-web-development-official` project. That key is public by design; access
is controlled by the Realtime Database rules, not by hiding the key.

The rules live in `database.rules.json` at the repository root. **nginx does not
apply them** — Firebase does. Until they are deployed, the database keeps
whatever rules were last published:

- Firebase Console -> Realtime Database -> Rules -> paste `database.rules.json` -> Publish, or
- `firebase deploy --only database` with the Firebase CLI logged in.

Also make sure, in the Firebase Console:

- Authentication -> Sign-in method: Google is enabled.
- Authentication -> Settings -> Authorized domains: add the hostname you serve
  this site from (for example `localhost` during testing, or your domain).

## The AI deploy Worker

`worker.js` is a Cloudflare Worker, not something nginx can serve. It powers the
AI site generator and needs:

- the Workers AI binding named `AI`,
- optionally `GITHUB_TOKEN`, `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID` if
  you want it to create repositories and DNS records.

Deploy it with `wrangler deploy`, then point `app.js` at its URL. Treat it as a
separate service: **as written it accepts unauthenticated POSTs**, so anyone can
trigger generation and, if the tokens are set, repository and DNS creation. Put
it behind a shared secret or Turnstile before you expose it.

## Custom domain and HTTPS

Put a TLS-terminating proxy in front of the container. With Caddy:

```caddyfile
textnexus.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

With nginx and certbot, proxy port 80/443 to `127.0.0.1:8080` and run
`certbot --nginx`. A Cloudflare Tunnel also works and avoids opening ports.
The repository's `CNAME` file only affects GitHub Pages; ignore it here.

## Updating

```bash
git pull
docker compose -f "Self hosting/docker-compose.yml" up -d --build
```

## Troubleshooting

- **`/textnexus.html` returns 404.** Server filesystems are case-sensitive and
  the real file is `TextNexus.html`. Link to it with the exact casing.
- **Pages load but data is empty, console shows `PERMISSION_DENIED`.** The
  published database rules do not allow that read. Deploy `database.rules.json`
  and confirm the user is signed in.
- **Ghostlink or Jeoweb misbehave.** They register a service worker and load
  remote scripts; make sure the site is served over HTTP(S) from a single
  origin, then hard-reload to drop a stale worker.
- **Ads or the Turnstile gate never appear.** An ad blocker or a missing
  third-party script will do that; both are expected on a filtered network.

## Security notes

- Admin, Owner and Creator pages are gated in JavaScript; the page markup is
  public. The database rules are the real boundary, so keep them deployed.
- No secrets belong in this image. The only credential in the site files is the
  public Firebase web API key, which should be restricted by HTTP referrer in
  the Google Cloud console.
- `nginx.conf` intentionally has no Content-Security-Policy: the pages use
  inline scripts and several CDNs. Add one only with a policy tested per page.
