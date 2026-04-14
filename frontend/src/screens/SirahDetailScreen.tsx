import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getSirahById, Sirah } from "../api/mizan";

export function SirahDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { sirahId, sirah: passedSirah } = route.params || {};
  const [sirah, setSirah] = useState<Sirah | null>(passedSirah || null);
  const [loading, setLoading] = useState(!passedSirah);

  useEffect(() => {
    if (passedSirah) return;
    async function load() {
      try {
        const data = await getSirahById(sirahId);
        setSirah(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sirahId, passedSirah]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbf9f5' }}>
        <ActivityIndicator size="large" color="#003527" />
      </View>
    );
  }

  if (!sirah) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbf9f5' }}>
        <Text style={{ color: '#707974', fontSize: 16 }}>İçerik bulunamadı</Text>
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
        <View style={{ height: '100%', width: '35%', backgroundColor: '#003527', borderRadius: 2 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 160 }}
      >
        {/* Category + Read Time */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <View style={{ backgroundColor: '#cfe6f2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#526772', textTransform: 'uppercase', letterSpacing: 1 }}>
              Siyer-i Nebi
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#707974', fontFamily: 'Inter_500Medium' }}>
            • {Math.ceil((sirah.content?.length || 500) / 200)} dk okuma
          </Text>
        </View>

        {/* Title */}
        <Text style={{
          fontFamily: 'NotoSerif_700Bold',
          fontSize: 32,
          color: '#003527',
          lineHeight: 44,
          letterSpacing: -0.5,
          marginBottom: 24,
        }}>
          {sirah.title}
        </Text>

        {/* Subtitle/Summary */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <View style={{ width: 48, height: 1, backgroundColor: '#bfc9c3' }} />
          <Text style={{
            flex: 1,
            fontFamily: 'NotoSerif_400Regular',
            fontStyle: 'italic',
            color: '#404944',
            fontSize: 16,
            lineHeight: 24,
            opacity: 0.8,
          }}>
            {sirah.summary}
          </Text>
        </View>

        {/* Part/Unit info */}
        {sirah.partTitle && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: '#f5f3ef',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 16,
            marginBottom: 32,
          }}>
            <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#003527' }}>
              {sirah.partTitle}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#707974' }}>
              Ünite {sirah.unitNumber} - {sirah.unitTitle}
            </Text>
          </View>
        )}

        {/* Content */}
        <Text style={{
          fontFamily: 'NotoSerif_400Regular',
          fontSize: 18,
          lineHeight: 36,
          color: 'rgba(27,28,26,0.9)',
          letterSpacing: -0.2,
        }}>
          {sirah.content}
        </Text>

        {/* Completion Section */}
        <View style={{ alignItems: 'center', marginTop: 64, paddingTop: 48, borderTopWidth: 1, borderTopColor: 'rgba(191,201,195,0.2)' }}>
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
            Bu bölümü tamamladınız
          </Text>
          <Text style={{ color: '#4c616c', textAlign: 'center', maxWidth: 300, lineHeight: 22, marginBottom: 32 }}>
            Okumanız kaydedildi. Bir sonraki bölüme geçebilir veya diğer hadislere göz atabilirsiniz.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              paddingHorizontal: 40,
              paddingVertical: 16,
              backgroundColor: '#003527',
              borderRadius: 999,
              shadowColor: '#003527',
              shadowOpacity: 0.1,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              marginBottom: 24,
            }}
          >
            <Text style={{ color: '#ffffff', fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>
              Bölümü Bitir
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
            <TouchableOpacity style={{ alignItems: 'center', gap: 8 }}>
              <View style={{ width: 48, height: 48, backgroundColor: '#f5f3ef', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="share" size={22} color="#404944" />
              </View>
              <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#707974', fontFamily: 'Inter_600SemiBold' }}>Paylaş</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', gap: 8 }}>
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
