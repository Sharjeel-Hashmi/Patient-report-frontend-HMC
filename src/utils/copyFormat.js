import { RANGES } from "../theme";

const fmtDate = (d) => {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

// IMPORTANT: use non-breaking spaces (\u00A0) instead of regular spaces for padding.
// Many paste destinations (WhatsApp Web, Gmail, chat apps, Notion, contenteditable
// boxes, etc.) are HTML-based and silently COLLAPSE consecutive regular spaces down
// to a single space when rendering pasted text — even in a monospace font. Regular
// spaces would then look "correctly aligned" in a plain-text editor but break apart
// the moment they're pasted into any HTML-based app. Non-breaking spaces are never
// collapsed, so column alignment survives no matter where the text is pasted.
const NBSP = "\u00A0";

const pad = (str, width) => {
  const s = String(str);
  if (s.length >= width) return s + NBSP;
  return s + NBSP.repeat(width - s.length);
};

const LABEL_WIDTH = 12;
const VALUE_WIDTH = 10;

/**
 * Builds aligned plain-text for a SINGLE report (Detail page copy):
 * "Blood test of DD.MM.YYYY"
 * blank line
 * Parameter   Value
 */
export function buildSingleReportCopyText(report) {
  const lines = [`Blood test of ${fmtDate(report.date)}`, ""];

  Object.entries(RANGES).forEach(([key, range]) => {
    const val = report[key];
    if (val === undefined || val === null || val === "") return;
    lines.push(`${pad(range.label, LABEL_WIDTH)}${val}`);
  });

  return lines.join("\n");
}

/**
 * Builds aligned plain-text for TWO reports (Compare page copy):
 * "Blood tests of DD.MM.YYYY and DD.MM.YYYY"
 * blank line
 * Parameter   PrevValue   RecentValue
 * (no header row, no grid lines — space-aligned columns using non-breaking spaces
 * so alignment survives pasting into any app)
 */
export function buildCompareCopyText(prevReport, currReport) {
  const lines = [
    `Blood tests of ${fmtDate(prevReport.date)} and ${fmtDate(currReport.date)}`,
    "",
  ];

  Object.entries(RANGES).forEach(([key, range]) => {
    const prevVal = prevReport[key];
    const currVal = currReport[key];
    if ((prevVal === undefined || prevVal === null || prevVal === "") && (currVal === undefined || currVal === null || currVal === "")) return;

    const prevStr = prevVal === undefined || prevVal === null || prevVal === "" ? "-" : String(prevVal);
    const currStr = currVal === undefined || currVal === null || currVal === "" ? "-" : String(currVal);

    lines.push(`${pad(range.label, LABEL_WIDTH)}${pad(prevStr, VALUE_WIDTH)}${currStr}`);
  });

  return lines.join("\n");
}
