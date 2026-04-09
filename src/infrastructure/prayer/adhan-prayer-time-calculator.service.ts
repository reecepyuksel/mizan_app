import { Injectable } from "@nestjs/common";
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";
import tzLookup from "tz-lookup";

import {
  CalculateDailyPrayerTimesInput,
  PrayerTimeCalculatorPort,
} from "../../application/ports/services/prayer-time-calculator.port";
import { DailyPrayerTimes } from "../../domain/entities/prayer-times.entity";

@Injectable()
export class AdhanPrayerTimeCalculatorService implements PrayerTimeCalculatorPort {
  public calculateDaily(
    input: CalculateDailyPrayerTimesInput,
  ): DailyPrayerTimes {
    const timezone = tzLookup(input.latitude, input.longitude);

    const parameters = CalculationMethod.Other();
    parameters.fajrAngle = 18;
    parameters.ishaAngle = 17;
    parameters.madhab = Madhab.Hanafi;
    parameters.adjustments.dhuhr = 7;

    const coordinates = new Coordinates(input.latitude, input.longitude);
    const date = new Date(
      Date.UTC(
        input.date.getUTCFullYear(),
        input.date.getUTCMonth(),
        input.date.getUTCDate(),
        12,
        0,
        0,
      ),
    );
    const prayerTimes = new PrayerTimes(coordinates, date, parameters);

    return {
      date: this.formatDate(input.date, timezone),
      latitude: input.latitude,
      longitude: input.longitude,
      timezone,
      method: "diyanet",
      madhab: "hanafi",
      imsak: this.formatTime(prayerTimes.fajr, timezone),
      gunes: this.formatTime(prayerTimes.sunrise, timezone),
      ogle: this.formatTime(prayerTimes.dhuhr, timezone),
      ikindi: this.formatTime(prayerTimes.asr, timezone),
      aksam: this.formatTime(prayerTimes.maghrib, timezone),
      yatsi: this.formatTime(prayerTimes.isha, timezone),
    };
  }

  private formatTime(value: Date, timezone: string): string {
    return new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(value);
  }

  private formatDate(value: Date, timezone: string): string {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: timezone,
    }).format(value);
  }
}
