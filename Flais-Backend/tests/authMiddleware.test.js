const test = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";

// Required after JWT_SECRET is set because the middleware reads it at load time.
const { protect } = require("../middleware/authMiddleware");
const Admin = require("../models/Admin");

const JWT_OPTIONS = { algorithm: "HS256", issuer: "flais-admin", audience: "flais-dashboard", expiresIn: "1h" };

const makeRes = () => ({
  statusCode: undefined,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const signToken = (payload, options = {}) => jwt.sign(payload, "test-secret", { ...JWT_OPTIONS, ...options });

const stubAdmin = (t, admin) =>
  t.mock.method(Admin, "findById", () => ({ select: async () => admin }));

test("attaches the admin and calls next for a valid bearer token", async (t) => {
  const admin = { _id: "admin-1", email: "admin@test.com" };
  const findById = stubAdmin(t, admin);
  const req = { headers: { authorization: `Bearer ${signToken({ id: "admin-1" })}` } };
  const res = makeRes();
  let nextCalled = false;

  await protect(req, res, () => {
    nextCalled = true;
  });

  assert.ok(nextCalled);
  assert.strictEqual(req.admin, admin);
  assert.deepStrictEqual(findById.mock.calls[0].arguments, ["admin-1"]);
  assert.strictEqual(res.statusCode, undefined);
});

test("rejects a request without an authorization header", async () => {
  const res = makeRes();

  await protect({ headers: {} }, res, () => assert.fail("next should not be called"));

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.message, "Not authorized, no token");
});

test("rejects a non bearer authorization scheme", async () => {
  const res = makeRes();

  await protect({ headers: { authorization: "Basic abc" } }, res, () => assert.fail("next should not be called"));

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.message, "Not authorized, no token");
});

test("rejects a tampered, expired or wrongly scoped token", async (t) => {
  stubAdmin(t, { _id: "admin-1" });

  const tokens = [
    "not-a-token",
    jwt.sign({ id: "admin-1" }, "other-secret", JWT_OPTIONS),
    signToken({ id: "admin-1" }, { expiresIn: -10 }),
    signToken({ id: "admin-1" }, { issuer: "someone-else" }),
    signToken({ id: "admin-1" }, { audience: "other-audience" }),
  ];

  for (const token of tokens) {
    const res = makeRes();
    await protect({ headers: { authorization: `Bearer ${token}` } }, res, () => assert.fail("next should not be called"));
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Not authorized, token failed");
  }
});

test("rejects a valid token whose admin no longer exists", async (t) => {
  stubAdmin(t, null);
  const res = makeRes();

  await protect({ headers: { authorization: `Bearer ${signToken({ id: "gone" })}` } }, res, () =>
    assert.fail("next should not be called")
  );

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.message, "Not authorized, admin not found");
});
