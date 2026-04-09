import { Injectable } from "@nestjs/common";

import { DailyPrayerTimes } from "../../domain/entities/prayer-times.entity";
import { GetDailyPrayerTimesUseCase } from "./get-daily-prayer-times.use-case";

interface GetPrayerTimesRangeInput {
  latitude: number;
  longitude: number;
  startDate: Date;
  days: number;
}

@Injectable()
export class GetPrayerTimesRangeUseCase {
  public constructor(
    private readonly getDailyPrayerTimesUseCase: GetDailyPrayerTimesUseCase,
  ) {}

  public execute(input: GetPrayerTimesRangeInput): DailyPrayerTimes[] {
    const results: DailyPrayerTimes[] = [];

    for (let i = 0; i < input.days; i += 1) {
      const date = new Date(input.startDate);
      date.setUTCDate(date.getUTCDate() + i);

      results.push(
        this.getDailyPrayerTimesUseCase.execute({
          latitude: input.latitude,
          longitude: input.longitude,
          date,
        }),
      );
    }

    return results;
  }
}
