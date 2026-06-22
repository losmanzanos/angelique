/* Shared settings for every blog post in this folder.
   Each markdown file becomes a page at /blog/<filename>/ */
module.exports = {
  layout: "post.njk",
  permalink: (data) => `/blog/${data.page.fileSlug}/`,
};
