const asyncHandler = require("./asyncHandler");
const { sendSuccess } = require("./apiResponse");

// Many "page settings" documents are singletons: one document per collection
// that is lazily seeded with defaults on first read and replaced on update.
// This factory builds the shared get/upsert handlers for that pattern.
const createSingletonPageController = ({
  Model,
  defaults = {},
  bodyKey,
  resourceKey,
  updateMessage = "Updated successfully",
}) => {
  const get = asyncHandler(async (req, res) => {
    let doc = await Model.findOne();
    if (!doc) {
      doc = await Model.create(defaults);
    }
    sendSuccess(res, 200, { [resourceKey]: doc });
  });

  const upsert = asyncHandler(async (req, res) => {
    const payload = bodyKey && req.body?.[bodyKey] ? req.body[bodyKey] : req.body;
    const doc = await Model.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    sendSuccess(res, 200, { message: updateMessage, [resourceKey]: doc });
  });

  return { get, upsert };
};

module.exports = { createSingletonPageController };
