# eclipse708-site

Personal site + blog for [@eclipse708](https://github.com/eclipse708). Built with [Astro](https://astro.build), deployed to GitHub Pages, zero JavaScript shipped except the reading-progress bar.

---

## quick start

### 1. requirements

- Node.js 20 or newer ([download](https://nodejs.org))
- git
- a text editor (VS Code recommended)

### 2. run locally

```bash
git clone https://github.com/eclipse708/eclipse708.github.io.git
cd eclipse708.github.io
npm install
npm run dev
```

Open <http://localhost:4321> in your browser. Edit files in `src/`, the dev server hot-reloads on save.

### 3. build for production

```bash
npm run build     # outputs to ./dist
npm run preview   # serves ./dist locally
```

You usually don't need to run `npm run build` yourself — GitHub Actions does it on every push.

---

## writing a new primer

This is the main thing you'll do. Three steps.

### 1. create a new markdown file

In `src/content/primers/`, create a file named with your slug (this becomes the URL):

```
src/content/primers/my-new-primer.md
```

→ this post will live at `/primers/my-new-primer`.

Filenames should be lowercase with hyphens. No spaces, no underscores.

### 2. add frontmatter

Every primer needs this block at the very top of the file:

```yaml
---
title: "your title here"
dek: "one-sentence hook that appears below the title and in RSS"
date: 2026-07-15
level: beginner       # beginner | intermediate | advanced
tags: ["crypto"]      # array of tag strings
readingTime: 12       # estimated minutes (just a guess is fine)
draft: false          # set to true to hide from listings while drafting
---
```

If a frontmatter field is missing or has the wrong type, the dev server will tell you exactly what's wrong (this is the Zod schema in `src/content.config.ts` doing its job).

### 3. write the content

Below the closing `---`, write markdown. Supported:

- **Headings** — `##` for section headings, `###` for subsections. The site uses lowercase headings throughout to match the aesthetic.
- **Code blocks** — triple-backtick blocks with a language tag get syntax highlighting via Shiki, themed with the site's amber/teal palette.
  ````
  ```python
  print("hello")
  ```
  ````
- **Inline code** — `` `like this` `` gets the bordered-chip style.
- **Math** — KaTeX is available. Inline: `$e \cdot d \equiv 1$`. Display: `$$...$$`.
- **Asides** — use a blockquote starting with `> **note:**` or `> **aside.**` to get the bordered aside block style.
- **Lists** — standard markdown. Bullets use amber markers automatically.
- **Tables** — supported but not styled yet for this aesthetic; ask for table styling to be added before you use one.
- **Images** — drop into `public/` and reference as `/your-image.png`.

Save the file. The dev server auto-reloads. New primer appears at:

- `http://localhost:4321/primers/your-slug` — the post itself
- `http://localhost:4321/primers` — the listing page (auto-updates)
- `http://localhost:4321/` — the landing page (PRIMERS count auto-updates)
- `http://localhost:4321/rss.xml` — the RSS feed (auto-updates)

When you're done, commit and push (see [deploying](#deploying-to-github-pages) below) — auto-deploy takes over from there.

---

## customizing common things

| What                                  | File to edit                                  |
|---------------------------------------|-----------------------------------------------|
| Colours, fonts, spacing               | `src/styles/global.css` (CSS variables at top) |
| Landing page copy (bio, NOW section)  | `src/pages/index.astro`                       |
| Contact info / PGP fingerprint        | `src/pages/index.astro` + both `security.txt` files |
| HUD coordinates / version             | `src/components/Hud.astro`                    |
| Code-block syntax colours             | `src/styles/global.css` → `--astro-code-token-*` |
| 404 page copy + quote                 | `src/pages/404.astro`                         |
| Footer text + links                   | `src/components/Footer.astro`                 |
| RSS feed metadata                     | `src/pages/rss.xml.ts`                        |
| RSS preview page styling              | `public/rss.xsl`                              |
| security.txt expiry / contact         | `public/security.txt` AND `public/.well-known/security.txt` (keep in sync) |

---

## deploying to GitHub Pages

### one-time setup

#### 1. push your code to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/eclipse708/eclipse708.github.io.git
git push -u origin main
```

**About the repo name:**

- If you name the repo **`eclipse708.github.io`** (matching your username), the site is served at `https://eclipse708.github.io/` with **no path prefix**. This is what `astro.config.mjs` is currently configured for.
- If you name it anything else (e.g. `eclipse708-site`), the site is served at `https://eclipse708.github.io/eclipse708-site/`. You'd need to set `base: '/eclipse708-site'` in `astro.config.mjs` — there's a commented line ready for this.

The `eclipse708.github.io` name is recommended unless you have a reason otherwise.

#### 2. enable GitHub Pages

On github.com, in your repo:

1. Click **Settings**
2. Scroll to **Pages** in the left sidebar
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. Save

That's it. The workflow at `.github/workflows/deploy.yml` will run on every push to `main` and deploy automatically. First deploy takes ~2 minutes.

#### 3. verify the first deploy

After pushing:

1. Go to the **Actions** tab in your repo
2. You should see a workflow run named "Deploy to GitHub Pages" — wait for the green checkmark
3. Visit `https://eclipse708.github.io/` — your site should be live

If the build fails, click the failed run to see the error. Most common cause is a frontmatter typo in a new primer.

### the steady-state workflow

After the one-time setup, every change you make goes live like this:

1. Edit files locally
2. `git add .`
3. `git commit -m "describe what changed"`
4. `git push`
5. ~2 minutes later your site updates

Monitor the deploy in the **Actions** tab. The site URL stays the same.

### custom domain (optional, later)

If you buy a domain (e.g. `eclipse708.dev`):

1. Create `public/CNAME` containing just your domain on one line: `eclipse708.dev`
2. In your domain registrar, set DNS records per [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
3. In repo Settings → Pages, add the custom domain
4. Update `site: 'https://eclipse708.dev'` in `astro.config.mjs`
5. Update `Canonical:` URLs in both `security.txt` files
6. Push

---

## adding new sections (log, tools)

The landing page INDEX block lists `LOG` and `TOOLS` as "soon". When you have real content, here's how to promote one from "soon" to live.

### example: adding LOG

#### 1. update the schema

In `src/content.config.ts`, add a new collection (same shape as primers):

```ts
const log = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/log' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    date: z.coerce.date(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    tags: z.array(z.string()),
    readingTime: z.number().int().positive(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { primers, log };
```

#### 2. create the folder and first post

```
src/content/log/your-first-writeup.md
```

#### 3. copy the pages

Duplicate `src/pages/primers/` to `src/pages/log/`. In both files inside the new folder, change every `'primers'` to `'log'` (in `getCollection()` calls, the `section` prop, the `basePath`).

#### 4. update the landing page

In `src/pages/index.astro`:

- Add `const logCount = (await getCollection('log', ({ data }) => !data.draft)).length;`
- Move the LOG row from `.section-row.pending` to `.section-row.live`, with `href="/log"` and `{logCount} →` as the meta

#### 5. update the RSS feed

In `src/pages/rss.xml.ts`, fetch both collections and merge:

```ts
const primers = await getCollection('primers', ({ data }) => !data.draft);
const logs    = await getCollection('log',     ({ data }) => !data.draft);
// map and merge, using the appropriate basePath per item
```

Same pattern for TOOLS when that time comes.

---

## project structure

```
.
├── .github/workflows/deploy.yml   # auto-deploy CI
├── astro.config.mjs               # Astro + markdown + Shiki config
├── package.json
├── tsconfig.json
├── public/                        # static files served as-is
│   ├── favicon.svg
│   ├── rss.xsl                    # XSLT stylesheet for /rss.xml preview
│   ├── security.txt               # RFC 9116 (root copy)
│   └── .well-known/
│       └── security.txt           # RFC 9116 (canonical copy)
├── src/
│   ├── content.config.ts          # collection schemas — DO NOT move into src/content/
│   ├── styles/global.css          # entire design system
│   ├── components/
│   │   ├── Hud.astro              # top HUD strip
│   │   ├── Footer.astro
│   │   ├── ProgressBar.astro      # reading progress for post pages
│   │   └── PostRow.astro          # row in index listings
│   ├── content/
│   │   └── primers/               # primer markdown files go here
│   │       └── rsa-from-the-math-up.md
│   ├── layouts/
│   │   ├── Base.astro             # HTML shell — wraps every page
│   │   └── Post.astro             # post layout (extends Base)
│   └── pages/                     # files here become routes
│       ├── index.astro            # /
│       ├── 404.astro              # /404
│       ├── rss.xml.ts             # /rss.xml
│       └── primers/
│           ├── index.astro        # /primers
│           └── [...slug].astro    # /primers/* — dynamic route per primer
```

---

## troubleshooting

**A new primer isn't showing up on `/primers`**

- File must be at `src/content/primers/your-slug.md` (no nested folders).
- `draft: false` in the frontmatter (or remove the line).
- Restart the dev server. If still missing, delete the `.astro/` folder and restart.
- Run `npx astro sync` — it prints schema errors that dev mode silences.

**Build fails on GitHub Actions but works locally**

- Almost always a frontmatter typo. Click the failed run to see which file.
- Sometimes a relative image path that works locally but breaks in production.

**`/security.txt` returns 404**

- File must be in `public/`, not `src/`. Files in `public/` are copied to site root as-is.

**HUD tooltip appears off-screen**

- Should be fixed by the `.hud [data-tooltip]` rules in `global.css`. If you see it again, that rule was deleted.

**RSS feed shows raw XML in the browser**

- That's correct — browsers don't style XML by default. The XSLT at `public/rss.xsl` makes it human-readable; RSS readers ignore it. If even the styled version isn't showing, hard-reload (Ctrl+Shift+R / Cmd+Shift+R) to bust the cache.

---

## design philosophy (for the record)

Principles that drove the design — keep them in mind when adding features:

- **Earn each section.** Empty content categories hurt more than missing ones. The INDEX block uses live-vs-pending styling to be honest about what's there.
- **Mono everywhere.** JetBrains Mono for body, VT323 for the handle, Noto Sans JP for kanji markers. No serif, no system sans.
- **One accent, used surgically.** Amber for links, kanji, focus. Teal as a second voice (level badges, eclipse708 handle). Red exclusively for danger/severity — don't reuse it for emphasis.
- **Zero JavaScript by default.** The only JS on the site is the reading progress bar (~30 lines, inline). If you add a feature that needs JS, ask whether it really does.
- **Mobile is not an afterthought.** All breakpoints live at the bottom of `global.css`. Changes that work only on desktop are not done.

---

## license

Site code: MIT. Post content: © Asfandyar Nawaz Khan, all rights reserved.