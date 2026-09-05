import { useEffect, useState } from "react";
import NewsManager from "./NewsManager";
import ScheduleManager from "./ScheduleManager";
import ShoutoutManager from "./ShoutoutManager";
import AdminLogin from "./AdminLogin";
import api from "../api";
import {
  Radio,
  Music2,
  Clock3,
  Check,
  X,
  Play,
  RefreshCw,
} from "lucide-react";

function AdminDashboard() {

    const [adminUser, setAdminUser] = useState(() => {
    const savedUser =
      localStorage.getItem("campusfm_user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });


  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const handleLogout = () => {
  localStorage.removeItem("campusfm_token");
  localStorage.removeItem("campusfm_user");

  setAdminUser(null);
};

  const fetchRequests = async () => {
    try {
      const response = await api.get(
        "/requests"
      );

      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  let cancelled = false;

  const loadRequests = async () => {
    try {
      const response = await api.get(
        "/requests"
      );

      if (!cancelled) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadRequests();

  return () => {
    cancelled = true;
  };
}, []);

const updateRequestStatus = async (id, status) => {
  console.log("BUTTON CLICKED");
  console.log("Request ID:", id);
  console.log("New status:", status);

  try {
    const response = await api.patch(
      `/requests/${id}`,
      { status }
    );

    console.log(
      "STATUS UPDATE RESPONSE:",
      response.data
    );

    setRequests((previousRequests) =>
      previousRequests.map((request) =>
        request._id === id
          ? {
              ...request,
              status,
            }
          : request
      )
    );
  } catch (error) {
    console.error(
      "STATUS UPDATE ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );
  }
};

  const pending = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const approved = requests.filter(
    (request) => request.status === "approved"
  ).length;

  const played = requests.filter(
    (request) => request.status === "played"
  ).length;

  const rejected = requests.filter(
        (request) => request.status === "rejected"
   ).length;

   const filteredRequests =
  filter === "all"
    ? requests
    : requests.filter(
        (request) => request.status === filter
      );

       //If admin is not logged in,
// show login page instead of dashboard.
if (!adminUser) {
  return (
    <AdminLogin
      onLogin={(user) => setAdminUser(user)}
    />
  );
}

  return (
    <div className="admin-page">

      {/* HEADER */}
      <header className="admin-header">

  <div className="admin-brand">

    <div className="admin-logo">
      <Radio size={22} />
    </div>

    <div>
      <h1>Campus FM</h1>
      <span>ADMIN DASHBOARD</span>
    </div>

  </div>

  <div className="admin-header-actions">

    <div className="admin-status">
      <span className="live-dot"></span>
      RADIO ONLINE
    </div>

    <button
      className="logout-btn"
      onClick={handleLogout}
    >
      Logout
    </button>

  </div>

</header>

      <main className="admin-main">

        {/* TITLE */}
        <div className="admin-title">
          <div>
            <span className="section-label">
              CONTROL CENTER
            </span>

            <h2>Radio Dashboard</h2>

            <p>
              Manage song requests and monitor Campus FM.
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchRequests}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* STATISTICS */}
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon red">
                    <X size={22} />
                </div>

            <div>
            <span>REJECTED</span>
                <h3>{rejected}</h3>
            </div>
        </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Music2 size={22} />
            </div>

            <div>
              <span>SONG REQUESTS</span>
              <h3>{requests.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <Clock3 size={22} />
            </div>

            <div>
              <span>PENDING</span>
              <h3>{pending}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Check size={22} />
            </div>

            <div>
              <span>APPROVED</span>
              <h3>{approved}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <Play size={22} />
            </div>

            <div>
              <span>PLAYED</span>
              <h3>{played}</h3>
            </div>
          </div>

        </div>

        {/* REQUESTS */}
        <section className="requests-section">

          <div className="section-heading">
            <div>
              <span className="section-label">
                MUSIC QUEUE
              </span>

              <h2>Song Requests</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <Music2 size={35} />

              <h3>No song requests yet</h3>

              <p>
                Student requests will appear here.
              </p>
            </div>
          ) : (
          <div className="requests-content">
            <div className="request-filters">
              
  <button
    className={filter === "all" ? "filter-active" : ""}
    onClick={() => setFilter("all")}
  >
    All
  </button>

  <button
    className={filter === "pending" ? "filter-active" : ""}
    onClick={() => setFilter("pending")}
  >
    Pending
  </button>

  <button
    className={filter === "approved" ? "filter-active" : ""}
    onClick={() => setFilter("approved")}
  >
    Approved
  </button>

  <button
    className={filter === "played" ? "filter-active" : ""}
    onClick={() => setFilter("played")}
  >
    Played
  </button>

  <button
    className={filter === "rejected" ? "filter-active" : ""}
    onClick={() => setFilter("rejected")}
  >
    Rejected
  </button>
</div>

        {filteredRequests.length === 0 ? (
          <div className="empty-state filtered-empty">
            <Music2 size={32} />

            <h3>
              No {filter === "all" ? "" : filter} requests
            </h3>

            <p>
              There are no requests matching this filter.
            </p>
          </div>
        ) : (
          <div className="request-list">

            {filteredRequests.map((request) => (
                <div
                  className="admin-request"
                  key={request._id}
                >

                  <div className="request-music-icon">
                    <Music2 size={21} />
                  </div>

                  <div className="request-info">
                    <h3>{request.songName}</h3>

                    <p>
                      Requested by{" "}
                      <strong>
                        {request.studentName}
                      </strong>
                    </p>

                    {request.message && (
                      <span className="request-note">
                        "{request.message}"
                      </span>
                    )}
                  </div>

                  <div className="request-status">
                    <span
                      className={`status ${request.status}`}
                    >
                      {request.status}
                    </span>

                    <small>
                      {new Date(
                        request.createdAt
                      ).toLocaleString()}
                    </small>
                  </div>

                  <div className="request-actions">

                    {request.status === "pending" && (
                      <>
                        <button
                          className="approve-btn"
                          type="button"
                          onClick={() =>
                            updateRequestStatus(
                              request._id,
                              "approved"
                            )
                          }
                        >
                          <Check size={15} />
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          type="button"
                          onClick={() =>
                            updateRequestStatus(
                              request._id,
                              "rejected"
                            )
                          }
                        >
                          <X size={15} />
                          Reject
                        </button>
                      </>
                    )}

                    {request.status === "approved" && (
                      <button
                        className="play-request-btn"
                        onClick={() =>
                          updateRequestStatus(
                            request._id,
                            "played"
                          )
                        }
                      >
                        <Play size={15} />
                        Mark Played
                      </button>
                    )}

                  </div>

                </div>
              ))}
             
            </div>
         
          )}
          
          </div>
          )}

        </section>
       <NewsManager />

       <ScheduleManager />

       <ShoutoutManager />

      </main>
    </div>
  );
}

export default AdminDashboard;