const test = require("node:test");
const assert = require("node:assert");

const filenameGenerator = require("../services/storage/FilenameGenerator");

const PREFIX = /^\d{13}-[0-9a-f]{8}-/;

test("throws when the original name is empty", () => {
  assert.throws(() => filenameGenerator.generate(""), /Original name is empty/);
  assert.throws(() => filenameGenerator.generate(undefined), /Original name is empty/);
});

test("prefixes the name with a timestamp and short uuid", () => {
  const generated = filenameGenerator.generate("Photo.JPG");
  assert.match(generated, PREFIX);
  assert.strictEqual(generated.replace(PREFIX, ""), "photo.jpg");
});

test("lowercases the extension and keeps it at the end", () => {
  assert.ok(filenameGenerator.generate("report.PDF").endsWith(".pdf"));
});

test("replaces special characters with single dashes and trims them", () => {
  const generated = filenameGenerator.generate("--My Fancy@@Photo!!--.png");
  assert.strictEqual(generated.replace(PREFIX, ""), "my-fancy-photo.png");
});

test("falls back to 'file' when the base name sanitizes to nothing", () => {
  assert.strictEqual(filenameGenerator.generate("!!!.png").replace(PREFIX, ""), "file.png");
});

test("handles names without an extension", () => {
  assert.strictEqual(filenameGenerator.generate("no-extension").replace(PREFIX, ""), "no-extension");
});

test("truncates long base names without leaving a trailing dash", () => {
  const generated = filenameGenerator.generate(`${"a".repeat(200)}.jpg`);
  const base = generated.replace(PREFIX, "").replace(/\.jpg$/, "");
  assert.strictEqual(base.length, 120 - 27);
  assert.ok(!base.endsWith("-"));
});

test("produces unique names for identical inputs", () => {
  const names = new Set(Array.from({ length: 20 }, () => filenameGenerator.generate("photo.jpg")));
  assert.strictEqual(names.size, 20);
});
