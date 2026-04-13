import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  formatHadithSource,
  listHadiths,
  listSirahs,
  truncateText,
  type Hadith,
  type Sirah,
} from "../api/mizan";
import { BottomNav } from "../components/BottomNav";
import { TopBar } from "../components/TopBar";
import { colors } from "../theme";

export function HadithSirahListScreen() {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [sirahs, setSirahs] = useState<Sirah[]>([]);
  const [activeChip, setActiveChip] = useState("Hepsi");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadContent = async () => {
      try {
        const [hadithPayload, sirahPayload] = await Promise.all([
          listHadiths(8),
          listSirahs(4),
        ]);

        if (!alive) {
          return;
        }

        setHadiths(hadithPayload);
        setSirahs(sirahPayload);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void loadContent();
    return () => {
      alive = false;
    };
  }, []);

  const chips = useMemo(() => {
    const sourceChips = Array.from(
      new Set(hadiths.map((item) => formatHadithSource(item.source))),
    ).slice(0, 3);
    return ["Hepsi", ...sourceChips, "Siyer"];
  }, [hadiths]);

  const filteredHadiths = useMemo(() => {
    if (activeChip === "Hepsi") {
      return hadiths.slice(0, 4);
    }

    if (activeChip === "Siyer") {
      return [];
    }

    return hadiths.filter(
      (item) => formatHadithSource(item.source) === activeChip,
    );
  }, [activeChip, hadiths]);

  return (
    <View style={styles.page}>
      <TopBar title="Hadis-i Şerifler" />
      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {chips.map((chip) => (
            <TouchableOpacity
              key={chip}
              onPress={() => setActiveChip(chip)}
              style={[styles.chip, activeChip === chip && styles.chipOn]}
            >
              <Text
                style={[
                  styles.chipText,
                  activeChip === chip && styles.chipOnText,
                ]}
              >
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.chapter}>
          <Text style={styles.chapterTitle}>
            {activeChip === "Siyer" ? "Siyer Kayıtları" : "Hadis Listesi"}
          </Text>
          <Text style={styles.chapterSub}>
            {activeChip === "Siyer"
              ? `${sirahs.length} kayıt`
              : `${filteredHadiths.length} kayıt`}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null}

        {activeChip !== "Siyer"
          ? filteredHadiths.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.tag}>
                    {item.chapter
                      ? truncateText(item.chapter, 28)
                      : formatHadithSource(item.source)}
                  </Text>
                  <Text>🔖</Text>
                </View>
                <Text style={styles.contentText}>
                  {truncateText(item.content, 140)}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.ravi}>
                    Kaynak: {formatHadithSource(item.source)}
                  </Text>
                  <Text style={styles.readMore}>Okumaya Devam Et →</Text>
                </View>
              </View>
            ))
          : sirahs.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.tag}>{item.partTitle}</Text>
                  <Text>📘</Text>
                </View>
                <Text style={styles.contentText}>{item.title}</Text>
                <Text style={styles.rowSummary}>
                  {truncateText(item.summary, 140)}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.ravi}>Ünite: {item.unitNumber}</Text>
                  <Text style={styles.readMore}>Detayı Aç →</Text>
                </View>
              </View>
            ))}

        <View style={styles.chapter}>
          <Text style={styles.chapterTitle}>Siyer Notu</Text>
          <Text style={styles.chapterSub}>Öne çıkan kayıt</Text>
        </View>
        <View style={styles.sirahNote}>
          <Text style={styles.sirahTitle}>
            {sirahs[0]?.title ?? "Siyer kaydı"}
          </Text>
          <Text style={styles.sirahContent}>
            {sirahs[0]
              ? truncateText(sirahs[0].summary, 160)
              : "Siyer verisi yükleniyor..."}
          </Text>
        </View>
      </ScrollView>
      <BottomNav active="more" />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceHighest,
    marginRight: 8,
  },
  chipOn: { backgroundColor: colors.primary },
  chipText: { color: colors.onSurfaceVariant, fontWeight: "600", fontSize: 13 },
  chipOnText: { color: colors.white },
  chapter: {
    marginTop: 20,
    backgroundColor: colors.surfaceLow,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chapterTitle: { fontSize: 20, fontWeight: "700", color: colors.primary },
  chapterSub: {
    fontSize: 11,
    color: colors.outline,
    textTransform: "uppercase",
  },
  card: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    fontSize: 10,
    textTransform: "uppercase",
    color: colors.tertiaryContainer,
    backgroundColor: colors.tertiaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  contentText: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 34,
    color: colors.onSurface,
  },
  rowSummary: { marginTop: 10, color: colors.onSurfaceVariant, lineHeight: 22 },
  cardFooter: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceHighest,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ravi: { fontSize: 13, color: colors.secondary },
  readMore: { fontSize: 13, color: colors.primary, fontWeight: "700" },
  loadingWrap: { marginTop: 12, alignItems: "center" },
  sirahNote: {
    marginTop: 14,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighest,
  },
  sirahTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    color: colors.outline,
    fontWeight: "700",
  },
  sirahContent: { marginTop: 8, fontSize: 15, color: colors.secondary },
});
