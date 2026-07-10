import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { theme } from "../theme";
import { s } from "../styles";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.headerGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ ...s.card, width: 380, maxWidth: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: theme.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: theme.primary,
              margin: "0 auto 12px",
              fontSize: 18,
            }}
          >
            HMC
          </div>
          <div style={s.h1}>Thyroid Tracker</div>
          <div style={s.muted}>Sign in to manage patients &amp; reports</div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={s.input}
              placeholder="doctor@harbourmedical.com"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={s.input}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} style={{ ...s.btnPrimary, width: "100%", padding: 12 }}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13.5, color: theme.textMuted }}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={{ color: theme.primary, fontWeight: 600, textDecoration: "none" }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
