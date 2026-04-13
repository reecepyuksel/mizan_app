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
  getSirahById,
  listSirahs,
  truncateText,
  type Sirah,
} from "../api/mizan";
import { colors } from "../theme";

export function ReadingDetailScreen() {
  const [sirah, setSirah] = useState<Sirah | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadSirah = async () => {
      try {
        const list = await listSirahs(1);
        const first = list[0];

        if (!first) {
          return;
        }

        const detail = await getSirahById(first.id);
        if (alive) {
          setSirah(detail);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void loadSirah();
    return () => {
      alive = false;
    };
  }, []);

  const paragraphs = useMemo(() => {
    if (!sirah?.content) {
      return [];
    }

    const blocks = sirah.content
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (blocks.length > 0) {
      return blocks.slice(0, 4);
    }

    return sirah.content
      .split(/(?<=[.!?])\s+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);
  }, [sirah]);

  return (
    <View style={styles.page}>
      <View style={styles.progress} />
      <View style={styles.top}>
        <Text style={styles.icon}>←</Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Text style={styles.icon}>A</Text>
          <Text style={styles.icon}>🔖</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null}
        <Text style={styles.badge}>
          {sirah
            ? `${sirah.partTitle} • Ünite ${sirah.unitNumber}`
            : "Siyer-i Nebi • Okuma"}
        </Text>
        <Text style={styles.title}>
          {sirah?.title ?? "Siyer detayı yükleniyor"}
        </Text>
        <Text style={styles.lead}>
          {sirah?.summary ??
            "Seçilen siyer kaydının özeti burada gösterilecek."}
        </Text>
        <View style={styles.imageMock}>
          <Text style={styles.imageMockText}>
            {sirah?.unitTitle ?? "Görsel Alanı"}
          </Text>
        </View>
        {paragraphs.slice(0, 2).map((paragraph) => (
          <Text key={paragraph} style={styles.p}>
            {paragraph}
          </Text>
        ))}
        <Text style={styles.quote}>
          "
          {truncateText(
            sirah?.unitTitle ?? sirah?.summary ?? "Siyer-i Nebi",
            72,
          )}
          "
        </Text>
        {paragraphs.slice(2).map((paragraph) => (
          <Text key={paragraph} style={styles.p}>
            {paragraph}
          </Text>
        ))}

        <View style={styles.finish}>
          <Text style={styles.finishTitle}>Bu bölümü tamamladınız</Text>
          <Text style={styles.finishSub}>
            {sirah
              ? `${sirah.order}. kayıt backend üzerinden yüklendi.`
              : "Okumanız kaydedildi."}
          </Text>
          <TouchableOpacity style={styles.finishBtn}>
            <Text style={styles.finishBtnText}>Bölümü Bitir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  progress: {
    height: 4,
    width: "35%",
    backgroundColor: colors.primaryContainer,
  },
  top: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  icon: { fontSize: 20, color: colors.primary },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  loadingWrap: { marginTop: 8, alignItems: "center" },
  badge: { marginTop: 8, fontSize: 11, color: colors.secondary },
  title: {
    marginTop: 10,
    fontSize: 40,
    lineHeight: 46,
    color: colors.primary,
    fontWeight: "700",
  },
  lead: {
    marginTop: 16,
    fontSize: 16,
    fontStyle: "italic",
    color: colors.onSurfaceVariant,
  },
  imageMock: {
    marginTop: 20,
    borderRadius: 24,
    height: 220,
    backgroundColor: colors.surfaceHighest,
    alignItems: "center",
    justifyContent: "center",
  },
  imageMockText: { color: colors.outline },
  p: { marginTop: 18, fontSize: 22, lineHeight: 42, color: colors.onSurface },
  quote: {
    marginTop: 22,
    borderLeftWidth: 4,
    borderLeftColor: "rgba(0,53,39,0.2)",
    paddingLeft: 16,
    fontSize: 28,
    color: colors.primaryContainer,
    fontStyle: "italic",
  },
  finish: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    alignItems: "center",
  },
  finishTitle: { fontSize: 28, color: colors.primary, fontWeight: "700" },
  finishSub: { marginTop: 6, color: colors.onSurfaceVariant },
  finishBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  finishBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
