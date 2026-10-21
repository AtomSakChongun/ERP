// Client-side CSV export: build the text, then hand the browser a file to save.

const cell = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (rows: (string | number)[][]) => rows.map((row) => row.map(cell).join(",")).join("\n");

/** Saves `csv` as `filename`. The BOM makes Excel read UTF-8 (Thai text, typographic quotes) correctly. */
export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
