import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { listHadiths, listSirahs, Hadith, Sirah, truncateText } from "../api/mizan";

type ContentTab = "hadis" | "siyer";

export function HadithSirahListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<ContentTab>("hadis");
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [sirahs, setSirahs] = useState<Sirah[]>([]);
  const [loading, setLoading] = useState(true);
  const [hadithPage, setHadithPage] = useState(1);
  const [sirahPage, setSirahPage] = useState(1);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (activeTab === "hadis") {
          const data = await listHadiths(10, hadithPage);
          setHadiths(data);
        } else {
          const data = await listSirahs(10, sirahPage);
          setSirahs(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTab, hadithPage, sirahPage]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fbf9f5' }}>
      {/* Top App Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingVertical: 16,
          paddingTop: insets.top + 16,
          backgroundColor: '#f5f3ef',
        }}
      >
        <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 20, color: '#064e3b' }}>
          İlim Hazinesi
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('NotificationSettings')}
          style={{ padding: 8, borderRadius: 999 }}
        >
          <MaterialIcons name="notifications-none" size={24} color="#064e3b" />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={{
        flexDirection: 'row',
        marginHorizontal: 24,
        marginTop: 16,
        backgroundColor: '#f5f3ef',
        borderRadius: 999,
        padding: 4,
      }}>
        <TouchableOpacity
          onPress={() => setActiveTab("hadis")}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 999,
            backgroundColor: activeTab === "hadis" ? '#003527' : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            color: activeTab === "hadis" ? '#ffffff' : '#4c616c',
          }}>
            Hadis-i Şerifler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("siyer")}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 999,
            backgroundColor: activeTab === "siyer" ? '#003527' : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            color: activeTab === "siyer" ? '#ffffff' : '#4c616c',
          }}>
            Siyer-i Nebi
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 }}
      >
        {loading ? (
          <View style={{ paddingVertical: 80, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#003527" />
          </View>
        ) : activeTab === "hadis" ? (
          <View style={{ gap: 20 }}>
            {/* Hadith Header */}
            <View style={{
              backgroundColor: '#f5f3ef',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 18, color: '#003527' }}>
                Hadis Koleksiyonu
              </Text>
              <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 2, color: '#707974' }}>
                {hadiths.length} hadis
              </Text>
            </View>

            {hadiths.map((h, i) => (
              <TouchableOpacity
                key={h.id || i}
                onPress={() => navigation.navigate('HadithDetail', { hadithId: h.id, hadith: h })}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#ffffff',
                  padding: 24,
                  borderRadius: 16,
                  shadowColor: '#1f2937',
                  shadowOpacity: 0.03,
                  shadowRadius: 24,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#fbe0a5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ color: '#534216', fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'uppercase' }}>
                      {h.chapter || "Hadis"}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <MaterialIcons name="bookmark-border" size={20} color="#707974" />
                  </TouchableOpacity>
                </View>

                <Text style={{
                  fontFamily: 'NotoSerif_400Regular',
                  fontSize: 17,
                  lineHeight: 28,
                  color: '#1b1c1a',
                  marginBottom: 20,
                }}>
                  {truncateText(h.content, 200)}
                </Text>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(228,226,222,0.4)',
                }}>
                  <View>
                    <Text style={{ fontSize: 10, color: '#707974', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'Inter_600SemiBold' }}>
                      Kaynak
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#4c616c' }}>
                      {h.source}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: '#003527', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>
                      Oku
                    </Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#003527" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Pagination */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 }}>
              {hadithPage > 1 && (
                <TouchableOpacity
                  onPress={() => setHadithPage(p => p - 1)}
                  style={{ backgroundColor: '#f5f3ef', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}
                >
                  <Text style={{ fontFamily: 'Inter_500Medium', color: '#003527' }}>← Önceki</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setHadithPage(p => p + 1)}
                style={{ backgroundColor: '#003527', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', color: '#ffffff' }}>Sonraki →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ gap: 20 }}>
            {/* Siyer Header */}
            <View style={{
              backgroundColor: '#f5f3ef',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 18, color: '#003527' }}>
                Siyer-i Nebi
              </Text>
              <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 2, color: '#707974' }}>
                {sirahs.length} bölüm
              </Text>
            </View>

            {sirahs.map((s, i) => (
              <TouchableOpacity
                key={s.id || i}
                onPress={() => navigation.navigate('SirahDetail', { sirahId: s.id, sirah: s })}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#ffffff',
                  padding: 24,
                  borderRadius: 16,
                  shadowColor: '#1f2937',
                  shadowOpacity: 0.03,
                  shadowRadius: 24,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 2,
                  borderLeftWidth: 3,
                  borderLeftColor: '#003527',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <View style={{ backgroundColor: '#cfe6f2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#526772', textTransform: 'uppercase' }}>
                      {s.partTitle || "Siyer"}
                    </Text>
                  </View>
                  {s.unitNumber && (
                    <Text style={{ fontSize: 11, color: '#707974', fontFamily: 'Inter_500Medium' }}>
                      Ünite {s.unitNumber}
                    </Text>
                  )}
                </View>

                <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 18, color: '#1b1c1a', marginBottom: 8 }}>
                  {s.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#4c616c', lineHeight: 22, marginBottom: 16 }}>
                  {truncateText(s.summary, 150)}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: '#003527', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>
                    Dönemi İncele
                  </Text>
                  <MaterialIcons name="keyboard-arrow-right" size={18} color="#003527" />
                </View>
              </TouchableOpacity>
            ))}

            {/* Pagination */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 }}>
              {sirahPage > 1 && (
                <TouchableOpacity
                  onPress={() => setSirahPage(p => p - 1)}
                  style={{ backgroundColor: '#f5f3ef', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}
                >
                  <Text style={{ fontFamily: 'Inter_500Medium', color: '#003527' }}>← Önceki</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setSirahPage(p => p + 1)}
                style={{ backgroundColor: '#003527', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', color: '#ffffff' }}>Sonraki →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
