import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Sequelize } from "sequelize-typescript";

import { SEQUELIZE } from "./database.constants";
import { AyahModel } from "./models/ayah.model";
import { HadithModel } from "./models/hadith.model";
import { KissaModel } from "./models/kissa.model";
import { NotificationDeviceModel } from "./models/notification-device.model";
import { UserFavoriteModel } from "./models/user-favorite.model";
import { UserNoteModel } from "./models/user-note.model";

export const databaseProviders: Provider[] = [
  {
    provide: SEQUELIZE,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): Sequelize => {
      return new Sequelize({
        dialect: "postgres",
        host: configService.get<string>("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 5432),
        database: configService.get<string>("DB_NAME", "mizan"),
        username: configService.get<string>("DB_USER", "mizan_user"),
        password: configService.get<string>("DB_PASSWORD", "mizan_pass"),
        schema: configService.get<string>("DB_SCHEMA", "public"),
        models: [
          AyahModel,
          HadithModel,
          KissaModel,
          NotificationDeviceModel,
          UserFavoriteModel,
          UserNoteModel,
        ],
        logging: false,
        benchmark: true,
        define: {
          underscored: true,
          timestamps: true,
        },
        pool: {
          max: 20,
          min: 2,
          acquire: 30000,
          idle: 10000,
        },
      });
    },
  },
];
