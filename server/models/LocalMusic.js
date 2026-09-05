const mongoose = require("mongoose");

const localMusicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    artist: {
      type: String,
      default: "Unknown Artist",
    },

    fileName: {
      type: String,
      required: true,
    },

    artwork: {
      type: String,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LocalMusic",
  localMusicSchema
);