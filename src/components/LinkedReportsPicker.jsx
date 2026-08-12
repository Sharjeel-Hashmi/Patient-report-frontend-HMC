import { useState, useEffect } from "react";
import { theme } from "../theme";
import { s } from "../styles";
import BloodTestPreview from "./BloodTestPreview";

// Auto-defaults to the latest 2 reports (or the latest 1, or none) so the
// comparison shows up without any action from the doctor. A "Change selection"
// toggle lets them manually pick a single report or a specific pair to compare.
//
// value: array of report ids (0-2). onChange(newIds) fires whenever selection changes.
// reports: patient's full reports array (any order).
export default function LinkedReportsPicker({ reports, value, onChange }) {
  const sortedDesc = [...reports].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestTwoIds = sortedDesc.slice(0, 2).map((r) => r._id).reverse(); // [older, newer]
  const latestOneId = sortedDesc.length ? [sortedDesc[0]._id] : [];
  const autoDefault = latestTwoIds.length === 2 ? latestTwoIds : latestOneId;

  const [manualOpen, setManualOpen] = useState(false);
  const [pickMode, setPickMode] = useState(value && value.length === 1 ? "single" : "compare");

  // If nothing is selected yet, default to the latest 2 (or latest 1) automatically.
  useEffect(() => {
    if ((!value || value.length === 0) && autoDefault.length > 0) {
      onChange(autoDefault);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports.length]);

  const selectedReports = (value || [])
    .map((id) => reports.find((r) => r._id === id))
    .filter(Boolean)
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological: older first

  const isAutoLatest =
    value &&
    value.length > 0 &&
    JSON.stringify([...value].sort()) === JSON.stringify([...autoDefault].sort());

  const handleSingleSelect = (id) => onChange(id ? [id] : []);

  const handleCompareSelect = (which, id) => {
    const next = [selectedReports[0]?._id || "", selectedReports[1]?._id || ""];
    if (which === "prev") next[0] = id;
    else next[1] = id;
    onChange(next.filter(Boolean));
  };

  if (reports.length === 0) {
    return <div style={s.muted}>No blood test reports yet for this patient.</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 12.5, color: theme.textMuted }}>
          {manualOpen
            ? "Choose which report(s) to show below."
            : isAutoLatest
            ? selectedReports.length === 2
              ? "Showing latest 2 reports (auto comparison)."
              : "Showing latest report (auto)."
            : "Showing manually selected report(s)."}
        </div>
        <button
          type="button"
          style={{ ...s.btnOutline, fontSize: 12.5, padding: "5px 10px" }}
          onClick={() => setManualOpen((v) => !v)}
        >
          {manualOpen ? "Done" : "Change selection"}
        </button>
      </div>

      {manualOpen && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <input
                type="radio"
                checked={pickMode === "single"}
                onChange={() => {
                  setPickMode("single");
                  onChange(selectedReports[selectedReports.length - 1] ? [selectedReports[selectedReports.length - 1]._id] : latestOneId);
                }}
              />
              Single report
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <input
                type="radio"
                checked={pickMode === "compare"}
                onChange={() => {
                  setPickMode("compare");
                  onChange(latestTwoIds.length === 2 ? latestTwoIds : selectedReports.map((r) => r._id));
                }}
              />
              Compare two reports
            </label>
          </div>

          {pickMode === "single" ? (
            <select style={s.input} value={selectedReports[0]?._id || ""} onChange={(e) => handleSingleSelect(e.target.value)}>
              <option value="">Select report...</option>
              {sortedDesc.map((r) => (
                <option key={r._id} value={r._id}>
                  {new Date(r.date).toLocaleDateString()} — {r.labName || "No lab"}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ ...s.label, fontSize: 11.5 }}>Older</label>
                <select style={s.input} value={selectedReports[0]?._id || ""} onChange={(e) => handleCompareSelect("prev", e.target.value)}>
                  <option value="">Select report...</option>
                  {sortedDesc.map((r) => (
                    <option key={r._id} value={r._id}>
                      {new Date(r.date).toLocaleDateString()} — {r.labName || "No lab"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ ...s.label, fontSize: 11.5 }}>Newer</label>
                <select style={s.input} value={selectedReports[1]?._id || ""} onChange={(e) => handleCompareSelect("curr", e.target.value)}>
                  <option value="">Select report...</option>
                  {sortedDesc.map((r) => (
                    <option key={r._id} value={r._id}>
                      {new Date(r.date).toLocaleDateString()} — {r.labName || "No lab"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedReports.length > 0 ? <BloodTestPreview reports={selectedReports} /> : <div style={s.muted}>No report selected.</div>}
    </div>
  );
}