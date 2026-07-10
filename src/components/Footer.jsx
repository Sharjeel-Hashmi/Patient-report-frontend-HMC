import { theme } from "../theme";

export default function Footer() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "18px 12px",
        color: theme.textMuted,
        fontSize: 12.5,
        borderTop: `1px solid ${theme.border}`,
        marginTop: 30,
      }}
    >
      © 2026 All Rights Reserved | Design by{" "}
      <a
        href="https://webpalm.ie"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: theme.primary, textDecoration: "none", fontWeight: 600 }}
      >
        WebPalm
      </a>
    </div>
  );
}
