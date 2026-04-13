import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme";

export function NotificationStatesScreen() {
  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <View style={styles.hero}>
          <View style={styles.float}>
            <Text style={styles.floatIcon}>🔔</Text>
          </View>
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>Vakitleri kaçırmayın</Text>
          <View style={styles.item}>
            <Text style={styles.itemIcon}>⏰</Text>
            <View>
              <Text style={styles.itemTitle}>Namaz vakitleri bildirimleri</Text>
              <Text style={styles.itemText}>
                Ezan vakitlerinden önce hatırlatıcı alın.
              </Text>
            </View>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemIcon}>📘</Text>
            <View>
              <Text style={styles.itemTitle}>Günlük Ayet ve Hadisler</Text>
              <Text style={styles.itemText}>
                Her gün ilham verici içerikler.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Bildirimleri Aç</Text>
          </TouchableOpacity>
          <Text style={styles.skip}>Daha Sonra</Text>
        </View>
      </View>
      <View style={styles.snack}>
        <Text style={styles.snackText}>✓ Senkronizasyon Başarılı</Text>
        <Text style={styles.ok}>Tamam</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    justifyContent: "center",
  },
  card: { borderRadius: 28, overflow: "hidden", backgroundColor: colors.white },
  hero: { height: 180, backgroundColor: colors.primaryContainer },
  float: {
    marginTop: 18,
    marginRight: 18,
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  floatIcon: { color: colors.white },
  body: { padding: 24 },
  title: {
    fontSize: 38,
    lineHeight: 44,
    color: colors.primary,
    fontWeight: "700",
  },
  item: { marginTop: 18, flexDirection: "row", gap: 12 },
  itemIcon: {
    width: 32,
    textAlign: "center",
    fontSize: 20,
    color: colors.primary,
  },
  itemTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  itemText: { marginTop: 2, fontSize: 13, color: colors.onSurfaceVariant },
  btn: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { color: colors.white, fontWeight: "700" },
  skip: {
    marginTop: 14,
    textAlign: "center",
    color: colors.primary,
    fontWeight: "600",
  },
  snack: {
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  snackText: { color: colors.white, fontWeight: "600" },
  ok: {
    color: "#80bea6",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 11,
  },
});
