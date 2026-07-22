import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiFileText,
  FiUserPlus,
  FiPlusCircle,
  FiAlertTriangle,
  FiClock,
  FiPieChart,
  FiActivity,
  FiArrowRight,
} from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import { api } from "../api/api";
import { RANGES, theme } from "../theme";
import { s } from "../styles";

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...s.card, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: color.bg,
          color: color.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 20,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: theme.textMuted }}>{label}</div>
      </div>
    </div>
  );
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  if (error) {
    return (
      <div style={s.page}>
        <Header title="Dashboard" showBack onBack={() => navigate("/")} />
        <div style={s.container}>
          <div style={s.error}>{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={s.page}>
        <Header title="Dashboard" showBack onBack={() => navigate("/")} />
        <div style={s.container}>
          <div style={s.muted}>Loading dashboard...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const genderTotal = stats.genderSplit.Male + stats.genderSplit.Female + stats.genderSplit.Other || 1;
  const genderColors = { Male: theme.blue, Female: theme.purple, Other: theme.textMuted };

  const abnormalityMax = Math.max(1, ...Object.values(stats.abnormalityCounts));

  return (
    <div style={s.page}>
      <Header title="Dashboard" showBack onBack={() => navigate("/")} />
      <div style={s.container}>
        {/* Basic Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
          <StatCard icon={<FiUsers />} label="Total Patients" value={stats.totalPatients} color={{ color: theme.primary, bg: theme.primaryLight }} />
          <StatCard icon={<FiFileText />} label="Total Reports" value={stats.totalReports} color={{ color: theme.purple, bg: theme.purpleLight }} />
          <StatCard icon={<FiUserPlus />} label="New Patients This Month" value={stats.newPatientsThisMonth} color={{ color: theme.green, bg: theme.greenBg }} />
          <StatCard icon={<FiPlusCircle />} label="Reports Added This Month" value={stats.reportsThisMonth} color={{ color: theme.blue, bg: theme.blueBg }} />
        </div>

        {/* Alerts row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 20 }}>
          {/* Abnormal Results Alert */}
          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FiAlertTriangle color={theme.red} size={18} />
              <div style={{ ...s.h2, margin: 0 }}>Abnormal Results Alert</div>
              <span
                style={{
                  marginLeft: "auto",
                  background: theme.redBg,
                  color: theme.red,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                {stats.abnormalAlerts.length}
              </span>
            </div>
            {stats.abnormalAlerts.length === 0 ? (
              <div style={s.muted}>No patients with abnormal latest results.</div>
            ) : (
              <div style={{ display: "grid", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                {stats.abnormalAlerts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/patients/${a.id}`)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 12px",
                      borderRadius: 9,
                      border: `1px solid ${theme.border}`,
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: theme.text }}>{a.name}</div>
                      <div style={{ fontSize: 11.5, color: theme.textMuted }}>
                        Last: {new Date(a.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {a.abnormalParams.map((ap) => (
                        <StatusBadge key={ap.param} status={ap.status} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-up Due */}
          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FiClock color={theme.blue} size={18} />
              <div style={{ ...s.h2, margin: 0 }}>Follow-up Due</div>
              <span
                style={{
                  marginLeft: "auto",
                  background: theme.blueBg,
                  color: theme.blue,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                {stats.followUpDue.length}
              </span>
            </div>
            <div style={{ ...s.muted, marginBottom: 10 }}>No report in the last 6 months</div>
            {stats.followUpDue.length === 0 ? (
              <div style={s.muted}>Everyone is up to date.</div>
            ) : (
              <div style={{ display: "grid", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                {stats.followUpDue.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => navigate(`/patients/${f.id}`)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 12px",
                      borderRadius: 9,
                      border: `1px solid ${theme.border}`,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: theme.text }}>{f.name}</div>
                    <div style={{ fontSize: 11.5, color: theme.textMuted }}>
                      Last: {new Date(f.lastReportDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gender split + Most common abnormality */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 20 }}>
          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <FiPieChart color={theme.purple} size={18} />
              <div style={{ ...s.h2, margin: 0 }}>Gender Split</div>
            </div>
            <div style={{ display: "flex", height: 14, borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
              {["Male", "Female", "Other"].map((g) =>
                stats.genderSplit[g] > 0 ? (
                  <div
                    key={g}
                    style={{ width: `${(stats.genderSplit[g] / genderTotal) * 100}%`, background: genderColors[g] }}
                  />
                ) : null
              )}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {["Male", "Female", "Other"].map((g) => (
                <div key={g} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: genderColors[g] }} />
                  <span style={{ color: theme.text, fontWeight: 600 }}>{g}</span>
                  <span style={{ marginLeft: "auto", color: theme.textMuted }}>{stats.genderSplit[g]} patients</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <FiActivity color={theme.red} size={18} />
              <div style={{ ...s.h2, margin: 0 }}>Most Common Abnormality</div>
            </div>
            {stats.mostCommonAbnormality ? (
              <div style={{ ...s.muted, marginBottom: 14 }}>
                <b style={{ color: theme.text }}>{RANGES[stats.mostCommonAbnormality.param].label}</b> is abnormal most
                often — in <b style={{ color: theme.red }}>{stats.mostCommonAbnormality.count}</b> patients' latest reports.
              </div>
            ) : (
              <div style={{ ...s.muted, marginBottom: 14 }}>No abnormal results recorded yet.</div>
            )}
            <div style={{ display: "grid", gap: 10 }}>
              {Object.entries(stats.abnormalityCounts).map(([key, count]) => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: theme.text }}>{RANGES[key].label}</span>
                    <span style={{ color: theme.textMuted }}>{count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 6, background: "#f0f2f7" }}>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 6,
                        width: `${(count / abnormalityMax) * 100}%`,
                        background: theme.red,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={s.card}>
          <div style={{ ...s.h2, marginBottom: 14 }}>Recent Activity</div>
          {stats.recentActivity.length === 0 ? (
            <div style={s.muted}>No reports added yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {stats.recentActivity.map((r, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/patients/${r.patientId}`)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: 9,
                    border: `1px solid ${theme.border}`,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FiFileText color={theme.primary} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: theme.text }}>{r.patientName}</div>
                      <div style={{ fontSize: 11.5, color: theme.textMuted }}>
                        Report added — {new Date(r.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 20,
                        color: r.hasAbnormal ? theme.red : theme.green,
                        background: r.hasAbnormal ? theme.redBg : theme.greenBg,
                      }}
                    >
                      {r.hasAbnormal ? "Abnormal" : "Normal"}
                    </span>
                    <FiArrowRight color={theme.textMuted} size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
