import { useEffect, useState } from "react";
import api from "../api";
import {
  Mic2,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

function ShoutoutManager() {
  const [shoutouts, setShoutouts] =
    useState([]);

  const fetchShoutouts = async () => {
    try {
      const response = await api.get(
        "/shoutouts/admin"
      );

      setShoutouts(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch shoutouts:",
        error
      );
    }
  };

useEffect(() => {
  let cancelled = false;

  const loadShoutouts = async () => {
    try {
      const response = await api.get("/shoutouts/admin");

      if (!cancelled) {
        setShoutouts(response.data);
      }
    } catch (error) {
      if (!cancelled) {
        console.error(
          "Failed to fetch shoutouts:",
          error
        );
      }
    }
  };

  loadShoutouts();

  return () => {
    cancelled = true;
  };
}, []);

  const updateStatus = async (
    id,
    status
  ) => {
    try {
      await api.patch(
        `/shoutouts/${id}`,
        { status }
      );

      fetchShoutouts();
    } catch (error) {
      console.error(
        "Failed to update shoutout:",
        error
      );
    }
  };

  return (
    <div className="shoutout-manager">

      <div className="shoutout-manager-header">

        <div>
          <span className="section-label">
            COMMUNITY
          </span>

          <h2>Shoutouts</h2>

          <p>
            Review messages before they go live.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchShoutouts}
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>

      {shoutouts.length === 0 ? (

        <div className="empty-state">
          <Mic2 size={35} />

          <h3>
            No shoutouts yet
          </h3>

          <p>
            Student messages will appear here.
          </p>
        </div>

      ) : (

        <div className="shoutout-list">

          {shoutouts.map((item) => (

            <div
              className="shoutout-admin-card"
              key={item._id}
            >

              <div className="shoutout-icon">
                <Mic2 size={20} />
              </div>

              <div className="shoutout-admin-info">

                <h3>
                  {item.studentName}
                </h3>

                <p>
                  "{item.message}"
                </p>

                <span
                  className={`status ${item.status}`}
                >
                  {item.status}
                </span>

              </div>

              {item.status === "pending" && (

                <div className="shoutout-actions">

                  <button
                    className="approve-btn"
                    onClick={() =>
                      updateStatus(
                        item._id,
                        "approved"
                      )
                    }
                  >
                    <Check size={15} />
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() =>
                      updateStatus(
                        item._id,
                        "rejected"
                      )
                    }
                  >
                    <X size={15} />
                    Reject
                  </button>

                </div>

              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default ShoutoutManager;