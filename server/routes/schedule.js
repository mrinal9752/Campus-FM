const express = require("express");
const Schedule = require("../models/Schedule");
const protect = require("../middleware/auth");

const router = express.Router();

// ==========================================
// CREATE SCHEDULE
// ==========================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      programName,
      hostName,
      day,
      startTime,
      endTime,
      description,
    } = req.body;

    if (
      !programName ||
      !hostName ||
      !day ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const newSchedule = new Schedule({
      programName,
      hostName,
      day,
      startTime,
      endTime,
      description,
    });

    const savedSchedule =
      await newSchedule.save();

    res.status(201).json({
      message: "Schedule added successfully 📅",
      schedule: savedSchedule,
    });
  } catch (error) {
    console.error(
      "Create schedule error:",
      error
    );

    res.status(500).json({
      message: "Failed to create schedule",
    });
  }
});

// ==========================================
// GET ALL SCHEDULES
// ==========================================

router.get("/", async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({
      day: 1,
      startTime: 1,
    });

    res.json(schedules);
  } catch (error) {
    console.error(
      "Get schedules error:",
      error
    );

    res.status(500).json({
      message: "Failed to get schedules",
    });
  }
});

// ==========================================
// DELETE SCHEDULE
// ==========================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {
  try {
    const deletedSchedule =
      await Schedule.findByIdAndDelete(
        req.params.id
      );

    if (!deletedSchedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    res.json({
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete schedule error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete schedule",
    });
  }
});

module.exports = router;