const test = require("node:test");
const assert = require("node:assert");

const validationService = require("../services/storage/ValidationService");

const makeFile = (overrides = {}) => ({
  mimetype: "image/jpeg",
  originalname: "photo.jpg",
  size: 1024,
  ...overrides,
});

test("accepts a file allowed for its category", () => {
  assert.strictEqual(validationService.validate(makeFile(), "products"), true);
});

test("falls back to the general allowlist for unknown categories", () => {
  assert.strictEqual(
    validationService.validate(makeFile({ mimetype: "application/pdf", originalname: "brochure.pdf" }), "unknown-category"),
    true
  );
});

test("falls back to the general allowlist when no category is given", () => {
  assert.strictEqual(validationService.validate(makeFile({ mimetype: "image/gif", originalname: "loop.gif" })), true);
});

test("throws when no file payload is provided", () => {
  assert.throws(() => validationService.validate(null, "products"), /No file payload provided/);
});

test("rejects a mime type not allowed for the category", () => {
  assert.throws(
    () => validationService.validate(makeFile({ mimetype: "application/pdf", originalname: "doc.pdf" }), "products"),
    /Unsupported file type: application\/pdf for category products/
  );
});

test("accepts svg for logos but not for products", () => {
  assert.strictEqual(validationService.validate(makeFile({ mimetype: "image/svg+xml", originalname: "logo.svg" }), "logos"), true);
  assert.throws(
    () => validationService.validate(makeFile({ mimetype: "image/svg+xml", originalname: "logo.svg" }), "products"),
    /Unsupported file type/
  );
});

test("throws when the original filename is missing", () => {
  assert.throws(() => validationService.validate(makeFile({ originalname: "" }), "products"), /Original filename is missing/);
});

test("rejects filenames containing path separators or null bytes", () => {
  for (const name of ["../etc/passwd.jpg", "dir\\photo.jpg", "photo\0.jpg"]) {
    assert.throws(
      () => validationService.validate(makeFile({ originalname: name }), "products"),
      /Security Violation: Invalid filename characters detected/
    );
  }
});

test("rejects multi-extension attack patterns", () => {
  for (const name of ["shell.php.jpg", "page.html.png", "script.js.jpg"]) {
    assert.throws(
      () => validationService.validate(makeFile({ originalname: name, mimetype: "image/png" }), "products"),
      /Security Violation: Multi-extension attack pattern detected/
    );
  }
});

test("allows harmless multi-dot filenames", () => {
  assert.strictEqual(validationService.validate(makeFile({ originalname: "my.holiday.photo.jpg" }), "products"), true);
});

test("throws when the filename has no extension", () => {
  assert.throws(() => validationService.validate(makeFile({ originalname: "photo" }), "products"), /File extension is missing/);
});

test("rejects an extension that does not match the mime type", () => {
  assert.throws(
    () => validationService.validate(makeFile({ originalname: "photo.png", mimetype: "image/jpeg" }), "products"),
    /Filename extension \.png does not match verified MIME type image\/jpeg/
  );
});

test("matches extensions case-insensitively", () => {
  assert.strictEqual(validationService.validate(makeFile({ originalname: "PHOTO.JPEG" }), "products"), true);
});
