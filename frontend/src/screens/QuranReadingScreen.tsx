import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, FlatList } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { getQuranPage, QuranPageResponse } from "../api/mizan";

const STORAGE_KEY = "mizan_quran_last_page";

// 114 Surah list with starting pages
const SURAHS = [
  { no: 1, name: "Fatiha", page: 1 }, { no: 2, name: "Bakara", page: 2 }, { no: 3, name: "Âl-i İmrân", page: 50 },
  { no: 4, name: "Nisâ", page: 77 }, { no: 5, name: "Mâide", page: 106 }, { no: 6, name: "En'âm", page: 128 },
  { no: 7, name: "A'râf", page: 151 }, { no: 8, name: "Enfâl", page: 177 }, { no: 9, name: "Tevbe", page: 187 },
  { no: 10, name: "Yûnus", page: 208 }, { no: 11, name: "Hûd", page: 221 }, { no: 12, name: "Yûsuf", page: 235 },
  { no: 13, name: "Ra'd", page: 249 }, { no: 14, name: "İbrâhîm", page: 255 }, { no: 15, name: "Hicr", page: 262 },
  { no: 16, name: "Nahl", page: 267 }, { no: 17, name: "İsrâ", page: 282 }, { no: 18, name: "Kehf", page: 293 },
  { no: 19, name: "Meryem", page: 305 }, { no: 20, name: "Tâhâ", page: 312 }, { no: 21, name: "Enbiyâ", page: 322 },
  { no: 22, name: "Hac", page: 332 }, { no: 23, name: "Mü'minûn", page: 342 }, { no: 24, name: "Nûr", page: 350 },
  { no: 25, name: "Furkân", page: 359 }, { no: 26, name: "Şuarâ", page: 367 }, { no: 27, name: "Neml", page: 377 },
  { no: 28, name: "Kasas", page: 385 }, { no: 29, name: "Ankebût", page: 396 }, { no: 30, name: "Rûm", page: 404 },
  { no: 31, name: "Lokmân", page: 411 }, { no: 32, name: "Secde", page: 415 }, { no: 33, name: "Ahzâb", page: 418 },
  { no: 34, name: "Sebe'", page: 428 }, { no: 35, name: "Fâtır", page: 434 }, { no: 36, name: "Yâsîn", page: 440 },
  { no: 37, name: "Sâffât", page: 446 }, { no: 38, name: "Sâd", page: 453 }, { no: 39, name: "Zümer", page: 458 },
  { no: 40, name: "Mü'min", page: 467 }, { no: 41, name: "Fussilet", page: 477 }, { no: 42, name: "Şûrâ", page: 483 },
  { no: 43, name: "Zuhruf", page: 489 }, { no: 44, name: "Duhân", page: 496 }, { no: 45, name: "Câsiye", page: 499 },
  { no: 46, name: "Ahkâf", page: 502 }, { no: 47, name: "Muhammed", page: 507 }, { no: 48, name: "Fetih", page: 511 },
  { no: 49, name: "Hucurât", page: 515 }, { no: 50, name: "Kaf", page: 518 }, { no: 51, name: "Zâriyât", page: 520 },
  { no: 52, name: "Tûr", page: 523 }, { no: 53, name: "Necm", page: 526 }, { no: 54, name: "Kamer", page: 528 },
  { no: 55, name: "Rahmân", page: 531 }, { no: 56, name: "Vâkıa", page: 534 }, { no: 57, name: "Hadîd", page: 537 },
  { no: 58, name: "Mücâdele", page: 542 }, { no: 59, name: "Haşr", page: 545 }, { no: 60, name: "Mümtehine", page: 549 },
  { no: 61, name: "Saf", page: 551 }, { no: 62, name: "Cum'a", page: 553 }, { no: 63, name: "Münâfikûn", page: 554 },
  { no: 64, name: "Teğâbün", page: 556 }, { no: 65, name: "Talâk", page: 558 }, { no: 66, name: "Tahrîm", page: 560 },
  { no: 67, name: "Mülk", page: 562 }, { no: 68, name: "Kalem", page: 564 }, { no: 69, name: "Hâkka", page: 566 },
  { no: 70, name: "Meâric", page: 568 }, { no: 71, name: "Nûh", page: 570 }, { no: 72, name: "Cin", page: 572 },
  { no: 73, name: "Müzzemmil", page: 574 }, { no: 74, name: "Müddessir", page: 575 }, { no: 75, name: "Kıyâmet", page: 577 },
  { no: 76, name: "İnsân", page: 578 }, { no: 77, name: "Mürselât", page: 580 }, { no: 78, name: "Nebe'", page: 582 },
  { no: 79, name: "Nâziât", page: 583 }, { no: 80, name: "Abese", page: 585 }, { no: 81, name: "Tekvîr", page: 586 },
  { no: 82, name: "İnfitâr", page: 587 }, { no: 83, name: "Mutaffifîn", page: 587 }, { no: 84, name: "İnşikâk", page: 589 },
  { no: 85, name: "Burûc", page: 590 }, { no: 86, name: "Târık", page: 591 }, { no: 87, name: "A'lâ", page: 591 },
  { no: 88, name: "Gâşiye", page: 592 }, { no: 89, name: "Fecr", page: 593 }, { no: 90, name: "Beled", page: 594 },
  { no: 91, name: "Şems", page: 595 }, { no: 92, name: "Leyl", page: 595 }, { no: 93, name: "Duhâ", page: 596 },
  { no: 94, name: "İnşirâh", page: 596 }, { no: 95, name: "Tîn", page: 597 }, { no: 96, name: "Alak", page: 597 },
  { no: 97, name: "Kadir", page: 598 }, { no: 98, name: "Beyyine", page: 598 }, { no: 99, name: "Zilzal", page: 599 },
  { no: 100, name: "Âdiyât", page: 599 }, { no: 101, name: "Kâria", page: 600 }, { no: 102, name: "Tekâsür", page: 600 },
  { no: 103, name: "Asr", page: 601 }, { no: 104, name: "Hümeze", page: 601 }, { no: 105, name: "Fîl", page: 601 },
  { no: 106, name: "Kureyş", page: 602 }, { no: 107, name: "Mâûn", page: 602 }, { no: 108, name: "Kevser", page: 602 },
  { no: 109, name: "Kâfirûn", page: 603 }, { no: 110, name: "Nasr", page: 603 }, { no: 111, name: "Tebbet", page: 603 },
  { no: 112, name: "İhlâs", page: 604 }, { no: 113, name: "Felak", page: 604 }, { no: 114, name: "Nâs", page: 604 },
];

function getSurahForPage(page: number): string {
  for (let i = SURAHS.length - 1; i >= 0; i--) {
    if (page >= SURAHS[i].page) return SURAHS[i].name;
  }
  return "Fatiha";
}

export function QuranReadingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [pageData, setPageData] = useState<QuranPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"mushaf" | "meal">("mushaf");
  const [currentPage, setCurrentPage] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [pageInputText, setPageInputText] = useState("");
  const [surahSearch, setSurahSearch] = useState("");

  // Load saved page on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const num = parseInt(saved, 10);
          if (num >= 1 && num <= 604) setCurrentPage(num);
        }
      } catch { }
      setIsReady(true);
    })();
  }, []);

  // Save current page whenever it changes
  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEY, String(currentPage)).catch(() => { });
  }, [currentPage, isReady]);

  // Fetch page data
  useEffect(() => {
    if (!isReady) return;
    async function fetchPage() {
      setLoading(true);
      try {
        const data = await getQuranPage(currentPage, true);
        setPageData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [currentPage, isReady]);

  const goToPage = useCallback((p: number) => {
    const clamped = Math.max(1, Math.min(604, p));
    setCurrentPage(clamped);
  }, []);

  const handlePageInput = () => {
    const num = parseInt(pageInputText, 10);
    if (num >= 1 && num <= 604) {
      goToPage(num);
      setPageInputText("");
    }
  };

  const filteredSurahs = surahSearch
    ? SURAHS.filter(s =>
      s.name.toLowerCase().includes(surahSearch.toLowerCase()) ||
      String(s.no).includes(surahSearch)
    )
    : SURAHS;

  const surahName = getSurahForPage(currentPage);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f3ef' }}>
      {/* Top App Bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 16,
          paddingTop: insets.top + 16,
          backgroundColor: '#f5f3ef',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(228,226,222,0.3)',
        }}
      >
        <TouchableOpacity 
          onPress={() => navigation.navigate('NotificationSettings')}
          style={{ padding: 8, borderRadius: 999 }}
        >
          <MaterialIcons name="notifications-none" size={24} color="#064e3b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ padding: 8, borderRadius: 999 }}
          onPress={() => goToPage(currentPage - 1)}
        >
          <MaterialIcons name="chevron-left" size={24} color="#064e3b" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowSurahPicker(true)}
          style={{ alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 20, color: '#064e3b' }}>
            Sayfa {currentPage}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: 'rgba(6,78,59,0.6)', textTransform: 'uppercase', letterSpacing: 2 }}>
              {surahName} Suresi
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={14} color="rgba(6,78,59,0.6)" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ padding: 8, borderRadius: 999 }}
          onPress={() => goToPage(currentPage + 1)}
        >
          <MaterialIcons name="chevron-right" size={24} color="#064e3b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: '#fbf9f5' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 150 }}
      >
        {/* Toggle Switch */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 32 }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#f5f3ef',
            padding: 6,
            borderRadius: 999,
            gap: 4,
            alignItems: 'center',
          }}>
            <TouchableOpacity
              onPress={() => setMode("mushaf")}
              style={{
                paddingHorizontal: 32,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: mode === "mushaf" ? '#003527' : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontFamily: 'Inter_600SemiBold',
                color: mode === "mushaf" ? '#ffffff' : '#4c616c'
              }}>Mushaf</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMode("meal")}
              style={{
                paddingHorizontal: 32,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: mode === "meal" ? '#003527' : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontFamily: 'Inter_600SemiBold',
                color: mode === "meal" ? '#ffffff' : '#4c616c'
              }}>Meal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <ActivityIndicator size="large" color="#003527" />
          </View>
        ) : (
          <View style={{
            backgroundColor: '#ffffff',
            padding: 24,
            borderRadius: 32,
            borderWidth: 1,
            borderColor: 'rgba(191,201,195,0.1)',
            minHeight: 400,
            position: 'relative',
          }}>
            {/* Decorative Borders */}
            <View style={{ position: 'absolute', top: 16, left: 16, width: 48, height: 48, borderTopWidth: 2, borderLeftWidth: 2, borderColor: 'rgba(0,53,39,0.1)', borderTopLeftRadius: 16 }} />
            <View style={{ position: 'absolute', top: 16, right: 16, width: 48, height: 48, borderTopWidth: 2, borderRightWidth: 2, borderColor: 'rgba(0,53,39,0.1)', borderTopRightRadius: 16 }} />
            <View style={{ position: 'absolute', bottom: 16, left: 16, width: 48, height: 48, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: 'rgba(0,53,39,0.1)', borderBottomLeftRadius: 16 }} />
            <View style={{ position: 'absolute', bottom: 16, right: 16, width: 48, height: 48, borderBottomWidth: 2, borderRightWidth: 2, borderColor: 'rgba(0,53,39,0.1)', borderBottomRightRadius: 16 }} />

            <View style={{ paddingVertical: 16, marginTop: 24, gap: 40 }}>
              {currentPage === 1 && (
                <Text style={{
                  fontSize: 30, textAlign: 'center', color: '#003527',
                  fontFamily: 'NotoSerif_700Bold', marginBottom: 16,
                }}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </Text>
              )}

              {pageData?.items.map((ayah, idx) => (
                <View key={ayah.id || idx} style={{ marginBottom: 24 }}>
                  {mode === "mushaf" ? (
                    <Text style={{
                      fontSize: 28, textAlign: 'right', lineHeight: 50,
                      color: '#1b1c1a', fontFamily: 'NotoSerif_400Regular',
                      writingDirection: 'rtl',
                    }}>
                      {ayah.arabicText} ﴿{ayah.ayahNumber}﴾
                    </Text>
                  ) : (
                    <View>
                      <Text style={{
                        fontSize: 24, textAlign: 'right', lineHeight: 40,
                        color: '#003527', fontFamily: 'NotoSerif_700Bold',
                        marginBottom: 12, writingDirection: 'rtl',
                      }}>
                        {ayah.arabicText} ﴿{ayah.ayahNumber}﴾
                      </Text>
                      <Text style={{
                        fontSize: 16, textAlign: 'left', lineHeight: 28,
                        color: '#404944', fontFamily: 'Inter_400Regular',
                      }}>
                        {ayah.surahNumber}:{ayah.ayahNumber} - {ayah.turkishMeal}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Page Navigation */}
      <View style={{
        position: 'absolute',
        bottom: 100,
        left: 0, right: 0,
        paddingHorizontal: 24,
        alignItems: 'center',
        zIndex: 40,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: '#ffffff',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 999,
          shadowColor: '#1f2937',
          shadowOpacity: 0.08,
          shadowRadius: 32,
          shadowOffset: { width: 0, height: 12 },
          elevation: 8,
          borderWidth: 1,
          borderColor: 'rgba(0,53,39,0.05)',
        }}>
          <TouchableOpacity onPress={() => goToPage(currentPage - 1)} style={{ padding: 8 }}>
            <MaterialIcons name="keyboard-arrow-left" size={24} color="#003527" />
          </TouchableOpacity>

          {/* Page input */}
          <TextInput
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              color: '#003527',
              textAlign: 'center',
              minWidth: 60,
              paddingVertical: 4,
              paddingHorizontal: 8,
              backgroundColor: '#f5f3ef',
              borderRadius: 8,
            }}
            value={pageInputText || String(currentPage)}
            onChangeText={setPageInputText}
            onSubmitEditing={handlePageInput}
            keyboardType="number-pad"
            returnKeyType="go"
            selectTextOnFocus
          />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#707974' }}>/ 604</Text>

          <TouchableOpacity onPress={() => goToPage(currentPage + 1)} style={{ padding: 8 }}>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#003527" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Surah Picker Modal */}
      <Modal visible={showSurahPicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: '#fbf9f5',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 16,
            maxHeight: '75%',
          }}>
            {/* Handle */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#bfc9c3', borderRadius: 2 }} />
            </View>

            <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 22, color: '#003527', paddingHorizontal: 24, marginBottom: 16 }}>
              Sure Seç
            </Text>

            {/* Search */}
            <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
              <View style={{ position: 'relative', justifyContent: 'center' }}>
                <View style={{ position: 'absolute', left: 16, zIndex: 10 }}>
                  <MaterialIcons name="search" size={20} color="#707974" />
                </View>
                <TextInput
                  style={{
                    backgroundColor: '#eae8e4',
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingLeft: 44,
                    paddingRight: 16,
                    fontSize: 14,
                    color: '#1b1c1a',
                    fontFamily: 'Inter_400Regular',
                  }}
                  placeholder="Sure adı veya numarası..."
                  placeholderTextColor="#707974"
                  value={surahSearch}
                  onChangeText={setSurahSearch}
                />
              </View>
            </View>

            <FlatList
              data={filteredSurahs}
              keyExtractor={(item) => String(item.no)}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    goToPage(item.page);
                    setShowSurahPicker(false);
                    setSurahSearch("");
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(191,201,195,0.15)',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 8,
                      backgroundColor: '#efeeea',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#003527' }}>
                        {item.no}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 16, color: '#1b1c1a' }}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#707974' }}>
                    Sayfa {item.page}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={() => { setShowSurahPicker(false); setSurahSearch(""); }}
              style={{
                paddingVertical: 16,
                alignItems: 'center',
                borderTopWidth: 1,
                borderTopColor: 'rgba(191,201,195,0.2)',
              }}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#003527', fontSize: 16 }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
