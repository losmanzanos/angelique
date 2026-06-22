/* ================================================================
   PIVOTAL TIDES — Eleventy build
   ----------------------------------------------------------------
   Set ELEVENTY_PATH_PREFIX env var for subpath deployments.
   e.g. ELEVENTY_PATH_PREFIX=/angelique for GitHub Pages demo.
   Leave unset (defaults to "") for production on pivotaltides.com.
   ================================================================ */

const rawPrefix = process.env.ELEVENTY_PATH_PREFIX || "";
// Normalize: no trailing slash, always starts with / if non-empty
const pathPrefix = rawPrefix ? ("/" + rawPrefix.replace(/^\/|\/$/g, "")) : "";

module.exports = function (eleventyConfig) {
  /* ---- Copy the existing static site through untouched ---- */
  eleventyConfig.addPassthroughCopy("Assets");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("*.html");
  eleventyConfig.addPassthroughCopy("admin");

  /* ---- Expose basePath to all templates as a global variable ---- */
  eleventyConfig.addGlobalData("basePath", pathPrefix);

  /* ---- Date helpers ---- */
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

  /* ---- assetUrl: normalize path AND prepend pathPrefix ---- */
  eleventyConfig.addFilter("assetUrl", (p) => {
    if (!p) return p;
    if (/^https?:\/\//.test(p)) return p;
    const clean = p.startsWith("/") ? p : "/" + p;
    return pathPrefix + clean;
  });

  /* ---- Blog posts collection (newest first, drafts hidden) ---- */
  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("blog/posts/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => b.date - a.date)
  );

  /* ---- Unique sorted tag list ---- */
  eleventyConfig.addCollection("postTags", (api) => {
    const set = new Set();
    api
      .getFilteredByGlob("blog/posts/*.md")
      .filter((p) => !p.data.draft)
      .forEach((p) => (p.data.tags || []).forEach((t) => set.add(t)));
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  /* ---- Related posts ---- */
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
    pathPrefix: pathPrefix || "/",
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
