import { useState } from "react";
import api from "../api";
import {
  LockKeyhole,
  Radio,
} from "lucide-react";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem(
        "campusfm_token",
        response.data.token
      );

      localStorage.setItem(
        "campusfm_user",
        JSON.stringify(response.data.user)
      );

      onLogin(response.data.user);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-login-logo">
          <Radio size={25} />
        </div>

        <span className="section-label">
          CAMPUS FM
        </span>

        <h1>Admin Login</h1>

        <p className="admin-login-subtitle">
          Sign in to manage Campus FM.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="login-field">
            <label>Email</label>

            <input
              type="email"
              placeholder="admin@campusfm.local"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            <LockKeyhole size={16} />

            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

        </form>

      </div>

    </div>
  );
}

export default AdminLogin;