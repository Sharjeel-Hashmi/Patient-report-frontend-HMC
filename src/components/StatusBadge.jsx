import { statusColor } from "../theme";

export default function StatusBadge({ status }) {
  if (!status) return <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>;
  const c = statusColor(status);
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 700,
        color: c.color,
        background: c.bg,
      }}
    >
      {status}
    </span>
  );
}
