import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Magnetometer } from "expo-sensors";
import { useLocation } from "../context/LocationContext";
import { calculateDistanceToKaaba, formatDistance, KAABA_COORDS } from "../api/mizan";

function calculateQiblaAngle(lat: number, lon: number): number {
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;
  const lat2 = (KAABA_COORDS.lat * Math.PI) / 180;
  const lon2 = (KAABA_COORDS.lon * Math.PI) / 180;

  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let angle = (Math.atan2(y, x) * 180) / Math.PI;
  return (angle + 360) % 360;
}

function getCompassHeading(magnetometer: { x: number; y: number; z: number }): number {
  let angle = Math.atan2(magnetometer.y, magnetometer.x) * (180 / Math.PI);
  // Adjust for device orientation
  if (Platform.OS === "ios") {
    angle = angle + 90;
  }
  return (angle + 360) % 360;
}

export function QiblaCompassScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const location = useLocation();
  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [distance, setDistance] = useState(0);
  const [compassReady, setCompassReady] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Calculate qibla direction and distance when location is ready
  useEffect(() => {
    if (!location.granted) return;
    const angle = calculateQiblaAngle(location.lat, location.lon);
    setQiblaAngle(angle);
    const dist = calculateDistanceToKaaba(location.lat, location.lon);
    setDistance(dist);
  }, [location.lat, location.lon, location.granted]);

  // Start magnetometer for real compass
  useEffect(() => {
    if (!permissionGranted) return;

    let subscription: any;

    (async () => {
      const available = await Magnetometer.isAvailableAsync();
      if (!available) {
        console.warn("Magnetometer not available");
        setCompassReady(true);
        return;
      }

      Magnetometer.setUpdateInterval(100);
      subscription = Magnetometer.addListener((data) => {
        const h = getCompassHeading(data);
        setHeading(h);
        setCompassReady(true);
      });
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [permissionGranted]);

  // The arrow should point to qibla relative to current heading
  const arrowRotation = qiblaAngle - heading;

  const handleGrantPermission = () => {
    setPermissionGranted(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fbf9f5', position: 'relative' }}>
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
          Kıble Pusulası
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('NotificationSettings')}
          style={{ padding: 8, borderRadius: 999 }}
        >
          <MaterialIcons name="notifications-none" size={24} color="#064e3b" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 100 }}>
        {/* Headline */}
        <View style={{ width: '100%', marginBottom: 48, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 28, color: '#003527', textAlign: 'center' }}>
            Yönünüzü Tayin Edin
          </Text>
          <Text style={{ color: '#4c616c', fontFamily: 'Inter_500Medium', marginTop: 8, textAlign: 'center' }}>
            {location.city}{location.country ? `, ${location.country}` : ''} konumundan yönlendirme
          </Text>
        </View>

        {!permissionGranted || !compassReady ? (
          <ActivityIndicator size="large" color="#003527" />
        ) : (
          <>
            {/* Compass */}
            <View style={{ position: 'relative', width: 288, height: 288, alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer ring */}
              <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: 144, borderWidth: 1, borderColor: 'rgba(0,53,39,0.05)',
                backgroundColor: 'rgba(245,243,239,0.3)',
              }} />
              {/* Dashed inner ring */}
              <View style={{
                position: 'absolute', top: 8, left: 8, right: 8, bottom: 8,
                borderRadius: 136, borderWidth: 2, borderStyle: 'dashed',
                borderColor: 'rgba(191,201,195,0.3)',
              }} />

              {/* Cardinal directions - rotate with phone heading */}
              <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                alignItems: 'center', justifyContent: 'center',
                transform: [{ rotate: `${-heading}deg` }],
              }}>
                <Text style={{ position: 'absolute', top: 16, fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#ba1a1a' }}>K</Text>
                <Text style={{ position: 'absolute', bottom: 16, fontSize: 11, fontFamily: 'Inter_600SemiBold', color: 'rgba(76,97,108,0.4)' }}>G</Text>
                <Text style={{ position: 'absolute', left: 16, fontSize: 11, fontFamily: 'Inter_600SemiBold', color: 'rgba(76,97,108,0.4)' }}>B</Text>
                <Text style={{ position: 'absolute', right: 16, fontSize: 11, fontFamily: 'Inter_600SemiBold', color: 'rgba(76,97,108,0.4)' }}>D</Text>
              </View>

              {/* Inner Circle */}
              <View style={{
                position: 'absolute', top: 64, left: 64, right: 64, bottom: 64,
                borderRadius: 80, backgroundColor: '#ffffff',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 4, borderColor: 'rgba(0,53,39,0.1)',
              }}>
                <MaterialIcons name="explore" size={48} color="#2b6954" />
              </View>

              {/* Qibla Arrow - rotates to point at Kaaba relative to heading */}
              <View
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8,
                  transform: [{ rotate: `${arrowRotation}deg` }],
                }}
              >
                <View style={{ width: 6, height: 96, backgroundColor: '#003527', borderRadius: 999, position: 'relative', alignItems: 'center' }}>
                  <View style={{ position: 'absolute', top: -4, width: 16, height: 16, backgroundColor: '#2b6954', borderRadius: 4, transform: [{ rotate: '45deg' }] }} />
                  <View style={{ position: 'absolute', top: -48, alignItems: 'center' }}>
                    <MaterialIcons name="mosque" size={20} color="#064e3b" />
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#064e3b', textTransform: 'uppercase', marginTop: 4 }}>Kıble</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Info Cards */}
            <View style={{ marginTop: 40, alignItems: 'center', gap: 12 }}>
              {/* Qibla Degree */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: '#064e3b', paddingHorizontal: 24, paddingVertical: 12,
                borderRadius: 999,
              }}>
                <MaterialIcons name="rotate-right" size={20} color="#80bea6" />
                <Text style={{ fontFamily: 'Inter_600SemiBold', letterSpacing: 1, color: '#80bea6' }}>
                  Kıble yönü: {qiblaAngle.toFixed(1)}°
                </Text>
              </View>

              {/* Distance to Kaaba */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: '#f5f3ef', paddingHorizontal: 24, paddingVertical: 12,
                borderRadius: 999,
              }}>
                <MaterialIcons name="place" size={20} color="#003527" />
                <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#003527', fontSize: 14 }}>
                  Kabe'ye uzaklık: {formatDistance(distance)}
                </Text>
              </View>

              {/* Current heading */}
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#707974', marginTop: 8 }}>
                Pusula yönünüz: {Math.round(heading)}°
              </Text>
            </View>

            <Text style={{
              color: '#4c616c', fontSize: 14, fontFamily: 'NotoSerif_400Regular',
              fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 32,
              lineHeight: 22, marginTop: 32,
            }}>
              "Nereye dönerseniz dönün, Allah'ın vechi ordadır."
            </Text>
          </>
        )}
      </View>

      {/* Permissions Modal */}
      {!permissionGranted && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,53,39,0.2)', zIndex: 50,
          alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <View style={{
            backgroundColor: '#ffffff', width: '100%', maxWidth: 400,
            borderRadius: 32, padding: 32, alignItems: 'center',
            shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 32,
            shadowOffset: { width: 0, height: 16 },
          }}>
            <View style={{
              width: 64, height: 64, backgroundColor: '#cfe6f2',
              borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24,
            }}>
              <MaterialIcons name="explore" size={32} color="#4c616c" />
            </View>
            <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 22, color: '#1b1c1a', marginBottom: 12, textAlign: 'center' }}>
              Pusula İzni
            </Text>
            <Text style={{ color: '#4c616c', textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
              Kıble yönünü canlı olarak göstermek için cihazınızın pusula sensörüne erişim izni gereklidir.
            </Text>

            <TouchableOpacity
              style={{
                width: '100%', backgroundColor: '#003527',
                paddingVertical: 16, borderRadius: 999, alignItems: 'center', marginBottom: 12,
              }}
              onPress={handleGrantPermission}
            >
              <Text style={{ color: '#ffffff', fontFamily: 'Inter_600SemiBold' }}>Pusulayı Aç</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '100%', paddingVertical: 12, borderRadius: 999,
                alignItems: 'center', backgroundColor: '#f5f3ef',
              }}
            >
              <Text style={{ color: '#4c616c', fontFamily: 'Inter_500Medium' }}>Daha Sonra</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
