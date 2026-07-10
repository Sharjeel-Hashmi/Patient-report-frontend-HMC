import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FiCopy, FiPrinter, FiCheck } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RangeStrip from "../components/RangeStrip";
import StatusBadge from "../components/StatusBadge";
import { api } from "../api/api";
import { RANGES, getStatus, theme } from "../theme";
import { s } from "../styles";
import { buildCompareCopyText } from "../utils/copyFormat";

export default function CompareScreen() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const reportAId = searchParams.get("a");
  const reportBId = searchParams.get("b");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getPatient(id);
        setPatient(data);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [id]);

  if (error) return <div style={s.page}><Header title="Compare" showBack /><div style={s.container}><div style={s.error}>{error}</div></div></div>;
  if (!patient) return <div style={s.page}><Header title="Compare" showBack /><div style={s.container}><div style={s.muted}>Loading...</div></div></div>;

  const sortedReports = [...patient.reports].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sortedReports.length < 2) {
    return (
      <div style={s.page}>
        <Header title="Compare Reports" showBack />
        <div style={s.container}>
          <div style={{ ...s.card, textAlign: "center", color: theme.textMuted }}>
            At least 2 reports are needed to compare.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const prevReport = sortedReports.find((r) => r._id === reportAId) || sortedReports[sortedReports.length - 2];
  const currReport = sortedReports.find((r) => r._id === reportBId) || sortedReports[sortedReports.length - 1];

  const handleSelect = (which, reportId) => {
    const params = new URLSearchParams(searchParams);
    params.set(which, reportId);
    setSearchParams(params);
  };

  const handleCopy = () => {
    const text = buildCompareCopyText(prevReport, currReport);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const computeChange = (key) => {
    const prevVal = prevReport[key];
    const currVal = currReport[key];
    if (prevVal === undefined || prevVal === null || currVal === undefined || currVal === null || Number(prevVal) === 0) return null;
    const change = ((Number(currVal) - Number(prevVal)) / Number(prevVal)) * 100;
    return change;
  };

  return (
    <div style={s.page}>
      <Header title={`Compare — ${patient.name}`} showBack />
      <div style={s.container}>
        <div style={{ ...s.card, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="no-print">
            <div>
              <label style={s.label}>Previous Report (P)</label>
              <select style={s.input} value={prevReport._id} onChange={(e) => handleSelect("a", e.target.value)}>
                {sortedReports.map((r) => (
                  <option key={r._id} value={r._id}>{new Date(r.date).toLocaleDateString('en-IE')} — {r.labName || "No lab"}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={s.label}>Recent Report (R)</label>
              <select style={s.input} value={currReport._id} onChange={(e) => handleSelect("b", e.target.value)}>
                {sortedReports.map((r) => (
                  <option key={r._id} value={r._id}>{new Date(r.date).toLocaleDateString('en-IE')} — {r.labName || "No lab"}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }} className="no-print">
            <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => window.print()}>
              <FiPrinter /> Print
            </button>
          </div>
        </div>

        {/* Summary cards showing % change */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
          {Object.entries(RANGES).map(([key, range]) => {
            const change = computeChange(key);
            const currStatus = getStatus(key, currReport[key]);
            return (
              <div key={key} style={{ ...s.card, padding: 14 }}>
                <div style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600 }}>{range.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, margin: "4px 0" }}>
                  {currReport[key] ?? "—"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <StatusBadge status={currStatus} />
                  {change !== null && (
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: change > 0 ? theme.red : change < 0 ? theme.blue : theme.textMuted }}>
                      {change > 0 ? "▲" : change < 0 ? "▼" : "–"} {Math.abs(change).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Range strips */}
        <div style={{ ...s.card, marginBottom: 20 }}>
          <div style={s.h2}>Visual Range Comparison</div>
          {Object.keys(RANGES).map((key) => (
            <RangeStrip key={key} paramKey={key} previousValue={prevReport[key]} currentValue={currReport[key]} />
          ))}
        </div>

        {/* Summary Table */}
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ ...s.h2, margin: 0 }}>Summary Table</div>
            <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={handleCopy} className="no-print">
              {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Comparison</>}
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: `2px solid ${theme.border}` }}>
                  <th style={{ padding: "10px 8px" }}>Parameter</th>
                  <th style={{ padding: "10px 8px" }}>Previous ({new Date(prevReport.date).toLocaleDateString('en-IE')})</th>
                  <th style={{ padding: "10px 8px" }}>Recent ({new Date(currReport.date).toLocaleDateString('en-IE')})</th>
                  <th style={{ padding: "10px 8px" }}>Change</th>
                  {/* Status columns available below — commented out per current design, uncomment to re-enable
                  <th style={{ padding: "10px 8px" }}>Prev Status</th>
                  <th style={{ padding: "10px 8px" }}>Recent Status</th>
                  */}
                </tr>
              </thead>
              <tbody>
                {Object.entries(RANGES).map(([key, range]) => {
                  const change = computeChange(key);
                  return (
                    <tr key={key} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600 }}>{range.label}</td>
                      <td style={{ padding: "10px 8px" }}>{prevReport[key] ?? "—"}</td>
                      <td style={{ padding: "10px 8px" }}>{currReport[key] ?? "—"}</td>
                      <td style={{ padding: "10px 8px", color: change > 0 ? theme.red : change < 0 ? theme.blue : theme.textMuted, fontWeight: 600 }}>
                        {change !== null ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%` : "—"}
                      </td>
                      {/*
                      <td style={{ padding: "10px 8px" }}><StatusBadge status={getStatus(key, prevReport[key])} /></td>
                      <td style={{ padding: "10px 8px" }}><StatusBadge status={getStatus(key, currReport[key])} /></td>
                      */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {(prevReport.notes || currReport.notes) && (
          <div style={{ ...s.card, marginTop: 20 }}>
            <div style={s.h2}>Notes / Symptoms</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 6 }}>PREVIOUS</div>
                <div style={{ ...s.card, background: theme.bg, boxShadow: "none" }}>{prevReport.notes || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginBottom: 6 }}>RECENT</div>
                <div style={{ ...s.card, background: theme.bg, boxShadow: "none" }}>{currReport.notes || "—"}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
