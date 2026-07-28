const test = require("node:test");
const assert = require("node:assert");

delete process.env.JWT_SECRET;

// Required with JWT_SECRET unset because the middleware reads it at load time.
const { protect } = require("../middleware/authMiddleware");

test("returns 500 when JWT_SECRET is not configured", async () => {
  const res = {
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
  };

  await protect({ headers: { authorization: "Bearer anything" } }, res, () => assert.fail("next should not be called"));

  assert.strictEqual(res.statusCode, 500);
  assert.deepStrictEqual(res.body, { success: false, message: "Server misconfigured" });
});
