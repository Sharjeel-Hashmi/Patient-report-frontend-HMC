import { RANGES } from "../theme";

const fmtDate = (d) => {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

// IMPORTANT — why TAB characters, not spaces:
// Space padding only lines up into columns inside a MONOSPACE font (every
// character same width). The moment this text is pasted into an app using a
// PROPORTIONAL font — MS Word, WhatsApp, Gmail, Notion, etc. — space-counted
// columns fall apart because "i" and "W" don't take the same width. This is a
// font limitation that cannot be fixed by choosing a different space character.
//
// TAB characters behave completely differently: every app (Word, Excel, Notepad,
// WhatsApp, Telegram, Gmail...) renders a tab by jumping to the next fixed tab
// stop (a fixed physical position, e.g. every 0.5"), regardless of the font or
// how many characters came before it. That makes tabs the one plain-text
// separator that reliably lines up columns across every app, without needing an
// actual bordered table/grid. We use two tabs after the parameter label (so even
// the longest label, "Anti-TPO", clears the first tab stop) and one tab between
// the two values.
const LABEL_TABS = "\t\t";
const VALUE_TABS = "\t";

/**
 * Builds aligned plain-text for a SINGLE report (Detail page copy):
 * "Blood test of DD.MM.YYYY"
 * blank line
 * Parameter <tab><tab> Value
 */
export function buildSingleReportCopyText(report) {
  const lines = [`Blood test of ${fmtDate(report.date)}`, ""];

  Object.entries(RANGES).forEach(([key, range]) => {
    const val = report[key];
    if (val === undefined || val === null || val === "") return;
    lines.push(`${range.label}${LABEL_TABS}${val}`);
  });

  return lines.join("\n");
}

/**
 * Builds aligned plain-text for TWO reports (Compare page copy):
 * "Blood tests of DD.MM.YYYY and DD.MM.YYYY"
 * blank line
 * Parameter <tab><tab> PrevValue <tab> RecentValue
 * (no header row, no grid lines — tab-aligned columns that hold up in Word,
 * WhatsApp, Notes, Gmail, or anywhere else this gets pasted)
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

    lines.push(`${range.label}${LABEL_TABS}${prevStr}${VALUE_TABS}${currStr}`);
  });

  return lines.join("\n");
}
