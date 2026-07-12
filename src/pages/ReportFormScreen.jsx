import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSave, FiX, FiList, FiArrowLeft } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../api/api";
import { RANGES, getStatus, statusColor } from "../theme";
import { s } from "../styles";

export default function ReportFormScreen() {
  const { id, reportId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(reportId);

  const [labs, setLabs] = useState([]);
  const [labMode, setLabMode] = useState("select"); // "select" or "manual"
  const [labName, setLabName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState({ tsh: "", t4: "", t3: "", antiTpo: "", antiTg: "" });
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [labsData, patient] = await Promise.all([api.getLabs(), api.getPatient(id)]);
        setLabs(labsData);
        setLabMode(labsData.length >= 2 ? "select" : "manual");

        if (isEdit) {
          const report = patient.reports.find((r) => r._id === reportId);
          if (report) {
            setDate(report.date.slice(0, 10));
            setLabName(report.labName || "");
            setValues({
              tsh: report.tsh ?? "",
              t4: report.t4 ?? "",
              t3: report.t3 ?? "",
              antiTpo: report.antiTpo ?? "",
              antiTg: report.antiTg ?? "",
            });
            setNotes(report.notes || "");
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reportId, isEdit]);

  const handleAddNewLab = async () => {
    const name = window.prompt("Enter new lab name:");
    if (!name || !name.trim()) return;
    try {
      const lab = await api.createLab(name.trim());
      setLabs((prev) => [...prev, lab]);
      setLabName(lab.name);
      setLabMode("select");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { date, labName, notes, ...values };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") payload[k] = undefined;
      });

      if (isEdit) {
        await api.updateReport(id, reportId, payload);
      } else {
        await api.addReport(id, payload);
      }
      navigate(`/patients/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={s.page}><Header title="Report" showBack /><div style={s.container}><div style={s.muted}>Loading...</div></div></div>;

  return (
    <div style={s.page}>
      <Header title={isEdit ? "Edit Report" : "Add Report"} showBack onBack={() => navigate(`/patients/${id}`)} />
      <div style={s.container}>
        <div style={s.card}>
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => navigate(`/patients/${id}`)}
            >
              <FiArrowLeft size={14} />Back
            </button>
          </div>
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={s.label}>Report Date *</label>
                <input type="date" required style={s.input} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Lab Name</label>
                {labMode === "select" && labs.length >= 2 ? (
                  <select
                    style={s.input}
                    value={labName}
                    onChange={(e) => {
                      if (e.target.value === "__add_new__") {
                        handleAddNewLab();
                      } else {
                        setLabName(e.target.value);
                      }
                    }}
                  >
                    <option value="">Select lab...</option>
                    {labs.map((lab) => (
                      <option key={lab._id} value={lab.name}>{lab.name}</option>
                    ))}
                    <option value="__add_new__">+ Add new lab</option>
                  </select>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input style={s.input} placeholder="Lab name" value={labName} onChange={(e) => setLabName(e.target.value)} />
                    {labs.length >= 2 && (
                      <button type="button" style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => setLabMode("select")}>
                        <FiList /> List
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={s.h2}>Test Parameters</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {Object.entries(RANGES).map(([key, range]) => {
                const status = getStatus(key, values[key]);
                const c = statusColor(status);
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <label style={{ ...s.label, marginBottom: 0 }}>
                        {range.label} ({range.unit}) <span style={{ color: "#9ca3af" }}>· Normal {range.min}–{range.max}</span>
                      </label>
                      {status && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: c.color,
                            background: c.bg,
                            padding: "2px 9px",
                            borderRadius: 20,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {status}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      style={{
                        ...s.input,
                        borderColor: status ? c.color : undefined,
                        background: status ? c.bg : "#fff",
                      }}
                      value={values[key]}
                      onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                      placeholder="Enter value"
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>Notes / Symptoms</label>
              <textarea
                style={{ ...s.input, minHeight: 90, resize: "vertical", fontFamily: "inherit" }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Patient symptoms, doctor notes, etc."
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate(`/patients/${id}`)}>
                <FiX /> Cancel
              </button>
              <button type="submit" disabled={saving} style={{ ...s.btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
                {saving ? "Saving..." : <><FiSave /> Save Report</>}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
