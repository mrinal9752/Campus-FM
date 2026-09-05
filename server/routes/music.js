const express = require("express");
const axios = require("axios");
const LocalMusic = require("../models/LocalMusic");


const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    console.log("Music search received:", query);

    if (!query) {
      return res.status(400).json({
        message: "Song name is required",
      });
    }

    console.log("Searching Audius...");

    const response = await axios.get(
      "https://api.audius.co/v1/tracks/search",
      {
        params: {
          query: query,
          limit: 10,
          sort_method: "relevant",
        },

        timeout: 10000,
      }
    );

    console.log(
      "Audius response received"
    );

    const tracks = response.data.data || [];

    console.log(
  "RAW AUDIUS TRACKS:",
  tracks.map((track) => ({
    id: track.id,
    title: track.title,
    artist: track.user?.name,
  }))
);

const results = tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.user?.name || "Unknown Artist",
        artwork:
          track.artwork?._480x480 || null,
        duration: track.duration,
        permalink: track.permalink,
      }));

    console.log(
      "Tracks found:",
      results.length
    );

        res.json(results);

  } catch (error) {

    console.error(
      "Audius search failed:"
    );

    console.error(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      message: "Audius search failed",
      error:
        error.response?.data ||
        error.message,
    });
  }
});

router.get("/local-search", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({
        message: "Song name is required",
      });
    }

    const regex = new RegExp(query, "i");

    const songs = await LocalMusic.find({
      active: true,
      $or: [
        { title: regex },
        { artist: regex },
      ],
    });

    const results = songs.map((song) => ({
      id: song._id,
      title: song.title,
      artist: song.artist,
      artwork: song.artwork,
      source: "local",
      streamUrl: `/api/music/local/${song.fileName}`,
    }));

    res.json(results);
  } catch (error) {
    console.error("Local music search failed:", error);

    res.status(500).json({
      message: "Failed to search local music",
    });
  }
});


// ========================================
// GET AUDIO STREAM
// ========================================

router.get("/stream/:trackId", async (req, res) => {
  try {

    const { trackId } = req.params;

    console.log(
      "Stream requested:",
      trackId
    );

    const response = await axios.get(
      `https://api.audius.co/v1/tracks/${trackId}/stream`,
      {
        maxRedirects: 0,

        validateStatus: (status) =>
          status >= 200 && status < 400,

        timeout: 10000,
      }
    );

    console.log(
      "Audius stream response:",
      response.status
    );

    const streamUrl =
      response.headers.location;

    if (!streamUrl) {
      return res.status(404).json({
        message: "No stream URL available",
      });
    }

    res.json({
      streamUrl,
    });

  } catch (error) {

    console.error(
      "Audius stream error:"
    );

    console.error(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      message: "Unable to get stream",
      error:
        error.response?.data ||
        error.message,
    });
  }
});


module.exports = router;