import { Inject, Injectable } from "@nestjs/common";
import { QueryTypes, Sequelize, Transaction } from "sequelize";

import {
  MobileSyncPort,
  PullSyncInput,
  PushSyncInput,
} from "../../application/ports/services/mobile-sync.port";
import { SEQUELIZE } from "../database/database.constants";

type SyncTableChanges = {
  created: Array<Record<string, unknown>>;
  updated: Array<Record<string, unknown>>;
  deleted: string[];
};

const ALLOWED_ENTITY_TYPES = new Set(["ayah", "hadith", "kissa"]);

@Injectable()
export class WatermelonSyncService implements MobileSyncPort {
  public constructor(
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
  ) {}

  public async pull(
    input: PullSyncInput,
  ): Promise<{ changes: Record<string, unknown>; timestamp: number }> {
    const since = this.toDate(input.lastPulledAt);
    const now = Date.now();

    const [ayahs, hadiths, kissas, favorites, notes] = await Promise.all([
      this.pullAyahs(since),
      this.pullHadiths(since),
      this.pullKissas(since),
      this.pullFavorites(input.deviceId, since),
      this.pullNotes(input.deviceId, since),
    ]);

    return {
      changes: {
        ayahs,
        hadiths,
        kissas,
        user_favorites: favorites,
        user_notes: notes,
      },
      timestamp: now,
    };
  }

  public async push(
    input: PushSyncInput,
  ): Promise<{ success: true; timestamp: number }> {
    const changes = input.changes as Record<string, unknown>;

    await this.sequelize.transaction(async (transaction) => {
      await this.applyFavoriteChanges(
        input.deviceId,
        (changes.user_favorites as Record<string, unknown>) ?? {},
        transaction,
      );
      await this.applyNoteChanges(
        input.deviceId,
        (changes.user_notes as Record<string, unknown>) ?? {},
        transaction,
      );
    });

    return {
      success: true,
      timestamp: Date.now(),
    };
  }

  private async pullAyahs(since: Date | null): Promise<SyncTableChanges> {
    const rows = await this.sequelize.query<Record<string, unknown>>(
      `
      SELECT
        id,
        surah_number,
        ayah_number,
        arabic_text,
        turkish_meal,
        EXTRACT(EPOCH FROM created_at) * 1000 AS created_at,
        EXTRACT(EPOCH FROM updated_at) * 1000 AS updated_at
      FROM ayahs
      WHERE (:since::timestamptz IS NULL OR updated_at > :since)
      ORDER BY updated_at ASC;
      `,
      {
        replacements: { since },
        type: QueryTypes.SELECT,
      },
    );

    return this.splitCreatedUpdated(rows, since);
  }

  private async pullHadiths(since: Date | null): Promise<SyncTableChanges> {
    const rows = await this.sequelize.query<Record<string, unknown>>(
      `
      SELECT
        id,
        source,
        chapter,
        content,
        EXTRACT(EPOCH FROM created_at) * 1000 AS created_at,
        EXTRACT(EPOCH FROM updated_at) * 1000 AS updated_at
      FROM hadiths
      WHERE (:since::timestamptz IS NULL OR updated_at > :since)
      ORDER BY updated_at ASC;
      `,
      {
        replacements: { since },
        type: QueryTypes.SELECT,
      },
    );

    return this.splitCreatedUpdated(rows, since);
  }

  private async pullKissas(since: Date | null): Promise<SyncTableChanges> {
    const rows = await this.sequelize.query<Record<string, unknown>>(
      `
      SELECT
        id,
        title,
        content,
        EXTRACT(EPOCH FROM created_at) * 1000 AS created_at,
        EXTRACT(EPOCH FROM updated_at) * 1000 AS updated_at
      FROM kissas
      WHERE (:since::timestamptz IS NULL OR updated_at > :since)
      ORDER BY updated_at ASC;
      `,
      {
        replacements: { since },
        type: QueryTypes.SELECT,
      },
    );

    return this.splitCreatedUpdated(rows, since);
  }

  private async pullFavorites(
    deviceId: string,
    since: Date | null,
  ): Promise<SyncTableChanges> {
    const activeRows = await this.sequelize.query<Record<string, unknown>>(
      `
      SELECT
        id,
        device_id,
        entity_type,
        entity_id,
        EXTRACT(EPOCH FROM created_at) * 1000 AS created_at,
        EXTRACT(EPOCH FROM updated_at) * 1000 AS updated_at
      FROM user_favorites
      WHERE device_id = :deviceId
        AND deleted_at IS NULL
        AND (:since::timestamptz IS NULL OR updated_at > :since)
      ORDER BY updated_at ASC;
      `,
      {
        replacements: { deviceId, since },
        type: QueryTypes.SELECT,
      },
    );

    const deletedRows = await this.sequelize.query<{ id: string }>(
      `
      SELECT id
      FROM user_favorites
      WHERE device_id = :deviceId
        AND deleted_at IS NOT NULL
        AND (:since::timestamptz IS NOT NULL AND deleted_at > :since);
      `,
      {
        replacements: { deviceId, since },
        type: QueryTypes.SELECT,
      },
    );

    const split = this.splitCreatedUpdated(activeRows, since);
    split.deleted = deletedRows.map((row) => row.id);
    return split;
  }

  private async pullNotes(
    deviceId: string,
    since: Date | null,
  ): Promise<SyncTableChanges> {
    const activeRows = await this.sequelize.query<Record<string, unknown>>(
      `
      SELECT
        id,
        device_id,
        entity_type,
        entity_id,
        note,
        EXTRACT(EPOCH FROM created_at) * 1000 AS created_at,
        EXTRACT(EPOCH FROM updated_at) * 1000 AS updated_at
      FROM user_notes
      WHERE device_id = :deviceId
        AND deleted_at IS NULL
        AND (:since::timestamptz IS NULL OR updated_at > :since)
      ORDER BY updated_at ASC;
      `,
      {
        replacements: { deviceId, since },
        type: QueryTypes.SELECT,
      },
    );

    const deletedRows = await this.sequelize.query<{ id: string }>(
      `
      SELECT id
      FROM user_notes
      WHERE device_id = :deviceId
        AND deleted_at IS NOT NULL
        AND (:since::timestamptz IS NOT NULL AND deleted_at > :since);
      `,
      {
        replacements: { deviceId, since },
        type: QueryTypes.SELECT,
      },
    );

    const split = this.splitCreatedUpdated(activeRows, since);
    split.deleted = deletedRows.map((row) => row.id);
    return split;
  }

  private splitCreatedUpdated(
    rows: Array<Record<string, unknown>>,
    since: Date | null,
  ): SyncTableChanges {
    if (!since) {
      return {
        created: rows,
        updated: [],
        deleted: [],
      };
    }

    const sinceMs = since.getTime();
    const created: Array<Record<string, unknown>> = [];
    const updated: Array<Record<string, unknown>> = [];

    for (const row of rows) {
      const createdAt = Number(row.created_at ?? 0);
      if (createdAt > sinceMs) {
        created.push(row);
      } else {
        updated.push(row);
      }
    }

    return {
      created,
      updated,
      deleted: [],
    };
  }

  private async applyFavoriteChanges(
    deviceId: string,
    tableChanges: Record<string, unknown>,
    transaction: Transaction,
  ): Promise<void> {
    const created = this.asRecordArray(tableChanges.created);
    const updated = this.asRecordArray(tableChanges.updated);
    const deleted = this.asStringArray(tableChanges.deleted);

    for (const row of [...created, ...updated]) {
      const entityType = String(row.entity_type ?? row.entityType ?? "");
      if (!ALLOWED_ENTITY_TYPES.has(entityType)) {
        continue;
      }

      await this.sequelize.query(
        `
        INSERT INTO user_favorites (
          id,
          device_id,
          entity_type,
          entity_id,
          created_at,
          updated_at,
          deleted_at
        ) VALUES (
          :id,
          :deviceId,
          :entityType,
          :entityId,
          NOW(),
          NOW(),
          NULL
        )
        ON CONFLICT (id)
        DO UPDATE SET
          device_id = EXCLUDED.device_id,
          entity_type = EXCLUDED.entity_type,
          entity_id = EXCLUDED.entity_id,
          updated_at = NOW(),
          deleted_at = NULL;
        `,
        {
          replacements: {
            id: String(row.id),
            deviceId,
            entityType,
            entityId: String(row.entity_id ?? row.entityId),
          },
          type: QueryTypes.INSERT,
          transaction,
        },
      );
    }

    if (deleted.length > 0) {
      await this.sequelize.query(
        `
        UPDATE user_favorites
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE device_id = :deviceId
          AND id = ANY(:deletedIds::uuid[]);
        `,
        {
          replacements: { deviceId, deletedIds: deleted },
          type: QueryTypes.UPDATE,
          transaction,
        },
      );
    }
  }

  private async applyNoteChanges(
    deviceId: string,
    tableChanges: Record<string, unknown>,
    transaction: Transaction,
  ): Promise<void> {
    const created = this.asRecordArray(tableChanges.created);
    const updated = this.asRecordArray(tableChanges.updated);
    const deleted = this.asStringArray(tableChanges.deleted);

    for (const row of [...created, ...updated]) {
      const entityType = String(row.entity_type ?? row.entityType ?? "");
      if (!ALLOWED_ENTITY_TYPES.has(entityType)) {
        continue;
      }

      const note = String(row.note ?? "").trim();
      if (note.length === 0) {
        continue;
      }

      await this.sequelize.query(
        `
        INSERT INTO user_notes (
          id,
          device_id,
          entity_type,
          entity_id,
          note,
          created_at,
          updated_at,
          deleted_at
        ) VALUES (
          :id,
          :deviceId,
          :entityType,
          :entityId,
          :note,
          NOW(),
          NOW(),
          NULL
        )
        ON CONFLICT (id)
        DO UPDATE SET
          device_id = EXCLUDED.device_id,
          entity_type = EXCLUDED.entity_type,
          entity_id = EXCLUDED.entity_id,
          note = EXCLUDED.note,
          updated_at = NOW(),
          deleted_at = NULL;
        `,
        {
          replacements: {
            id: String(row.id),
            deviceId,
            entityType,
            entityId: String(row.entity_id ?? row.entityId),
            note,
          },
          type: QueryTypes.INSERT,
          transaction,
        },
      );
    }

    if (deleted.length > 0) {
      await this.sequelize.query(
        `
        UPDATE user_notes
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE device_id = :deviceId
          AND id = ANY(:deletedIds::uuid[]);
        `,
        {
          replacements: { deviceId, deletedIds: deleted },
          type: QueryTypes.UPDATE,
          transaction,
        },
      );
    }
  }

  private asRecordArray(value: unknown): Array<Record<string, unknown>> {
    return Array.isArray(value)
      ? (value.filter(
          (item) => typeof item === "object" && item !== null,
        ) as Array<Record<string, unknown>>)
      : [];
  }

  private asStringArray(value: unknown): string[] {
    return Array.isArray(value)
      ? value
          .filter((item) => typeof item === "string")
          .map((item) => String(item))
      : [];
  }

  private toDate(value?: number): Date | null {
    if (value === undefined || value === null) {
      return null;
    }

    if (!Number.isFinite(value) || value < 0) {
      return null;
    }

    return new Date(value);
  }
}
