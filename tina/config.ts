import { defineConfig } from "tinacms";

/**
 * TinaCMS configuration for the Pivotal Tides Journal.
 *
 * - Angelique logs in at  /admin  with the email + password you invite her with
 *   (managed in your free TinaCloud project — no GitHub account needed for her).
 * - Each post is saved as a markdown file in /blog/posts and published
 *   automatically by the Cloudflare Pages build.
 * - Featured images are uploaded into /Assets/blog.
 *
 * The CLIENT_ID / TOKEN below come from your TinaCloud project and are set as
 * environment variables in Cloudflare Pages (see BLOG-SETUP.md). Locally,
 * `npm run dev` runs in offline mode and writes straight to your files — no
 * login or keys required.
 */

const branch =
  process.env.TINA_BRANCH ||
  process.env.CF_PAGES_BRANCH || // Cloudflare Pages sets this automatically
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || "", // from TinaCloud
  token: process.env.TINA_TOKEN || "", // from TinaCloud (read-only token)

  build: {
    outputFolder: "admin", // admin panel is built to /admin
    publicFolder: ".", // site root
  },
  media: {
    tina: {
      mediaRoot: "Assets/blog", // uploads land in /Assets/blog
      publicFolder: ".",
    },
  },

  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "blog/posts",
        format: "md",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) =>
              (values?.title || "untitled-post")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Date Posted",
            required: true,
            ui: { dateFormat: "MMMM D, YYYY" },
          },
          {
            type: "image",
            name: "image",
            label: "Featured Image",
            description:
              "Shown on the Journal landing page and at the top of the post.",
          },
          {
            type: "string",
            name: "excerpt",
            label: "Short Summary",
            description:
              "1–2 sentences. Appears on the Journal list and in Google search results.",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "tags",
            label: "Tags / Keywords",
            description:
              "Topics for this post (e.g. Anxiety, Relationships). Used for filtering, related posts, and SEO. Type a tag and press enter.",
            list: true,
          },
          {
            type: "string",
            name: "metaDescription",
            label: "SEO Meta Description (optional)",
            description:
              "The blurb Google shows under the title (~155 characters). If left blank, the Short Summary above is used.",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "author",
            label: "Author",
          },
          {
            type: "boolean",
            name: "draft",
            label: "Draft (hide from the live site)",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
