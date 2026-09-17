const test = require("node:test");
const assert = require("node:assert");
const dns = require("node:dns");

const { validateEmail } = require("../services/emailValidation.service");

const INVALID = { valid: false, message: "Please enter a valid email address." };

test("rejects empty and malformed addresses without a DNS lookup", async (t) => {
  const resolveMx = t.mock.method(dns.promises, "resolveMx", async () => [{ exchange: "mx.test", priority: 10 }]);

  for (const email of ["", null, undefined, "not-an-email", "missing@domain", "a b@test.com"]) {
    assert.deepStrictEqual(await validateEmail(email), INVALID);
  }

  assert.strictEqual(resolveMx.mock.callCount(), 0);
});

test("accepts an address whose domain has MX records", async (t) => {
  t.mock.method(dns.promises, "resolveMx", async () => [{ exchange: "mx.test", priority: 10 }]);

  assert.deepStrictEqual(await validateEmail("user@test.com"), { valid: true });
});

test("trims and lowercases the address before looking up the domain", async (t) => {
  const resolveMx = t.mock.method(dns.promises, "resolveMx", async () => [{ exchange: "mx.test", priority: 10 }]);

  assert.deepStrictEqual(await validateEmail("  User@TEST.com  "), { valid: true });
  assert.deepStrictEqual(resolveMx.mock.calls[0].arguments, ["test.com"]);
});

test("rejects a domain with no MX records", async (t) => {
  t.mock.method(dns.promises, "resolveMx", async () => []);

  assert.deepStrictEqual(await validateEmail("user@test.com"), INVALID);
});

test("rejects when the DNS lookup exceeds the timeout", async (t) => {
  t.mock.method(console, "error", () => {});
  t.mock.method(dns.promises, "resolveMx", () => new Promise(() => {}));
  t.mock.timers.enable({ apis: ["setTimeout"] });

  const pending = validateEmail("user@slow.com");
  t.mock.timers.tick(5000);

  assert.deepStrictEqual(await pending, INVALID);
});

test("rejects when the DNS lookup fails, without leaking the error", async (t) => {
  t.mock.method(console, "error", () => {});
  t.mock.method(dns.promises, "resolveMx", async () => {
    throw new Error("ENOTFOUND");
  });

  assert.deepStrictEqual(await validateEmail("user@test.com"), INVALID);
});
