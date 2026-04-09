import { Inject, Injectable } from "@nestjs/common";

import { DailyPrayerTimes } from "../../domain/entities/prayer-times.entity";
import {
  PrayerTimeCalculatorPort,
  CalculateDailyPrayerTimesInput,
} from "../ports/services/prayer-time-calculator.port";
import { PRAYER_TIME_CALCULATOR } from "../ports/services/service.tokens";

@Injectable()
export class GetDailyPrayerTimesUseCase {
  public constructor(
    @Inject(PRAYER_TIME_CALCULATOR)
    private readonly prayerTimeCalculator: PrayerTimeCalculatorPort,
  ) {}

  public execute(input: CalculateDailyPrayerTimesInput): DailyPrayerTimes {
    return this.prayerTimeCalculator.calculateDaily(input);
  }
}
