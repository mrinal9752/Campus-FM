const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");



require("dotenv").config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    methods: [
      "GET",
      "POST",
      "PATCH",
      "PUT",
      "DELETE",
    ],
    credentials: true,
  },
});
app.set("io", io);

const PORT = process.env.PORT || 5000;

let listenerCount = 0;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(
  "/api/music/local",
  express.static(path.join(__dirname, "music"))
);

app.use(express.json());

// Routes
const requestRoutes = require("./routes/requests");
const newsRoutes = require("./routes/news");
const scheduleRoutes = require("./routes/schedule");
const shoutoutRoutes = require("./routes/shoutouts");
const authRoutes = require("./routes/auth");
const musicRoutes = require("./routes/music");
const queueRoutes = require("./routes/queue");

app.use("/api/requests", requestRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/shoutouts", shoutoutRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/queue", queueRoutes);

// Socket.IO
io.on("connection", (socket) => {
  listenerCount++;

  console.log(
    `Listener connected. Total listeners: ${listenerCount}`
  );

  io.emit("listenerCount", listenerCount);

  socket.on("disconnect", () => {
    listenerCount--;

    console.log(
      `Listener disconnected. Total listeners: ${listenerCount}`
    );

    io.emit("listenerCount", listenerCount);
  });
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully 🍃");
    console.log(
      "Connected database:",
      mongoose.connection.name
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });

app.get("/", (req, res) => {
  res.json({
    message: "Campus FM Backend is running 🎙️",
  });
});



server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Campus FM server running on port ${PORT}`
  );
});