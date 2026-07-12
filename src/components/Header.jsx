import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FiArrowLeft, FiSettings, FiLogOut } from "react-icons/fi";
import { theme } from "../theme";
import { useAuth } from "../AuthContext";
import logo from "../assets/logo2.png";

export default function Header({ title, showBack, onBack, right }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { id } = useParams();
  const location = useLocation();

  const defaultBack = () => {
    if (id) {
      // Reports (new/edit/view), Compare -> wapas patient page pe
      navigate(`/patients/${id}`);
    } else if (location.pathname.startsWith("/patients")) {
      navigate("/patients");
    } else {
      navigate(-1);
    }
  };

  const handleBack = onBack || defaultBack;

  return (
    <div
      style={{
        background: theme.headerGradient,
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: theme.shadow,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {showBack && (
          <button
            onClick={handleBack}
            style={{
              background: "rgba(255,255,255,0.25)",
              border: "none",
              color: "#fff",
              borderRadius: 10,
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Back"
          >
            <FiArrowLeft />
          </button>
        )}
        <div
          style={{
            width: 200,
            height: 60,
            borderRadius: 10,
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <img
            src={logo}
            alt="HMC Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
          />
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, lineHeight: 1.1 }}>
            {title || "HMC Thyroid Tracker"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>Harbour Medical Clinic</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {right}
        {user && (
          <>
            <button
              onClick={() => navigate("/settings")}
              title="Settings"
              style={{
                background: "rgba(255,255,255,0.25)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                width: 36,
                height: 36,
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiSettings />
            </button>
            <span style={{ color: "#fff", fontSize: 13, opacity: 0.9 }}>{user.name}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{
                background: "rgba(255,255,255,0.9)",
                color: theme.primary,
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FiLogOut /> Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
