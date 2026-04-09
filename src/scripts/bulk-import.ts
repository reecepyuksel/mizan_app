import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Sequelize } from "sequelize-typescript";

import { AppModule } from "../app.module";
import { SEQUELIZE } from "../infrastructure/database/database.constants";
import { AyahModel } from "../infrastructure/database/models/ayah.model";
import { HadithModel } from "../infrastructure/database/models/hadith.model";

type RawRecord = Record<string, unknown>;

interface HadithBookDocument {
  metadata?: {
    name?: string;
    sections?: Record<string, string>;
  };
  hadiths?: RawRecord[];
}

interface AyahImportPayload {
  id?: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  turkishMeal: string;
}

interface HadithImportPayload {
  id?: string;
  source: string;
  chapter?: string | null;
  content: string;
}

const logger = new Logger("BulkImport");

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const sequelize = app.get<Sequelize>(SEQUELIZE);

    const quranPath = resolveInputPath(
      process.env.QURAN_SOURCE ?? "data/quran-uthmani.xml",
    );
    const quranMealPath = resolveInputPath(
      process.env.QURAN_MEAL_SOURCE ?? "data/tr.diyanet.xml",
    );
    const hadithPaths = resolveMultipleInputPaths(
      process.env.HADITH_SOURCES ??
        process.env.HADITH_SOURCE ??
        "data/tur-bukhari.json,data/tur-muslim.json",
    );

    const quranRows = await loadQuranRows(quranPath, quranMealPath);
    const hadithRows = await loadHadithRows(hadithPaths);

    logger.log(
      `Kaynaklar: Quran=${path.basename(quranPath)} Hadith=${hadithPaths
        .map((filePath) => path.basename(filePath))
        .join(", ")}`,
    );

    if (quranRows.length === 0) {
      throw new Error(
        "Kur'an kaydi bulunamadi. Kaynak dosyalari kontrol edin.",
      );
    }

    if (hadithRows.length === 0) {
      throw new Error("Hadis kaydi bulunamadi. Kaynak dosyalari kontrol edin.");
    }

    const truncate = process.env.BULK_IMPORT_TRUNCATE === "true";

    await sequelize.transaction(async (transaction) => {
      if (truncate) {
        await HadithModel.destroy({ where: {}, truncate: true, transaction });
        await AyahModel.destroy({ where: {}, truncate: true, transaction });
      }

      await AyahModel.bulkCreate(
        quranRows as unknown as Array<Record<string, unknown>>,
        {
          transaction,
          validate: true,
        },
      );
      await HadithModel.bulkCreate(
        hadithRows as unknown as Array<Record<string, unknown>>,
        {
          transaction,
          validate: true,
        },
      );
    });

    logger.log(
      `Import tamamlandi. Ayah: ${quranRows.length}, Hadith: ${hadithRows.length}`,
    );
  } finally {
    await app.close();
  }
}

function resolveInputPath(input: string): string {
  if (path.isAbsolute(input)) {
    return input;
  }

  return path.join(process.cwd(), input);
}

function resolveMultipleInputPaths(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => resolveInputPath(item));
}

async function loadQuranRows(
  quranPath: string,
  quranMealPath: string,
): Promise<AyahImportPayload[]> {
  const extension = path.extname(quranPath).toLowerCase();
  let rows: AyahImportPayload[];

  if (extension === ".xml") {
    rows = await parseQuranXmlFile(quranPath);
  } else {
    rows = (await readJsonArray(quranPath)).map(normalizeAyahRecord);
  }

  const mealMap = await readQuranMealMap(quranMealPath);
  if (mealMap.size > 0) {
    rows = rows.map((row) => {
      const key = buildAyahKey(row.surahNumber, row.ayahNumber);
      const turkishMeal = mealMap.get(key);

      return {
        ...row,
        turkishMeal: turkishMeal ?? row.turkishMeal,
      };
    });
  }

  return rows.map((row) => ({
    ...row,
    turkishMeal:
      row.turkishMeal.trim().length > 0 ? row.turkishMeal : row.arabicText,
  }));
}

async function parseQuranXmlFile(
  filePath: string,
): Promise<AyahImportPayload[]> {
  const rawXml = await fs.readFile(filePath, "utf-8");
  const rows: AyahImportPayload[] = [];

  const suraRegex = /<sura\b[^>]*index="(\d+)"[^>]*>([\s\S]*?)<\/sura>/g;
  for (const suraMatch of rawXml.matchAll(suraRegex)) {
    const surahNumber = Number.parseInt(suraMatch[1], 10);
    const suraBody = suraMatch[2];

    const ayaRegex = /<aya\b[^>]*index="(\d+)"[^>]*text="([^"]*)"[^>]*\/>/g;
    for (const ayaMatch of suraBody.matchAll(ayaRegex)) {
      const ayahNumber = Number.parseInt(ayaMatch[1], 10);
      const arabicText = decodeXmlEntities(ayaMatch[2]);

      rows.push({
        surahNumber,
        ayahNumber,
        arabicText,
        turkishMeal: arabicText,
      });
    }
  }

  return rows;
}

async function readQuranMealMap(
  mealFilePath: string,
): Promise<Map<string, string>> {
  const extension = path.extname(mealFilePath).toLowerCase();
  if (extension === ".xml") {
    return readQuranMealMapFromXml(mealFilePath);
  }

  const map = new Map<string, string>();

  const rows = await readJsonArraySafe(mealFilePath);
  for (const row of rows) {
    const surahNumber = toNumber(
      row.surahNumber ?? row.surah_number ?? row.surah ?? row.sura,
    );
    const ayahNumber = toNumber(
      row.ayahNumber ?? row.ayah_number ?? row.ayah ?? row.verse,
    );
    const meal = toString(
      row.turkishMeal ?? row.turkish_meal ?? row.meal ?? row.translation,
    );

    if (!surahNumber || !ayahNumber || !meal) {
      continue;
    }

    map.set(buildAyahKey(surahNumber, ayahNumber), meal);
  }

  return map;
}

async function readQuranMealMapFromXml(
  mealFilePath: string,
): Promise<Map<string, string>> {
  const rawXml = await fs.readFile(mealFilePath, "utf-8");
  const map = new Map<string, string>();

  const suraRegex = /<sura\b[^>]*index="(\d+)"[^>]*>([\s\S]*?)<\/sura>/g;
  for (const suraMatch of rawXml.matchAll(suraRegex)) {
    const surahNumber = Number.parseInt(suraMatch[1], 10);
    const suraBody = suraMatch[2];

    const ayaRegex = /<aya\b[^>]*index="(\d+)"[^>]*text="([^"]*)"[^>]*\/>/g;
    for (const ayaMatch of suraBody.matchAll(ayaRegex)) {
      const ayahNumber = Number.parseInt(ayaMatch[1], 10);
      const mealText = decodeXmlEntities(ayaMatch[2]).trim();

      if (mealText.length === 0) {
        continue;
      }

      map.set(buildAyahKey(surahNumber, ayahNumber), mealText);
    }
  }

  return map;
}

async function loadHadithRows(
  filePaths: string[],
): Promise<HadithImportPayload[]> {
  const allRows: HadithImportPayload[] = [];
  let skippedCount = 0;

  for (const filePath of filePaths) {
    const raw = await fs.readFile(filePath, "utf-8");
    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      logger.warn(`Hadis dosyasi bos gecildi: ${path.basename(filePath)}`);
      continue;
    }

    const parsed = JSON.parse(trimmed) as unknown;

    if (Array.isArray(parsed)) {
      for (const item of parsed as RawRecord[]) {
        const normalized = normalizeHadithRecord(item);
        if (!normalized) {
          skippedCount += 1;
          continue;
        }
        allRows.push(normalized);
      }
      continue;
    }

    const document = parsed as HadithBookDocument;
    const sourceName =
      toString(document.metadata?.name) ??
      path.basename(filePath, path.extname(filePath));

    for (const item of document.hadiths ?? []) {
      const normalized = normalizeHadithRecord(item, sourceName, document);
      if (!normalized) {
        skippedCount += 1;
        continue;
      }
      allRows.push(normalized);
    }
  }

  if (skippedCount > 0) {
    logger.warn(
      `Icerigi bos/eksik oldugu icin atlanan hadis kaydi: ${skippedCount}`,
    );
  }

  return allRows;
}

async function readJsonArray(filePath: string): Promise<RawRecord[]> {
  const raw = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error(`JSON array bekleniyor: ${filePath}`);
  }

  return parsed as RawRecord[];
}

async function readJsonArraySafe(filePath: string): Promise<RawRecord[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      return [];
    }

    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as RawRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

function normalizeAyahRecord(row: RawRecord): AyahImportPayload {
  const arabicText = requiredString(
    row.arabicText ?? row.arabic_text ?? row.text_ar ?? row.arabic,
    "arabicText",
  );

  const turkishMeal = toString(
    row.turkishMeal ?? row.turkish_meal ?? row.meal ?? row.translation,
  );

  return {
    id: optionalString(row.id),
    surahNumber: requiredNumber(
      row.surahNumber ?? row.surah_number ?? row.surah ?? row.sura,
      "surahNumber",
    ),
    ayahNumber: requiredNumber(
      row.ayahNumber ?? row.ayah_number ?? row.ayah ?? row.verse,
      "ayahNumber",
    ),
    arabicText,
    turkishMeal: turkishMeal ?? arabicText,
  };
}

function normalizeHadithRecord(
  row: RawRecord,
  sourceOverride?: string,
  document?: HadithBookDocument,
): HadithImportPayload | null {
  const content = toString(row.content ?? row.text ?? row.hadith);
  if (!content) {
    return null;
  }

  const sectionBook =
    (row.reference as RawRecord | undefined)?.book ?? row.book ?? row.sectionId;
  const chapterFromSection = sectionBook
    ? toString(document?.metadata?.sections?.[String(sectionBook)])
    : undefined;

  return {
    id: optionalString(row.id),
    source:
      sourceOverride ??
      requiredString(row.source ?? row.book ?? row.collection, "source"),
    chapter: optionalString(
      row.chapter ?? row.topic ?? row.section ?? chapterFromSection,
    ),
    content,
  };
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function buildAyahKey(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`;
}

function toNumber(value: unknown): number | undefined {
  const numericValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return numericValue;
}

function toString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function requiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Zorunlu metin alani eksik: ${fieldName}`);
  }

  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  return toString(value);
}

function requiredNumber(value: unknown, fieldName: string): number {
  const numericValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(numericValue)) {
    throw new Error(`Zorunlu sayi alani eksik: ${fieldName}`);
  }

  return numericValue;
}

void bootstrap();
