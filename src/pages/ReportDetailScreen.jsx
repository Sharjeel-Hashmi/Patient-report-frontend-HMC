import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCopy, FiPrinter, FiEdit2, FiCheck } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import { api } from "../api/api";
import { RANGES, getStatus, theme } from "../theme";
import { s } from "../styles";
import { buildSingleReportCopyText } from "../utils/copyFormat";

export default function ReportDetailScreen() {
  const { id, reportId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getPatient(id);
        setPatient(data);
        const r = data.reports.find((x) => x._id === reportId);
        setReport(r);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [id, reportId]);

  const handleCopy = () => {
    if (!report) return;
    const text = buildSingleReportCopyText(report);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) return <div style={s.page}><Header title="Report" showBack /><div style={s.container}><div style={s.error}>{error}</div></div></div>;
  if (!patient || !report) return <div style={s.page}><Header title="Report" showBack /><div style={s.container}><div style={s.muted}>Loading...</div></div></div>;

  return (
    <div style={s.page}>
      <Header title={patient.name} showBack />
      <div style={s.container} className="print-area">
        <div style={{ ...s.card, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={s.h1}>Report — {new Date(report.date).toLocaleDateString()}</div>
              <div style={s.muted}>{report.labName || "Lab not specified"}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }} className="no-print">
              <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={handleCopy}>
                {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Values</>}
              </button>
              <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => window.print()}>
                <FiPrinter /> Print
              </button>
              <button style={{ ...s.btnPrimary, display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate(`/patients/${id}/reports/${reportId}/edit`)}>
                <FiEdit2 /> Edit
              </button>
            </div>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.h2}>Test Parameters</div>
          <div style={{ display: "grid", gap: 10 }}>
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
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: theme.text }}>{range.label}</div>
                    <div style={{ fontSize: 12, color: theme.textMuted }}>Normal: {range.min}–{range.max} {range.unit}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>
                      {value !== undefined && value !== null && value !== "" ? value : "—"}
                    </div>
                    <StatusBadge status={status} />
                  </div>
                </div>
              );
            })}
          </div>

          {report.notes && (
            <div style={{ marginTop: 20 }}>
              <div style={s.h2}>Notes / Symptoms</div>
              <div style={{ ...s.card, background: theme.bg, boxShadow: "none" }}>{report.notes}</div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
