import { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HomePrayerScreen } from "./src/screens/HomePrayerScreen";
import { QuranReadingScreen } from "./src/screens/QuranReadingScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { HadithSirahListScreen } from "./src/screens/HadithSirahListScreen";
import { ReadingDetailScreen } from "./src/screens/ReadingDetailScreen";
import { NotificationStatesScreen } from "./src/screens/NotificationStatesScreen";
import { UXStatesScreen } from "./src/screens/UXStatesScreen";
import { QiblaCompassScreen } from "./src/screens/QiblaCompassScreen";
import { WidgetCollectionScreen } from "./src/screens/WidgetCollectionScreen";
import { colors } from "./src/theme";

type ScreenKey =
  | "ana_sayfa_vakitler"
  | "kur_an_okuma"
  | "geli_mi_arama"
  | "hadis_ve_siyer_listesi"
  | "okuma_modu_detay"
  | "bildirim_ve_durumlar"
  | "ux_durumlar"
  | "k_ble_pusulas"
  | "widget_koleksiyonu";

const screens: { key: ScreenKey; label: string }[] = [
  { key: "ana_sayfa_vakitler", label: "Ana Sayfa Vakitler" },
  { key: "kur_an_okuma", label: "Kur'an Okuma" },
  { key: "geli_mi_arama", label: "Gelişmiş Arama" },
  { key: "hadis_ve_siyer_listesi", label: "Hadis ve Siyer Listesi" },
  { key: "okuma_modu_detay", label: "Okuma Modu Detay" },
  { key: "bildirim_ve_durumlar", label: "Bildirim ve Durumlar" },
  { key: "ux_durumlar", label: "UX Durumları" },
  { key: "k_ble_pusulas", label: "Kıble Pusulası" },
  { key: "widget_koleksiyonu", label: "Widget Koleksiyonu" },
];

export default function App() {
  const [active, setActive] = useState<ScreenKey>("ana_sayfa_vakitler");

  const screen = useMemo(() => {
    if (active === "ana_sayfa_vakitler") return <HomePrayerScreen />;
    if (active === "kur_an_okuma") return <QuranReadingScreen />;
    if (active === "geli_mi_arama") return <SearchScreen />;
    if (active === "hadis_ve_siyer_listesi") return <HadithSirahListScreen />;
    if (active === "okuma_modu_detay") return <ReadingDetailScreen />;
    if (active === "bildirim_ve_durumlar") return <NotificationStatesScreen />;
    if (active === "ux_durumlar") return <UXStatesScreen />;
    if (active === "widget_koleksiyonu") return <WidgetCollectionScreen />;
    return <QiblaCompassScreen />;
  }, [active]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.pickerWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pickerContent}
        >
          {screens.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.pill, active === item.key && styles.pillOn]}
              onPress={() => setActive(item.key)}
            >
              <Text
                style={[
                  styles.pillText,
                  active === item.key && styles.pillTextOn,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.body}>{screen}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  pickerWrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.surfaceLow,
  },
  pickerContent: { paddingHorizontal: 10, paddingVertical: 10, gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  pillOn: { backgroundColor: colors.primary },
  pillText: { fontSize: 12, color: colors.onSurfaceVariant, fontWeight: "600" },
  pillTextOn: { color: colors.white },
  body: { flex: 1 },
});
