import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getHadithById, Hadith, formatHadithSource } from "../api/mizan";

export function HadithDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { hadithId, hadith: passedHadith } = route.params || {};
  const [hadith, setHadith] = useState<Hadith | null>(passedHadith || null);
  const [loading, setLoading] = useState(!passedHadith);

  useEffect(() => {
    if (passedHadith) return;
    async function load() {
      try {
        const data = await getHadithById(hadithId);
        setHadith(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hadithId, passedHadith]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbf9f5' }}>
        <ActivityIndicator size="large" color="#003527" />
      </View>
    );
  }

  if (!hadith) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbf9f5' }}>
        <Text style={{ color: '#707974', fontSize: 16 }}>Hadis bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fbf9f5' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingVertical: 16,
          paddingTop: insets.top + 16,
          backgroundColor: 'rgba(251,249,245,0.8)',
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8, borderRadius: 999 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#003527" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity style={{ padding: 8, borderRadius: 999 }}>
            <MaterialIcons name="bookmark-border" size={24} color="#404944" />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 8, borderRadius: 999 }}>
            <MaterialIcons name="share" size={24} color="#404944" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{ height: 3, backgroundColor: '#eae8e4' }}>
        <View style={{ height: '100%', width: '100%', backgroundColor: '#003527', borderRadius: 2 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 160 }}
      >
        {/* Category Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <View style={{ backgroundColor: '#fbe0a5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#534216', textTransform: 'uppercase', letterSpacing: 1 }}>
              Hadis-i Şerif
            </Text>
          </View>
          {hadith.chapter && (
            <Text style={{ fontSize: 12, color: '#707974', fontFamily: 'Inter_500Medium' }}>
              • {hadith.chapter}
            </Text>
          )}
        </View>

        {/* Hadith Content */}
        <Text style={{
          fontFamily: 'NotoSerif_700Bold',
          fontSize: 24,
          lineHeight: 40,
          color: '#1b1c1a',
          marginBottom: 32,
        }}>
          "{hadith.content}"
        </Text>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: 'rgba(191,201,195,0.3)', marginBottom: 24 }} />

        {/* Source Info */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 10, color: '#707974', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'Inter_600SemiBold', marginBottom: 4 }}>
            Kaynak
          </Text>
          <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#4c616c' }}>
            {formatHadithSource(hadith.source)}
          </Text>
        </View>

        {/* Completion Section */}
        <View style={{ alignItems: 'center', paddingTop: 48, borderTopWidth: 1, borderTopColor: 'rgba(191,201,195,0.2)' }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(6,78,59,0.05)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}>
            <MaterialIcons name="auto-stories" size={36} color="#003527" />
          </View>
          <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 22, color: '#003527', marginBottom: 8 }}>
            Okumanız Kaydedildi
          </Text>
          <Text style={{ color: '#4c616c', textAlign: 'center', maxWidth: 280, lineHeight: 22, marginBottom: 32 }}>
            Bir sonraki hadise geçebilir veya diğer içeriklere göz atabilirsiniz.
          </Text>

          <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
            <TouchableOpacity style={{
              alignItems: 'center',
              gap: 8,
            }}>
              <View style={{ width: 48, height: 48, backgroundColor: '#f5f3ef', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="share" size={22} color="#404944" />
              </View>
              <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#707974', fontFamily: 'Inter_600SemiBold' }}>Paylaş</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignItems: 'center',
              gap: 8,
            }}>
              <View style={{ width: 48, height: 48, backgroundColor: '#f5f3ef', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="file-download" size={22} color="#404944" />
              </View>
              <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#707974', fontFamily: 'Inter_600SemiBold' }}>İndir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
