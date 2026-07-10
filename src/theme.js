export const theme = {
  // Light theme — soft blue gradient header, purple accents, white cards
  headerGradient: "linear-gradient(90deg, #4f7fe0 0%, #6b8ff0 55%, #8b6fe8 100%)",
  primary: "#3b5fd9",
  primaryLight: "#eaf0ff",
  purple: "#8b5cf6",
  purpleLight: "#f3edff",
  bg: "#f6f8fc",
  card: "#ffffff",
  border: "#e5eaf3",
  text: "#1f2937",
  textMuted: "#6b7280",
  green: "#22c55e",
  greenBg: "#e9fbef",
  red: "#ef4444",
  redBg: "#fdeaea",
  blue: "#3b82f6",
  blueBg: "#e9f1fd",
  shadow: "0 2px 10px rgba(31, 41, 55, 0.06)",
  shadowMd: "0 6px 20px rgba(31, 41, 55, 0.10)",
  radius: "14px",
};

// Normal ranges for each thyroid test parameter
export const RANGES = {
  tsh: { label: "TSH", unit: "mIU/L", min: 0.27, max: 4.2 },
  t4: { label: "T4", unit: "nmol/L", min: 11.9, max: 21.6 },
  t3: { label: "T3", unit: "nmol/L", min: 3.1, max: 6.8 },
  antiTpo: { label: "Anti-TPO", unit: "IU/mL", min: 0, max: 34 },
  antiTg: { label: "Anti-TG", unit: "IU/mL", min: 15, max: 115 },
};

export const getStatus = (key, value) => {
  if (value === undefined || value === null || value === "") return null;
  const range = RANGES[key];
  const v = Number(value);
  if (v < range.min) return "Low";
  if (v > range.max) return "High";
  return "Normal";
};

export const statusColor = (status) => {
  if (status === "High") return { color: theme.red, bg: theme.redBg };
  if (status === "Low") return { color: theme.blue, bg: theme.blueBg };
  if (status === "Normal") return { color: theme.green, bg: theme.greenBg };
  return { color: theme.textMuted, bg: "#f3f4f6" };
};
