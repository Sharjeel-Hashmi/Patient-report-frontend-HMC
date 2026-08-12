import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiArrowLeft, FiPrinter, FiCheckCircle, FiXCircle, FiCopy, FiCheck } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ConfirmModal from "../components/ConfirmModal";
import BloodTestPreview from "../components/BloodTestPreview";
import { api } from "../api/api";
import { theme } from "../theme";
import { s } from "../styles";
import { buildConsultationCopyText } from "../utils/copyFormat";

function Row({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div style={{ display: "flex", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ width: 220, flexShrink: 0, fontWeight: 600, color: theme.textMuted, fontSize: 13 }}>{label}</div>
      <div style={{ color: theme.text, fontSize: 13.5 }}>{value}</div>
    </div>
  );
}

export default function ConsultationDetailScreen() {
  const { id, consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [c, p] = await Promise.all([api.getConsultation(id, consultationId), api.getPatient(id)]);
        setConsultation(c);
        setPatient(p);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, consultationId]);

  const handleDelete = async () => {
    try {
      await api.deleteConsultation(id, consultationId);
      navigate(`/patients/${id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setConfirmDelete(false);
    }
  };

  const handleCopy = () => {
    if (!consultation || !patient) return;
    const text = buildConsultationCopyText(consultation, patient.name, linkedReportObjs);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div style={s.page}><Header title="Consultation" showBack /><div style={s.container}><div style={s.muted}>Loading...</div></div></div>;
  if (error || !consultation) return <div style={s.page}><Header title="Consultation" showBack /><div style={s.container}><div style={s.error}>{error || "Consultation not found"}</div></div></div>;

  const supplementLabels = [];
  if (consultation.supplements?.zinc) supplementLabels.push("Zn");
  if (consultation.supplements?.selenium) supplementLabels.push("Selenium");
  if (consultation.supplements?.vitD3K2) supplementLabels.push("Vit D3 / K2");
  if (consultation.supplements?.magnesium) supplementLabels.push("Magnesium");
  if (consultation.supplements?.custom) supplementLabels.push(consultation.supplements.custom);

  const currentlyTakingNames = (consultation.currentlyTakingMeds || []).map((m) => m.medicationName).filter(Boolean).join(", ");

  // Backward compat: older consultations only had a single `linkedReport`.
  const linkedReportIds =
    consultation.linkedReports && consultation.linkedReports.length
      ? consultation.linkedReports
      : consultation.linkedReport
      ? [consultation.linkedReport]
      : [];
  const linkedReportObjs = linkedReportIds
    .map((rid) => patient?.reports?.find((r) => r._id === rid))
    .filter(Boolean)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={s.page}>
      <Header title="Consultation Note" showBack onBack={() => navigate(`/patients/${id}`)} />
      <div style={s.container}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate(`/patients/${id}`)}>
            <FiArrowLeft size={14} />Back
          </button>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={handleCopy}>
              {copied ? <><FiCheck size={14} />Copied</> : <><FiCopy size={14} />Copy</>}
            </button>
            <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => window.print()}>
              <FiPrinter size={14} />Print
            </button>
            <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate(`/patients/${id}/consultations/${consultationId}/edit`)}>
              <FiEdit2 size={14} />Edit
            </button>
            <button style={{ ...s.btnDanger, display: "flex", alignItems: "center", gap: 6 }} onClick={() => setConfirmDelete(true)}>
              <FiTrash2 size={14} />Delete
            </button>
          </div>
        </div>

        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div>
              <div style={s.h1}>{patient?.name}</div>
              <div style={s.muted}>{consultation.visitTypeName} · {consultation.conditionName} · {new Date(consultation.date).toLocaleDateString()}</div>
            </div>
          </div>

          <div style={s.h2}>Consultation Details</div>
          <div style={{ marginBottom: 20 }}>
            <Row label="Pt c/o (Chief Complaint)" value={consultation.chiefComplaint} />
            <Row label="Currently Taking" value={currentlyTakingNames} />
            <Row label="Feeling" value={consultation.feeling} />
            <Row label="SSS Score" value={consultation.sssScore !== undefined && consultation.sssScore !== null ? `${consultation.sssScore} / 50` : ""} />
            <Row label="Thyroid US done?" value={consultation.thyroidUSDone} />
            <Row label="Findings" value={consultation.ultrasoundNotes} />
            <Row label="Refer for Thyroid US" value={consultation.referForThyroidUS} />
            <Row label="Allergy" value={consultation.allergy} />
            <Row label="Medicines (current)" value={consultation.currentMedicines} />
          </div>

          {linkedReportObjs.length > 0 && (
            <>
              <div style={s.h2}>
                {linkedReportObjs.length === 2 ? "Linked Blood Test Comparison" : "Linked Blood Test"} —{" "}
                {linkedReportObjs.map((r) => new Date(r.date).toLocaleDateString()).join(" vs ")}
              </div>
              <div style={{ marginBottom: 20 }}>
                <BloodTestPreview reports={linkedReportObjs} />
              </div>
            </>
          )}

          <div style={s.h2}>O/E</div>
          <div style={{ marginBottom: 20 }}>
            <Row label="BP" value={consultation.bp} />
            <Row label="Pulse" value={consultation.pulse} />
            <Row label="SaO2" value={consultation.spo2 !== undefined && consultation.spo2 !== null ? `${consultation.spo2}%` : ""} />
          </div>

          <div style={s.h2}>Plan</div>
          <div style={{ marginBottom: 12, whiteSpace: "pre-wrap", fontSize: 13.5, color: theme.text }}>{consultation.planNotes || "—"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: consultation.consentGiven ? theme.green : theme.textMuted }}>
            {consultation.consentGiven ? <FiCheckCircle /> : <FiXCircle />}
            Written consent for non-licensed medicines: {consultation.consentGiven ? "Given" : "Not recorded"}
          </div>

          <div style={s.h2}>Prescription</div>
          {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
            <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
              {consultation.prescriptions.map((p, i) => (
                <div key={i} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 13.5 }}>
                  <b>{p.medicationName}</b> {p.dosage && `— ${p.dosage}`} {p.instructions && <span style={{ color: theme.textMuted }}>({p.instructions})</span>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...s.muted, marginBottom: 20 }}>No prescription recorded.</div>
          )}

          <div style={s.h2}>Dietary & Supplements</div>
          <div style={{ marginBottom: 20 }}>
            <Row label="Dietary Restrictions" value={consultation.dietaryRestrictions} />
            <Row label="Nutritional Supplements" value={supplementLabels.join(", ")} />
            <Row label="Immune Modulation" value={consultation.immuneModulation} />
          </div>

          <div style={s.h2}>Follow-up</div>
          <Row label="R/V after" value={consultation.reviewAfter} />
        </div>
      </div>
      <Footer />
      {confirmDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this consultation? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}