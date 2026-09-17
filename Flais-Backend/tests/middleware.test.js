const test = require("node:test");
const assert = require("node:assert");

const { sanitizeInput } = require("../middleware/sanitizeInput");
const { createRateLimit } = require("../middleware/rateLimit");
const { errorHandler } = require("../middleware/errorMiddleware");

const makeRes = () => {
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
  return res;
};

test("sanitizeInput strips prototype pollution and operator keys from the body", () => {
  const req = {
    body: JSON.parse('{"name":"ok","__proto__":{"admin":true},"constructor":1,"prototype":1,"$gt":"","a.b":1}'),
  };
  let called = false;

  sanitizeInput(req, makeRes(), () => {
    called = true;
  });

  assert.ok(called);
  assert.deepStrictEqual(Object.keys(req.body), ["name"]);
});

test("sanitizeInput recurses into nested objects and arrays", () => {
  const req = {
    body: {
      user: { name: "ok", $set: "bad" },
      items: [{ id: 1, $ne: null }, "plain"],
    },
  };

  sanitizeInput(req, makeRes(), () => {});

  assert.deepStrictEqual(req.body, { user: { name: "ok" }, items: [{ id: 1 }, "plain"] });
});

test("sanitizeInput cleans query and params and leaves non-objects untouched", () => {
  const req = { body: "raw string", query: { $where: "1", page: "2" }, params: { $id: "x", id: "7" } };

  sanitizeInput(req, makeRes(), () => {});

  assert.strictEqual(req.body, "raw string");
  assert.deepStrictEqual(req.query, { page: "2" });
  assert.deepStrictEqual(req.params, { id: "7" });
});

test("sanitizeInput calls next when the request has no payloads", () => {
  let called = false;
  sanitizeInput({}, makeRes(), () => {
    called = true;
  });
  assert.ok(called);
});

test("createRateLimit allows requests up to the max within the window", () => {
  const limiter = createRateLimit({ windowMs: 60000, max: 3 });
  const req = { ip: "1.1.1.1", baseUrl: "/api", path: "/allow" };
  let allowed = 0;

  for (let i = 0; i < 3; i += 1) {
    limiter(req, makeRes(), () => {
      allowed += 1;
    });
  }

  assert.strictEqual(allowed, 3);
});

test("createRateLimit responds with 429 once the max is exceeded", () => {
  const limiter = createRateLimit({ windowMs: 60000, max: 1, message: "Slow down" });
  const req = { ip: "2.2.2.2", baseUrl: "/api", path: "/block" };
  const res = makeRes();

  limiter(req, makeRes(), () => {});
  let nextCalled = false;
  limiter(req, res, () => {
    nextCalled = true;
  });

  assert.ok(!nextCalled);
  assert.strictEqual(res.statusCode, 429);
  assert.deepStrictEqual(res.body, { success: false, message: "Slow down" });
});

test("createRateLimit uses a default message and buckets per route", () => {
  const limiter = createRateLimit({ windowMs: 60000, max: 1 });
  const res = makeRes();

  limiter({ ip: "3.3.3.3", baseUrl: "/api", path: "/one" }, makeRes(), () => {});

  let otherRouteAllowed = false;
  limiter({ ip: "3.3.3.3", baseUrl: "/api", path: "/two" }, makeRes(), () => {
    otherRouteAllowed = true;
  });
  assert.ok(otherRouteAllowed);

  limiter({ ip: "3.3.3.3", baseUrl: "/api", path: "/one" }, res, () => {});
  assert.match(res.body.message, /Too many requests/);
});

test("createRateLimit resets the bucket after the window expires", async () => {
  const limiter = createRateLimit({ windowMs: 10, max: 1 });
  const req = { socket: { remoteAddress: "4.4.4.4" }, path: "/reset" };

  limiter(req, makeRes(), () => {});
  await new Promise((resolve) => setTimeout(resolve, 20));

  let allowed = false;
  limiter(req, makeRes(), () => {
    allowed = true;
  });
  assert.ok(allowed);
});

test("errorHandler keeps an already set status code and includes the stack outside production", () => {
  const res = makeRes();
  res.statusCode = 400;
  const error = new Error("Bad payload");

  errorHandler(error, {}, res, () => {});

  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, "Bad payload");
  assert.strictEqual(res.body.stack, error.stack);
});

test("errorHandler hides the stack in production", () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const res = makeRes();

  try {
    errorHandler(new Error("boom"), {}, res, () => {});
  } finally {
    process.env.NODE_ENV = previous;
  }

  assert.strictEqual(res.body.stack, null);
});
