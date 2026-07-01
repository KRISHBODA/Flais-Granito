const Blog = require("../models/Blog");

// @desc    Create a Blog
// @route   POST /api/blogs
// @access  Private/Admin
exports.createBlog = async (req, res) => {
    try {
        const { title, slug, content, textColor } = req.body;
        
        let imageUrl = "";
        if (req.file) {
            imageUrl = req.file.path; // Cloudinary URL
        }

        const blog = await Blog.create({ 
          title, 
          slug, 
          content, 
          image: imageUrl,
          textColor
        });

        res.status(201).json({ success: true, message: "Blog created successfully", blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get Single Blog
// @route   GET /api/blogs/:id (also accepts slug)
// @access  Public
exports.getBlogById = async (req, res) => {
    try {
        const idOrSlug = req.params.id;
        let query = {};
        if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
          query = { _id: idOrSlug };
        } else {
          query = { slug: idOrSlug };
        }

        const blog = await Blog.findOne(query);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        res.status(200).json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update Blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res) => {
    try {
        const { title, slug, content, textColor } = req.body;
        
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

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
            updateData.image = req.file.path;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: "Blog updated successfully", blog: updatedBlog });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed", error: error.message });
    }
};

// @desc    Delete Blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
        
        res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};