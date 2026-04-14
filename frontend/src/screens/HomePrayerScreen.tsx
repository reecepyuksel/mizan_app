import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useLocation } from "../context/LocationContext";
import {
  getDailyPrayerTimes,
  getNextPrayerInfo,
  getNextPrayerProgress,
  DailyPrayerTimes,
  getAyahReference,
  formatCountdown,
} from "../api/mizan";
import { NotificationOnboardingModal } from "../components/NotificationOnboardingModal";
import {
  scheduleAllNotifications,
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_STORAGE_KEY,
} from "../utils/notificationHelper";

const ONBOARDING_KEY = "mizan_onboarding_shown";
const SURAH_NAMES = [
  "Fâtiha",
  "Bakara",
  "Âl-i İmrân",
  "Nisâ",
  "Mâide",
  "En'âm",
  "A'râf",
  "Enfâl",
  "Tevbe",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ra'd",
  "İbrâhîm",
  "Hicr",
  "Nahl",
  "İsrâ",
  "Kehf",
  "Meryem",
  "Tâhâ",
  "Enbiyâ",
  "Hac",
  "Mü'minûn",
  "Nûr",
  "Furkân",
  "Şuarâ",
  "Neml",
  "Kasas",
  "Ankebût",
  "Rûm",
  "Lokmân",
  "Secde",
  "Ahzâb",
  "Sebe'",
  "Fâtır",
  "Yâsîn",
  "Sâffât",
  "Sâd",
  "Zümer",
  "Mü'min",
  "Fussilet",
  "Şûrâ",
  "Zuhruf",
  "Duhân",
  "Câsiye",
  "Ahkâf",
  "Muhammed",
  "Fetih",
  "Hucurât",
  "Kâf",
  "Zâriyât",
  "Tûr",
  "Necm",
  "Kamer",
  "Rahmân",
  "Vâkıa",
  "Hadîd",
  "Mücâdele",
  "Haşr",
  "Mümtehine",
  "Saf",
  "Cum'a",
  "Münâfikûn",
  "Teğâbün",
  "Talâk",
  "Tahrîm",
  "Mülk",
  "Kalem",
  "Hâkka",
  "Meâric",
  "Nûh",
  "Cin",
  "Müzzemmil",
  "Müddessir",
  "Kıyâmet",
  "İnsân",
  "Mürselât",
  "Nebe'",
  "Nâziât",
  "Abese",
  "Tekvîr",
  "İnfitâr",
  "Mutaffifîn",
  "İnşikâk",
  "Burûc",
  "Târık",
  "A'lâ",
  "Gâşiye",
  "Fecr",
  "Beled",
  "Şems",
  "Leyl",
  "Duhâ",
  "İnşirâ",
  "Tîn",
  "Alak",
  "Kadir",
  "Beyyine",
  "Zilzal",
  "Âdiyât",
  "Kâria",
  "Tekâsür",
  "Asr",
  "Hümeze",
  "Fîl",
  "Kureyş",
  "Mâûn",
  "Kevser",
  "Kâfirûn",
  "Nasr",
  "Tebbet",
  "İhlâs",
  "Felak",
  "Nâs",
];

const PRAYER_RING_SEGMENTS = 40;
const PRAYER_RING_SIZE = 256;
const PRAYER_RING_RADIUS = 110;

function formatRemainingBadge(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} sa ${minutes} dk kaldı`;
  }

  if (hours > 0) {
    return `${hours} sa kaldı`;
  }

  if (minutes > 0) {
    return `${minutes} dk kaldı`;
  }

  return "1 dk'dan az kaldı";
}

export function HomePrayerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const location = useLocation();
  const [prayerTimes, setPrayerTimes] = useState<DailyPrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<ReturnType<
    typeof getNextPrayerInfo
  > | null>(null);
  const [progress, setProgress] = useState(0);
  const [ayah, setAyah] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("00:00:00");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check for onboarding on mount
  useEffect(() => {
    (async () => {
      try {
        const shown = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!shown) {
          const { status } = await Notifications.getPermissionsAsync();
          if (status !== "granted") {
            // Wait a bit before showing to let home screen load
            setTimeout(() => setShowOnboarding(true), 1500);
          }
        }
      } catch (e) {}
    })();
  }, []);

  const handleAcceptOnboarding = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      setShowOnboarding(false);

      if (status === "granted") {
        // Load existing settings or use defaults to schedule
        const settingsJson = await AsyncStorage.getItem(
          NOTIFICATION_STORAGE_KEY,
        );
        const settings = settingsJson
          ? JSON.parse(settingsJson)
          : DEFAULT_NOTIFICATION_SETTINGS;
        await scheduleAllNotifications(settings, location.lat, location.lon);
      }
    } catch (e) {
      setShowOnboarding(false);
    }
  };

  const handleCloseOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  // Fetch prayer times when location is ready
  useEffect(() => {
    if (location.loading) return;

    async function loadData() {
      try {
        const times = await getDailyPrayerTimes(location.lat, location.lon);
        setPrayerTimes(times);
        const np = getNextPrayerInfo(times);
        setNextPrayer(np);
        setProgress(getNextPrayerProgress(times));
        setCountdown(formatCountdown(np.remainingMs));

        const randomAyah = await getAyahReference(2, 43, true);
        setAyah(randomAyah);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [location.loading, location.lat, location.lon]);

  // Per-second countdown
  useEffect(() => {
    if (!prayerTimes) return;

    const interval = setInterval(() => {
      const now = new Date();
      const np = getNextPrayerInfo(prayerTimes, now);
      setNextPrayer(np);
      setCountdown(formatCountdown(np.remainingMs));
      setProgress(getNextPrayerProgress(prayerTimes, now));
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  if (loading || location.loading || !prayerTimes) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fbf9f5",
        }}
      >
        <ActivityIndicator size="large" color="#003527" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 14,
            color: "#003527",
            fontFamily: "Inter_500Medium",
          }}
        >
          {location.loading ? "Konumunuz alınıyor..." : "Veriler Yükleniyor..."}
        </Text>
      </View>
    );
  }

  const timesList = [
    { label: "İmsak", time: prayerTimes.imsak },
    { label: "Güneş", time: prayerTimes.gunes },
    { label: "Öğle", time: prayerTimes.ogle },
    { label: "İkindi", time: prayerTimes.ikindi },
    { label: "Akşam", time: prayerTimes.aksam },
    { label: "Yatsı", time: prayerTimes.yatsi },
  ];
  const ringSegments = Array.from(
    { length: PRAYER_RING_SEGMENTS },
    (_, index) => {
      const angle = (index / PRAYER_RING_SEGMENTS) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * PRAYER_RING_RADIUS;
      const y = Math.sin(angle) * PRAYER_RING_RADIUS;

      return {
        index,
        x,
        y,
        rotation: `${(angle * 180) / Math.PI + 90}deg`,
        active: index < Math.round(progress * PRAYER_RING_SEGMENTS),
      };
    },
  );
  const indicatorAngle = progress * Math.PI * 2 - Math.PI / 2;
  const indicatorX = Math.cos(indicatorAngle) * PRAYER_RING_RADIUS;
  const indicatorY = Math.sin(indicatorAngle) * PRAYER_RING_RADIUS;
  const remainingLabel = formatRemainingBadge(nextPrayer?.remainingMs ?? 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fbf9f5" }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}
    >
      {/* Top App Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View>
            <Text
              style={{
                fontFamily: "NotoSerif_700Bold",
                fontSize: 20,
                color: "#064e3b",
              }}
            >
              Mizan
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <MaterialIcons name="location-pin" size={12} color="#526772" />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 10,
                  color: "#404944",
                }}
              >
                {location.city}
                {location.country ? `, ${location.country}` : ""}
              </Text>
              <TouchableOpacity
                onPress={() => location.refreshLocation()}
                style={{ marginLeft: 4 }}
              >
                <MaterialIcons name="refresh" size={12} color="#064e3b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationSettings")}
          style={{
            padding: 8,
            borderRadius: 12,
            backgroundColor: "rgba(6,78,59,0.06)",
          }}
        >
          <MaterialIcons name="notifications-none" size={24} color="#064e3b" />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 32, gap: 40 }}>
        {/* Prayer Timer Hero */}
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: PRAYER_RING_SIZE,
              height: PRAYER_RING_SIZE,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <View
              style={{
                position: "absolute",
                width: 228,
                height: 228,
                borderRadius: 114,
                borderWidth: 8,
                borderColor: "#eae8e4",
                backgroundColor: "#fbf9f5",
              }}
            />

            {ringSegments.map((segment) => (
              <View
                key={segment.index}
                style={{
                  position: "absolute",
                  width: 18,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: segment.active ? "#2b6954" : "#d9d7d2",
                  transform: [
                    { translateX: segment.x },
                    { translateY: segment.y },
                    { rotate: segment.rotation },
                  ],
                  shadowColor: segment.active ? "#2b6954" : "transparent",
                  shadowOpacity: segment.active ? 0.18 : 0,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                }}
              />
            ))}

            <View
              style={{
                position: "absolute",
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#2b6954",
                borderWidth: 4,
                borderColor: "#fbf9f5",
                transform: [
                  { translateX: indicatorX },
                  { translateY: indicatorY },
                ],
                shadowColor: "#2b6954",
                shadowOpacity: 0.2,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 2 },
              }}
            />

            <View
              style={{ alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "#526772",
                }}
              >
                Sıradaki Vakit
              </Text>
              <Text
                style={{
                  fontFamily: "NotoSerif_700Bold",
                  fontSize: 38,
                  color: "#003527",
                }}
              >
                {nextPrayer?.name || "İmsak"}
              </Text>
              <View
                style={{
                  marginTop: 4,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "#003527",
                  shadowColor: "#003527",
                  shadowOpacity: 0.14,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 8 },
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: "#ffffff",
                  }}
                >
                  {remainingLabel}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: "#707974",
                }}
              >
                {nextPrayer?.time} • {countdown}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 24, alignItems: "center", gap: 4 }}>
            <Text
              style={{
                fontFamily: "NotoSerif_400Regular",
                fontSize: 18,
                color: "#404944",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              “Namaz, müminin miracıdır.”
            </Text>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#707974",
              }}
            >
              Hadis-i Şerif
            </Text>
          </View>
        </View>

        {/* Prayer Times Grid */}
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontFamily: "NotoSerif_700Bold",
                fontSize: 24,
                color: "#003527",
              }}
            >
              Vakitler
            </Text>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                color: "#707974",
              }}
            >
              {prayerTimes.date}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            {timesList.map((item, idx) => {
              const isActive = nextPrayer?.name === item.label;
              return (
                <View
                  key={idx}
                  style={{
                    width: "47%",
                    padding: 20,
                    borderRadius: 16,
                    backgroundColor: isActive ? "#003527" : "#f5f3ef",
                    shadowColor: isActive ? "#003527" : "transparent",
                    shadowOpacity: isActive ? 0.15 : 0,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: isActive ? 4 : 0,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: 2,
                        color: isActive ? "#80bea6" : "#707974",
                      }}
                    >
                      {item.label}
                    </Text>
                    {isActive && (
                      <MaterialIcons
                        name="notifications-active"
                        size={16}
                        color="white"
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: isActive
                        ? "NotoSerif_700Bold"
                        : "NotoSerif_400Regular",
                      fontSize: 20,
                      marginTop: 4,
                      color: isActive ? "#ffffff" : "#003527",
                    }}
                  >
                    {item.time}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Günün Ayeti */}
        {ayah && (
          <View
            style={{
              backgroundColor: "#ffffff",
              padding: 24,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(191,201,195,0.2)",
              shadowColor: "#1f2937",
              shadowOpacity: 0.03,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#fbe0a5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="menu-book" size={16} color="#3b2c02" />
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: "#404944",
                }}
              >
                Günün Ayeti
              </Text>
            </View>

            <View style={{ gap: 24 }}>
              <Text
                style={{
                  fontFamily: "NotoSerif_700Bold",
                  fontSize: 24,
                  lineHeight: 40,
                  color: "#003527",
                  textAlign: "right",
                }}
              >
                {ayah.arabicText}
              </Text>
              <Text
                style={{
                  fontFamily: "NotoSerif_400Regular",
                  fontSize: 18,
                  lineHeight: 30,
                  color: "#1b1c1a",
                  fontStyle: "italic",
                }}
              >
                "{ayah.turkishMeal}"
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: "rgba(191,201,195,0.2)",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    color: "#707974",
                  }}
                >
                  {SURAH_NAMES[ayah.surahNumber - 1]} – {ayah.ayahNumber}. Ayet
                </Text>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <TouchableOpacity>
                    <MaterialIcons name="share" size={20} color="#003527" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <MaterialIcons
                      name="bookmark-border"
                      size={20}
                      color="#003527"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Bento Cards */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Kuran")}
            activeOpacity={0.7}
            style={{
              backgroundColor: "#efeeea",
              padding: 24,
              borderRadius: 16,
              flex: 1,
              aspectRatio: 1,
              justifyContent: "space-between",
            }}
          >
            <MaterialIcons name="menu-book" size={32} color="#003527" />
            <View>
              <Text
                style={{
                  fontFamily: "NotoSerif_700Bold",
                  fontSize: 18,
                  color: "#003527",
                  lineHeight: 22,
                }}
              >
                Kur'an-ı Kerim
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 11,
                  color: "#404944",
                  marginTop: 4,
                }}
              >
                Kaldığın yerden devam et.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Hadis")}
            activeOpacity={0.7}
            style={{
              backgroundColor: "#efeeea",
              padding: 24,
              borderRadius: 16,
              flex: 1,
              aspectRatio: 1,
              justifyContent: "space-between",
            }}
          >
            <MaterialIcons name="auto-stories" size={32} color="#003527" />
            <View>
              <Text
                style={{
                  fontFamily: "NotoSerif_700Bold",
                  fontSize: 18,
                  color: "#003527",
                  lineHeight: 22,
                }}
              >
                Hadis & Siyer
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 11,
                  color: "#404944",
                  marginTop: 4,
                }}
              >
                Okumayı sürdür.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <NotificationOnboardingModal
        visible={showOnboarding}
        onClose={handleCloseOnboarding}
        onAccept={handleAcceptOnboarding}
      />
    </ScrollView>
  );
}
