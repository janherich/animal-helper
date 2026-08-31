/** RFC-style CSV parser that keeps quoted multiline cells. */
export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
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

export const rowsToObjects = (rows) => {
  const headers = rows[1];
  if (headers === undefined) {
    throw new Error("matrix CSV is missing the column-header row");
  }

  const records = [];
  for (const row of rows.slice(2)) {
    if (!row.some((value) => value.trim() !== "")) {
      continue;
    }
    const padded =
      row.length < headers.length
        ? [
            ...row,
            ...Array.from({ length: headers.length - row.length }, () => ""),
          ]
        : row;
    const record = {};
    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];
      record[header] = padded[index] ?? "";
    }
    records.push(record);
  }
  return records;
};
