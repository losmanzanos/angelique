/* ================================================================
   PIVOTAL TIDES — Eleventy build
   ----------------------------------------------------------------
   This build is intentionally NON-DESTRUCTIVE. Every existing page
   (index.html, services.html, etc.), the stylesheet, the script,
   and the Assets folder are copied to the output UNCHANGED.
   Eleventy ONLY generates the new /blog section from markdown.
   ================================================================ */

module.exports = function (eleventyConfig) {
  /* ---- Copy the existing static site through untouched ---- */
  eleventyConfig.addPassthroughCopy("Assets");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("llms.txt");
  // Existing top-level pages — copied verbatim (NOT processed as templates)
  eleventyConfig.addPassthroughCopy("*.html");
  // TinaCMS admin panel (built by `tinacms build` before Eleventy runs)
  eleventyConfig.addPassthroughCopy("admin");

  /* ---- Date helpers (no extra dependencies) ---- */
  eleventyConfig.addFilter("readableDate", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    }).format(d);
  });
  eleventyConfig.addFilter("isoDate", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toISOString().slice(0, 10);
  });

  /* ---- Normalize image paths to root-absolute (handles Tina output) ---- */
  eleventyConfig.addFilter("assetUrl", (p) => {
    if (!p) return p;
    if (/^https?:\/\//.test(p) || p.startsWith("/")) return p;
    return "/" + p;
  });

  /* ---- Blog posts collection (newest first, drafts hidden) ---- */
  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("blog/posts/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => b.date - a.date)
  );

  /* ---- Unique, sorted list of all tags used by live posts ---- */
  eleventyConfig.addCollection("postTags", (api) => {
    const set = new Set();
    api
      .getFilteredByGlob("blog/posts/*.md")
      .filter((p) => !p.data.draft)
      .forEach((p) => (p.data.tags || []).forEach((t) => set.add(t)));
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  /* ---- Related posts: shared tags first, then most recent ---- */
  eleventyConfig.addFilter(
    "relatedPosts",
    (all, currentUrl, currentTags, limit = 3) => {
      const tags = currentTags || [];
      return (all || [])
        .filter((p) => p.url !== currentUrl)
        .map((p) => ({
          p,
          shared: (p.data.tags || []).filter((t) => tags.includes(t)).length,
        }))
        .sort((a, b) => b.shared - a.shared || b.p.date - a.p.date)
        .slice(0, limit)
        .map((s) => s.p);
    }
  );

  return {
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
