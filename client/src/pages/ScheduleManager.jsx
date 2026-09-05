import { useEffect, useState } from "react";
import api from "../api";
import {
  CalendarDays,
  Clock3,
  Trash2,
  RefreshCw,
  Radio,
} from "lucide-react";

function ScheduleManager() {
  const [schedules, setSchedules] = useState([]);

  const [form, setForm] = useState({
    programName: "",
    hostName: "",
    day: "Monday",
    startTime: "",
    endTime: "",
    description: "",
  });

  const [message, setMessage] = useState("");

  // ==========================================
  // FETCH SCHEDULES
  // ==========================================

  const fetchSchedules = async () => {
    try {
      const response = await api.get(
        "/schedule"
      );

      setSchedules(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch schedules:",
        error
      );
    }
  };

useEffect(() => {
  let cancelled = false;

  const loadSchedules = async () => {
    try {
      const response = await api.get("/schedule");

      if (!cancelled) {
        setSchedules(response.data);
      }
    } catch (error) {
      if (!cancelled) {
        console.error(
          "Failed to fetch schedules:",
          error
        );
      }
    }
  };

  loadSchedules();

  return () => {
    cancelled = true;
  };
}, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // ADD SCHEDULE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/schedule",
        form
      );

      setMessage(response.data.message);

      setForm({
        programName: "",
        hostName: "",
        day: "Monday",
        startTime: "",
        endTime: "",
        description: "",
      });

      fetchSchedules();
    } catch (error) {
      console.error(
        "Add schedule error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to add schedule"
      );
    }
  };

  // ==========================================
  // DELETE SCHEDULE
  // ==========================================

  const deleteSchedule = async (id) => {
    try {
      await api.delete(
        `/schedule/${id}`
      );

      fetchSchedules();
    } catch (error) {
      console.error(
        "Delete schedule error:",
        error
      );
    }
  };

  return (
    <div className="schedule-manager">

      {/* HEADER */}

      <div className="schedule-manager-header">

        <div>
          <span className="section-label">
            RADIO PROGRAMMING
          </span>

          <h2>Radio Schedule</h2>

          <p>
            Manage Campus FM programs and timings.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchSchedules}
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* ADD SCHEDULE */}

      <div className="schedule-form-card">

        <div className="schedule-form-title">

          <CalendarDays size={20} />

          <div>
            <h3>Add Radio Program</h3>

            <p>
              Create a new program for Campus FM.
            </p>
          </div>

        </div>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="programName"
            placeholder="Program name"
            value={form.programName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="hostName"
            placeholder="Host name"
            value={form.hostName}
            onChange={handleChange}
            required
          />

          <select
            name="day"
            value={form.day}
            onChange={handleChange}
          >
            <option value="Monday">
              Monday
            </option>

            <option value="Tuesday">
              Tuesday
            </option>

            <option value="Wednesday">
              Wednesday
            </option>

            <option value="Thursday">
              Thursday
            </option>

            <option value="Friday">
              Friday
            </option>

            <option value="Saturday">
              Saturday
            </option>

            <option value="Sunday">
              Sunday
            </option>
          </select>

          <div className="time-inputs">

            <div>
              <label>Start Time</label>

              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>End Time</label>

              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <textarea
            name="description"
            placeholder="Program description"
            value={form.description}
            onChange={handleChange}
          />

          <button type="submit">
            <CalendarDays size={16} />
            Add Schedule
          </button>

          {message && (
            <p className="schedule-message">
              {message}
            </p>
          )}

        </form>

      </div>

      {/* EXISTING SCHEDULE */}

      <div className="schedule-list-section">

        <div className="published-news-title">
          <h3>Current Schedule</h3>
        </div>

        {schedules.length === 0 ? (

          <div className="empty-state">

            <CalendarDays size={35} />

            <h3>
              No programs scheduled
            </h3>

            <p>
              Add your first Campus FM program.
            </p>

          </div>

        ) : (

          <div className="schedule-list">

            {schedules.map((item) => (

              <div
                className="schedule-admin-card"
                key={item._id}
              >

                <div className="schedule-icon">
                  <Radio size={20} />
                </div>

                <div className="schedule-info">

                  <span className="schedule-day">
                    {item.day}
                  </span>

                  <h3>
                    {item.programName}
                  </h3>

                  <p>
                    Hosted by{" "}
                    <strong>
                      {item.hostName}
                    </strong>
                  </p>

                  {item.description && (
                    <small>
                      {item.description}
                    </small>
                  )}

                </div>

                <div className="schedule-time">

                  <Clock3 size={15} />

                  <span>
                    {item.startTime}
                  </span>

                  <span>—</span>

                  <span>
                    {item.endTime}
                  </span>

                </div>

                <button
                  className="delete-schedule-btn"
                  onClick={() =>
                    deleteSchedule(item._id)
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

export default ScheduleManager;