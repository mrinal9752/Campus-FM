const mongoose = require("mongoose");

const radioQueueSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SongRequest",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    artist: {
      type: String,
      default: "Unknown Artist",
    },

    source: {
      type: String,
      enum: ["audius", "local"],
      required: true,
    },

    streamUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["queued", "playing", "played"],
      default: "queued",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RadioQueue",
  radioQueueSchema
);