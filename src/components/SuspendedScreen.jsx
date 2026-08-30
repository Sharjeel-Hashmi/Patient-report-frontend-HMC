import { FiLock } from "react-icons/fi";
import { theme } from "../theme";
import { s } from "../styles";

export default function SuspendedScreen({ message }) {
  return (
    <div style={s.container}>
      <div
        style={{
          ...s.card,
          textAlign: "center",
          padding: "48px 24px",
          maxWidth: 520,
          margin: "40px auto",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: theme.redBg,
            color: theme.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            margin: "0 auto 18px",
          }}
        >
          <FiLock />
        </div>
        <div style={{ ...s.h2, marginBottom: 10 }}>Access Suspended</div>
        <div style={{ color: theme.textMuted, fontSize: 14, lineHeight: 1.6 }}>
          {message || "Access to this system has been suspended due to a pending payment. Please contact WebPalm to restore access."}
        </div>
      </div>
    </div>
  );
}