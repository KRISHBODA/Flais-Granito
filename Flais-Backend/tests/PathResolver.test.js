const test = require("node:test");
const assert = require("node:assert");

const pathResolver = require("../services/storage/PathResolver");

const datePartition = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

test("images are date partitioned under their category", () => {
  assert.strictEqual(
    pathResolver.buildPath("image/png", "products", null, "a.png"),
    `images/products/${datePartition()}/a.png`
  );
});

test("videos are stored flat under videos", () => {
  assert.strictEqual(pathResolver.buildPath("video/mp4", "about", null, "clip.mp4"), "videos/about/clip.mp4");
});

test("pdfs are stored flat under pdfs", () => {
  assert.strictEqual(pathResolver.buildPath("application/pdf", "catalogs", null, "b.pdf"), "pdfs/catalogs/b.pdf");
});

test("unknown mime types fall back to the general directory", () => {
  assert.strictEqual(pathResolver.buildPath("text/plain", "misc", null, "notes.txt"), "general/misc/notes.txt");
});

test("missing category falls back to general", () => {
  assert.strictEqual(pathResolver.buildPath("video/webm", null, null, "c.webm"), "videos/general/c.webm");
});

test("category names are lowercased", () => {
  assert.strictEqual(pathResolver.buildPath("video/mp4", "About", null, "c.mp4"), "videos/about/c.mp4");
});

test("logos and categories stay flat even for images", () => {
  assert.strictEqual(pathResolver.buildPath("image/png", "logos", null, "l.png"), "images/logos/l.png");
  assert.strictEqual(pathResolver.buildPath("image/png", "categories", null, "c.png"), "images/categories/c.png");
});

test("subcategories are appended and slugified before the date partition", () => {
  assert.strictEqual(
    pathResolver.buildPath("image/jpeg", "products", "Marble Series!", "p.jpg"),
    `images/products/marble-series-/${datePartition()}/p.jpg`
  );
});

test("subcategories apply to non partitioned categories too", () => {
  assert.strictEqual(pathResolver.buildPath("image/png", "logos", "Series A", "l.png"), "images/logos/series-a/l.png");
});
