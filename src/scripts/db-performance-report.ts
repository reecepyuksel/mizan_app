import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";

import { AppModule } from "../app.module";
import { SEQUELIZE } from "../infrastructure/database/database.constants";

type ExplainRow = {
  "QUERY PLAN": string;
};

const logger = new Logger("DbPerformanceReport");

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const sequelize = app.get<Sequelize>(SEQUELIZE);
    const perfDeviceId = process.env.PERF_DEVICE_ID ?? "phase4_device_1";
    const perfSearchTerm = process.env.PERF_SEARCH_TERM ?? "rahmet";

    const reports = [
      {
        name: "Ayet FTS",
        sql: `
          SELECT id
          FROM ayahs
          WHERE search_vector @@ (plainto_tsquery('mizan_ar', :query) || plainto_tsquery('mizan_tr', :query))
          ORDER BY ts_rank(search_vector, plainto_tsquery('mizan_tr', :query)) DESC
          LIMIT 20;
        `,
        replacements: { query: perfSearchTerm },
      },
      {
        name: "Hadis FTS",
        sql: `
          SELECT id
          FROM hadiths
          WHERE search_vector @@ (plainto_tsquery('mizan_ar', :query) || plainto_tsquery('mizan_tr', :query))
          ORDER BY ts_rank(search_vector, plainto_tsquery('mizan_tr', :query)) DESC
          LIMIT 20;
        `,
        replacements: { query: perfSearchTerm },
      },
      {
        name: "Ayet Listeleme",
        sql: `
          SELECT id
          FROM ayahs
          WHERE surah_number = :surahNumber
          ORDER BY surah_number ASC, ayah_number ASC
          LIMIT 20 OFFSET 0;
        `,
        replacements: { surahNumber: 1 },
      },
      {
        name: "Sync Favori Pull",
        sql: `
          SELECT id
          FROM user_favorites
          WHERE device_id = :deviceId
            AND deleted_at IS NULL
          ORDER BY updated_at ASC;
        `,
        replacements: { deviceId: perfDeviceId },
      },
      {
        name: "Bildirim Token Lookup",
        sql: `
          SELECT fcm_token
          FROM notification_devices
          WHERE device_id = :deviceId
            AND is_active = true;
        `,
        replacements: { deviceId: perfDeviceId },
      },
    ];

    for (const report of reports) {
      try {
        await printExplainReport(
          sequelize,
          report.name,
          report.sql,
          report.replacements,
        );
      } catch (error) {
        logger.error(
          `${report.name} benchmark basarisiz oldu: ${(error as Error).message}`,
        );
      }
    }
  } finally {
    await app.close();
  }
}

async function printExplainReport(
  sequelize: Sequelize,
  name: string,
  sql: string,
  replacements: Record<string, unknown>,
): Promise<void> {
  const rows = await sequelize.query<ExplainRow>(
    `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${sql}`,
    {
      replacements,
      type: QueryTypes.SELECT,
    },
  );

  const lines = rows.map((row) => row["QUERY PLAN"]);
  const executionLine =
    lines.find((line) => line.includes("Execution Time")) ??
    "Execution Time: bilinmiyor";
  const scanLines = lines.filter(
    (line) =>
      line.includes("Index") ||
      line.includes("Bitmap") ||
      line.includes("Seq Scan"),
  );

  logger.log(`=== ${name} ===`);
  logger.log(executionLine);
  for (const line of scanLines.slice(0, 5)) {
    logger.log(line.trim());
  }
}

void bootstrap();
