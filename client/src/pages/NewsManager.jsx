import { useState } from "react";
import api from "../api";
import {
  Newspaper,
  Send,
  Trash2,
  RefreshCw,
} from "lucide-react";

function NewsManager() {
  const [news, setNews] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "CAMPUS",
    image: "",
  });

  const [message, setMessage] = useState("");

  const fetchNews = async () => {
    try {
      const response = await api.get(
        "/news"
      );

      setNews(response.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/news",
        form
      );

      setMessage(response.data.message);

      setForm({
        title: "",
        description: "",
        category: "CAMPUS",
        image: "",
      });

      fetchNews();
    } catch (error) {
      console.error("Publish news error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to publish news"
      );
    }
  };

  const deleteNews = async (id) => {
    try {
      await api.delete(
        `/news/${id}`
      );

      fetchNews();
    } catch (error) {
      console.error("Delete news error:", error);
    }
  };

  return (
    <div className="news-manager">

      <div className="news-manager-header">
        <div>
          <span className="section-label">
            CAMPUS CONTENT
          </span>

          <h2>Campus News</h2>

          <p>
            Publish important updates for students.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchNews}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ADD NEWS FORM */}

      <div className="news-form-card">

        <div className="news-form-title">
          <Newspaper size={20} />

          <div>
            <h3>Publish News</h3>
            <p>Create a new campus announcement.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="title"
            placeholder="News title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="News description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="CAMPUS">
              CAMPUS
            </option>

            <option value="EVENT">
              EVENT
            </option>

            <option value="NOTICE">
              NOTICE
            </option>

            <option value="ACHIEVEMENT">
              ACHIEVEMENT
            </option>

            <option value="CLUB">
              CLUB
            </option>
          </select>

          <input
            type="text"
            name="image"
            placeholder="Image URL (optional)"
            value={form.image}
            onChange={handleChange}
          />

          <button type="submit">
            <Send size={16} />
            Publish News
          </button>

          {message && (
            <p className="news-message">
              {message}
            </p>
          )}

        </form>
      </div>

      {/* NEWS LIST */}

      <div className="published-news">

        <div className="published-news-title">
          <h3>Published News</h3>
        </div>

        {news.length === 0 ? (
          <div className="empty-state">
            <Newspaper size={35} />

            <h3>No news published yet</h3>

            <p>
              Your campus announcements will appear here.
            </p>
          </div>
        ) : (
          <div className="news-list">

            {news.map((item) => (
              <div
                className="news-admin-card"
                key={item._id}
              >

                <div className="news-admin-info">

                  <span className="news-category">
                    {item.category}
                  </span>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <small>
                    {new Date(
                      item.createdAt
                    ).toLocaleString()}
                  </small>

                </div>

                <button
                  className="delete-news-btn"
                  onClick={() =>
                    deleteNews(item._id)
                  }
                >
                  <Trash2 size={16} />
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default NewsManager;