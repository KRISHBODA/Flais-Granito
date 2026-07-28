const test = require("node:test");
const assert = require("node:assert");

const uploadService = require("../services/storage/UploadService");
const localStorageProvider = require("../services/storage/LocalStorageProvider");

const makeFile = (overrides = {}) => ({
  buffer: Buffer.from("data"),
  mimetype: "image/png",
  originalname: "photo.png",
  ...overrides,
});

const stubProvider = (t) => {
  const saved = [];
  const deleted = [];
  t.mock.method(localStorageProvider, "save", async (buffer, relativePath) => {
    saved.push(relativePath);
    return { absolutePath: `/root/${relativePath}`, relativePath, size: buffer.length };
  });
  t.mock.method(localStorageProvider, "delete", async (relativePath) => {
    deleted.push(relativePath);
    return { deleted: true };
  });
  t.mock.method(localStorageProvider, "getPublicUrl", (relativePath) => `http://cdn.test/media/${relativePath}`);
  return { saved, deleted };
};

test("upload validates, stores and returns metadata", async (t) => {
  const { saved } = stubProvider(t);
  const file = makeFile();

  const result = await uploadService.upload(file, "logos");

  assert.strictEqual(saved.length, 1);
  assert.match(saved[0], /^images\/logos\/\d{13}-[0-9a-f]{8}-photo\.png$/);
  assert.strictEqual(result.path, saved[0]);
  assert.strictEqual(result.url, `http://cdn.test/media/${saved[0]}`);
  assert.strictEqual(result.size, file.buffer.length);
  assert.strictEqual(result.mimetype, "image/png");
  assert.strictEqual(result.originalName, "photo.png");
});

test("upload rejects a missing file or buffer", async () => {
  await assert.rejects(() => uploadService.upload(null, "logos"), /File buffer is missing/);
  await assert.rejects(() => uploadService.upload({ originalname: "a.png" }, "logos"), /File buffer is missing/);
});

test("upload propagates validation failures without writing", async (t) => {
  const { saved } = stubProvider(t);

  await assert.rejects(() => uploadService.upload(makeFile({ mimetype: "application/pdf" }), "products"), /Unsupported file type/);
  assert.strictEqual(saved.length, 0);
});

test("replace uploads the new asset before deleting the old one", async (t) => {
  const { saved, deleted } = stubProvider(t);

  const result = await uploadService.replace(makeFile(), "images/logos/old.png", "logos");

  assert.strictEqual(saved.length, 1);
  assert.deepStrictEqual(deleted, ["images/logos/old.png"]);
  assert.strictEqual(result.path, saved[0]);
});

test("replace skips deletion when there is no previous asset", async (t) => {
  const { deleted } = stubProvider(t);

  await uploadService.replace(makeFile(), null, "logos");

  assert.deepStrictEqual(deleted, []);
});

test("replace strips the media prefix from an absolute old url", async (t) => {
  const { deleted } = stubProvider(t);

  await uploadService.replace(makeFile(), "https://cdn.test/media/images/logos/old.png", "logos");

  assert.deepStrictEqual(deleted, ["images/logos/old.png"]);
});

test("delete returns early for an empty path", async (t) => {
  const { deleted } = stubProvider(t);

  assert.deepStrictEqual(await uploadService.delete(""), { deleted: false });
  assert.deepStrictEqual(deleted, []);
});

test("delete normalises absolute urls without a media prefix", async (t) => {
  const { deleted } = stubProvider(t);

  await uploadService.delete("https://cdn.test/images/logos/old.png");

  assert.deepStrictEqual(deleted, ["images/logos/old.png"]);
});

test("getUrl returns absolute urls unchanged and builds public urls otherwise", (t) => {
  stubProvider(t);

  assert.strictEqual(uploadService.getUrl(""), "");
  assert.strictEqual(uploadService.getUrl("https://cdn.test/a.png"), "https://cdn.test/a.png");
  assert.strictEqual(uploadService.getUrl("http://cdn.test/a.png"), "http://cdn.test/a.png");
  assert.strictEqual(uploadService.getUrl("images/a.png"), "http://cdn.test/media/images/a.png");
});

test("_extractRelativePath falls back to the input for malformed urls", () => {
  assert.strictEqual(uploadService._extractRelativePath(""), "");
  assert.strictEqual(uploadService._extractRelativePath("images/a.png"), "images/a.png");
  assert.strictEqual(uploadService._extractRelativePath("https://"), "https://");
});
