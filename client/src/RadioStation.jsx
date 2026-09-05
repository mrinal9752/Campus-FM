import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Radio,
  Search,
  ArrowLeft,
  Play,
  Users,
  Music2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "./api";
import { io } from "socket.io-client";

function RadioStation() {
  const [songQuery, setSongQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [radioQueue, setRadioQueue] = useState([]);
  const [studentName, setStudentName] = useState("");

const audioRef = useRef(null);

const fetchRadioQueue = useCallback(async () => {
  try {
    const response = await api.get("/queue");

    const queue = Array.isArray(response.data)
      ? response.data
      : [];

    setRadioQueue(queue);

    if (!currentSong && queue.length > 0) {
      setCurrentSong(queue[0]);
    }

    console.log("Radio queue loaded:", queue);
  } catch (error) {
    console.error(
      "Failed to fetch radio queue:",
      error.response?.data || error.message
    );
  }
}, [currentSong]);

useEffect(() => {
  let cancelled = false;

  const loadQueue = async () => {
    try {
      const response = await api.get("/queue");

      if (cancelled) return;

      const queue = Array.isArray(response.data)
        ? response.data
        : [];

      setRadioQueue(queue);

      console.log("Radio queue loaded:", queue);
    } catch (error) {
      if (cancelled) return;

      console.error(
        "Failed to fetch radio queue:",
        error.response?.data || error.message
      );
    }
  };

  loadQueue();

  return () => {
    cancelled = true;
  };
}, []);

const requestSong = async (e) => {
  e.preventDefault();

  console.log("Student Name:", studentName);
  console.log("Song Name:", songQuery);

  if (!studentName.trim() || !songQuery.trim()) {
    setMessage("Please enter your name and song name.");
    return;
  }

  try {
    setLoading(true);
    setMessage("");

    const requestData = {
      studentName: studentName.trim(),
      songName: songQuery.trim(),
      message: "",
    };

    console.log("Sending request:", requestData);

    const response = await api.post(
      "/requests",
      requestData
    );

    console.log("Request response:", response.data);

    setMessage(
      response.data?.message ||
        "Song request submitted successfully 🎵"
    );

    setStudentName("");
    setSongQuery("");
  } catch (error) {
    console.error(
      "Song request failed:",
      error.response?.data || error.message
    );

    setMessage(
      error.response?.data?.message ||
        "Unable to submit song request."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:5000";

  const socket = io(socketUrl);

  socket.on("approvedSong", (song) => {
    console.log("Approved song received:", song);

    setCurrentSong(song);
  });

  return () => {
    socket.disconnect();
  };
}, []);

useEffect(() => {
  if (!currentSong?.streamUrl || !audioRef.current) {
    return;
  }

  const audio = audioRef.current;

  audio.src = currentSong.streamUrl;
  audio.load();

  audio
    .play()
    .then(() => {
      setPlaying(true);
    })
    .catch((error) => {
      console.error("Radio playback failed:", error);
      setPlaying(false);
    });
}, [currentSong]);

useEffect(() => {
  const fetchQueue = async () => {
    try {
      const response = await api.get("/queue");

      setRadioQueue(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load radio queue:",
        error
      );
    }
  };

  fetchQueue();
}, []);

useEffect(() => {
  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:5000";

  const socket = io(socketUrl);

  console.log("Connecting to radio socket...");

  socket.on("connect", () => {
    console.log(
      "Radio socket connected:",
      socket.id
    );
  });

  socket.on("queueUpdated", () => {
    console.log("Queue updated from admin");

    fetchRadioQueue();
  });

  socket.on("disconnect", () => {
    console.log("Radio socket disconnected");
  });

  return () => {
    socket.disconnect();
  };
}, [fetchRadioQueue]);


  return (
    <div className="radio-page">

      {/* TOP NAVIGATION */}
      <header className="radio-navbar">

        <Link to="/" className="radio-back">
          <ArrowLeft size={18} />
          <span>Campus FM</span>
        </Link>

        <div className="radio-live">
          <span className="radio-live-dot"></span>
          LIVE
        </div>

      </header>

      {/* MAIN CONTENT */}
      <main className="radio-container">

        {/* HERO / NOW PLAYING */}
        <section className="radio-hero">

          <div className="radio-hero-left">

            <div className="radio-label">
              <Radio size={15} />
              CAMPUS FM RADIO
            </div>

            <h1>
              Your Campus.
              <br />
              <span>Your Sound.</span>
            </h1>

            <p>
              Tune in to Campus FM and enjoy music,
              campus updates and requests from students.
            </p>

            <div className="radio-live-card">

              <div className="radio-cover">
                <Radio size={45} />
              </div>

              <div className="radio-track-info">

                <span className="playing-label">
                  NOW PLAYING
                </span>

                <h2>Campus FM Live</h2>

                <p>Campus Radio Station</p>

              </div>

              <button className="radio-play-button">
                <Play size={20} fill="currentColor" />
              </button>

            </div>

          </div>


          <div className="radio-player-placeholder">

  <div className="radio-cover">
    <Radio size={45} />
  </div>

  <div className="radio-track-info">

    <span className="playing-label">
      NOW PLAYING
    </span>

    <h2>
      {currentSong?.title || "Campus FM Live"}
    </h2>

    <p>
      {currentSong?.artist || "Waiting for the next song"}
    </p>

  </div>

  <audio
    ref={audioRef}
    onPlay={() => setPlaying(true)}
    onPause={() => setPlaying(false)}
    onEnded={() => setPlaying(false)}
  />

</div>

          {/* LISTENERS */}
          <div className="radio-stats-card">

            <div className="radio-stat-icon">
              <Users size={22} />
            </div>

            <span>LIVE LISTENERS</span>

            <strong>Live</strong>

            <p>
              Students listening right now
            </p>

          </div>

        </section>

        {/* REQUEST SONG */}
        <section className="radio-request-card">

          <div className="request-icon">
            <Music2 size={26} />
          </div>

          <div className="request-content">

            <span className="radio-section-label">
              SONG REQUEST
            </span>

            <h2>
              What should we play?
            </h2>

            <p>
              Request a song and our radio team
              will review it for the next playlist.
            </p>

            <form
              className="radio-request-form"
              onSubmit={requestSong}
              
            >

              <div className="radio-request-fields">

                <div className="request-field">
                    <label htmlFor="studentName">
                    Your Name
                    </label>

                    <input
                    id="studentName"
                    type="text"
                    placeholder="Enter your name"
                    value={studentName}
                    onChange={(e) =>
                        setStudentName(e.target.value)
                    }
                    />
                </div>

                <div className="request-field request-song-field">
                    <label htmlFor="songRequest">
                    Song Name / Artist
                    </label>

                    <div className="radio-search-box">
                    <Search size={19} />

                    <input
                        id="songRequest"
                        type="text"
                        placeholder="e.g. Believer — Imagine Dragons"
                        value={songQuery}
                        onChange={(e) =>
                        setSongQuery(e.target.value)
                        }
                    />
                    </div>
                </div>

  <button
    type="submit"
    disabled={loading}
    className="request-submit-btn"
  >
    {loading ? (
      "Sending..."
    ) : (
      <>
        <Music2 size={17} />
        Request Song
      </>
    )}
  </button>

</div>

            </form>

            {message && (
              <div className="radio-message">
                {message}
              </div>
            )}

          </div>

        </section>

        {/* UP NEXT */}
        <section className="radio-queue-card">

          <div className="radio-section-label">
            UP NEXT
          </div>

          <h2>Radio Queue</h2>

          <p className="queue-placeholder">
            Approved song requests will appear here.
          </p>

        </section>

      </main>

    </div>
  );
}

export default RadioStation;