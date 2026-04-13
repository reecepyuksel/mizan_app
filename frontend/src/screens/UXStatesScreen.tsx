import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { DimensionValue } from "react-native";
import { BottomNav } from "../components/BottomNav";
import { TopBar } from "../components/TopBar";
import { colors } from "../theme";

const Skeleton = ({ h, w }: { h: number; w: DimensionValue }) => (
  <View style={[styles.skeleton, { height: h, width: w }]} />
);

export function UXStatesScreen() {
  return (
    <View style={styles.page}>
      <TopBar title="İrfan" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.head}>Sistem Durumları</Text>
        <Text style={styles.subhead}>Yükleme, boş ve hata durumları</Text>

        <Text style={styles.section}>Yükleme Durumu</Text>
        <View style={styles.box}>
          <Skeleton h={180} w="100%" />
          <Skeleton h={24} w="70%" />
          <Skeleton h={12} w="100%" />
          <Skeleton h={12} w="85%" />
        </View>

        <Text style={styles.section}>Boş Durum</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>◌</Text>
          <Text style={styles.emptyTitle}>Henüz içerik eklenmedi</Text>
          <Text style={styles.emptyText}>
            Yeni bir içerik ekleyerek başlayın.
          </Text>
          <TouchableOpacity style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>İçerik Ekle</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>Hata Durumu</Text>
        <View style={styles.error}>
          <Text style={styles.errorTitle}>Bağlantı Hatası</Text>
          <Text style={styles.errorText}>Sunucuyla bağlantı kurulamadı.</Text>
          <View style={styles.errorBtns}>
            <TouchableOpacity style={styles.retry}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.help}>Destek Al</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <BottomNav active="more" />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  head: {
    marginTop: 16,
    fontSize: 34,
    color: colors.primary,
    fontWeight: "700",
  },
  subhead: { marginTop: 6, color: colors.secondary },
  section: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 12,
    color: colors.outline,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  box: {
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: 16,
    gap: 10,
  },
  skeleton: { borderRadius: 8, backgroundColor: colors.surfaceContainer },
  empty: {
    borderRadius: 24,
    backgroundColor: colors.surfaceLow,
    padding: 24,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 42, color: colors.outline },
  emptyTitle: {
    marginTop: 8,
    fontSize: 24,
    color: colors.primary,
    fontWeight: "700",
  },
  emptyText: { marginTop: 8, color: colors.onSurfaceVariant },
  emptyBtn: {
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyBtnText: { color: colors.white, fontWeight: "700" },
  error: {
    borderRadius: 16,
    backgroundColor: colors.errorContainer,
    padding: 18,
  },
  errorTitle: { fontSize: 22, color: "#93000a", fontWeight: "700" },
  errorText: { marginTop: 6, color: "#93000a" },
  errorBtns: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  retry: {
    borderRadius: 999,
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: { color: colors.white, fontWeight: "700" },
  help: { color: "#93000a", fontWeight: "600" },
});
