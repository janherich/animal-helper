import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === undefined) {
      continue;
    }
    const next = text[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = false;
        continue;
      }
      cell += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
};

const objectsFrom = (rows: string[][]): Record<string, string>[] => {
  const headers = rows[1];
  if (headers === undefined) {
    throw new Error("matrix CSV is missing headers");
  }

  return rows.slice(2).flatMap((row) => {
    if (!row.some((value) => value.trim() !== "")) {
      return [];
    }
    const record: Record<string, string> = {};
    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];
      if (header === undefined) {
        continue;
      }
      record[header] = row[index] ?? "";
    }
    return [record];
  });
};

const sourceDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../docs/product/case-matrices/source",
);

export const readMatrixRows = (fileName: string): Record<string, string>[] =>
  objectsFrom(parseCsv(readFileSync(join(sourceDir, fileName), "utf8")));
