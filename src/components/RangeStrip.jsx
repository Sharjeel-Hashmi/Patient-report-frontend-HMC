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
  const blueCenter = bandStart / 2;
  const greenCenter = (bandStart + bandEnd) / 2;
  const redCenter = (bandEnd + 100) / 2;

  const hasPrev = previousValue !== undefined && previousValue !== null && previousValue !== "";
  const hasCurrent = currentValue !== undefined && currentValue !== null && currentValue !== "";

  const prevPct = hasPrev ? toPercent(Number(previousValue), min, max) : null;
  const currPct = hasCurrent ? toPercent(Number(currentValue), min, max) : null;

  const prevStatus = hasPrev ? getStatus(paramKey, previousValue) : null;
  const currStatus = hasCurrent ? getStatus(paramKey, currentValue) : null;

  const MARKER_SIZE = 24;
  const MARKER_AREA = 46; // shape + connector line height
  const STRIP_TOP = MARKER_AREA;
  const STRIP_HEIGHT = 16;
  const NUM_LABEL_TOP = STRIP_TOP + STRIP_HEIGHT + 4;
  const ZONE_LABEL_TOP = NUM_LABEL_TOP + 16;

  return (
    <div style={{ marginBottom: 34 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>
          {range.label} <span style={{ color: theme.textMuted, fontWeight: 400, fontSize: 12 }}>({range.unit})</span>
        </span>
      </div>

      <div style={{ position: "relative", height: ZONE_LABEL_TOP + 18 }}>
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

        {/* Normal range min/max numbers, under the green zone's edges */}
        <div style={{ position: "absolute", top: NUM_LABEL_TOP, left: `calc(${bandStart}% - 14px)`, width: 28, textAlign: "center", fontSize: 11, fontWeight: 700, color: theme.textMuted }}>
          {min}
        </div>
        <div style={{ position: "absolute", top: NUM_LABEL_TOP, left: `calc(${bandEnd}% - 14px)`, width: 28, textAlign: "center", fontSize: 11, fontWeight: 700, color: theme.textMuted }}>
          {max}
        </div>

        {/* Permanent zone labels: Low / Normal / High */}
        <div style={{ position: "absolute", top: ZONE_LABEL_TOP, left: `${blueCenter}%`, transform: "translateX(-50%)", fontSize: 13, fontWeight: 800, color: theme.blue, whiteSpace: "nowrap" }}>
          Low
        </div>
        <div style={{ position: "absolute", top: ZONE_LABEL_TOP, left: `${greenCenter}%`, transform: "translateX(-50%)", fontSize: 13, fontWeight: 800, color: theme.green, whiteSpace: "nowrap" }}>
          Normal
        </div>
        <div style={{ position: "absolute", top: ZONE_LABEL_TOP, left: `${redCenter}%`, transform: "translateX(-50%)", fontSize: 13, fontWeight: 800, color: theme.red, whiteSpace: "nowrap" }}>
          High
        </div>

        {/* Previous marker — hollow square outline with "P", connector line down to the strip */}
        {hasPrev && (
          <>
            <div
              title={`Previous: ${previousValue}`}
              style={{
                position: "absolute",
                left: `calc(${prevPct}% - ${MARKER_SIZE / 2}px)`,
                top: 0,
                width: MARKER_SIZE,
                height: MARKER_SIZE,
                borderRadius: 5,
                background: "#fff",
                border: `2.5px solid ${statusColor(prevStatus).color}`,
                boxShadow: theme.shadow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                color: statusColor(prevStatus).color,
                zIndex: 3,
              }}
            >
              P
            </div>
            <div
              style={{
                position: "absolute",
                left: `calc(${prevPct}% - 1px)`,
                top: MARKER_SIZE,
                width: 2,
                height: STRIP_TOP - MARKER_SIZE,
                background: statusColor(prevStatus).color,
                zIndex: 2,
              }}
            />
          </>
        )}

        {/* Recent marker — hollow downward triangle outline with "R", connector line down to the strip */}
        {hasCurrent && (
          <>
            <div
              title={`Recent: ${currentValue}`}
              style={{
                position: "absolute",
                left: `calc(${currPct}% - ${MARKER_SIZE / 2 + 2}px)`,
                top: 0,
                width: MARKER_SIZE + 4,
                height: MARKER_SIZE,
                clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
                background: statusColor(currStatus).color,
                zIndex: 4,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 2.5,
                  left: 2.8,
                  width: MARKER_SIZE + 4 - 5.6,
                  height: MARKER_SIZE - 5,
                  clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
                  background: "#fff",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 12,
                  fontWeight: 800,
                  color: statusColor(currStatus).color,
                }}
              >
                R
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                left: `calc(${currPct}% - 1px)`,
                top: MARKER_SIZE,
                width: 2,
                height: STRIP_TOP - MARKER_SIZE,
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
