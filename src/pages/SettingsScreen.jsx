import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import Header from "../components/Header";
import ConfirmModal from "../components/ConfirmModal";
import Footer from "../components/Footer";
import { api } from "../api/api";
import { useAuth } from "../AuthContext";
import { theme } from "../theme";
import { s } from "../styles";

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { user, updateStoredUser } = useAuth();
  const [labs, setLabs] = useState([]);
  const [visitTypes, setVisitTypes] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    api.getLabs().then(setLabs).catch(() => {});
    api.getVisitTypes().then(setVisitTypes).catch(() => {});
    api.getConditions().then(setConditions).catch(() => {});
    api.getMedications().then(setMedications).catch(() => {});
  }, []);

  return (
    <div style={s.page}>
      <Header title="Settings" showBack onBack={() => navigate("/")} />
      <div style={s.container}>
        <div style={{ marginBottom: 16 }}>
          <button style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate("/")}>
            <FiArrowLeft size={14} />Back
          </button>
        </div>
        <div style={{ display: "grid", gap: 20 }}>
          <ChangeEmailCard user={user} updateStoredUser={updateStoredUser} />
          <ChangePasswordCard />
          <ManageLabsCard labs={labs} setLabs={setLabs} />
          <ManageSimpleListCard
            title="Manage Consultation Types"
            placeholder="New visit type (e.g. Telephone consultation)"
            items={visitTypes}
            setItems={setVisitTypes}
            createFn={api.createVisitType}
            deleteFn={api.deleteVisitType}
          />
          <ManageSimpleListCard
            title="Manage Conditions"
            placeholder="New condition (e.g. Hyperthyroid)"
            items={conditions}
            setItems={setConditions}
            createFn={api.createCondition}
            deleteFn={api.deleteCondition}
          />
          <ManageMedicationsCard medications={medications} setMedications={setMedications} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ChangeEmailCard({ user, updateStoredUser }) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const data = await api.changeEmail(newEmail, password);
      updateStoredUser(data.user, data.token);
      setSuccess("Email updated successfully.");
      setNewEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.card}>
      <div style={s.h2}>Change Email</div>
      <div style={{ ...s.muted, marginBottom: 14 }}>Current email: <b style={{ color: theme.text }}>{user?.email}</b></div>
      {error && <div style={s.error}>{error}</div>}
      {success && <div style={s.success}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={s.label}>New Email</label>
            <input type="email" required style={s.input} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div>
            <label style={s.label}>Current Password</label>
            <input type="password" required style={s.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={saving} style={s.btnPrimary}>{saving ? "Updating..." : "Update Email"}</button>
      </form>
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.card}>
      <div style={s.h2}>Change Password</div>
      {error && <div style={s.error}>{error}</div>}
      {success && <div style={s.success}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={s.label}>Current Password</label>
            <input type="password" required style={s.input} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <label style={s.label}>New Password</label>
            <input type="password" required minLength={6} style={s.input} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={saving} style={s.btnPrimary}>{saving ? "Updating..." : "Update Password"}</button>
      </form>
    </div>
  );
}

function ManageLabsCard({ labs, setLabs }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteLabId, setConfirmDeleteLabId] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    try {
      const lab = await api.createLab(name.trim());
      setLabs((prev) => [...prev, lab]);
      setName("");
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDeleteLabAction = async () => {
    try {
      await api.deleteLab(confirmDeleteLabId);
      setLabs((prev) => prev.filter((l) => l._id !== confirmDeleteLabId));
    } catch (err) {
      alert(err.message);
    } finally {
      setConfirmDeleteLabId(null);
    }
  };

  return (
    <div style={s.card}>
      <div style={s.h2}>Manage Labs</div>
      {error && <div style={s.error}>{error}</div>}
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input style={s.input} placeholder="New lab name" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" style={s.btnPrimary}>Add Lab</button>
      </form>
      {labs.length === 0 ? (
        <div style={s.muted}>No labs added yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {labs.map((lab) => (
            <div key={lab._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, border: `1px solid ${theme.border}` }}>
              <span>{lab.name}</span>
              <button style={{ ...s.btnDanger, padding: "5px 12px", fontSize: 12 }} onClick={() => setConfirmDeleteLabId(lab._id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
      {confirmDeleteLabId && (
        <ConfirmModal
          message="Are you sure you want to delete this lab?"
          onConfirm={confirmDeleteLabAction}
          onCancel={() => setConfirmDeleteLabId(null)}
        />
      )}
    </div>
  );
}

// Reusable "name only" master-data manager — used for Consultation Types and Conditions.
function ManageSimpleListCard({ title, placeholder, items, setItems, createFn, deleteFn }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    try {
      const created = await createFn(name.trim());
      setItems((prev) => [...prev, created]);
      setName("");
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDeleteAction = async () => {
    try {
      await deleteFn(confirmDeleteId);
      setItems((prev) => prev.filter((i) => i._id !== confirmDeleteId));
    } catch (err) {
      alert(err.message);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div style={s.card}>
      <div style={s.h2}>{title}</div>
      {error && <div style={s.error}>{error}</div>}
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input style={s.input} placeholder={placeholder} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" style={{ ...s.btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
          <FiPlus size={14} />Add
        </button>
      </form>
      {items.length === 0 ? (
        <div style={s.muted}>None added yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {items.map((item) => (
            <div key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, border: `1px solid ${theme.border}` }}>
              <span>{item.name}</span>
              <button style={{ ...s.btnDanger, padding: "5px 12px", fontSize: 12 }} onClick={() => setConfirmDeleteId(item._id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
      {confirmDeleteId && (
        <ConfirmModal
          message={`Are you sure you want to delete "${title.replace("Manage ", "")}" entry?`}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}

// Medications manager — each medication also carries its own list of dosage options
// (e.g. Eltroxin -> 25mcg/50mcg/...), used as a dependent dropdown on the Consultation form.
function ManageMedicationsCard({ medications, setMedications }) {
  const [name, setName] = useState("");
  const [dosageInput, setDosageInput] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    const dosages = dosageInput
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    try {
      const created = await api.createMedication(name.trim(), dosages);
      setMedications((prev) => [...prev, created]);
      setName("");
      setDosageInput("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveDosage = async (medication, dosage) => {
    try {
      const updatedDosages = medication.dosages.filter((d) => d !== dosage);
      const updated = await api.updateMedication(medication._id, { dosages: updatedDosages });
      setMedications((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmDeleteAction = async () => {
    try {
      await api.deleteMedication(confirmDeleteId);
      setMedications((prev) => prev.filter((m) => m._id !== confirmDeleteId));
    } catch (err) {
      alert(err.message);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div style={s.card}>
      <div style={s.h2}>Manage Medications</div>
      <div style={{ ...s.muted, marginBottom: 14 }}>
        Add a medicine name and its dosage options (comma-separated), e.g. Eltroxin — 25mcg, 50mcg, 75mcg
      </div>
      {error && <div style={s.error}>{error}</div>}
      <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 16 }}>
        <input style={s.input} placeholder="Medicine name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={s.input} placeholder="Dosages, comma-separated" value={dosageInput} onChange={(e) => setDosageInput(e.target.value)} />
        <button type="submit" style={{ ...s.btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
          <FiPlus size={14} />Add
        </button>
      </form>
      {medications.length === 0 ? (
        <div style={s.muted}>No medications added yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {medications.map((med) => (
            <div key={med._id} style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>{med.name}</span>
                <button style={{ ...s.btnDanger, padding: "5px 12px", fontSize: 12 }} onClick={() => setConfirmDeleteId(med._id)}>Remove</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {med.dosages.length === 0 && <span style={s.muted}>No dosages set.</span>}
                {med.dosages.map((d) => (
                  <span
                    key={d}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: theme.primaryLight,
                      color: theme.primary,
                      padding: "3px 8px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {d}
                    <FiTrash2 size={11} style={{ cursor: "pointer" }} onClick={() => handleRemoveDosage(med, d)} />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {confirmDeleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this medication?"
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}