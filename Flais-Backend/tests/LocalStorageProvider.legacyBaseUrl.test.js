const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const STORAGE_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "flais-storage-legacy-"));
process.env.STORAGE_ROOT = STORAGE_ROOT;
process.env.STORAGE_BASE_URL = "http://187.127.179.251/media";

// Required after the env is set so the singleton picks up this base url.
const localStorageProvider = require("../services/storage/LocalStorageProvider");

test.after(() => {
  fs.rmSync(STORAGE_ROOT, { recursive: true, force: true });
});

test("adds the missing port to the legacy host base url", () => {
  assert.strictEqual(
    localStorageProvider.getPublicUrl("images/a.png"),
    "http://187.127.179.251:8000/media/images/a.png"
  );
});

test("delete swallows filesystem errors and reports nothing was deleted", async (t) => {
  t.mock.method(console, "warn", () => {});
  fs.mkdirSync(path.join(STORAGE_ROOT, "a-directory"), { recursive: true });

  assert.deepStrictEqual(await localStorageProvider.delete("a-directory"), { deleted: false });
  assert.ok(fs.existsSync(path.join(STORAGE_ROOT, "a-directory")));
});
