import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { GetDailyPrayerTimesUseCase } from "../../application/use-cases/get-daily-prayer-times.use-case";
import { GetPrayerTimesRangeUseCase } from "../../application/use-cases/get-prayer-times-range.use-case";
import { PrayerTimesQueryDto } from "../dto/prayer-times-query.dto";
import { PrayerTimesRangeQueryDto } from "../dto/prayer-times-range-query.dto";

@Controller("prayer-times")
@ApiTags("Prayer Times")
export class PrayerTimesController {
  public constructor(
    private readonly getDailyPrayerTimesUseCase: GetDailyPrayerTimesUseCase,
    private readonly getPrayerTimesRangeUseCase: GetPrayerTimesRangeUseCase,
  ) {}

  @Get("daily")
  @ApiOperation({
    summary: "Koordinata gore gunluk namaz vakitleri (Diyanet, Hanafi)",
  })
  @ApiOkResponse({ description: "Gunluk namaz vakitleri" })
  public getDaily(@Query() query: PrayerTimesQueryDto) {
    return this.getDailyPrayerTimesUseCase.execute({
      latitude: query.lat,
      longitude: query.lon,
      date: this.parseDate(query.date),
    });
  }

  @Get("range")
  @ApiOperation({
    summary: "Koordinata gore cok gunlu namaz vakitleri (Diyanet, Hanafi)",
  })
  @ApiOkResponse({ description: "Gunluk vakit listesi" })
  public getRange(@Query() query: PrayerTimesRangeQueryDto) {
    return this.getPrayerTimesRangeUseCase.execute({
      latitude: query.lat,
      longitude: query.lon,
      startDate: this.parseDate(query.startDate),
      days: query.days,
    });
  }

  private parseDate(date?: string): Date {
    if (!date) {
      return new Date();
    }

    const [year, month, day] = date.split("-").map((value) => Number(value));
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }
}
