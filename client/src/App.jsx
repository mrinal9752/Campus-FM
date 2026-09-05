import {
  Radio,
  Play,
  Pause,
  Volume2,
  CalendarDays,
  Music2,
  Mic2,
  Newspaper,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import {
  useEffect,
  useRef,
  useState
} from "react";
import "./index.css";
import { io } from "socket.io-client";
import api from "./api";
import RadioStation from "./RadioStation";

function Home() {
  const [playing, setPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const audioRef = useRef(null);

  const [campusNews, setCampusNews] = useState([]);

  const [songRequest, setSongRequest] = useState({
    studentName: "",
    songName: "",
    message: "",
  });

  const [requestMessage, setRequestMessage] = useState("");

  const [radioSchedule, setRadioSchedule] = useState([]);

  const [listenerCount, setListenerCount] =
  useState(0);

  const [shoutoutForm, setShoutoutForm] =
  useState({
    studentName: "",
    message: "",
  });

const [shoutoutMessage, setShoutoutMessage] =
  useState("");

  const [shoutouts, setShoutouts] =
  useState([]);

const searchMusic = async (e) => {
  e.preventDefault();

  const query = searchQuery.trim();

  if (!query) {
    return;
  }

  setSearching(true);
  setSearchError("");
  setSearchResults([]);

  try {
    const response = await api.get(
      "/music/search",
      {
        params: {
          q: query,
        },
      }
    );

    console.log(
      "Music search response:",
      response.data
    );

    if (Array.isArray(response.data)) {
      setSearchResults(response.data);
    } else {
      setSearchResults([]);

      setSearchError(
        "Music search returned an invalid response."
      );

      console.error(
        "Expected array but received:",
        response.data
      );
    }

  } catch (error) {
    console.error(
      "Music search failed:",
      error.response?.data ||
        error.message
    );

    setSearchResults([]);

    setSearchError(
      "Unable to search music."
    );

  } finally {
    setSearching(false);
  }
};

  useEffect(() => {
const fetchSchedule = async () => {
  try {
    const response = await api.get("/schedule");

    console.log(
      "Schedule response:",
      response.data
    );

    setRadioSchedule(
      Array.isArray(response.data)
        ? response.data
        : []
    );

  } catch (error) {
    console.error(
      "Failed to fetch schedules:",
      error.response?.data ||
        error.message
    );

    setRadioSchedule([]);
  }
};

  fetchSchedule();
}, []);

  useEffect(() => {
const fetchCampusNews = async () => {
  try {
    const response = await api.get("/news");

    console.log(
      "Campus news response:",
      response.data
    );

    setCampusNews(
      Array.isArray(response.data)
        ? response.data
        : []
    );

  } catch (error) {
    console.error(
      "Failed to fetch campus news:",
      error.response?.data ||
        error.message
    );

    setCampusNews([]);
  }
};

  fetchCampusNews();
}, []);

useEffect(() => {
  const socket = io(
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000"
);

  socket.on("listenerCount", (count) => {
    setListenerCount(count);
  });

  return () => {
    socket.disconnect();
  };
}, []);




const handleShoutoutSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await api.post(
      "/shoutouts",
      shoutoutForm
    );

    setShoutoutMessage(
      response.data.message
    );

    setShoutoutForm({
      studentName: "",
      message: "",
    });
  } catch (error) {
    console.error(
      "Shoutout submission error:",
      error
    );

    setShoutoutMessage(
      error.response?.data?.message ||
        "Failed to submit shoutout"
    );
  }
};


useEffect(() => {
const fetchShoutouts = async () => {
  try {
    const response = await api.get("/shoutouts");

    console.log("Shoutouts response:", response.data);

    setShoutouts(
      Array.isArray(response.data)
        ? response.data
        : []
    );

  } catch (error) {
    console.error(
      "Failed to fetch shoutouts:",
      error.response?.data || error.message
    );

    setShoutouts([]);
  }
};

  fetchShoutouts();
}, []);
  
const toggleRadio = () => {
  if (!audioRef.current || !currentSong) {
    return;
  }

  if (playing) {
    audioRef.current.pause();
    setPlaying(false);
  } else {
    audioRef.current
      .play()
      .then(() => {
        setPlaying(true);
      })
      .catch((error) => {
        console.error(
          "Audio playback failed:",
          error
        );

        setPlaying(false);
      });
  }
};

  const handleSongRequest = async (e) => {
  e.preventDefault();

  try {
    const response = await api.post(
      "/requests",
      songRequest
    );

    setRequestMessage(response.data.message);

    setSongRequest({
      studentName: "",
      songName: "",
      message: "",
    });
  } catch (error) {
    console.error("Song request failed:", error);

    setRequestMessage(
        error.response?.data?.message ||
        "Failed to submit song request"
      );
    }
  };

const playSong = async (song) => {
  try {
    console.log("Playing song:", song.title);

    const response = await api.get(
      `/music/stream/${song.id}`
    );

    console.log(
      "Stream response:",
      response.data
    );

    const streamUrl =
      response.data?.streamUrl;

    if (!streamUrl) {
      throw new Error(
        "No stream URL received from backend"
      );
    }

    const playableSong = {
      ...song,
      streamUrl,
    };

    console.log(
      "Stream URL received:",
      streamUrl
    );

    setCurrentSong(playableSong);

  } catch (error) {
    console.error(
      "Unable to play song:",
      error.response?.data ||
        error.message
    );

    setPlaying(false);
  }
};

useEffect(() => {
  if (!currentSong || !audioRef.current) {
    return;
  }

  audioRef.current.load();

  audioRef.current
    .play()
    .then(() => {
      setPlaying(true);
    })
    .catch((error) => {
      console.error(
        "Playback failed:",
        error
      );

      setPlaying(false);
    });

}, [currentSong]);

const queueSong = async (song) => {
  try {
    console.log("Queueing song:", song.title);

    const response = await api.get(
      `/music/stream/${song.id}`
    );

    const queuedSong = {
      ...song,
      streamUrl: response.data.streamUrl,
    };

    setQueue((previousQueue) => [
      ...previousQueue,
      queuedSong,
    ]);

    console.log(
      "Song added to queue:",
      queuedSong.title
    );

  } catch (error) {
    console.error(
      "Unable to queue song:",
      error.response?.data || error.message
    );
  }
};

const handleSongEnded = () => {
  setQueue((previousQueue) => {
    if (previousQueue.length === 0) {
      setPlaying(false);
      setCurrentSong(null);
      return [];
    }

    const nextSong = previousQueue[0];

    setCurrentSong(nextSong);

    return previousQueue.slice(1);
  });
};

  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Radio size={22} />
          </div>

          <div>
            <h2>Campus FM</h2>
            <span>YOUR CAMPUS. YOUR VOICE.</span>
          </div>
        </div>

        <div className="nav-links">
          <a className="active">Home</a>
          <a href="#schedule">Schedule</a>
          <a href="#news">News</a>
          <a href="#request">Request Song</a>
        </div>

        <Link
            to="/admin"
            className="admin-login-btn"
          >
            Admin Login
        </Link>
      </nav>

          {/* =========================
        MUSIC SEARCH
    ========================= */}

    <section className="music-search-section">

      <div className="section-heading">

        <span className="section-label">
          MUSIC DISCOVERY
        </span>

        <h2>Find a Song</h2>

        <p>
          Search for a song or artist and play it on Campus FM.
        </p>

      </div>

      <form
        className="music-search-form"
        onSubmit={searchMusic}
      >

        <input
          type="text"
          placeholder="Search songs, artists..."
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
        />

        <button type="submit">
          {searching ? "Searching..." : "Search"}
        </button>

      </form>

      {searchError && (
        <p className="music-search-error">
          {searchError}
        </p>
      )}

      {searchResults.length > 0 && (
        <div className="music-search-results">

          <div className="section-label">
            SEARCH RESULTS
          </div>

          {Array.isArray(searchResults) &&
            searchResults.map((song) => (
              <div
                className={`music-result ${
                  currentSong?.id === song.id
                    ? "is-playing"
                    : ""
                }`}
                key={song.id}
              >
              <div className="music-result-artwork">
                {song.artwork ? (
                  <img
                    src={song.artwork}
                    alt={song.title}
                  />
                ) : (
                  <Music2 size={24} />
                )}
              </div>

              <div className="music-result-info">
                <h3>{song.title}</h3>

                <p>{song.artist}</p>
              </div>

              <div className="music-result-actions">

                {/* PLAY / PAUSE */}
                <button
                  type="button"
                  className="music-play-btn"
                  onClick={() => {
                    if (
                      currentSong?.id === song.id &&
                      playing
                    ) {
                      toggleRadio();
                    } else {
                      playSong(song);
                    }
                  }}
                >
                  {currentSong?.id === song.id && playing ? (
                    <>
                      <Pause size={14} />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Play
                    </>
                  )}
                </button>

                {/* QUEUE */}
                <button
                  type="button"
                  className="music-queue-btn"
                  onClick={() => queueSong(song)}
                >
                  <span>+</span>
                  Queue
                </button>

              </div>
            </div>
          ))}
        

        </div>
      )}

    </section>

    <Link to="/radio" className="home-radio-button">
  <Radio size={18} />
  Enter Campus FM Radio
</Link>

      {/* HERO / LIVE RADIO */}
      <main>
{currentSong?.streamUrl && (
  <audio
    ref={audioRef}
    src={currentSong.streamUrl}
    onLoadedMetadata={() => {
      console.log("Audio metadata loaded");
    }}
    onCanPlay={() => {
      console.log("Audio can play");
    }}
    onPlay={() => {
      console.log("Audio started");
    }}
    onPause={() => {
      console.log("Audio paused");
    }}
    onError={(e) => {
      console.error(
        "AUDIO ERROR:",
        e.currentTarget.error
      );
    }}
    onEnded={handleSongEnded}
  />
)}
        <section className="hero">
          <div className="hero-content">
            <div className="live-badge">
              <span className="live-dot"></span>
              LIVE NOW
            </div>

            <h1>
              Campus
              <br />
              <span>Vibes.</span>
            </h1>

            <p className="hero-description">
              Your college radio station for music, conversations,
              announcements and student voices.
            </p>

            <div className="hero-buttons">
              <button
                className="play-button"
                type="button"
                onClick={toggleRadio}
              >
                {playing ? "⏸" : "▶"}
              </button>

              <a href="#schedule" className="schedule-button">
                <CalendarDays size={19} />
                View Schedule
              </a>
            </div>
          </div>

          {/* RADIO CARD */}
          <div className="radio-card">
            <div className="radio-card-top">
              <div className="small-live">
                <span className="live-dot"></span>
                LIVE
              </div>

              <div className="listener-count">
                  <span>
                    {listenerCount}{" "}
                    {listenerCount === 1
                      ? "listener"
                      : "listeners"}
                 </span>
              </div>
            </div>

            <div className="album-art">
              <div className="sound-circle">
                <Radio size={58} />
              </div>

              <div className="sound-wave">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>

            <div className="now-playing-info">

              <span className="now-playing-label">
                NOW PLAYING
              </span>

              <h2>
                {currentSong?.title || "Campus FM"}
              </h2>

              <p>
                {currentSong?.artist || "Choose a song to start"}
              </p>

            </div>

            <div className="progress">
              <div className="progress-fill"></div>
            </div>

            <div className="player-controls">
              <span>LIVE</span>

              <button
                className="main-play"
                onClick={toggleRadio}
              >
                {playing ? <Pause size={22} /> : <Play size={22} />}
              </button>

              <Volume2 size={19} />
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="quick-actions">
          <div className="request-card" id="request">
            <div className="request-header">
              <div className="quick-icon purple">
                <Music2 size={24} />
              </div>

              <div>
                <h3>Request a Song</h3>
                <p>Tell our RJ what you want to hear.</p>
              </div>
            </div>

            <form onSubmit={handleSongRequest}>
              <input
                type="text"
                placeholder="Your name"
                value={songRequest.studentName}
                onChange={(e) =>
                  setSongRequest({
                    ...songRequest,
                    studentName: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Song name"
                value={songRequest.songName}
                onChange={(e) =>
                  setSongRequest({
                    ...songRequest,
                    songName: e.target.value,
                  })
                }
                required
              />

              <textarea
                placeholder="Message for the RJ (optional)"
                value={songRequest.message}
                onChange={(e) =>
                  setSongRequest({
                    ...songRequest,
                    message: e.target.value,
                  })
                }
              />

              <button type="submit">
                <Music2 size={17} />
                Send Request
              </button>

              {requestMessage && (
                <p className="request-message">
                  {requestMessage}
                </p>
              )}
            </form>
          </div>
          <div className="quick-icon purple">
            <Music2 size={24} />
          </div>

          <div>
            <h3>Request a Song</h3>
            <p>Tell our RJ what you want to hear.</p>
          </div>

          <ChevronRight size={20} />

          <div className="quick-card">
            <div className="quick-icon orange">
              <Mic2 size={24} />
            </div>

            <div>
              <h3>Send a Shoutout</h3>
              <p>Send your message to the campus.</p>
            </div>

            <ChevronRight size={20} />
          </div>

          <div className="quick-card">
            <div className="quick-icon blue">
              <Newspaper size={24} />
            </div>

            <div>
              <h3>Campus News</h3>
              <p>Stay updated with what's happening.</p>
            </div>

            <ChevronRight size={20} />
          </div>
        </section>

        {/* Shoutout*/}
        <section className="shoutout-section">

  <div className="section-heading">
    <div>
      <span className="section-label">
        CAMPUS VOICES
      </span>

      <h2>Send a Shoutout</h2>

      <p>
        Send a message to your friends on Campus FM.
      </p>
    </div>
  </div>

  <form
    className="shoutout-form"
    onSubmit={handleShoutoutSubmit}
  >

    <input
      type="text"
      placeholder="Your name"
      value={shoutoutForm.studentName}
      onChange={(e) =>
        setShoutoutForm({
          ...shoutoutForm,
          studentName: e.target.value,
        })
      }
      required
    />

    <textarea
      placeholder="Write your shoutout..."
      value={shoutoutForm.message}
      onChange={(e) =>
        setShoutoutForm({
          ...shoutoutForm,
          message: e.target.value,
        })
      }
      maxLength={250}
      required
    />

    <button type="submit">
      🎙️ Send Shoutout
    </button>

    {shoutoutMessage && (
      <p className="shoutout-message">
        {shoutoutMessage}
      </p>
    )}

  </form>

</section>

      {/*Shoutout approved*/}
      <section className="approved-shoutouts">

  <div className="section-heading">

    <div>
      <span className="section-label">
        ON AIR
      </span>

      <h2>Campus Shoutouts</h2>
    </div>

  </div>

  {shoutouts.length === 0 ? (

    <p className="no-shoutouts">
      No shoutouts yet. Be the first!
    </p>

  ) : (

    <div className="shoutout-grid">

      {Array.isArray(shoutouts) &&
        shoutouts.map((item) => (

        <div
          className="shoutout-card"
          key={item._id}
        >

          <div className="shoutout-card-icon">
            <Mic2 size={18} />
          </div>

          <p>
            "{item.message}"
          </p>

          <span>
            — {item.studentName}
          </span>

        </div>

      ))}

    </div>

  )}

</section>

<div className="queue-section">

  <div className="section-label">
    NEXT UP
  </div>

  {queue.length === 0 ? (
    <p className="queue-empty">
      No songs in queue.
    </p>
  ) : (
    <div className="queue-list">

      {queue.map((song, index) => (
        <div
          className="queue-item"
          key={`${song.id}-${index}`}
        >
          <span className="queue-number">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="queue-song-info">
            <strong>{song.title}</strong>

            <small>{song.artist}</small>
          </div>
        </div>
      ))}

    </div>
  )}

</div>

        {/* SCHEDULE */}
        <section className="radio-schedule">

  <div className="section-heading">
    <div>
      <span className="section-label">
        ON AIR PROGRAMMING
      </span>

      <h2>Radio Schedule</h2>
    </div>
  </div>

  {radioSchedule.length === 0 ? (
    <div className="empty-state">

      <CalendarDays size={35} />

      <h3>No programs scheduled</h3>

      <p>
        Check back soon for the latest schedule.
      </p>

    </div>
  ) : (

    <div className="schedule-grid">

      {Array.isArray(radioSchedule) &&
        radioSchedule.map((item) => (

        <div
          className="schedule-card"
          key={item._id}
        >

          <div className="schedule-card-top">

            <span className="schedule-day">
              {item.day}
            </span>

            <Clock3 size={16} />

          </div>

          <h3>
            {item.programName}
          </h3>

          <p>
            Hosted by {item.hostName}
          </p>

          <div className="schedule-card-time">

            {item.startTime}

            <span>—</span>

            {item.endTime}

          </div>

          {item.description && (
            <small>
              {item.description}
            </small>
          )}

        </div>

      ))}

    </div>

  )}

</section>

        {/* NEWS */}
        <section className="section" id="news">
          <div className="section-heading">
            <div>
              <span className="section-label">STAY UPDATED</span>
              <h2>Campus News</h2>
            </div>

            <button className="view-all">
              All News <ChevronRight size={16} />
            </button>
          </div>

          <div className="news-grid">
            {Array.isArray(campusNews) &&
              campusNews.map((item) => (
  <div
    className="news-card"
    key={item._id}
  >
    {item.image && (
      <img
        src={item.image}
        alt={item.title}
      />
    )}

    <span className="news-category">
      {item.category}
    </span>

    <h3>{item.title}</h3>

    <p>{item.description}</p>

    <small>
      {new Date(
        item.createdAt
      ).toLocaleDateString()}
    </small>
  </div>

            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-brand">
          <Radio size={22} />
          <span>Campus FM</span>
        </div>

        <p>Connecting students through music, stories & voices.</p>

        <span className="copyright">© 2026 Campus FM</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
  path="/radio"
  element={<RadioStation />}
/>

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;