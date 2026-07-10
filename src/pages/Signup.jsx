import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { theme } from "../theme";
import { s } from "../styles";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
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
          <div style={s.h1}>Create Admin Account</div>
          <div style={s.muted}>HMC Thyroid Tracker</div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Full Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} style={s.input} placeholder="Dr. John Smith" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} placeholder="doctor@harbourmedical.com" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={s.input} placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={loading} style={{ ...s.btnPrimary, width: "100%", padding: 12 }}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13.5, color: theme.textMuted }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: theme.primary, fontWeight: 600, textDecoration: "none" }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
