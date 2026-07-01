const HomePage = require("../models/HomePage");
const { uploadToR2 } = require("../middleware/r2Upload");

const DEFAULT_HOME = {
  homeTexts: {
    innovationTitle: "Leading the Way in Tile Innovation",
    innovationDesc:
      "FLAIS GRANITO has been a trusted name in the industry for over two decades. We source only the finest materials from around the globe to ensure our customers receive products that are not only beautiful but also built to last.",
    innovationExp: "20+",
    innovationDesigns: "500+",
    collectionsDesc1:
      "Be inspired by FLAIS's new collections, designed to interpret contemporary styles and meet the needs of design projects.",
    collectionsDesc2:
      "Surfaces for floors, wall coverings, countertops, and furnishings that combine aesthetics, performance, and versatility for architecture and interior design.",
    collectionsImage: "",
    collectionsVideo: "",
    sustainabilityTitle: "Our Commitment to Sustainability",
    sustainabilityDesc:
      "We have been producing porcelain surfaces for over 60 years with passion, innovation, and a focus on sustainability. Our processes are designed to minimize environmental impact while maximizing quality and durability.",
    sustainabilityImage: "",
    blogTitle: "New Day\nNew Inspiration",
  },
  choices: [
    { id: 1, name: "LISC collection", image: "", type: "lisc", logoImage: "" },
  ],
  sizes: [],
  categories: [],
  video: { url: "", name: "" },
};

exports.getHomePage = async (req, res) => {
  try {
    let home = await HomePage.findOne();
    if (!home) {
      home = await HomePage.create(DEFAULT_HOME);
    }
    res.status(200).json({ success: true, home });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.upsertHomePage = async (req, res) => {
  try {
    const payload = req.body?.home ? req.body.home : req.body;
    
    // Handle video upload to R2 if video file is provided
    if (req.file) {
      try {
        const uploadResult = await uploadToR2(req.file, "videos/home");
        if (uploadResult.success) {
          payload.video = {
            url: uploadResult.url,
            name: req.file.originalname,
            key: uploadResult.key,
          };
        }
      } catch (uploadError) {
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload video to R2: " + uploadError.message 
        });
      }
    }

    const home = await HomePage.findOneAndUpdate(
      {},
      { $set: payload },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
    res.status(200).json({ success: true, message: "Home page updated", home });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
