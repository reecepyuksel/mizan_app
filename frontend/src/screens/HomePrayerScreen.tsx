import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  type Ayah,
  type DailyPrayerTimes,
  type Hadith,
  formatCountdown,
  formatHadithSource,
  formatPrayerDateLabel,
  getAyahReference,
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

const FALLBACK_AYAH: Ayah = {
  id: "fallback-ayah",
  surahNumber: 2,
  ayahNumber: 43,
  arabicText: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ",
  turkishMeal: "Namazı kılın, zekâtı verin...",
};

const FALLBACK_HADITH: Hadith = {
  id: "fallback-hadith",
  source: "Hadis-i Şerif",
  content: "Namaz, müminin miracıdır.",
};

export function HomePrayerScreen() {
  const [daily, setDaily] = useState<DailyPrayerTimes>(FALLBACK_DAILY);
  const [ayah, setAyah] = useState<Ayah>(FALLBACK_AYAH);
  const [hadith, setHadith] = useState<Hadith>(FALLBACK_HADITH);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadHomeData = async () => {
      try {
        const [dailyPayload, ayahPayload, hadithPayload] = await Promise.all([
          getDailyPrayerTimes(),
          getAyahReference(2, 43, true),
          listHadiths(1),
        ]);

        if (!alive) {
          return;
        }

        setDaily(dailyPayload);
        setAyah({
          id: String(ayahPayload.id ?? "ayah-reference"),
          surahNumber: ayahPayload.surahNumber,
          ayahNumber: ayahPayload.ayahNumber,
          arabicText: ayahPayload.arabicText,
          turkishMeal: ayahPayload.turkishMeal ?? FALLBACK_AYAH.turkishMeal,
        });
        setHadith(hadithPayload[0] ?? FALLBACK_HADITH);
      } catch {
        if (!alive) {
          return;
        }

        setDaily(FALLBACK_DAILY);
        setAyah(FALLBACK_AYAH);
        setHadith(FALLBACK_HADITH);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void loadHomeData();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextPrayer = useMemo(() => getNextPrayerInfo(daily, now), [daily, now]);

  const prayerItems = useMemo(
    () => [
      { label: "İmsak", time: daily.imsak },
      { label: "Güneş", time: daily.gunes },
      { label: "Öğle", time: daily.ogle },
      { label: "İkindi", time: daily.ikindi },
      { label: "Akşam", time: daily.aksam },
      { label: "Yatsı", time: daily.yatsi },
    ],
    [daily],
  );

  return (
    <View style={styles.page}>
      <View style={styles.sync}>
        <Text style={styles.syncText}>
          {loading ? "sessizce senkronize ediliyor" : "veriler güncellendi"}
        </Text>
      </View>
      <TopBar title="İrfan" subtitle="İstanbul, TR" />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null}
        <View style={styles.heroCircle}>
          <Text style={styles.next}>Sıradaki Vakit</Text>
          <Text style={styles.name}>{nextPrayer.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {formatCountdown(nextPrayer.remainingMs)} kaldı
            </Text>
          </View>
        </View>
        <Text style={styles.quote}>“{truncateText(hadith.content, 56)}”</Text>
        <Text style={styles.quoteSub}>{formatHadithSource(hadith.source)}</Text>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Vakitler</Text>
          <Text style={styles.sectionDate}>
            {formatPrayerDateLabel(daily.date)}
          </Text>
        </View>
        <View style={styles.grid}>
          {prayerItems.map((item) => {
            const isActive = item.label === nextPrayer.name;
            return (
              <View
                key={item.label}
                style={[styles.cell, isActive && styles.cellActive]}
              >
                <Text style={[styles.cellLabel, isActive && styles.white]}>
                  {item.label}
                </Text>
                <Text style={[styles.cellTime, isActive && styles.white]}>
                  {item.time}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.ayahCard}>
          <Text style={styles.ayahTitle}>Günün Ayeti</Text>
          <Text style={styles.ar}>{ayah.arabicText}</Text>
          <Text style={styles.tr}>"{ayah.turkishMeal}"</Text>
          <Text style={styles.src}>
            {ayah.surahNumber}. Sure, {ayah.ayahNumber}. Ayet
          </Text>
        </View>
      </ScrollView>
      <BottomNav active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  sync: {
    alignItems: "center",
    paddingVertical: 4,
    backgroundColor: "rgba(245,243,239,0.7)",
  },
  syncText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
  },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  loaderWrap: { marginTop: 8, alignItems: "center" },
  heroCircle: {
    marginTop: 18,
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 12,
    borderColor: colors.surfaceContainer,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  next: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
  },
  name: { fontSize: 36, fontWeight: "700", color: colors.primary },
  badge: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: colors.white, fontWeight: "600", fontSize: 13 },
  quote: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 18,
    fontStyle: "italic",
    color: colors.onSurfaceVariant,
  },
  quoteSub: {
    textAlign: "center",
    fontSize: 11,
    color: colors.outline,
    marginBottom: 24,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 28, color: colors.primary, fontWeight: "700" },
  sectionDate: { fontSize: 12, color: colors.outline },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: {
    width: "31%",
    minWidth: 100,
    backgroundColor: colors.surfaceLow,
    borderRadius: 16,
    padding: 14,
  },
  cellActive: { backgroundColor: colors.primaryContainer },
  cellLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    color: colors.outline,
  },
  cellTime: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },
  white: { color: colors.white },
  ayahCard: {
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    backgroundColor: colors.white,
  },
  ayahTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  ar: {
    marginTop: 12,
    fontSize: 28,
    textAlign: "right",
    color: colors.primary,
  },
  tr: { marginTop: 12, fontSize: 20, color: colors.onSurface },
  src: { marginTop: 12, fontSize: 12, color: colors.outline },
});
