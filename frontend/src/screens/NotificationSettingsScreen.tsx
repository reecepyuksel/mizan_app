import React, { useEffect, useState } from "react";
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, Modal, FlatList } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { useLocation } from "../context/LocationContext";

import { 
  NOTIFICATION_STORAGE_KEY as STORAGE_KEY, 
  NotificationSettings as Settings, 
  DEFAULT_NOTIFICATION_SETTINGS as DEFAULT_SETTINGS,
  SoundType,
  PrayerToggle,
  scheduleAllNotifications
} from "../utils/notificationHelper";
import { SmallWidget, MediumWidget, LargeWidget } from "../components/WidgetComponents";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const MOCK_DATA = {
  city: "İstanbul",
  countdown: "01:45:22",
  nextPrayerName: "İkindi",
  nextPrayerTime: "15:48",
  prayerTimes: { imsak: "05:42", ogle: "13:12", ikindi: "15:48", aksam: "18:14", yatsi: "19:35", gunes: "07:11" },
  progress: 0.65,
  isHijri: "14 Rebiülevvel 1446"
};

const SOUND_OPTIONS: { id: SoundType; label: string }[] = [
  { id: "default", label: "Varsayılan" },
  { id: "makkah", label: "Mekke-i Mükerreme Ezanı" },
  { id: "madinah", label: "Medine-i Münevvere Ezanı" },
  { id: "istanbul", label: "İstanbul (Saba) Ezanı" },
  { id: "silent", label: "Sessiz" },
];

export function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const location = useLocation();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [soundTypeToEdit, setSoundTypeToEdit] = useState<"sound" | "adhan">("sound");

  // Load stored settings
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const parsed = JSON.parse(json);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Request notification permission once
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert("Uyarı", "Bildirim izni verilmedi, hatırlatıcılar çalışmayacak.");
        }
      }
    })();
  }, []);

  const saveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    await scheduleAllNotifications(newSettings, location.lat, location.lon);
  };

  const togglePrayer = (key: keyof PrayerToggle) => {
    const newPrayers = { ...settings.prayers, [key]: !settings.prayers[key] };
    saveSettings({ ...settings, prayers: newPrayers });
  };

  const updateTime = (field: "dailyAyahTime" | "dailyHadithTime", value: string) => {
    saveSettings({ ...settings, [field]: value });
  };

  const openSoundModal = (type: "sound" | "adhan") => {
    setSoundTypeToEdit(type);
    setShowSoundModal(true);
  };

  const selectSound = (soundId: SoundType) => {
    saveSettings({ ...settings, [soundTypeToEdit]: soundId });
    setShowSoundModal(false);
  };


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fbf9f5" }}>
        <MaterialIcons name="hourglass-empty" size={48} color="#003527" />
        <Text style={{ marginTop: 16, fontFamily: 'Inter_500Medium', color: '#003527' }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fbf9f5" }}>
      {/* Custom Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: insets.top + 10,
        paddingBottom: 15,
        backgroundColor: '#f5f3ef',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,53,39,0.05)',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, borderRadius: 12, backgroundColor: 'white' }}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#003527" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
        <Text style={{
          fontFamily: "NotoSerif_700Bold",
          fontSize: 20,
          color: "#003527",
          marginLeft: 16,
        }}>
          Bildirim Ayarları
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 24 }}>
        
        {/* Location Info Card */}
        <View style={{ 
          backgroundColor: '#003527', 
          borderRadius: 24, 
          padding: 24, 
          marginBottom: 32,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 1 }}>Konumunuz</Text>
            <Text style={{ color: '#ffffff', fontSize: 18, fontFamily: 'NotoSerif_700Bold', marginTop: 4 }}>{location.city}, {location.country}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => location.refreshLocation()}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialIcons name="my-location" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Widget Selection Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#003527", marginBottom: 16 }}>Widget Koleksiyonu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20 }}>
            {/* Small Preview */}
            <TouchableOpacity 
              onPress={() => saveSettings({ ...settings, widgetStyle: "classic" as any })}
              style={{ alignItems: 'center', gap: 12 }}
            >
              <View style={{ transform: [{ scale: 0.8 }] }}>
                <SmallWidget {...MOCK_DATA} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                 <MaterialIcons 
                    name={settings.widgetStyle === ("classic" as any) ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color="#003527" 
                 />
                 <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#003527' }}>Minimalist (2x2)</Text>
              </View>
            </TouchableOpacity>

            {/* Medium Preview */}
            <TouchableOpacity 
              onPress={() => saveSettings({ ...settings, widgetStyle: "modern" as any })}
              style={{ alignItems: 'center', gap: 12 }}
            >
              <View style={{ transform: [{ scale: 0.8 }], width: (width - 48) * 0.8 }}>
                <MediumWidget {...MOCK_DATA} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                 <MaterialIcons 
                    name={settings.widgetStyle === ("modern" as any) ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color="#003527" 
                 />
                 <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#003527' }}>Çizelge (4x2)</Text>
              </View>
            </TouchableOpacity>

            {/* Large Preview */}
            <TouchableOpacity 
              onPress={() => saveSettings({ ...settings, widgetStyle: "bento" as any })}
              style={{ alignItems: 'center', gap: 12 }}
            >
              <View style={{ transform: [{ scale: 0.6 }], height: 260, justifyContent: 'center' }}>
                <LargeWidget {...MOCK_DATA} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                 <MaterialIcons 
                    name={settings.widgetStyle === ("bento" as any) ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color="#003527" 
                 />
                 <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#003527' }}>Detaylı Panel (4x4)</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Sound Selection */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(0,53,39,0.05)' }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#003527", marginBottom: 20 }}>Ses Ayarları</Text>
          
          <TouchableOpacity 
            onPress={() => openSoundModal("adhan")}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(0,53,39,0.05)',
              marginBottom: 12
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(6,78,59,0.06)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="campaign" size={20} color="#003527" />
              </View>
              <View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1b1c1a' }}>Ezan Sesi</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#707974' }}>{SOUND_OPTIONS.find(o => o.id === settings.adhan)?.label}</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#bfc9c3" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => openSoundModal("sound")}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(6,78,59,0.06)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="notifications-active" size={20} color="#003527" />
              </View>
              <View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1b1c1a' }}>Hatırlatıcı Sesi</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#707974' }}>{SOUND_OPTIONS.find(o => o.id === settings.sound)?.label}</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#bfc9c3" />
          </TouchableOpacity>
        </View>

        {/* Prayer Toggles */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(0,53,39,0.05)' }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#003527", marginBottom: 20 }}>Vakit Bildirimleri</Text>
          {(Object.keys(settings.prayers) as (keyof PrayerToggle)[]).map((key) => (
            <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 }}>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#404944" }}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Switch 
                value={settings.prayers[key]} 
                onValueChange={() => togglePrayer(key)}
                trackColor={{ false: "#e4e2de", true: "#80bea6" }}
                thumbColor={settings.prayers[key] ? "#003527" : "#fbf9f5"}
              />
            </View>
          ))}
          <View style={{ 
            flexDirection: "row", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(0,53,39,0.05)'
          }}>
            <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#404944" }}>Hatırlatma Süresi</Text>
            <TouchableOpacity 
              onPress={() => saveSettings({ ...settings, reminderMinutes: settings.reminderMinutes === 10 ? 5 : 10 })}
              style={{ backgroundColor: '#f5f3ef', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", color: "#003527", fontSize: 12 }}>{settings.reminderMinutes} Dakika Önce</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Content */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(0,53,39,0.05)' }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#003527", marginBottom: 20 }}>Ruhun Gıdası</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <View>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#1b1c1a" }}>Günün Ayeti</Text>
              <Text style={{ color: '#707974', fontSize: 12 }}>Her sabah taptaze bir ayet.</Text>
            </View>
            <TouchableOpacity 
              onPress={() => updateTime("dailyAyahTime", settings.dailyAyahTime === "08:00" ? "09:00" : "08:00")}
              style={{ backgroundColor: '#f5f3ef', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", color: "#003527", fontSize: 12 }}>{settings.dailyAyahTime}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#1b1c1a" }}>Günün Hadisi</Text>
              <Text style={{ color: '#707974', fontSize: 12 }}>Öğle vakti bir sünnet hatırlatması.</Text>
            </View>
            <TouchableOpacity 
              onPress={() => updateTime("dailyHadithTime", settings.dailyHadithTime === "12:00" ? "13:00" : "12:00")}
              style={{ backgroundColor: '#f5f3ef', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", color: "#003527", fontSize: 12 }}>{settings.dailyHadithTime}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sound Selection Modal */}
      <Modal visible={showSoundModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,53,39,0.4)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 32, padding: 24, maxHeight: '60%' }}>
            <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 22, color: '#003527', marginBottom: 20 }}>
              {soundTypeToEdit === "adhan" ? "Ezan Sesi Seçin" : "Bildirim Sesi Seçin"}
            </Text>
            <FlatList
              data={SOUND_OPTIONS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => selectSound(item.id)}
                  style={{ 
                    paddingVertical: 16, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(0,53,39,0.05)'
                  }}
                >
                  <Text style={{ 
                    fontFamily: (settings[soundTypeToEdit] === item.id) ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    color: (settings[soundTypeToEdit] === item.id) ? '#003527' : '#404944',
                    fontSize: 16 
                  }}>{item.label}</Text>
                  {(settings[soundTypeToEdit] === item.id) && (
                    <MaterialIcons name="check-circle" size={20} color="#003527" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              onPress={() => setShowSoundModal(false)}
              style={{ marginTop: 24, backgroundColor: '#003527', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#ffffff', fontFamily: 'Inter_600SemiBold' }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
