import { FiAlertTriangle } from "react-icons/fi";
import { theme } from "../theme";
import { s } from "../styles";

// Reusable Yes/No confirmation modal — replaces the native browser confirm() popup
// so every "delete" action in the app has a consistent, styled confirmation dialog.
export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(31,41,55,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div style={{ ...s.card, width: 380, maxWidth: "100%", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: theme.redBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <FiAlertTriangle size={24} color={theme.red} />
        </div>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: theme.text, marginBottom: 22, lineHeight: 1.4 }}>
          {message}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={{ ...s.btnOutline, minWidth: 100 }} onClick={onCancel}>No</button>
          <button
            style={{ ...s.btnDanger, background: theme.red, color: "#fff", border: "none", minWidth: 100 }}
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
