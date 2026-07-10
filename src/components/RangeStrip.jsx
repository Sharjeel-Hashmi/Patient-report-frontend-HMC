import { RANGES, getStatus, statusColor, theme } from "../theme";

// Maps a value onto a 0-100% position along an extended visual range
// (adds 30% padding on each side of the normal range so out-of-range values are visible)
function toPercent(value, min, max) {
  const pad = (max - min) * 0.6 || 1;
  const lo = min - pad;
  const hi = max + pad;
  const pct = ((value - lo) / (hi - lo)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export default function RangeStrip({ paramKey, previousValue, currentValue }) {
  const range = RANGES[paramKey];
  const min = range.min;
  const max = range.max;

  const bandStart = toPercent(min, min, max);
  const bandEnd = toPercent(max, min, max);

  const hasPrev = previousValue !== undefined && previousValue !== null && previousValue !== "";
  const hasCurrent = currentValue !== undefined && currentValue !== null && currentValue !== "";

  const prevPct = hasPrev ? toPercent(Number(previousValue), min, max) : null;
  const currPct = hasCurrent ? toPercent(Number(currentValue), min, max) : null;

  const prevStatus = hasPrev ? getStatus(paramKey, previousValue) : null;
  const currStatus = hasCurrent ? getStatus(paramKey, currentValue) : null;

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>
          {range.label} <span style={{ color: theme.textMuted, fontWeight: 400, fontSize: 12 }}>({range.unit})</span>
        </span>
        <span style={{ fontSize: 12, color: theme.textMuted }}>
          Normal: {min}–{max}
        </span>
      </div>

      <div style={{ position: "relative", height: 34, marginTop: 8 }}>
        {/* base track */}
        <div
          style={{
            position: "absolute",
            top: 13,
            left: 0,
            right: 0,
            height: 8,
            borderRadius: 6,
            background: "#f0f2f7",
          }}
        />
        {/* green normal band */}
        <div
          style={{
            position: "absolute",
            top: 13,
            left: `${bandStart}%`,
            width: `${bandEnd - bandStart}%`,
            height: 8,
            borderRadius: 6,
            background: theme.greenBg,
            border: `1px solid ${theme.green}`,
          }}
        />

        {/* Previous marker - square with P */}
        {hasPrev && (
          <div
            title={`Previous: ${previousValue}`}
            style={{
              position: "absolute",
              left: `calc(${prevPct}% - 9px)`,
              top: 2,
              width: 18,
              height: 18,
              borderRadius: 4,
              background: statusColor(prevStatus).bg,
              border: `2px solid ${statusColor(prevStatus).color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 800,
              color: statusColor(prevStatus).color,
              zIndex: 2,
            }}
          >
            P
          </div>
        )}

        {/* Current/Recent marker - circle with R */}
        {hasCurrent && (
          <div
            title={`Recent: ${currentValue}`}
            style={{
              position: "absolute",
              left: `calc(${currPct}% - 10px)`,
              top: 1,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: statusColor(currStatus).color,
              border: "2px solid #fff",
              boxShadow: theme.shadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 800,
              color: "#fff",
              zIndex: 3,
            }}
          >
            R
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 12, color: theme.textMuted }}>
        {hasPrev && (
          <span>
            ▪ Previous: <b style={{ color: theme.text }}>{previousValue}</b>{" "}
            <span style={{ color: statusColor(prevStatus).color, fontWeight: 600 }}>({prevStatus})</span>
          </span>
        )}
        {hasCurrent && (
          <span>
            ● Recent: <b style={{ color: theme.text }}>{currentValue}</b>{" "}
            <span style={{ color: statusColor(currStatus).color, fontWeight: 600 }}>({currStatus})</span>
          </span>
        )}
      </div>
    </div>
  );
}
