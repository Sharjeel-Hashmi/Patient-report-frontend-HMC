import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSave, FiX, FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../api/api";
import { theme } from "../theme";
import { s } from "../styles";

const emptyPrescriptionRow = { medication: "", dosage: "", instructions: "" };

export default function ConsultationFormScreen() {
  const { id, consultationId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(consultationId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [visitTypes, setVisitTypes] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [reports, setReports] = useState([]);
  const [patientGender, setPatientGender] = useState("");

  const [visitType, setVisitType] = useState("");
  const [condition, setCondition] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [currentlyTaking, setCurrentlyTaking] = useState("");
  const [feeling, setFeeling] = useState("");
  const [sssScore, setSssScore] = useState("");
  const [linkedReport, setLinkedReport] = useState("");
  const [ultrasoundNotes, setUltrasoundNotes] = useState("");
  const [allergy, setAllergy] = useState("");
  const [currentMedicines, setCurrentMedicines] = useState("");
  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [spo2, setSpo2] = useState("");
  const [planNotes, setPlanNotes] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [prescriptions, setPrescriptions] = useState([{ ...emptyPrescriptionRow }]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState("Gluten and Dairy free diet");
  const [zinc, setZinc] = useState(false);
  const [selenium, setSelenium] = useState(false);
  const [vitD3K2, setVitD3K2] = useState(false);
  const [customSupplement, setCustomSupplement] = useState("");
  const [immuneModulation, setImmuneModulation] = useState("");
  const [reviewAfter, setReviewAfter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [vt, cond, meds, patient] = await Promise.all([
          api.getVisitTypes(),
          api.getConditions(),
          api.getMedications(),
          api.getPatient(id),
        ]);
        setVisitTypes(vt);
        setConditions(cond);
        setMedications(meds);
        setReports([...patient.reports].sort((a, b) => new Date(b.date) - new Date(a.date)));
        setPatientGender(patient.gender || "");

        if (isEdit) {
          const c = await api.getConsultation(id, consultationId);
          setVisitType(c.visitType || "");
          setCondition(c.condition || "");
          setDate(c.date ? c.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
          setChiefComplaint(c.chiefComplaint || "");
          setCurrentlyTaking(c.currentlyTaking || "");
          setFeeling(c.feeling || "");
          setSssScore(c.sssScore ?? "");
          setLinkedReport(c.linkedReport || "");
          setUltrasoundNotes(c.ultrasoundNotes || "");
          setAllergy(c.allergy || "");
          setCurrentMedicines(c.currentMedicines || "");
          setBp(c.bp || "");
          setPulse(c.pulse ?? "");
          setSpo2(c.spo2 ?? "");
          setPlanNotes(c.planNotes || "");
          setConsentGiven(Boolean(c.consentGiven));
          setPrescriptions(
            c.prescriptions && c.prescriptions.length
              ? c.prescriptions.map((p) => ({ medication: p.medication || "", dosage: p.dosage || "", instructions: p.instructions || "" }))
              : [{ ...emptyPrescriptionRow }]
          );
          setDietaryRestrictions(c.dietaryRestrictions || "Gluten and Dairy free diet");
          setZinc(Boolean(c.supplements?.zinc));
          setSelenium(Boolean(c.supplements?.selenium));
          setVitD3K2(Boolean(c.supplements?.vitD3K2));
          setCustomSupplement(c.supplements?.custom || "");
          setImmuneModulation(c.immuneModulation || "");
          setReviewAfter(c.reviewAfter || "");
        } else if (vt.length) {
          setVisitType(vt[0]._id);
        }
        if (!isEdit && cond.length) setCondition((prev) => prev || cond[0]._id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, consultationId, isEdit]);

  const selectedVisitTypeName = (visitTypes.find((v) => v._id === visitType)?.name || "").toLowerCase();
  const selectedConditionName = (conditions.find((c) => c._id === condition)?.name || "").toLowerCase();
  const isNewPatientVisit = selectedVisitTypeName.includes("new patient");
  const isHashimotos = selectedConditionName.includes("hashimoto");
  const pronoun = patientGender === "Male" ? "He" : patientGender === "Female" ? "She" : "He/She";

  const updatePrescriptionRow = (index, field, value) => {
    setPrescriptions((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addPrescriptionRow = () => setPrescriptions((prev) => [...prev, { ...emptyPrescriptionRow }]);
  const removePrescriptionRow = (index) => setPrescriptions((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        visitType,
        condition,
        date,
        chiefComplaint,
        currentlyTaking,
        feeling,
        sssScore: sssScore === "" ? undefined : Number(sssScore),
        linkedReport: linkedReport || null,
        ultrasoundNotes,
        allergy,
        currentMedicines,
        bp,
        pulse: pulse === "" ? undefined : Number(pulse),
        spo2: spo2 === "" ? undefined : Number(spo2),
        planNotes,
        consentGiven,
        prescriptions: prescriptions.filter((p) => p.medication),
        dietaryRestrictions,
        supplements: { zinc, selenium, vitD3K2, custom: customSupplement },
        immuneModulation,
        reviewAfter,
      };

      if (isEdit) {
        await api.updateConsultation(id, consultationId, payload);
      } else {
        await api.addConsultation(id, payload);
      }
      navigate(`/patients/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={s.page}>
        <Header title="Consultation" showBack />
        <div style={s.container}><div style={s.muted}>Loading...</div></div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <Header title={isEdit ? "Edit Consultation" : "Add Consultation"} showBack onBack={() => navigate(`/patients/${id}`)} />
      <div style={s.container}>
        <div style={s.card}>
          <div style={{ marginBottom: 16 }}>
            <button type="button" style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate(`/patients/${id}`)}>
              <FiArrowLeft size={14} />Back
            </button>
          </div>
          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.h2}>Visit Info</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={s.label}>Consultation Type *</label>
                <select required style={s.input} value={visitType} onChange={(e) => setVisitType(e.target.value)}>
                  <option value="">Select...</option>
                  {visitTypes.map((v) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={s.label}>Condition *</label>
                <select required style={s.input} value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option value="">Select...</option>
                  {conditions.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={s.label}>Date *</label>
                <input type="date" required style={s.input} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            {isNewPatientVisit && (
              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Pt c/o (Chief Complaint)</label>
                <textarea style={{ ...s.input, minHeight: 60, resize: "vertical", fontFamily: "inherit" }} value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={s.label}>{pronoun} is taking</label>
                <input style={s.input} value={currentlyTaking} onChange={(e) => setCurrentlyTaking(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>{pronoun} is feeling</label>
                <input style={s.input} value={feeling} onChange={(e) => setFeeling(e.target.value)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={s.label}>Symptom Severity Score (SSS)</label>
                <input type="number" step="0.1" style={s.input} value={sssScore} onChange={(e) => setSssScore(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Linked Blood Test Report (optional)</label>
                <select style={s.input} value={linkedReport} onChange={(e) => setLinkedReport(e.target.value)}>
                  <option value="">None</option>
                  {reports.map((r) => (
                    <option key={r._id} value={r._id}>{new Date(r.date).toLocaleDateString()} — {r.labName || "No lab"}</option>
                  ))}
                </select>
              </div>
            </div>

            {isHashimotos && (
              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>Ultrasound (U/S) Notes</label>
                <textarea style={{ ...s.input, minHeight: 60, resize: "vertical", fontFamily: "inherit" }} value={ultrasoundNotes} onChange={(e) => setUltrasoundNotes(e.target.value)} />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={s.label}>Allergy</label>
                <input style={s.input} value={allergy} onChange={(e) => setAllergy(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Medicines (current)</label>
                <input style={s.input} value={currentMedicines} onChange={(e) => setCurrentMedicines(e.target.value)} />
              </div>
            </div>

            <div style={s.h2}>O/E (On Examination)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={s.label}>BP</label>
                <input style={s.input} placeholder="e.g. 120/80" value={bp} onChange={(e) => setBp(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Pulse</label>
                <input type="number" style={s.input} value={pulse} onChange={(e) => setPulse(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>SaO2 (%)</label>
                <input type="number" style={s.input} value={spo2} onChange={(e) => setSpo2(e.target.value)} />
              </div>
            </div>

            <div style={s.h2}>Plan</div>
            <div style={{ marginBottom: 12 }}>
              <textarea style={{ ...s.input, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} value={planNotes} onChange={(e) => setPlanNotes(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: theme.text, cursor: "pointer" }}>
                <input type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} />
                After explaining to the patient, written consent is taken regarding the prescription of Non Licensed medicines.
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={s.h2}>Prescription</div>
              <button type="button" style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={addPrescriptionRow}>
                <FiPlus size={14} />Add Medicine
              </button>
            </div>
            <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
              {prescriptions.map((row, i) => {
                const medDoc = medications.find((m) => m._id === row.medication);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr auto", gap: 10, alignItems: "start" }}>
                    <select
                      style={s.input}
                      value={row.medication}
                      onChange={(e) => updatePrescriptionRow(i, "medication", e.target.value)}
                    >
                      <option value="">Select medicine...</option>
                      {medications.map((m) => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                    <select
                      style={s.input}
                      value={row.dosage}
                      onChange={(e) => updatePrescriptionRow(i, "dosage", e.target.value)}
                      disabled={!medDoc}
                    >
                      <option value="">Dosage...</option>
                      {(medDoc?.dosages || []).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <input
                      style={s.input}
                      placeholder="Instructions (optional)"
                      value={row.instructions}
                      onChange={(e) => updatePrescriptionRow(i, "instructions", e.target.value)}
                    />
                    <button
                      type="button"
                      style={{ ...s.btnDanger, padding: "9px 12px" }}
                      onClick={() => removePrescriptionRow(i)}
                      disabled={prescriptions.length === 1}
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Dietary Restrictions</label>
              <input style={s.input} value={dietaryRestrictions} onChange={(e) => setDietaryRestrictions(e.target.value)} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>Nutritional Supplements</label>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                  <input type="checkbox" checked={zinc} onChange={(e) => setZinc(e.target.checked)} />Zn
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                  <input type="checkbox" checked={selenium} onChange={(e) => setSelenium(e.target.checked)} />Selenium
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                  <input type="checkbox" checked={vitD3K2} onChange={(e) => setVitD3K2(e.target.checked)} />Vit D3 / K2
                </label>
              </div>
              <input style={s.input} placeholder="Other supplements (optional)" value={customSupplement} onChange={(e) => setCustomSupplement(e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={s.label}>Immune Modulation</label>
                <input style={s.input} placeholder="e.g. LDN" value={immuneModulation} onChange={(e) => setImmuneModulation(e.target.value)} />
              </div>
              <div>
                <label style={s.label}>R/V after (Follow-up)</label>
                <input style={s.input} placeholder="e.g. 3 months, 8 weeks" value={reviewAfter} onChange={(e) => setReviewAfter(e.target.value)} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate(`/patients/${id}`)}>
                <FiX /> Cancel
              </button>
              <button type="submit" disabled={saving} style={{ ...s.btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
                {saving ? "Saving..." : <><FiSave /> Save Consultation</>}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}