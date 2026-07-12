import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiZap, FiRepeat, FiArrowRight, FiGitCommit, FiArrowLeft } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../api/api";
import { theme } from "../theme";
import { s } from "../styles";

export default function PatientScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPatient(id);
      setPatient(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeletePatient = async () => {
    if (!window.confirm(`Delete patient "${patient.name}"? This cannot be undone.`)) return;
    try {
      await api.deletePatient(id);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      const updated = await api.deleteReport(id, reportId);
      setPatient(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={s.page}><Header title="Patient" showBack /><div style={s.container}><div style={s.muted}>Loading...</div></div></div>;
  if (error || !patient) return <div style={s.page}><Header title="Patient" showBack /><div style={s.container}><div style={s.error}>{error || "Patient not found"}</div></div></div>;

  const sortedReports = [...patient.reports].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestTwo = sortedReports.slice(0, 2);

  return (
    <div style={s.page}>
      <Header title={patient.name} showBack onBack={() => navigate("/")} />
      <div style={s.container}>
        <div style={{ ...s.card, marginBottom: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={s.h1}>{patient.name}</div>
            <div style={s.muted}>
              {patient.dob ? `DOB: ${new Date(patient.dob).toLocaleDateString()}` : "DOB not set"} · {patient.gender}
              {patient.phone ? ` · ${patient.phone}` : ""}
            </div>
            {patient.address && <div style={{ ...s.muted, marginTop: 4 }}>{patient.address}</div>}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate("/")}><FiArrowLeft size={14} />Back</button>
            <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowEdit(true)}><FiEdit2 size={14} />Edit</button>
            <button style={{ ...s.btnDanger, display: "flex", alignItems: "center", gap: 6 }} onClick={handleDeletePatient}><FiTrash2 size={14} />Delete</button>
          </div>
        </div>

        {latestTwo.length === 2 && (
          <div
            onClick={() => navigate(`/patients/${id}/compare?a=${latestTwo[1]._id}&b=${latestTwo[0]._id}`)}
            style={{
              background: `linear-gradient(90deg, ${theme.purple}, #a78bfa)`,
              color: "#fff",
              borderRadius: theme.radius,
              padding: "16px 22px",
              marginBottom: 20,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: theme.shadowMd,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                <FiZap /> Compare Latest 2 Reports
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.9 }}>
                {new Date(latestTwo[1].date).toLocaleDateString()} vs {new Date(latestTwo[0].date).toLocaleDateString()}
              </div>
            </div>
            <FiArrowRight size={22} />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={s.h2}>Test Reports ({sortedReports.length})</div>
          <button style={{ ...s.btnPrimary, display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate(`/patients/${id}/reports/new`)}><FiPlus size={15} />Add Report</button>
        </div>

        {sortedReports.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", color: theme.textMuted }}>No reports yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {sortedReports.map((r) => (
              <div key={r._id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div style={{ cursor: "pointer", flex: 1 }} onClick={() => navigate(`/patients/${id}/reports/${r._id}`)}>
                  <div style={{ fontWeight: 700, color: theme.text }}>{new Date(r.date).toLocaleDateString()}</div>
                  <div style={s.muted}>{r.labName || "No lab specified"}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 5 }} onClick={() => navigate(`/patients/${id}/reports/${r._id}`)}><FiEye size={13} />View</button>
                  <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 5 }} onClick={() => navigate(`/patients/${id}/reports/${r._id}/edit`)}><FiEdit2 size={13} />Edit</button>
                  <button style={{ ...s.btnDanger, display: "flex", alignItems: "center", gap: 5 }} onClick={() => handleDeleteReport(r._id)}><FiTrash2 size={13} />Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedReports.length >= 2 && (
          <div style={{ marginTop: 20 }}>
            <button style={{ ...s.btnPurple, display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate(`/patients/${id}/compare`)}>
              <FiGitCommit size={15} /> Compare Any Two Reports
            </button>
          </div>
        )}
      </div>
      <Footer />
      {showEdit && <EditPatientModal patient={patient} onClose={() => setShowEdit(false)} onSaved={load} />}
    </div>
  );
}

function EditPatientModal({ patient, onClose, onSaved }) {
  const [name, setName] = useState(patient.name);
  const [dob, setDob] = useState(patient.dob ? patient.dob.slice(0, 10) : "");
  const [gender, setGender] = useState(patient.gender);
  const [phone, setPhone] = useState(patient.phone || "");
  const [address, setAddress] = useState(patient.address || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.updatePatient(patient._id, { name, dob, gender, phone, address });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(31,41,55,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }} onClick={onClose}>
      <div style={{ ...s.card, width: 440, maxWidth: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div style={s.h2}>Edit Patient</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Full Name *</label>
            <input required style={s.input} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={s.label}>Date of Birth</label>
              <input type="date" style={s.input} value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Gender</label>
              <select style={s.input} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Phone</label>
            <input style={s.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={s.label}>Address</label>
            <input style={s.input} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={s.btnOutline}>Cancel</button>
            <button type="submit" disabled={saving} style={s.btnPrimary}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
