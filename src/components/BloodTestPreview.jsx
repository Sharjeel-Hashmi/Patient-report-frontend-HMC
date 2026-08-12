import { RANGES, getStatus, theme } from "../theme";
import StatusBadge from "./StatusBadge";

// Renders values for 1 report (single view) or 2 reports (side-by-side comparison).
// `reports` should be ordered [older, newer] when length is 2.
export default function BloodTestPreview({ reports }) {
  if (!reports || reports.length === 0) return null;

  const isCompare = reports.length === 2;

  if (!isCompare) {
    const report = reports[0];
    return (
      <div style={{ display: "grid", gap: 8 }}>
        {Object.entries(RANGES).map(([key, range]) => {
          const value = report[key];
          const status = getStatus(key, value);
          return (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={{ fontWeight: 700, color: theme.text, fontSize: 13.5 }}>{range.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>
                  {value !== undefined && value !== null && value !== "" ? value : "—"}
                </div>
                <StatusBadge status={status} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const [prevReport, currReport] = reports;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: `2px solid ${theme.border}` }}>
            <th style={{ padding: "8px 6px" }}>Parameter</th>
            <th style={{ padding: "8px 6px" }}>{new Date(prevReport.date).toLocaleDateString()}</th>
            <th style={{ padding: "8px 6px" }}>{new Date(currReport.date).toLocaleDateString()}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(RANGES).map(([key, range]) => {
            const prevVal = prevReport[key];
            const currVal = currReport[key];
            return (
              <tr key={key} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: "8px 6px", fontWeight: 600 }}>{range.label}</td>
                <td style={{ padding: "8px 6px" }}>{prevVal ?? "—"}</td>
                <td style={{ padding: "8px 6px" }}>{currVal ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}