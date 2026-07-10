import { RANGES } from "../theme";

const fmtDate = (d) => {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

// Pads a string with spaces on the right up to `width` (monospace-style alignment,
// works without any table/grid lines when pasted into chat apps, notes, docs, etc.)
const pad = (str, width) => {
  const s = String(str);
  return s.length >= width ? s + " " : s + " ".repeat(width - s.length);
};

const LABEL_WIDTH = 12;
const VALUE_WIDTH = 10;

export function buildSingleReportCopyText(report) {
  const lines = [`Blood test of ${fmtDate(report.date)}`, ""];

  Object.entries(RANGES).forEach(([key, range]) => {
    const val = report[key];
    if (val === undefined || val === null || val === "") return;
    lines.push(`${pad(range.label, LABEL_WIDTH)}${val}`);
  });

  return lines.join("\n");
}

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
