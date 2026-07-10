import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../api/api";
import { useAuth } from "../AuthContext";
import { theme } from "../theme";
import { s } from "../styles";

export default function SettingsScreen() {
  const { user, updateStoredUser } = useAuth();
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    api.getLabs().then(setLabs).catch(() => {});
  }, []);

  return (
    <div style={s.page}>
      <Header title="Settings" showBack />
      <div style={s.container}>
        <div style={{ display: "grid", gap: 20 }}>
          <ChangeEmailCard user={user} updateStoredUser={updateStoredUser} />
          <ChangePasswordCard />
          <ManageLabsCard labs={labs} setLabs={setLabs} />
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

  const handleDelete = async (labId) => {
    if (!window.confirm("Delete this lab?")) return;
    try {
      await api.deleteLab(labId);
      setLabs((prev) => prev.filter((l) => l._id !== labId));
    } catch (err) {
      alert(err.message);
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
              <button style={{ ...s.btnDanger, padding: "5px 12px", fontSize: 12 }} onClick={() => handleDelete(lab._id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
