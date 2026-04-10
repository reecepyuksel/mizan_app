import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

interface SirahSectionRecord {
  title: string;
  slug: string;
  category: "sirah";
  partTitle: string;
  unitNumber: string;
  unitTitle: string;
  order: number;
  content: string;
  summary: string;
  sourceFile: string;
}

const DEFAULT_INPUT =
  "Siyer-i Nebi 32. BASKI (3)_5a5b8667-e54c-4275-ae29-ac91dcaf42cb.pdf";
const DEFAULT_OUTPUT = "data/siyer-nebi.json";

async function main(): Promise<void> {
  const inputPath = resolvePath(process.argv[2] ?? DEFAULT_INPUT);
  const outputPath = resolvePath(process.argv[3] ?? DEFAULT_OUTPUT);

  const extractedText = execFileSync("pdftotext", [inputPath, "-"], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });

  const normalizedLines = normalizeText(extractedText)
    .split("\n")
    .map((line) => line.trimEnd());

  const records = parseSirahSections(normalizedLines, path.basename(inputPath));

  await fs.writeFile(
    outputPath,
    `${JSON.stringify(records, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Siyer JSON hazirlandi: ${path.relative(process.cwd(), outputPath)} (${records.length} kayit)`,
  );
}

function resolvePath(input: string): string {
  if (path.isAbsolute(input)) {
    return input;
  }

  return path.join(process.cwd(), input);
}

function normalizeText(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/‹/g, "İ"],
    [/›/g, "ı"],
    [/ﬂ/g, "ş"],
    [/ﬁ/g, "Ş"],
    [/ﬀ/g, "ff"],
    [/ﬃ/g, "ffi"],
    [/ﬄ/g, "ffl"],
    [/€/g, "ğ"],
    [/⁄/g, "ğ"],
    [/–/g, "-"],
    [/—/g, "-"],
    [/’/g, "'"],
    [/‘/g, "'"],
    [/“/g, '"'],
    [/”/g, '"'],
    [/…/g, "..."],
    [/ /g, " "],
  ];

  let normalized = text;
  for (const [pattern, replacement] of replacements) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized
    .replace(/\r/g, "")
    .replace(/\u00ad/g, "")
    .replace(/[ \t]+/g, " ");
}

function parseSirahSections(
  lines: string[],
  sourceFile: string,
): SirahSectionRecord[] {
  const startIndex = findBodyStart(lines);
  const records: SirahSectionRecord[] = [];

  let currentPartTitle = "";
  let currentUnitNumber = "";
  let currentUnitTitle = "";
  let currentTitle = "";
  let currentContentLines: string[] = [];
  let order = 0;

  const flush = () => {
    if (!currentTitle) {
      return;
    }

    const content = formatContent(currentContentLines);
    if (content.length === 0) {
      currentTitle = "";
      currentContentLines = [];
      return;
    }

    order += 1;
    records.push({
      title: toTitleCase(currentTitle),
      slug: slugify(`${order}-${currentTitle}`),
      category: "sirah",
      partTitle: currentPartTitle,
      unitNumber: currentUnitNumber,
      unitTitle: toTitleCase(currentUnitTitle),
      order,
      content,
      summary: buildSummary(content),
      sourceFile,
    });

    currentTitle = "";
    currentContentLines = [];
  };

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (line.length === 0) {
      if (currentTitle) {
        currentContentLines.push("");
      }
      continue;
    }

    if (isNoiseLine(line)) {
      continue;
    }

    const partMatch = line.match(/^(Birinci|İkinci) Bölüm$/i);
    if (partMatch) {
      flush();
      currentPartTitle = collectFollowingTitle(lines, index + 1).joined;
      continue;
    }

    const unitMatch = line.match(/^ÜNİTE\s*-\s*([IVXLCDM]+)$/i);
    if (unitMatch) {
      flush();
      currentUnitNumber = unitMatch[1].toUpperCase();
      currentUnitTitle = collectUnitTitle(lines, index + 1).joined;
      continue;
    }

    const sectionTitle = collectSectionTitle(lines, index);
    if (sectionTitle) {
      flush();
      currentTitle = sectionTitle.title;
      index = sectionTitle.nextIndex;
      continue;
    }

    if (currentTitle) {
      currentContentLines.push(line);
    }
  }

  flush();

  return records;
}

function findBodyStart(lines: string[]): number {
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() !== "Birinci Bölüm") {
      continue;
    }

    const window = lines.slice(index, index + 20).join("\n");
    if (window.includes("ÜNİTE-I") && window.includes("Konular:")) {
      return index;
    }
  }

  throw new Error("PDF govde baslangici bulunamadi");
}

function collectFollowingTitle(
  lines: string[],
  startIndex: number,
): { joined: string; nextIndex: number } {
  const titleLines: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (line.length === 0 || isNoiseLine(line)) {
      index += 1;
      continue;
    }

    if (
      line.startsWith("ÜNİTE") ||
      line === "Konular:" ||
      isSectionHeading(line)
    ) {
      break;
    }

    if (!isMostlyUppercase(line)) {
      break;
    }

    titleLines.push(line);
    index += 1;
  }

  return {
    joined: titleLines.join(" - "),
    nextIndex: index - 1,
  };
}

function collectUnitTitle(
  lines: string[],
  startIndex: number,
): { joined: string; nextIndex: number } {
  const titleLines: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (line.length === 0 || isNoiseLine(line)) {
      index += 1;
      continue;
    }

    if (
      line === "Konular:" ||
      isSectionHeading(line) ||
      line.startsWith("ÜNİTE")
    ) {
      break;
    }

    if (!isMostlyUppercase(line)) {
      break;
    }

    titleLines.push(line);
    index += 1;
  }

  return {
    joined: titleLines.join(" - "),
    nextIndex: index - 1,
  };
}

function collectSectionTitle(
  lines: string[],
  index: number,
): { title: string; nextIndex: number } | null {
  const line = lines[index].trim();
  const subsectionMatch = line.match(/^([a-zıi])\)\s+(.+)$/i);
  const okumaMatch = line.match(/^Okuma:\s*(.+)$/i);

  if (!subsectionMatch && !okumaMatch) {
    return null;
  }

  const titleLines = [subsectionMatch ? subsectionMatch[2] : okumaMatch![1]];
  let cursor = index + 1;

  while (cursor < lines.length) {
    const nextLine = lines[cursor].trim();
    if (
      nextLine.length === 0 ||
      isNoiseLine(nextLine) ||
      nextLine === "Konular:" ||
      nextLine.startsWith("ÜNİTE") ||
      nextLine.match(/^(Birinci|İkinci) Bölüm$/i) ||
      isSectionHeading(nextLine)
    ) {
      break;
    }

    if (!isMostlyUppercase(nextLine)) {
      break;
    }

    titleLines.push(nextLine);
    cursor += 1;
  }

  return {
    title: titleLines.join(" "),
    nextIndex: cursor - 1,
  };
}

function isSectionHeading(line: string): boolean {
  return /^([a-zıi])\)\s+.+$/i.test(line) || /^Okuma:\s*.+$/i.test(line);
}

function isNoiseLine(line: string): boolean {
  return (
    /^\d+$/.test(line) ||
    /^Siyer-i Neb/i.test(line) ||
    /^Osman Keskio/iu.test(line) ||
    line === "Hazret-i Peygamberin Hayatı" ||
    /^Konular:$/.test(line)
  );
}

function isMostlyUppercase(line: string): boolean {
  const letters = line.replace(/[^A-Za-zÇĞİÖŞÜÂÎÛçğıöşüâîû]/g, "");
  if (letters.length === 0) {
    return false;
  }

  const uppercase = letters.replace(/[a-zçğıöşüâîû]/g, "");
  return uppercase.length / letters.length >= 0.7;
}

function formatContent(lines: string[]): string {
  const paragraphs: string[] = [];
  let buffer = "";

  const flush = () => {
    const normalized = buffer.replace(/\s+/g, " ").trim();
    if (normalized.length > 0) {
      paragraphs.push(normalized);
    }
    buffer = "";
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) {
      flush();
      continue;
    }

    if (buffer.length === 0) {
      buffer = line;
      continue;
    }

    if (buffer.endsWith("-")) {
      buffer = `${buffer.slice(0, -1)}${line}`;
      continue;
    }

    buffer = `${buffer} ${line}`;
  }

  flush();

  return paragraphs
    .join("\n\n")
    .replace(/([A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû])-\n\n([a-zçğıöşü])/g, "$1$2")
    .replace(/\n\nSiyer-i Neb[^\n]*/g, "")
    .trim();
}

function buildSummary(content: string): string {
  if (content.length <= 240) {
    return content;
  }

  return `${content.slice(0, 237).trimEnd()}...`;
}

function slugify(value: string): string {
  const transliterated = value
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");

  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toTitleCase(value: string): string {
  return value
    .replace(/[.:;]+$/g, "")
    .toLocaleLowerCase("tr")
    .split(/\s+/)
    .map((word) => {
      if (word.length === 0) {
        return word;
      }

      return word[0].toLocaleUpperCase("tr") + word.slice(1);
    })
    .join(" ")
    .replace(/\bHz\./g, "Hz.")
    .replace(/\bİslam\b/g, "İslam")
    .replace(/\bMekke\b/g, "Mekke")
    .replace(/\bMedine\b/g, "Medine");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
