import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  formatHadithSource,
  getAyahReference,
  listHadiths,
  listSirahs,
  searchAyahs,
  searchHadiths,
  searchKissas,
  searchSirahs,
  truncateText,
} from "../api/mizan";
import { BottomNav } from "../components/BottomNav";
import { TopBar } from "../components/TopBar";
import { colors } from "../theme";

const chips = ["Hepsi", "Ayet", "Hadis", "Siyer", "Kıssa"];

interface SearchItem {
  id: string;
  title: string;
  description: string;
  type: string;
}

export function SearchScreen() {
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState("Hepsi");
  const [featuredText, setFeaturedText] = useState(
    '"Ey iman edenler! Sabrederek ve namaz kılarak Allah\'tan yardım dileyin."',
  );
  const [featuredSrc, setFeaturedSrc] = useState("Bakara 153");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    const loadFeatured = async () => {
      try {
        const ayah = await getAyahReference(2, 153, true);
        if (!alive) {
          return;
        }

        setFeaturedText(`"${ayah.turkishMeal ?? ayah.arabicText}"`);
        setFeaturedSrc(`${ayah.surahNumber}:${ayah.ayahNumber}`);
      } catch {
        if (!alive) {
          return;
        }

        setFeaturedText(
          '"Ey iman edenler! Sabrederek ve namaz kılarak Allah\'tan yardım dileyin."',
        );
        setFeaturedSrc("Bakara 153");
      }
    };

    void loadFeatured();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadDefaultItems = async () => {
      setLoading(true);
      try {
        const [hadiths, sirahs, ayah] = await Promise.all([
          listHadiths(2),
          listSirahs(2),
          getAyahReference(112, 1, true),
        ]);

        if (!alive) {
          return;
        }

        const mapped: SearchItem[] = [
          {
            id: `ayah-${ayah.surahNumber}-${ayah.ayahNumber}`,
            title: `${ayah.surahNumber}. Sure ${ayah.ayahNumber}. Ayet`,
            description: truncateText(ayah.turkishMeal ?? ayah.arabicText, 84),
            type: "Ayet",
          },
          ...hadiths.map((item) => ({
            id: item.id,
            title: formatHadithSource(item.source),
            description: truncateText(item.content, 84),
            type: "Hadis",
          })),
          ...sirahs.map((item) => ({
            id: item.id,
            title: item.title,
            description: truncateText(item.summary, 84),
            type: "Siyer",
          })),
        ];

        setItems(
          activeChip === "Hepsi"
            ? mapped
            : mapped.filter((item) => item.type === activeChip),
        );
      } catch {
        if (alive) {
          setItems([]);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    const loadSearchResults = async () => {
      setLoading(true);
      try {
        let mapped: SearchItem[] = [];

        if (activeChip === "Hepsi") {
          const [ayahs, hadiths, sirahs, kissas] = await Promise.all([
            searchAyahs(query, 5),
            searchHadiths(query, 5),
            searchSirahs(query, 5),
            searchKissas(query, 5),
          ]);

          mapped = [
            ...ayahs.map((item) => ({
              id: item.id,
              title: `${item.surahNumber}. Sure ${item.ayahNumber}. Ayet`,
              description: truncateText(item.turkishMeal, 84),
              type: "Ayet",
            })),
            ...hadiths.map((item) => ({
              id: item.id,
              title: formatHadithSource(item.source),
              description: truncateText(item.content, 84),
              type: "Hadis",
            })),
            ...sirahs.map((item) => ({
              id: item.id,
              title: item.title,
              description: truncateText(item.summary, 84),
              type: "Siyer",
            })),
            ...kissas.map((item) => ({
              id: item.id,
              title: item.title,
              description: truncateText(item.content, 84),
              type: "Kıssa",
            })),
          ];
        } else if (activeChip === "Ayet") {
          const results = await searchAyahs(query, 12);
          mapped = results.map((item) => ({
            id: item.id,
            title: `${item.surahNumber}. Sure ${item.ayahNumber}. Ayet`,
            description: truncateText(item.turkishMeal, 84),
            type: "Ayet",
          }));
        } else if (activeChip === "Hadis") {
          const results = await searchHadiths(query, 12);
          mapped = results.map((item) => ({
            id: item.id,
            title: formatHadithSource(item.source),
            description: truncateText(item.content, 84),
            type: "Hadis",
          }));
        } else if (activeChip === "Siyer") {
          const results = await searchSirahs(query, 12);
          mapped = results.map((item) => ({
            id: item.id,
            title: item.title,
            description: truncateText(item.summary, 84),
            type: "Siyer",
          }));
        } else {
          const results = await searchKissas(query, 12);
          mapped = results.map((item) => ({
            id: item.id,
            title: item.title,
            description: truncateText(item.content, 84),
            type: "Kıssa",
          }));
        }

        if (alive) {
          setItems(mapped);
        }
      } catch {
        if (alive) {
          setItems([]);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    const timeout = setTimeout(() => {
      if (query.trim().length < 2) {
        void loadDefaultItems();
      } else {
        void loadSearchResults();
      }
    }, 250);

    return () => {
      alive = false;
      clearTimeout(timeout);
    };
  }, [activeChip, query]);

  const filteredItems = useMemo(() => {
    return items;
  }, [items]);

  return (
    <View style={styles.page}>
      <TopBar title="İrfan" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kütüphanede Ara</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>⌕</Text>
          <TextInput
            placeholder="Ayet, Hadis, Siyer ara..."
            placeholderTextColor={colors.outline}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 14 }}
        >
          {chips.map((c, i) => (
            <TouchableOpacity
              key={c}
              onPress={() => setActiveChip(c)}
              style={[styles.chip, activeChip === c && styles.chipOn]}
            >
              <Text
                style={[styles.chipText, activeChip === c && styles.chipOnText]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sub}>İlginizi Çekebilir</Text>
        <View style={styles.feature}>
          <Text style={styles.featureTag}>Günün Okuması</Text>
          <Text style={styles.featureText}>{featuredText}</Text>
          <Text style={styles.featureSrc}>{featuredSrc}</Text>
        </View>

        <Text style={styles.sub}>
          {query.trim().length >= 2 ? "Arama Sonuçları" : "Popüler İçerikler"}
        </Text>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null}
        {filteredItems.map((item) => (
          <View key={item.title} style={styles.row}>
            <View style={styles.iconBox}>
              <Text>{item.type[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDesc}>{item.description}</Text>
            </View>
          </View>
        ))}
        {filteredItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptyText}>
              Farklı bir kelime veya kategori ile tekrar deneyin.
            </Text>
          </View>
        ) : null}
      </ScrollView>
      <BottomNav active="search" />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  title: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: "700",
    color: colors.primary,
  },
  inputWrap: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceHighest,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  inputIcon: { color: colors.outline, fontSize: 18 },
  input: { flex: 1, fontSize: 18, paddingVertical: 16, marginLeft: 8 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceLow,
    marginRight: 8,
  },
  chipOn: { backgroundColor: colors.primary },
  chipText: { color: colors.onSurfaceVariant, fontWeight: "600" },
  chipOnText: { color: colors.white },
  sub: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 12,
    textTransform: "uppercase",
    color: colors.outline,
    fontWeight: "700",
  },
  feature: { backgroundColor: colors.primary, borderRadius: 24, padding: 20 },
  featureTag: { color: colors.white, fontSize: 10, textTransform: "uppercase" },
  featureText: {
    color: colors.white,
    fontSize: 24,
    lineHeight: 32,
    marginTop: 10,
  },
  featureSrc: { color: "rgba(255,255,255,0.75)", marginTop: 10 },
  row: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  rowDesc: { marginTop: 4, fontSize: 12, color: colors.onSurfaceVariant },
  loadingWrap: { alignItems: "center", marginBottom: 12 },
  emptyWrap: {
    marginTop: 6,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.surfaceLow,
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.primary },
  emptyText: { marginTop: 6, color: colors.onSurfaceVariant },
});
