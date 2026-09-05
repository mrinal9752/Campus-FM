const express = require("express");
const SongRequest = require("../models/SongRequest");
const protect = require("../middleware/auth");
const axios = require("axios");
const LocalMusic = require("../models/LocalMusic");
const RadioQueue = require("../models/RadioQueue");



const router = express.Router();

// Create a new song request
router.post("/", async (req, res) => {
  try {
    const { studentName, songName, message } = req.body;

    // Validate required fields
    if (!studentName || !songName) {
      return res.status(400).json({
        message: "Student name and song name are required",
      });
    }

    const newRequest = new SongRequest({
      studentName,
      songName,
      message,
    });

    const savedRequest = await newRequest.save();

    res.status(201).json({
      message: "Song request submitted successfully 🎵",
      request: savedRequest,
    });
  } catch (error) {
    console.error("Song request error:", error);

    res.status(500).json({
      message: "Failed to submit song request",
    });
  }
});

// Get all song requests
router.get("/", async (req, res) => {
  try {
    const requests = await SongRequest.find().sort({
      createdAt: -1,
    });

    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);

    res.status(500).json({
      message: "Failed to get song requests",
    });
  }
});

const findPlayableSong = async (songName) => {
  // ======================================
  // 1. SEARCH LOCAL MUSIC FIRST
  // ======================================

  try {
    console.log("1. Searching local music:", songName);

    const localSongs = await LocalMusic.find({
      active: true,
    });

    const searchText = songName
      .toLowerCase()
      .trim();

    // Exact title match first
    let localSong = localSongs.find(
      (song) =>
        song.title?.toLowerCase().trim() ===
        searchText
    );

    // Partial title / artist match second
    if (!localSong) {
      localSong = localSongs.find((song) => {
        const title =
          song.title?.toLowerCase() || "";

        const artist =
          song.artist?.toLowerCase() || "";

        return (
          title.includes(searchText) ||
          searchText.includes(title) ||
          artist.includes(searchText)
        );
      });
    }

    if (localSong) {
      console.log(
        "✅ Local song found:",
        localSong.title
      );

      const backendUrl =
        process.env.BACKEND_URL ||
        `http://localhost:${process.env.PORT || 5000}`;

      return {
        title: localSong.title,
        artist:
          localSong.artist ||
          "Unknown Artist",

        artwork:
          localSong.artwork || "",

        source: "local",

        streamUrl:
          `${backendUrl}/api/music/local/` +
          encodeURIComponent(
            localSong.fileName
          ),
      };
    }

    console.log(
      "❌ Local song not found. Trying Audius..."
    );
  } catch (error) {
    console.error(
      "Local music search failed:",
      error.message
    );
  }

  // ======================================
  // 2. SEARCH AUDIUS
  // ======================================

  try {
    console.log("2. Searching Audius:", songName);

    const response = await axios.get(
      "https://api.audius.co/v1/tracks/search",
      {
        params: {
          query: songName,
          limit: 10,
          sort_method: "relevant",
        },
        timeout: 8000,
      }
    );

    const tracks =
      response.data?.data || [];

    console.log(
      "Audius results:",
      tracks.length
    );

    for (const track of tracks) {
      try {
        const streamResponse =
          await axios.get(
            `https://api.audius.co/v1/tracks/${track.id}/stream`,
            {
              maxRedirects: 0,
              validateStatus: (status) =>
                status >= 200 && status < 400,
              timeout: 5000,
            }
          );

        const streamUrl =
          streamResponse.headers.location;

        if (streamUrl) {
          console.log(
            "✅ Audius song found:",
            track.title
          );

          return {
            title: track.title,

            artist:
              track.user?.name ||
              "Unknown Artist",

            artwork:
              track.artwork?._480x480 || "",

            source: "audius",

            streamUrl,
          };
        }
      } catch (error) {
        console.log(
          "Audius track not playable:",
          track.title
        );
      }
    }

    console.log(
      "❌ No playable Audius song found."
    );
  } catch (error) {
    console.error(
      "Audius search failed:",
      error.message
    );
  }

  // ======================================
  // 3. NOTHING FOUND
  // ======================================

  return null;
};

// Update song request status
router.patch(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "pending",
        "approved",
        "played",
        "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid request status",
        });
      }

      const updatedRequest =
        await SongRequest.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true }
        );

      if (!updatedRequest) {
        return res.status(404).json({
          message: "Song request not found",
        });
      }

      // --------------------------------
      // ADMIN APPROVED THE REQUEST
      // --------------------------------
      if (status === "approved") {
        console.log(
          "Finding playable song:",
          updatedRequest.songName
        );

        const playableSong =
          await findPlayableSong(
            updatedRequest.songName
          );

        // No Audius or local song found
        if (!playableSong) {
          return res.status(404).json({
            message:
              "Song approved, but no playable version was found.",
            request: updatedRequest,
          });
        }

        // --------------------------------
        // Add to radio queue
        // --------------------------------
        const queueItem = await RadioQueue.create({
          requestId: updatedRequest._id,

          title: playableSong.title,

          artist: playableSong.artist,

          source: playableSong.source,

          streamUrl: playableSong.streamUrl,

          status: "queued",
        });

        // --------------------------------
        // Tell Radio Station
        // --------------------------------
        const io = req.app.get("io");

        if (io) {
          io.emit("queueUpdated", queueItem);
        }

        return res.json({
          message:
            "Request approved and added to radio queue 🎵",

          request: updatedRequest,

          queueItem,
        });
      }

      res.json({
        message:
          "Request status updated successfully",

        request: updatedRequest,
      });
    } catch (error) {
      console.error(
        "Update request error:",
        error
      );

      res.status(500).json({
        message: "Failed to update request",
      });
    }
  }
);

module.exports = router;