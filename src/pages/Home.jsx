import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiX, FiUsers, FiFileText, FiSearch, FiCalendar, FiChevronRight, FiChevronLeft, FiBarChart2 } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../api/api";
import { theme } from "../theme";
import { s } from "../styles";

const PAGE_SIZE = 10;

export default function Home() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [dobFilter, setDobFilter] = useState("");
  const [reportDateFilter, setReportDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (dobFilter) params.dob = dobFilter;
      if (reportDateFilter) params.reportDate = reportDateFilter;
      const data = await api.getPatients(params);
      setPatients(data.patients);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, dobFilter, reportDateFilter, page]);

  useEffect(() => {
    const timer = setTimeout(loadPatients, 300);
    return () => clearTimeout(timer);
  }, [loadPatients]);

  // Reset back to page 1 whenever a filter changes (avoids landing on an empty page)
  useEffect(() => {
    setPage(1);
  }, [search, dobFilter, reportDateFilter]);

  const clearFilters = () => {
    setSearch("");
    setDobFilter("");
    setReportDateFilter("");
  };

  return (
    <div style={s.page}>
      <Header
        title="Patients"
        right={
          <>
            <button onClick={() => navigate("/dashboard")} style={{ ...s.btnOutline, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", gap: 6 }}>
              <FiBarChart2 size={15} /> Dashboard
            </button>
            <button onClick={() => setShowAddModal(true)} style={{ ...s.btnPrimary, background: "rgba(255,255,255,0.95)", color: theme.primary, display: "flex", alignItems: "center", gap: 6 }}>
              <FiPlus size={15} /> Add Patient
            </button>
          </>
        }
      />
      <div style={s.container}>
        <div style={{ ...s.card, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={s.label}><FiSearch size={12} style={{ marginRight: 4, verticalAlign: -1 }} />Search by name</label>
              <input style={s.input} placeholder="Type patient name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label style={s.label}><FiCalendar size={12} style={{ marginRight: 4, verticalAlign: -1 }} />Filter by DOB</label>
              <input type="date" style={s.input} value={dobFilter} onChange={(e) => setDobFilter(e.target.value)} />
            </div>
            <div>
              <label style={s.label}><FiCalendar size={12} style={{ marginRight: 4, verticalAlign: -1 }} />Filter by report date</label>
              <input type="date" style={s.input} value={reportDateFilter} onChange={(e) => setReportDateFilter(e.target.value)} />
            </div>
            <button onClick={clearFilters} style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}><FiX /> Clear</button>
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {loading ? (
          <div style={s.muted}>Loading patients...</div>
        ) : patients.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", color: theme.textMuted }}>
            No patients found. Click "+ Add Patient" to create one.
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 12 }}>
              {patients.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/patients/${p._id}`)}
                  style={{
                    ...s.card,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "box-shadow 0.15s",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15.5, color: theme.text, display: "flex", alignItems: "center", gap: 8 }}><FiUsers style={{ color: theme.primary }} /> {p.name}</div>
                    <div style={s.muted}>
                      {p.dob ? `DOB: ${new Date(p.dob).toLocaleDateString()}` : "DOB not set"} · {p.gender || "N/A"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: theme.primary, display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
                        <FiFileText size={13} />
                        {p.reports.length} report{p.reports.length !== 1 ? "s" : ""}
                      </div>
                      {p.reports.length > 0 && (
                        <div style={{ fontSize: 12, color: theme.textMuted }}>
                          Last: {new Date(p.reports[p.reports.length - 1].date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <FiChevronRight color={theme.textMuted} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ fontSize: 13, color: theme.textMuted }}>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} patients
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 4, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
                  >
                    <FiChevronLeft /> Prev
                  </button>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: theme.text, padding: "0 6px" }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: 4, opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />

      {showAddModal && <AddPatientModal onClose={() => setShowAddModal(false)} onCreated={loadPatients} />}
    </div>
  );
}

function AddPatientModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Other");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const patient = await api.createPatient({ name, dob, gender, phone, address });
      onCreated();
      onClose();
      navigate(`/patients/${patient._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(31,41,55,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div style={{ ...s.card, width: 440, maxWidth: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div style={s.h2}>Add New Patient</div>
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
            <button type="submit" disabled={saving} style={s.btnPrimary}>{saving ? "Saving..." : "Save Patient"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
