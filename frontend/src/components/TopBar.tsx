import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme";

interface TopBarProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
}

export function TopBar({
  title,
  subtitle,
  leftIcon = "☰",
  rightIcon = "🔔",
}: TopBarProps) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.iconBtn}>
        <Text style={styles.icon}>{leftIcon}</Text>
      </TouchableOpacity>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity style={styles.iconBtn}>
        <Text style={styles.icon}>{rightIcon}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
  },
  center: { alignItems: "center", flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.3,
  },
  subtitle: { fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 18, color: colors.primary },
});
