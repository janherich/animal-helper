export const COPY_MAX_LENGTH = 4000;

const EDITORIAL =
  /ZATIAĽ|ODKOMUNIKOVAŤ|DOMI DOPLNÍ|POZRIEŤ PRESNE ZNENIE|ASI EŠTE VŠADE|POZNÁMKA PRE/i;

const dropLine = (line) => {
  if (EDITORIAL.test(line)) {
    return true;
  }
  const letters = line.replace(
    /[^A-Za-zÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽáäčďéíĺľňóôŕšťúýž]/g,
    "",
  );
  const caps = line.replace(/[^A-ZÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]/g, "");
  return letters.length > 24 && caps.length / letters.length > 0.75;
};

export const sanitizeImportedCopy = (text) => {
  const stripped = text
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\+?\d[\d\s./-]{8,}\d/g, "");
  const collapsed = [];

  for (const raw of stripped.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") {
      if (collapsed.length > 0 && collapsed[collapsed.length - 1] !== "") {
        collapsed.push("");
      }
      continue;
    }
    if (dropLine(line)) {
      continue;
    }
    collapsed.push(line);
  }

  while (collapsed.at(-1) === "") {
    collapsed.pop();
  }

  return collapsed.join("\n").slice(0, COPY_MAX_LENGTH);
};
