const express = require("express");
const News = require("../models/News");
const protect = require("../middleware/auth");

const router = express.Router();

// ==========================================
// CREATE NEWS
// ==========================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      category,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const newNews = new News({
      title,
      description,
      image,
      category,
    });

    const savedNews = await newNews.save();

    res.status(201).json({
      message: "Campus news published successfully 📰",
      news: savedNews,
    });
  } catch (error) {
    console.error("Create news error:", error);

    res.status(500).json({
      message: "Failed to publish news",
    });
  }
});

// ==========================================
// GET ALL NEWS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const news = await News.find().sort({
      createdAt: -1,
    });

    res.json(news);
  } catch (error) {
    console.error("Get news error:", error);

    res.status(500).json({
      message: "Failed to get campus news",
    });
  }
});

// ==========================================
// DELETE NEWS
// ==========================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(
      req.params.id
    );

    if (!deletedNews) {
      return res.status(404).json({
        message: "News not found",
      });
    }

    res.json({
      message: "News deleted successfully",
    });
  } catch (error) {
    console.error("Delete news error:", error);

    res.status(500).json({
      message: "Failed to delete news",
    });
  }
});

module.exports = router;