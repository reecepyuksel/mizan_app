import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme";

const items = [
  { key: "home", label: "Ana Sayfa", icon: "⌂" },
  { key: "quran", label: "Kur'an", icon: "📖" },
  { key: "search", label: "Arama", icon: "⌕" },
  { key: "more", label: "Diğer", icon: "⋯" },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const selected = active === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.item, selected && styles.active]}
          >
            <Text style={[styles.icon, selected && styles.activeText]}>
              {item.icon}
            </Text>
            <Text style={[styles.label, selected && styles.activeText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "rgba(251,249,245,0.92)",
  },
  item: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  active: {
    backgroundColor: colors.primary,
    minWidth: 84,
  },
  icon: { color: "rgba(0,53,39,0.55)", fontSize: 16 },
  label: {
    color: "rgba(0,53,39,0.55)",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
  },
  activeText: { color: colors.white },
});
