const express = require("express");
const Shoutout = require("../models/Shoutout");
const protect = require("../middleware/auth");

const router = express.Router();

// ==========================================
// CREATE SHOUTOUT
// ==========================================

router.post("/", async (req, res) => {
  try {
    const {
      studentName,
      message,
    } = req.body;

    if (!studentName || !message) {
      return res.status(400).json({
        message:
          "Student name and message are required",
      });
    }

    const newShoutout = new Shoutout({
      studentName,
      message,
    });

    const savedShoutout =
      await newShoutout.save();

    res.status(201).json({
      message:
        "Shoutout submitted successfully 🎙️",
      shoutout: savedShoutout,
    });
  } catch (error) {
    console.error(
      "Create shoutout error:",
      error
    );

    res.status(500).json({
      message: "Failed to submit shoutout",
    });
  }
});

// ==========================================
// GET APPROVED SHOUTOUTS
// ==========================================

router.get(
  "/",
  async (req, res) => {
  try {
    const shoutouts = await Shoutout.find({
      status: "approved",
    }).sort({
      createdAt: -1,
    });

    res.json(shoutouts);
  } catch (error) {
    console.error(
      "Get shoutouts error:",
      error
    );

    res.status(500).json({
      message: "Failed to get shoutouts",
    });
  }
});

// ==========================================
// GET ALL SHOUTOUTS FOR ADMIN
// ==========================================

router.get("/admin",protect, async (req, res) => {
  try {
    const shoutouts = await Shoutout.find().sort({
      createdAt: -1,
    });

    res.json(shoutouts);
  } catch (error) {
    console.error(
      "Get admin shoutouts error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to get admin shoutouts",
    });
  }
});

// ==========================================
// UPDATE STATUS
// ==========================================

router.patch(
  "/:id",
  protect,
  async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid shoutout status",
      });
    }

    const updatedShoutout =
      await Shoutout.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

    if (!updatedShoutout) {
      return res.status(404).json({
        message: "Shoutout not found",
      });
    }

    res.json({
      message:
        "Shoutout status updated successfully",
      shoutout: updatedShoutout,
    });
  } catch (error) {
    console.error(
      "Update shoutout error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update shoutout",
    });
  }
});

// ==========================================
// DELETE SHOUTOUT
// ==========================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {
  try {
    const deletedShoutout =
      await Shoutout.findByIdAndDelete(
        req.params.id
      );

    if (!deletedShoutout) {
      return res.status(404).json({
        message: "Shoutout not found",
      });
    }

    res.json({
      message:
        "Shoutout deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete shoutout error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete shoutout",
    });
  }
});

module.exports = router;