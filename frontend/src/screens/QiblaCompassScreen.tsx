import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getQiblaDirection, type QiblaDirection } from "../api/mizan";
import { BottomNav } from "../components/BottomNav";
import { TopBar } from "../components/TopBar";
import { colors } from "../theme";

export function QiblaCompassScreen() {
  const [direction, setDirection] = useState<QiblaDirection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadQibla = async () => {
      try {
        const payload = await getQiblaDirection();
        if (alive) {
          setDirection(payload);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void loadQibla();
    return () => {
      alive = false;
    };
  }, []);

  const angle = direction?.qiblaAzimuth ?? 151.5;

  return (
    <View style={styles.page}>
      <TopBar title="Kıble Pusulası" />
      <View style={styles.content}>
        <Text style={styles.head}>Yönünüzü Tayin Edin</Text>
        <Text style={styles.sub}>
          Kabe-i Muazzama'ya yönelmek için rehberiniz.
        </Text>

        <View style={styles.compassWrap}>
          <View style={styles.compass}>
            <Text style={styles.dirTop}>N</Text>
            <Text style={styles.dirRight}>E</Text>
            <Text style={styles.dirBottom}>S</Text>
            <Text style={styles.dirLeft}>W</Text>
            <View style={styles.center}>
              <Text style={styles.centerIcon}>⌖</Text>
            </View>
            <View
              style={[styles.arrow, { transform: [{ rotate: `${angle}deg` }] }]}
            >
              <Text style={styles.arrowHead}>▲</Text>
            </View>
          </View>
        </View>

        <View style={styles.info}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null}
          <Text style={styles.infoBadge}>
            ↻ Kıble Açısı {angle.toFixed(1)}°
          </Text>
          <Text style={styles.verse}>
            "Nereye dönerseniz dönün, Allah'ın vechi ordadır."
          </Text>
          <Text style={styles.map}>İstanbul koordinatlarıyla hesaplandı</Text>
        </View>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Canlı Kıble Verisi</Text>
        <Text style={styles.sheetText}>
          Backend üzerinden hesaplanan azimut değeri: {angle.toFixed(1)}°
        </Text>
        <TouchableOpacity style={styles.allow}>
          <Text style={styles.allowText}>Harita Görünümü Yakında</Text>
        </TouchableOpacity>
        <Text style={styles.later}>Mekke doğrultusuna göre gösteriliyor</Text>
      </View>
      <BottomNav active="more" />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  head: {
    fontSize: 34,
    lineHeight: 40,
    color: colors.primary,
    fontWeight: "700",
  },
  sub: { marginTop: 8, color: colors.secondary },
  compassWrap: { marginTop: 20, alignItems: "center" },
  compass: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  dirTop: { position: "absolute", top: 14, color: colors.outline },
  dirRight: { position: "absolute", right: 14, color: colors.outline },
  dirBottom: { position: "absolute", bottom: 14, color: colors.outline },
  dirLeft: { position: "absolute", left: 14, color: colors.outline },
  center: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  centerIcon: { fontSize: 40, color: colors.primaryContainer },
  arrow: { position: "absolute", top: 28 },
  arrowHead: { color: colors.primary, fontSize: 30 },
  info: { marginTop: 22, alignItems: "center" },
  infoBadge: {
    borderRadius: 999,
    backgroundColor: colors.primaryContainer,
    color: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontWeight: "700",
  },
  verse: {
    marginTop: 14,
    textAlign: "center",
    color: colors.onSurfaceVariant,
    fontStyle: "italic",
  },
  map: { marginTop: 10, color: colors.primary, fontWeight: "700" },
  sheet: {
    marginTop: 20,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 28,
  },
  sheetTitle: { fontSize: 30, color: colors.onSurface, fontWeight: "700" },
  sheetText: { marginTop: 8, color: colors.secondary },
  allow: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: "center",
  },
  allowText: { color: colors.white, fontWeight: "700" },
  later: { marginTop: 12, textAlign: "center", color: colors.secondary },
});
