import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { searchAyahs, searchHadiths, searchSirahs, Ayah, Hadith, Sirah, truncateText } from "../api/mizan";

type TabTypes = "Hepsi" | "Ayet" | "Hadis" | "Siyer";
const TABS: TabTypes[] = ["Hepsi", "Ayet", "Hadis", "Siyer"];

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabTypes>("Hepsi");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    ayahs: Ayah[];
    hadiths: Hadith[];
    sirahs: Sirah[];
  }>({ ayahs: [], hadiths: [], sirahs: [] });

  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const [ayahsRes, hadithsRes, sirahsRes] = await Promise.all([
        searchAyahs(text, 5),
        searchHadiths(text, 5),
        searchSirahs(text, 5),
      ]);
      setResults({
        ayahs: ayahsRes || [],
        hadiths: hadithsRes || [],
        sirahs: sirahsRes || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasNoResults = hasSearched && !loading &&
    results.ayahs.length === 0 &&
    results.hadiths.length === 0 &&
    results.sirahs.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#fbf9f5' }}>
      {/* Top Navigation */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 16,
          paddingTop: insets.top + 16,
          backgroundColor: '#f5f3ef',
        }}
      >
        <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 20, color: '#064e3b' }}>Arama</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('NotificationSettings')}
          style={{ padding: 8, borderRadius: 999 }}
        >
          <MaterialIcons name="notifications-none" size={24} color="#064e3b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
      >
        <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 28, color: '#003527', marginBottom: 24 }}>
          Kütüphanede Ara
        </Text>

        {/* Search Input */}
        <View style={{ position: 'relative', marginBottom: 32, justifyContent: 'center' }}>
          <View style={{ position: 'absolute', left: 20, zIndex: 10 }}>
            <MaterialIcons name="search" size={22} color="#707974" />
          </View>
          <TextInput
            style={{
              width: '100%',
              backgroundColor: '#eae8e4',
              borderRadius: 16,
              paddingVertical: 18,
              paddingLeft: 56,
              paddingRight: 24,
              fontSize: 16,
              color: '#1b1c1a',
              fontFamily: 'Inter_400Regular',
            }}
            placeholder="Ayet, Hadis, Siyer ara..."
            placeholderTextColor="#707974"
            value={query}
            onChangeText={handleSearch}
          />
        </View>

        {/* Tabs */}
        <View style={{ marginBottom: 40 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 8 }}>
              {TABS.map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: activeTab === tab ? '#003527' : '#f5f3ef',
                  }}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 14,
                    color: activeTab === tab ? '#ffffff' : '#404944',
                  }}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Content */}
        {loading ? (
          <View style={{ paddingVertical: 80, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#003527" />
            <Text style={{ color: '#404944', marginTop: 12, fontSize: 14 }}>Aranıyor...</Text>
          </View>
        ) : hasNoResults ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32, backgroundColor: '#f5f3ef', borderRadius: 32 }}>
            <View style={{ width: 80, height: 80, backgroundColor: '#e4e2de', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <MaterialIcons name="search-off" size={32} color="rgba(112,121,116,0.4)" />
            </View>
            <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 20, color: '#003527', marginBottom: 8 }}>Sonuç Bulunamadı</Text>
            <Text style={{ color: '#404944', fontSize: 14, textAlign: 'center' }}>
              Aradığınız kelimeye uygun içerik bulunamadı.
            </Text>
          </View>
        ) : hasSearched ? (
          <View style={{ gap: 16 }}>
            {/* Ayahs */}
            {(activeTab === "Hepsi" || activeTab === "Ayet") && results.ayahs.map(ayah => (
              <View key={ayah.id} style={{
                backgroundColor: '#ffffff', padding: 20, borderRadius: 16,
                shadowColor: '#1f2937', shadowOpacity: 0.03, shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
                borderWidth: 1, borderColor: 'rgba(191,201,195,0.1)',
              }}>
                <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 18, color: '#003527', marginBottom: 8, textAlign: 'right', writingDirection: 'rtl' }}>
                  {ayah.arabicText}
                </Text>
                <Text style={{ fontSize: 14, color: '#404944', marginBottom: 8 }}>{ayah.turkishMeal}</Text>
                <Text style={{ fontSize: 10, color: '#707974', fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase' }}>
                  {ayah.surahNumber}. Sure {ayah.ayahNumber}. Ayet
                </Text>
              </View>
            ))}

            {/* Hadiths */}
            {(activeTab === "Hepsi" || activeTab === "Hadis") && results.hadiths.map(hadith => (
              <TouchableOpacity
                key={hadith.id}
                onPress={() => navigation.navigate('HadithDetail', { hadithId: hadith.id, hadith })}
                style={{
                  backgroundColor: '#ffffff', padding: 20, borderRadius: 16,
                  shadowColor: '#1f2937', shadowOpacity: 0.03, shadowRadius: 16,
                  shadowOffset: { width: 0, height: 4 },
                  borderWidth: 1, borderColor: 'rgba(191,201,195,0.1)',
                }}
              >
                <Text style={{ fontSize: 14, color: '#1b1c1a', marginBottom: 8 }}>{truncateText(hadith.content, 150)}</Text>
                <Text style={{ fontSize: 10, color: '#4c616c', fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase' }}>{hadith.source}</Text>
              </TouchableOpacity>
            ))}

            {/* Sirahs */}
            {(activeTab === "Hepsi" || activeTab === "Siyer") && results.sirahs.map(sirah => (
              <TouchableOpacity
                key={sirah.id}
                onPress={() => navigation.navigate('SirahDetail', { sirahId: sirah.id, sirah })}
                style={{
                  backgroundColor: '#ffffff', padding: 20, borderRadius: 16,
                  shadowColor: '#1f2937', shadowOpacity: 0.03, shadowRadius: 16,
                  shadowOffset: { width: 0, height: 4 },
                  borderWidth: 1, borderColor: 'rgba(191,201,195,0.1)',
                }}
              >
                <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 18, color: '#003527', marginBottom: 8 }}>
                  {sirah.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#404944', marginBottom: 8 }}>{truncateText(sirah.summary, 100)}</Text>
                <Text style={{ fontSize: 10, color: '#003527', fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase' }}>Siyer</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 2, color: '#707974', marginBottom: 16 }}>
              İlginizi Çekebilir
            </Text>
            <View style={{
              backgroundColor: '#003527', borderRadius: 32, padding: 32, overflow: 'hidden',
            }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start', marginBottom: 16 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', color: '#ffffff' }}>Günün Okuması</Text>
              </View>
              <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 22, color: '#ffffff', marginBottom: 8, fontStyle: 'italic', lineHeight: 32 }}>
                "Ey iman edenler! Sabrederek ve namaz kılarak Allah'tan yardım dileyin."
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium' }}>
                Bakara Suresi, 153. Ayet
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
