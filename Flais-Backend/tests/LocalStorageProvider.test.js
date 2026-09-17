const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const STORAGE_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "flais-storage-"));
process.env.STORAGE_ROOT = STORAGE_ROOT;
process.env.STORAGE_BASE_URL = "http://localhost:8000/media/";

// Required after the env is set so the singleton picks up the temp storage root.
const localStorageProvider = require("../services/storage/LocalStorageProvider");

test.after(() => {
  fs.rmSync(STORAGE_ROOT, { recursive: true, force: true });
});

test("resolve requires a relative path", () => {
  assert.throws(() => localStorageProvider.resolve(""), /Relative path is required/);
});

test("resolve returns an absolute path inside the storage root", () => {
  assert.strictEqual(localStorageProvider.resolve("images/a.png"), path.join(STORAGE_ROOT, "images/a.png"));
});

test("resolve blocks directory traversal", () => {
  assert.throws(() => localStorageProvider.resolve("../../etc/passwd"), /Security Violation: Path traversal detected/);
});

test("save creates missing directories and reports the written size", async () => {
  const buffer = Buffer.from("hello world");
  const result = await localStorageProvider.save(buffer, "images/nested/deep/a.txt");

  assert.strictEqual(result.relativePath, "images/nested/deep/a.txt");
  assert.strictEqual(result.absolutePath, path.join(STORAGE_ROOT, "images/nested/deep/a.txt"));
  assert.strictEqual(result.size, buffer.length);
  assert.strictEqual(fs.readFileSync(result.absolutePath, "utf8"), "hello world");
});

test("exists reflects whether the file is on disk and is safe for bad paths", async () => {
  await localStorageProvider.save(Buffer.from("x"), "images/exists.txt");

  assert.strictEqual(await localStorageProvider.exists("images/exists.txt"), true);
  assert.strictEqual(await localStorageProvider.exists("images/missing.txt"), false);
  assert.strictEqual(await localStorageProvider.exists("../../escape.txt"), false);
});

test("delete removes an existing file and is idempotent", async () => {
  await localStorageProvider.save(Buffer.from("x"), "images/delete-me.txt");

  assert.deepStrictEqual(await localStorageProvider.delete("images/delete-me.txt"), { deleted: true });
  assert.deepStrictEqual(await localStorageProvider.delete("images/delete-me.txt"), { deleted: false });
});

test("delete re-throws path traversal violations", async () => {
  await assert.rejects(() => localStorageProvider.delete("../../etc/passwd"), /Security Violation/);
});

test("getPublicUrl joins the base url with the path exactly once", () => {
  assert.strictEqual(localStorageProvider.getPublicUrl("images/a.png"), "http://localhost:8000/media/images/a.png");
  assert.strictEqual(localStorageProvider.getPublicUrl("/images/a.png"), "http://localhost:8000/media/images/a.png");
});
