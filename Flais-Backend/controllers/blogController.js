const Blog = require("../models/Blog");
const uploadService = require("../services/storage/UploadService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Create a Blog
// @route   POST /api/blogs
// @access  Private/Admin
exports.createBlog = asyncHandler(async (req, res) => {
    const { title, slug, content, textColor } = req.body;

    let imageUrl = "";
    if (req.file) {
        const uploadResult = await uploadService.upload(req.file, "blogs");
        imageUrl = uploadResult.path;
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      image: imageUrl,
      textColor
    });

    sendSuccess(res, 201, { message: "Blog created successfully", blog });
});

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    sendSuccess(res, 200, { blogs });
});

// @desc    Get Single Blog
// @route   GET /api/blogs/:id (also accepts slug)
// @access  Public
exports.getBlogById = asyncHandler(async (req, res) => {
    const idOrSlug = req.params.id;
    let query = {};
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: idOrSlug };
    } else {
      query = { slug: idOrSlug };
    }

    const blog = await Blog.findOne(query);
    if (!blog) return sendError(res, 404, "Blog not found");

    sendSuccess(res, 200, { blog });
});

// @desc    Update Blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
exports.updateBlog = asyncHandler(async (req, res) => {
    const { title, slug, content, textColor } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return sendError(res, 404, "Blog not found");

    let updateData = { title, content, textColor };
    if (slug) {
        updateData.slug = slug;
    } else if (title && title !== blog.title) {
        updateData.slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
    }

    if (req.file) {
        const uploadResult = await uploadService.replace(req.file, blog.image, "blogs");
        updateData.image = uploadResult.path;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    sendSuccess(res, 200, { message: "Blog updated successfully", blog: updatedBlog });
});

// @desc    Delete Blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
exports.deleteBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return sendError(res, 404, "Blog not found");

    if (blog.image) {
        await uploadService.delete(blog.image);
    }

    sendSuccess(res, 200, { message: "Blog deleted successfully" });
});
