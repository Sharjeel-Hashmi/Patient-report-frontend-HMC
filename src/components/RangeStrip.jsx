import { RANGES, getStatus, statusColor, theme } from "../theme";

// Maps a value onto a 0-100% position along an extended visual range
// (adds 60% padding on each side of the normal range so out-of-range values are visible)
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

  // Solid zone boundaries: Blue (Low) | Green (Normal) | Red (High)
  const bandStart = toPercent(min, min, max);
  const bandEnd = toPercent(max, min, max);

  const hasPrev = previousValue !== undefined && previousValue !== null && previousValue !== "";
  const hasCurrent = currentValue !== undefined && currentValue !== null && currentValue !== "";

  const prevPct = hasPrev ? toPercent(Number(previousValue), min, max) : null;
  const currPct = hasCurrent ? toPercent(Number(currentValue), min, max) : null;

  const prevStatus = hasPrev ? getStatus(paramKey, previousValue) : null;
  const currStatus = hasCurrent ? getStatus(paramKey, currentValue) : null;

  const MARKER_AREA = 40; // shape + connector line height
  const STRIP_TOP = MARKER_AREA;
  const STRIP_HEIGHT = 16;
  const LABEL_TOP = STRIP_TOP + STRIP_HEIGHT + 4;

  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>
          {range.label} <span style={{ color: theme.textMuted, fontWeight: 400, fontSize: 12 }}>({range.unit})</span>
        </span>
      </div>

      <div style={{ position: "relative", height: LABEL_TOP + 18 }}>
        {/* Solid 3-zone strip: Blue (Low) | Green (Normal) | Red (High) */}
        <div
          style={{
            position: "absolute",
            top: STRIP_TOP,
            left: 0,
            width: `${bandStart}%`,
            height: STRIP_HEIGHT,
            background: theme.blue,
            borderRadius: "8px 0 0 8px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: STRIP_TOP,
            left: `${bandStart}%`,
            width: `${bandEnd - bandStart}%`,
            height: STRIP_HEIGHT,
            background: theme.green,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: STRIP_TOP,
            left: `${bandEnd}%`,
            width: `${100 - bandEnd}%`,
            height: STRIP_HEIGHT,
            background: theme.red,
            borderRadius: "0 8px 8px 0",
          }}
        />

        {/* Normal range min/max labels, placed under the green zone's edges */}
        <div
          style={{
            position: "absolute",
            top: LABEL_TOP,
            left: `calc(${bandStart}% - 14px)`,
            width: 28,
            textAlign: "center",
            fontSize: 11,
            fontWeight: 700,
            color: theme.textMuted,
          }}
        >
          {min}
        </div>
        <div
          style={{
            position: "absolute",
            top: LABEL_TOP,
            left: `calc(${bandEnd}% - 14px)`,
            width: 28,
            textAlign: "center",
            fontSize: 11,
            fontWeight: 700,
            color: theme.textMuted,
          }}
        >
          {max}
        </div>

        {/* Previous marker — square shape with "P", connector line down to the strip */}
        {hasPrev && (
          <>
            <div
              title={`Previous: ${previousValue}`}
              style={{
                position: "absolute",
                left: `calc(${prevPct}% - 9px)`,
                top: 0,
                width: 18,
                height: 18,
                borderRadius: 4,
                background: statusColor(prevStatus).color,
                border: "2px solid #fff",
                boxShadow: theme.shadow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 800,
                color: "#fff",
                zIndex: 3,
              }}
            >
              P
            </div>
            <div
              style={{
                position: "absolute",
                left: `calc(${prevPct}% - 1px)`,
                top: 18,
                width: 2,
                height: STRIP_TOP - 18,
                background: statusColor(prevStatus).color,
                zIndex: 2,
              }}
            />
          </>
        )}

        {/* Recent marker — downward triangle shape with "R", connector line down to the strip */}
        {hasCurrent && (
          <>
            <div
              title={`Recent: ${currentValue}`}
              style={{
                position: "absolute",
                left: `calc(${currPct}% - 10px)`,
                top: 0,
                width: 20,
                height: 18,
                clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
                background: statusColor(currStatus).color,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 2,
                zIndex: 4,
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>R</span>
            </div>
            <div
              style={{
                position: "absolute",
                left: `calc(${currPct}% - 1px)`,
                top: 18,
                width: 2,
                height: STRIP_TOP - 18,
                background: statusColor(currStatus).color,
                zIndex: 2,
              }}
            />
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 12, color: theme.textMuted }}>
        {hasPrev && (
          <span>
            ■ Previous: <b style={{ color: theme.text }}>{previousValue}</b>{" "}
            <span style={{ color: statusColor(prevStatus).color, fontWeight: 600 }}>({prevStatus})</span>
          </span>
        )}
        {hasCurrent && (
          <span>
            ▼ Recent: <b style={{ color: theme.text }}>{currentValue}</b>{" "}
            <span style={{ color: statusColor(currStatus).color, fontWeight: 600 }}>({currStatus})</span>
          </span>
        )}
      </div>
    </div>
  );
}
