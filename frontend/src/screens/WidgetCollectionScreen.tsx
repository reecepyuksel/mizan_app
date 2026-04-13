import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  type DailyPrayerTimes,
  type Hadith,
  formatCountdown,
  formatHadithSource,
  formatPrayerDateLabel,
  getDailyPrayerTimes,
  getNextPrayerInfo,
  listHadiths,
  truncateText,
} from "../api/mizan";
import { BottomNav } from "../components/BottomNav";
import { TopBar } from "../components/TopBar";
import { colors } from "../theme";

const FALLBACK_DAILY: DailyPrayerTimes = {
  date: "",
  latitude: 41.0082,
  longitude: 28.9784,
  timezone: "Europe/Istanbul",
  method: "diyanet",
  madhab: "hanafi",
  imsak: "05:42",
  gunes: "07:11",
  ogle: "13:12",
  ikindi: "15:48",
  aksam: "18:14",
  yatsi: "19:35",
};

const FALLBACK_HADITH: Hadith = {
  id: "fallback-widget-hadith",
  source: "Buhari",
  content: "Amellerin Allah'a en sevimli olanı, az da olsa devamlı olanıdır.",
};

const DAILY_KEYS: Array<{
  key: keyof Pick<
    DailyPrayerTimes,
    "imsak" | "gunes" | "ogle" | "ikindi" | "aksam" | "yatsi"
  >;
  short: string;
  full: string;
}> = [
  { key: "imsak", short: "İMS", full: "İmsak" },
  { key: "gunes", short: "GÜN", full: "Güneş" },
  { key: "ogle", short: "ÖĞL", full: "Öğle" },
  { key: "ikindi", short: "İKİNDİ", full: "İkindi" },
  { key: "aksam", short: "AKŞ", full: "Akşam" },
  { key: "yatsi", short: "YAT", full: "Yatsı" },
];

export function WidgetCollectionScreen() {
  const { width } = useWindowDimensions();
  const [daily, setDaily] = useState<DailyPrayerTimes>(FALLBACK_DAILY);
  const [hadith, setHadith] = useState<Hadith>(FALLBACK_HADITH);
  const [now, setNow] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;

    const loadDailyPrayerTimes = async () => {
      try {
        const [dailyPayload, hadiths] = await Promise.all([
          getDailyPrayerTimes(),
          listHadiths(1),
        ]);
        if (alive) {
          setDaily(dailyPayload);
          setHadith(hadiths[0] ?? FALLBACK_HADITH);
        }
      } catch {
        if (alive) {
          setDaily(FALLBACK_DAILY);
          setHadith(FALLBACK_HADITH);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void loadDailyPrayerTimes();
    const refreshInterval = setInterval(loadDailyPrayerTimes, 5 * 60 * 1000);

    return () => {
      alive = false;
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextPrayer = useMemo(() => {
    return getNextPrayerInfo(daily, now);
  }, [daily, now]);

  const prayerSlots = useMemo(
    () =>
      DAILY_KEYS.map((slot) => ({
        label: slot.short,
        full: slot.full,
        time: daily[slot.key],
        active: slot.full === nextPrayer.name,
      })),
    [daily, nextPrayer.name],
  );

  const miniSize = Math.max(146, Math.min(170, width * 0.42));
  const largeSize = Math.max(280, Math.min(380, width - 32));

  return (
    <View style={styles.page}>
      <TopBar title="İrfan" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Widget Koleksiyonu</Text>
          <Text style={styles.subtitle}>
            iOS ve Android için optimize edilmiş Emerald Serenity arayüzü.
          </Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Vakitler güncelleniyor...</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.label}>Minimalist (2x2)</Text>
        <View
          style={[styles.miniWidget, { width: miniSize, height: miniSize }]}
        >
          <View style={styles.miniTop}>
            <Text style={styles.miniIcon}>◷</Text>
            <View style={styles.dot} />
          </View>
          <View>
            <Text style={styles.miniCaption}>{nextPrayer.name}'ye</Text>
            <Text style={styles.miniTime}>
              {formatCountdown(nextPrayer.remainingMs)}
            </Text>
            <Text style={styles.miniHint}>Kalan Süre</Text>
          </View>
        </View>

        <Text style={styles.label}>Zaman Çizelgesi (4x2)</Text>
        <View style={styles.mediumWidget}>
          <View style={styles.mediumHead}>
            <View style={styles.mediumLeft}>
              <Text style={styles.mediumPin}>⌖</Text>
              <Text style={styles.mediumCity}>İstanbul</Text>
            </View>
            <Text style={styles.mediumDate}>
              {formatPrayerDateLabel(daily.date)}
            </Text>
          </View>
          <View style={styles.mediumSlots}>
            {prayerSlots.map((slot) => (
              <View
                key={slot.label}
                style={[
                  styles.slotWrap,
                  !slot.active && styles.slotWrapPassive,
                ]}
              >
                <Text
                  style={[styles.slotLabel, slot.active && styles.slotLabelOn]}
                >
                  {slot.label}
                </Text>
                <View style={[styles.slotBox, slot.active && styles.slotBoxOn]}>
                  <Text
                    style={[styles.slotTime, slot.active && styles.slotTimeOn]}
                  >
                    {slot.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.label}>Detaylı Panel (4x4)</Text>
        <View
          style={[
            styles.largeWidget,
            { width: largeSize, alignSelf: "center" },
          ]}
        >
          <View style={styles.largeTop}>
            <View style={styles.circleWrap}>
              <View style={styles.circleOuter}>
                <View style={styles.circleInner}>
                  <Text style={styles.circleTextTop}>Kalan</Text>
                  <Text style={styles.circleTextMain}>
                    {formatCountdown(nextPrayer.remainingMs)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.nextWrap}>
              <Text style={styles.nextLabel}>Sıradaki Vakit</Text>
              <Text style={styles.nextName}>{nextPrayer.name}</Text>
              <Text style={styles.nextTime}>{nextPrayer.time}</Text>
            </View>
          </View>

          <View style={styles.quickGrid}>
            <View style={styles.quickCard}>
              <Text style={styles.quickLabel}>İmsak</Text>
              <Text style={styles.quickTime}>{daily.imsak}</Text>
            </View>
            <View style={styles.quickCard}>
              <Text style={styles.quickLabel}>Öğle</Text>
              <Text style={styles.quickTime}>{daily.ogle}</Text>
            </View>
            <View style={styles.quickCard}>
              <Text style={styles.quickLabel}>Akşam</Text>
              <Text style={styles.quickTime}>{daily.aksam}</Text>
            </View>
          </View>

          <View style={styles.hadithCard}>
            <Text style={styles.hadithTitle}>Günün Hadisi</Text>
            <Text style={styles.hadithText}>
              "{truncateText(hadith.content, 108)}"
            </Text>
            <Text style={styles.hadithSrc}>
              — {formatHadithSource(hadith.source)}
            </Text>
          </View>
        </View>
      </ScrollView>
      <BottomNav active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 14,
  },
  titleWrap: { marginBottom: 8 },
  title: { fontSize: 34, color: colors.primary, fontWeight: "700" },
  subtitle: { marginTop: 4, color: colors.secondary, fontSize: 12 },
  loadingRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: { color: colors.onSurfaceVariant, fontSize: 12 },
  label: {
    marginTop: 8,
    fontSize: 10,
    color: colors.outline,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  miniWidget: {
    borderRadius: 40,
    backgroundColor: colors.white,
    padding: 20,
    justifyContent: "space-between",
  },
  miniTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniIcon: { fontSize: 24, color: colors.primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2b6954" },
  miniCaption: {
    fontSize: 11,
    color: colors.secondary,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  miniTime: {
    fontSize: 34,
    color: colors.primary,
    fontWeight: "700",
    lineHeight: 38,
    marginTop: 2,
  },
  miniHint: {
    marginTop: 4,
    fontSize: 10,
    color: colors.outlineVariant,
    fontStyle: "italic",
  },
  mediumWidget: {
    borderRadius: 40,
    backgroundColor: colors.surfaceLow,
    padding: 16,
  },
  mediumHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mediumLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  mediumPin: { color: colors.primaryContainer, fontSize: 14 },
  mediumCity: {
    color: colors.primaryContainer,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  mediumDate: { color: colors.outline, fontSize: 10, fontWeight: "600" },
  mediumSlots: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  slotWrap: { alignItems: "center", gap: 6 },
  slotWrapPassive: { opacity: 0.5 },
  slotLabel: { fontSize: 10, fontWeight: "700", color: colors.onSurface },
  slotLabelOn: { color: colors.primary, fontWeight: "800" },
  slotBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  slotBoxOn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  slotTime: { fontSize: 10, fontWeight: "700", color: colors.onSurface },
  slotTimeOn: { color: colors.white },
  largeWidget: {
    borderRadius: 42,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(191,201,195,0.3)",
    padding: 20,
    gap: 16,
  },
  largeTop: { flexDirection: "row", alignItems: "center" },
  circleWrap: {
    width: 132,
    height: 132,
    alignItems: "center",
    justifyContent: "center",
  },
  circleOuter: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 8,
    borderColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: { alignItems: "center" },
  circleTextTop: {
    fontSize: 10,
    textTransform: "uppercase",
    color: colors.outline,
    fontWeight: "700",
    letterSpacing: 1,
  },
  circleTextMain: {
    marginTop: 3,
    fontSize: 26,
    color: colors.primary,
    fontWeight: "700",
  },
  nextWrap: { flex: 1, alignItems: "flex-end" },
  nextLabel: {
    fontSize: 10,
    color: colors.primaryContainer,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  nextName: {
    marginTop: 4,
    fontSize: 34,
    color: colors.primary,
    fontWeight: "700",
    lineHeight: 36,
  },
  nextTime: { marginTop: 4, color: colors.secondary, fontWeight: "600" },
  quickGrid: { flexDirection: "row", gap: 8 },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.surfaceLow,
    paddingVertical: 10,
    alignItems: "center",
  },
  quickLabel: {
    fontSize: 10,
    color: colors.outline,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  quickTime: {
    marginTop: 4,
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
  },
  hadithCard: {
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    padding: 16,
  },
  hadithTitle: {
    fontSize: 10,
    color: colors.onPrimaryContainer,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  hadithText: {
    marginTop: 8,
    color: colors.white,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: "italic",
  },
  hadithSrc: {
    marginTop: 8,
    color: "rgba(255,255,255,0.65)",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "right",
  },
});
