import { DailyPrayerTimes } from "../../../domain/entities/prayer-times.entity";

export interface CalculateDailyPrayerTimesInput {
  latitude: number;
  longitude: number;
  date: Date;
}

export interface PrayerTimeCalculatorPort {
  calculateDaily(input: CalculateDailyPrayerTimesInput): DailyPrayerTimes;
}
