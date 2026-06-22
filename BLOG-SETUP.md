# Pivotal Tides — Blog / Journal

This adds a blog (the "Journal") to the Pivotal Tides site. Angelique can write
and publish posts herself from a simple `/admin` page — no code, no GitHub.

- **Blog landing:** `/blog/` — every post as a card (image, title, date), newest first.
- **Each post:** `/blog/the-post-slug/` — a real, SEO-friendly HTML page using the
  existing site's styling, header, and footer.
- **Editor:** `/admin` — Angelique logs in with email + password (via TinaCloud).

Nothing about the existing pages changed except a new **Journal** link added to the
nav and footer. All existing pages are published byte-for-byte unchanged.

---

## How it works (the short version)

- **Eleventy** is a tiny static-site builder. It turns each markdown post into a
  finished HTML page and copies the rest of the site through untouched. This is
  what makes the blog great for Google (real pages, real meta tags — not
  JavaScript-rendered content).
- **TinaCMS** is the editor at `/admin`. When Angelique saves a post, Tina commits
  a markdown file to the GitHub repo. Cloudflare Pages then rebuilds and the post
  goes live automatically.

Everything here is **free**: Eleventy and TinaCMS are open-source, TinaCloud has a
free tier (up to 2 editors), and Cloudflare Pages builds/hosts for free.

---

## 1. Test it locally (before going live)

You need **Node.js** installed (v18+). Check with `node -v`. If you don't have it,
install from https://nodejs.org (the "LTS" version).

From this folder:

```bash
npm install        # one time — downloads Eleventy + Tina
npm run dev        # starts the local site + editor
```

Then open:

- **The site:** http://localhost:8080/blog/
- **The editor:** http://localhost:8080/admin

In local mode the editor needs no login and saves straight to your files, so you
can create a sample post, see it appear on `/blog/`, and click into it — exactly
how it will work live. Press `Ctrl+C` in the terminal to stop.

> Just want to preview the built pages without the editor?
> Run `npm run build:site` and open the generated `_site/blog/index.html`.

---

## 2. Go live (one-time setup)

When you're happy with it:

### a) Create a free TinaCloud project
1. Go to https://app.tina.io and sign in with the `pivotaltides` GitHub account.
2. Create a project and connect it to the `pivotaltides/pivotaltides` repo, branch `main`.
3. Copy the **Client ID** and create a **Read-Only Token**.
4. Under **Users**, invite Angelique by email. She sets her own password — that's
   her login for `/admin`. (No GitHub account needed for her.)

### b) Point Cloudflare Pages at the build
In the Cloudflare Pages project settings → **Builds & deployments**:

- **Build command:** `npm run build`
- **Build output directory:** `_site`
- **Environment variables:**
  - `TINA_CLIENT_ID` = your TinaCloud Client ID
  - `TINA_TOKEN` = your TinaCloud read-only token
  - `NODE_VERSION` = `20`

### c) Push and deploy
Commit and push these files. Cloudflare runs the build and the site — plus
`/blog/` and `/admin` — goes live.

> **Safety net:** the whole site (existing pages + blog) also builds with just
> `npx @11ty/eleventy`. If TinaCloud is ever misconfigured, set the build command
> to `npx @11ty/eleventy` to publish everything except the `/admin` editor.

---

## 3. How Angelique posts (the daily workflow)

1. Go to **pivotaltides.com/admin** and log in.
2. Click **Blog Posts → Create New**.
3. Fill in **Title**, **Date**, a **Featured Image** (drag-and-drop), a one–two
   sentence **Short Summary**, and write the **Body**.
4. Click **Save**. The post publishes automatically in a minute or two.
   (Tick **Draft** to keep it hidden until ready.)

---

## File map (what was added)

```
eleventy.config.js          # build config — copies existing site through untouched
package.json                # scripts + dependencies
tina/config.ts              # the /admin editor: fields, login, media
_data/site.json             # site-wide values (URL, name) for meta tags
_includes/base.njk          # shared HTML shell (head + SEO, header, footer)
_includes/post.njk          # single-post layout
blog/index.njk              # the /blog landing page
blog/posts/*.md             # the posts themselves (one per file)
blog/posts/posts.11tydata.js# gives every post its /blog/<slug>/ URL
sitemap.njk                 # sitemap.xml now includes blog posts (better SEO)
Assets/blog/                # uploaded post images land here
styles.css                  # blog styles appended (existing styles unchanged)
```

To delete a post, remove its file in `blog/posts/` (or use the editor's delete).
