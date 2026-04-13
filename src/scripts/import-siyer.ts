import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { promises as fs } from "node:fs";
import net from "node:net";
import path from "node:path";
import { Sequelize } from "sequelize-typescript";

import { SirahModel } from "../infrastructure/database/models/sirah.model";

interface SirahImportRow {
  title: string;
  slug: string;
  category?: string;
  partTitle: string;
  unitNumber: string;
  unitTitle: string;
  order: number;
  summary: string;
  content: string;
}

const logger = new Logger("SirahImport");

async function bootstrap(): Promise<void> {
  await loadEnvFile();

  const inputPath = resolveInputPath(
    process.env.SIRAH_SOURCE ?? "data/siyer-nebi.json",
  );
  const rows = await loadRows(inputPath);

  if (rows.length === 0) {
    throw new Error("Siyer kaydi bulunamadi.");
  }

  if (isValidateOnlyMode()) {
    logger.log(
      `Siyer JSON dogrulandi: ${rows.length} kayit (${path.basename(inputPath)})`,
    );
    return;
  }

  const dbHost = process.env.DB_HOST ?? "localhost";
  const dbPort = Number.parseInt(process.env.DB_PORT ?? "5432", 10);
  const dbName = process.env.DB_NAME ?? "mizan";
  await ensureDatabaseReachable(dbHost, dbPort, dbName);

  const sequelize = new Sequelize({
    dialect: "postgres",
    host: dbHost,
    port: dbPort,
    database: dbName,
    username: process.env.DB_USER ?? "mizan_user",
    password: process.env.DB_PASSWORD ?? "mizan_pass",
    schema: process.env.DB_SCHEMA ?? "public",
    models: [SirahModel],
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  });

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const truncate = process.env.SIRAH_IMPORT_TRUNCATE === "true";
    if (truncate) {
      await SirahModel.destroy({ where: {}, truncate: true });
    }

    await SirahModel.bulkCreate(
      rows as unknown as Array<Record<string, unknown>>,
      {
        validate: true,
        updateOnDuplicate: [
          "title",
          "part_title",
          "unit_number",
          "unit_title",
          "order",
          "summary",
          "content",
          "updated_at",
        ],
      },
    );

    logger.log(
      `Siyer import tamamlandi: ${rows.length} kayit (${path.basename(inputPath)})`,
    );
  } finally {
    await sequelize.close();
  }
}

function isValidateOnlyMode(): boolean {
  return (
    process.argv.includes("--validate-only") ||
    process.env.SIRAH_VALIDATE_ONLY === "true"
  );
}

async function loadEnvFile(): Promise<void> {
  const envPath = path.join(process.cwd(), ".env");

  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex < 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw error;
    }
  }
}

function resolveInputPath(input: string): string {
  if (path.isAbsolute(input)) {
    return input;
  }

  return path.join(process.cwd(), input);
}

async function loadRows(filePath: string): Promise<SirahImportRow[]> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error(`JSON array bekleniyor: ${filePath}`);
  }

  return parsed.map((item, index) => normalizeRow(item, index));
}

function normalizeRow(input: unknown, index: number): SirahImportRow {
  const row = input as Record<string, unknown>;

  const title = toNonEmptyString(row.title, `title[${index}]`);
  const slug = toNonEmptyString(row.slug, `slug[${index}]`);
  const partTitle = toNonEmptyString(row.partTitle, `partTitle[${index}]`);
  const unitNumber = toNonEmptyString(row.unitNumber, `unitNumber[${index}]`);
  const unitTitle = toNonEmptyString(row.unitTitle, `unitTitle[${index}]`);
  const summary = toNonEmptyString(row.summary, `summary[${index}]`);
  const content = toNonEmptyString(row.content, `content[${index}]`);
  const order = toNumber(row.order, `order[${index}]`);

  return {
    title,
    slug,
    partTitle,
    unitNumber,
    unitTitle,
    order,
    summary,
    content,
  };
}

function toNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`${field} string olmali`);
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${field} bos olamaz`);
  }

  return trimmed;
}

function toNumber(value: unknown, field: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value ?? ""), 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${field} gecerli pozitif tam sayi olmali`);
  }

  return parsed;
}

async function ensureDatabaseReachable(
  host: string,
  port: number,
  database: string,
): Promise<void> {
  const isConfiguredPortReachable = await canConnectTcp(host, port);
  if (isConfiguredPortReachable) {
    return;
  }

  let hint = "";
  if (host === "localhost" && port !== 5432) {
    const isDefaultPostgresReachable = await canConnectTcp("localhost", 5432);
    if (isDefaultPostgresReachable) {
      hint =
        " localhost:5432 acik gorunuyor; .env icindeki DB_PORT degeri yanlis olabilir ya da Docker PostgreSQL ayakta degildir.";
    }
  }

  throw new Error(
    `PostgreSQL erisilemiyor (${host}:${port}/${database}).${hint}`,
  );
}

function canConnectTcp(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    const closeWith = (result: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(1500);
    socket.once("connect", () => closeWith(true));
    socket.once("timeout", () => closeWith(false));
    socket.once("error", () => closeWith(false));
  });
}

bootstrap().catch((error) => {
  const dbHost = process.env.DB_HOST ?? "localhost";
  const dbPort = process.env.DB_PORT ?? "5432";
  const dbName = process.env.DB_NAME ?? "mizan";

  console.error(
    `[SirahImport] Hata (${dbHost}:${dbPort}/${dbName}):`,
    error instanceof Error ? (error.stack ?? error.message) : String(error),
  );
  process.exitCode = 1;
});
