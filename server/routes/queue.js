const express = require("express");
const RadioQueue = require("../models/RadioQueue");

const router = express.Router();

// Get current queue
router.get("/", async (req, res) => {
  try {
    const queue = await RadioQueue.find({
      status: "queued",
    }).sort({ createdAt: 1 });

    res.json(queue);
  } catch (error) {
    console.error("Get queue error:", error);

    res.status(500).json({
      message: "Failed to get radio queue",
    });
  }
});

module.exports = router;