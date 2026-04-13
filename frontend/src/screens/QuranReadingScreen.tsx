import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getQuranPage,
  getQuranPageMeal,
  truncateText,
  type QuranPageMealResponse,
  type QuranPageResponse,
} from "../api/mizan";
import { BottomNav } from "../components/BottomNav";
import { TopBar } from "../components/TopBar";
import { colors } from "../theme";

export function QuranReadingScreen() {
  const [mode, setMode] = useState<"mushaf" | "meal">("mushaf");
  const [pageData, setPageData] = useState<QuranPageResponse | null>(null);
  const [mealData, setMealData] = useState<QuranPageMealResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadPage = async () => {
      try {
        const [pagePayload, mealPayload] = await Promise.all([
          getQuranPage(282, true),
          getQuranPageMeal(282),
        ]);

        if (!alive) {
          return;
        }

        setPageData(pagePayload);
        setMealData(mealPayload);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void loadPage();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <View style={styles.page}>
      <TopBar
        title={`Sayfa ${pageData?.page ?? 282}`}
        subtitle={
          pageData
            ? `${pageData.firstAyah.surahNumber}:${pageData.firstAyah.ayahNumber} - ${pageData.lastAyah.surahNumber}:${pageData.lastAyah.ayahNumber}`
            : "Kur'an Sayfası"
        }
        leftIcon="☰"
        rightIcon="⚙"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.toggleWrap}>
          <TouchableOpacity
            style={[styles.toggle, mode === "mushaf" && styles.toggleOn]}
            onPress={() => setMode("mushaf")}
          >
            <Text style={styles.toggleOnText}>Mushaf</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, mode === "meal" && styles.toggleOn]}
            onPress={() => setMode("meal")}
          >
            <Text
              style={
                mode === "meal" ? styles.toggleOnText : styles.toggleOffText
              }
            >
              Meal
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.canvas}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null}
          {mode === "mushaf"
            ? pageData?.items.slice(0, 6).map((ayah, index) => (
                <Text
                  key={ayah.id}
                  style={index === 0 ? styles.ar : styles.arBig}
                >
                  {ayah.arabicText}
                </Text>
              ))
            : mealData?.items.slice(0, 8).map((ayah) => (
                <Text
                  key={`${ayah.surahNumber}-${ayah.ayahNumber}`}
                  style={styles.mealText}
                >
                  {ayah.ayahNumber}. {truncateText(ayah.turkishMeal, 220)}
                </Text>
              ))}
        </View>

        <TouchableOpacity
          style={styles.fullMealBtn}
          onPress={() => setMode(mode === "mushaf" ? "meal" : "mushaf")}
        >
          <Text style={styles.fullMealText}>
            {mode === "mushaf"
              ? "Sayfayı Tam Meal Olarak Gör"
              : "Mushaf Görünümüne Dön"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav active="quran" />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  toggleWrap: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: colors.surfaceLow,
    borderRadius: 999,
    padding: 4,
    flexDirection: "row",
  },
  toggle: { paddingHorizontal: 28, paddingVertical: 10, borderRadius: 999 },
  toggleOn: { backgroundColor: colors.primary },
  toggleOnText: { color: colors.white, fontWeight: "700" },
  toggleOffText: { color: colors.secondary, fontWeight: "600" },
  canvas: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
  },
  ar: {
    textAlign: "right",
    fontSize: 38,
    lineHeight: 56,
    color: colors.primary,
  },
  arBig: {
    marginTop: 24,
    textAlign: "right",
    fontSize: 30,
    lineHeight: 50,
    color: colors.onSurface,
  },
  mealText: {
    marginTop: 16,
    fontSize: 18,
    lineHeight: 30,
    color: colors.onSurface,
  },
  fullMealBtn: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  fullMealText: { color: colors.primary, fontWeight: "700" },
});
