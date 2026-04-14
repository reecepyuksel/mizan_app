import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const NOTIFICATION_STORAGE_KEY = "mizan_notification_settings";

export type SoundType = "default" | "makkah" | "madinah" | "istanbul" | "silent";

export type PrayerToggle = {
  imsak: boolean;
  gunes: boolean;
  ogle: boolean;
  ikindi: boolean;
  aksam: boolean;
  yatsi: boolean;
};

export type NotificationSettings = {
  prayers: PrayerToggle;
  reminderMinutes: number;
  sound: SoundType;
  adhan: SoundType;
  dailyAyahTime: string;
  dailyHadithTime: string;
  widgetStyle: "classic" | "modern" | "bento";
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  prayers: {
    imsak: true,
    gunes: true,
    ogle: true,
    ikindi: true,
    aksam: true,
    yatsi: true,
  },
  reminderMinutes: 10,
  sound: "default",
  adhan: "makkah",
  dailyAyahTime: "08:00",
  dailyHadithTime: "12:00",
  widgetStyle: "bento",
};

const timeStringToDate = (timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  now.setHours(h, m, 0, 0);
  return now;
};

export const scheduleAllNotifications = async (cfg: NotificationSettings, lat: number, lon: number) => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const { getDailyPrayerTimes } = await import("../api/mizan");
    
    const prayerTimes = await getDailyPrayerTimes(lat, lon);
    const now = new Date();
    const reminder = cfg.reminderMinutes * 60 * 1000;
    const prayerMap: { [key: string]: string } = {
      imsak: prayerTimes.imsak,
      gunes: prayerTimes.gunes,
      ogle: prayerTimes.ogle,
      ikindi: prayerTimes.ikindi,
      aksam: prayerTimes.aksam,
      yatsi: prayerTimes.yatsi,
    };

    for (const [key, enabled] of Object.entries(cfg.prayers) as [keyof PrayerToggle, boolean][]) {
      if (!enabled) continue;
      const timeStr = prayerMap[key];
      const target = new Date(`${now.toDateString()} ${timeStr}`);
      target.setTime(target.getTime() - reminder);
      
      if (target > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${key.charAt(0).toUpperCase() + key.slice(1)} vakti yaklaşıyor`,
            body: `Namaz ${key} ${cfg.reminderMinutes} dk içinde başlayacak.`,
          },
          trigger: target as any,
        });
      }
    }

    // Daily content
    const ayahDate = timeStringToDate(cfg.dailyAyahTime);
    if (ayahDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title: "Günün Ayeti", body: "Bugünün ayetini keşfet!" },
        trigger: ayahDate as any,
      });
    }
    const hadithDate = timeStringToDate(cfg.dailyHadithTime);
    if (hadithDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title: "Günün Hadisi", body: "Bugünün hadisini oku." },
        trigger: hadithDate as any,
      });
    }
  } catch (error) {
    console.error("Failed to schedule notifications:", error);
  }
};
