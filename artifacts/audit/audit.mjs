import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, posix } from 'node:path';

const root = resolve(process.argv[2] || 'dist');
const pages = readdirSync(root).filter((f) => f.endsWith('.html'));
const issues = [];
const add = (kind, page, detail) => issues.push({ kind, page, detail });

const decode = (u) => u.replace(/&amp;/g, '&').replace(/&#38;/g, '&').replace(/&quot;/g, '"');
const files = new Set(readdirSync(root));

for (const page of pages) {
  const html = readFileSync(join(root, page), 'utf8');

  // Metadata
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title || !title[1].trim()) add('meta', page, 'missing <title>');
  if (!/<html[^>]*\slang=/i.test(html)) add('meta', page, 'missing lang on <html>');
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) add('meta', page, 'missing viewport meta');
  const desc = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (!desc || desc[1].trim().length < 40) add('meta', page, `description missing/short (${desc ? desc[1].length : 0} chars)`);
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (!canonical) add('meta', page, 'missing canonical');
  if (!/<meta[^>]+property=["']og:title["']/i.test(html)) add('meta', page, 'missing og:title');
  if (!/<meta[^>]+property=["']og:image["']/i.test(html)) add('meta', page, 'missing og:image');

  // Duplicate ids
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((m) => m[1]);
  const seen = new Map();
  for (const id of ids) seen.set(id, (seen.get(id) || 0) + 1);
  for (const [id, n] of seen) if (n > 1) add('html', page, `duplicate id "${id}" x${n}`);

  // Images without alt
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/i.test(m[0])) add('a11y', page, `<img> without alt: ${m[0].slice(0, 90)}`);
  }
  // Buttons with no accessible text
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const text = m[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    const hasLabel = /aria-label|title=/i.test(m[1]);
    const hasIcon = /<svg|<img/i.test(m[2]);
    if (!text && !hasLabel && !hasIcon) add('a11y', page, `<button> with no text or label: ${m[1].slice(0, 80)}`);
  }

  // Links / assets
  const refs = [];
  for (const m of html.matchAll(/<(?:a|link|script|img|source|iframe|form)\b[^>]*>/gi)) {
    const tag = m[0];
    const attr = /\b(?:href|src|action|data-src)=["']([^"']+)["']/i.exec(tag);
    if (!attr) continue;
    refs.push({ url: decode(attr[1]), tag });
  }
  for (const m of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const part of decode(m[1]).split(',')) refs.push({ url: part.trim().split(/\s+/)[0], tag: 'srcset' });
  }

  for (const { url, tag } of refs) {
    if (!url || url.includes('${') || url.startsWith('#') || url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('tel:')) continue;
    if (/^(https?:)?\/\//i.test(url)) {
      if (/placehold\.co/i.test(url)) add('asset', page, `external placeholder image: ${url}`);
      if (/^http:\/\//i.test(url)) add('mixed', page, `insecure http link: ${url}`);
      if (/\btarget=["']_blank["']/i.test(tag) && !/\brel=["'][^"']*noopener/i.test(tag)) {
        add('security', page, `target=_blank without rel=noopener: ${url.slice(0, 90)}`);
      }
      continue;
    }
    let path = url.split('#')[0].split('?')[0];
    if (!path) continue;
    let target;
    if (path.startsWith('/')) target = join(root, path);
    else target = resolve(root, path);
    if (!existsSync(target)) {
      add('broken', page, `missing target ${url} (${tag.slice(0, 50)})`);
      continue;
    }
    const hash = url.includes('#') ? url.split('#')[1] : '';
    if (hash && target.endsWith('.html')) {
      const body = readFileSync(target, 'utf8');
      const esc = hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`id=["']${esc}["']`, 'i').test(body) && !new RegExp(`name=["']${esc}["']`, 'i').test(body)) {
        add('broken-anchor', page, `missing anchor #${hash} in ${url}`);
      }
    }
  }
}

// Referenced files that exist but are empty
for (const f of files) {
  if (!f.endsWith('.html') && statSync(join(root, f)).size === 0) add('asset', f, 'zero-byte file');
}

const byKind = {};
for (const i of issues) (byKind[i.kind] ||= []).push(i);
console.log(`pages: ${pages.length}, files: ${files.size}, issues: ${issues.length}`);
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`\n## ${kind} (${list.length})`);
  for (const i of list) console.log(`- ${i.page}: ${i.detail}`);
}
