import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface WidgetProps {
  city?: string;
  countdown?: string;
  nextPrayerName?: string;
  nextPrayerTime?: string;
  prayerTimes?: any;
  progress?: number;
  hadith?: { text: string; reference: string };
  isHijri?: string;
}

/**
 * Small Widget (2x2)
 * Minimalist countdown to next prayer
 */
export const SmallWidget: React.FC<WidgetProps> = ({ countdown, nextPrayerName }) => {
  return (
    <View style={styles.smallContainer}>
      <View style={styles.smallContent}>
        <View style={styles.smallHeader}>
          <MaterialIcons name="schedule" size={24} color="#003527" />
          <View style={styles.activeDot} />
        </View>
        <View>
          <Text style={styles.smallLabel}>{nextPrayerName}'ye</Text>
          <Text style={styles.smallTime}>{countdown}</Text>
          <Text style={styles.smallSubt}>Kalan Süre</Text>
        </View>
      </View>
      <View style={styles.smallBgAccent} />
    </View>
  );
};

/**
 * Medium Widget (4x2)
 * Horizontal timeline of prayer times
 */
export const MediumWidget: React.FC<WidgetProps> = ({ city, isHijri, prayerTimes, nextPrayerName }) => {
  const times = [
    { key: 'İMS', label: 'İMSAK', time: prayerTimes?.imsak },
    { key: 'GÜN', label: 'GÜNEŞ', time: prayerTimes?.gunes },
    { key: 'ÖĞL', label: 'ÖĞLE', time: prayerTimes?.ogle },
    { key: 'İKN', label: 'İKİNDİ', time: prayerTimes?.ikindi },
    { key: 'AKŞ', label: 'AKŞAM', time: prayerTimes?.aksam },
    { key: 'YAT', label: 'YATSI', time: prayerTimes?.yatsi },
  ];

  return (
    <View style={styles.mediumContainer}>
      <View style={styles.mediumHeader}>
        <View style={styles.mediumLocation}>
          <MaterialIcons name="location-on" size={16} color="#064e3b" />
          <Text style={styles.mediumCity}>{city?.toUpperCase() || 'İSTANBUL'}</Text>
        </View>
        <Text style={styles.mediumHijri}>{isHijri || '14 Rebiülevvel'}</Text>
      </View>
      <View style={styles.timelineRow}>
        {times.map((item, index) => {
          const isActive = nextPrayerName?.toUpperCase().startsWith(item.key) || 
                          (item.key === 'ÖĞL' && nextPrayerName === 'Öğle') ||
                          (item.key === 'İKN' && nextPrayerName === 'İkindi') ||
                          (item.key === 'AKŞ' && nextPrayerName === 'Akşam') ||
                          (item.key === 'İMS' && nextPrayerName === 'İmsak');
          
          return (
            <View key={index} style={[styles.timeColumn, isActive && styles.activeColumn]}>
              <Text style={[styles.timeKey, isActive && styles.activeKeyText]}>{item.label.substring(0, 3)}</Text>
              {isActive ? (
                <LinearGradient
                  colors={['#003527', '#064e3b']}
                  style={styles.activeTimeBox}
                >
                  <Text style={styles.activeTimeText}>{item.time}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTimeBox}>
                  <Text style={styles.inactiveTimeText}>{item.time}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

/**
 * Large Widget (4x4)
 * Detailed panel with progress ring and hadith
 */
export const LargeWidget: React.FC<WidgetProps> = ({ 
  countdown, nextPrayerName, nextPrayerTime, prayerTimes, progress = 0.5, hadith 
}) => {
  // Simple ring calculation
  const RING_SIZE = 110;
  const RING_STROKE = 8;
  const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  
  return (
    <View style={styles.largeContainer}>
      <View style={styles.largeHeroSection}>
        <View style={styles.ringContainer}>
          {/* Simple simulated ring */}
          <View style={[styles.ringBase, { width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE/2, borderWidth: RING_STROKE }]} />
          <View style={styles.ringCenter}>
            <Text style={styles.ringLabel}>KALAN</Text>
            <Text style={styles.ringTime}>{countdown?.substring(0, 5)}</Text>
          </View>
        </View>
        <View style={styles.largeNextInfo}>
          <Text style={styles.nextVakitLabel}>SIRADAKİ VAKİT</Text>
          <Text style={styles.nextVakitName}>{nextPrayerName}</Text>
          <Text style={styles.nextVakitTime}>{nextPrayerTime}</Text>
        </View>
      </View>

      <View style={styles.miniGrid}>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>İMSAK</Text>
          <Text style={styles.miniValue}>{prayerTimes?.imsak}</Text>
        </View>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>ÖĞLE</Text>
          <Text style={styles.miniValue}>{prayerTimes?.ogle}</Text>
        </View>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>AKŞAM</Text>
          <Text style={styles.miniValue}>{prayerTimes?.aksam}</Text>
        </View>
      </View>

      <View style={styles.hadithCard}>
        <View style={styles.quoteIconBox}>
          <MaterialIcons name="format-quote" size={32} color="rgba(255,255,255,0.2)" />
        </View>
        <Text style={styles.hadithLabel}>GÜNÜN HADİSİ</Text>
        <Text style={styles.hadithText}>
          "{hadith?.text || "Amellerin Allah'a en sevimli olanı, az da olsa devamlı olanıdır."}"
        </Text>
        <Text style={styles.hadithRef}>— {hadith?.reference || "Buhari, İman 32"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Small 2x2
  smallContainer: {
    width: 160,
    height: 160,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#1f2937',
    shadowOpacity: 0.05,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  smallContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  smallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2b6954',
  },
  smallLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#4c616c',
    textTransform: 'uppercase',
  },
  smallTime: {
    fontFamily: 'NotoSerif_700Bold',
    fontSize: 24,
    color: '#003527',
    marginTop: 4,
  },
  smallSubt: {
    fontSize: 10,
    color: '#bfc9c3',
    fontStyle: 'italic',
    marginTop: 2,
  },
  smallBgAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(0, 53, 39, 0.03)',
  },

  // Medium 4x2
  mediumContainer: {
    width: width - 48,
    height: 160,
    backgroundColor: '#f5f3ef',
    borderRadius: 40,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#1f2937',
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 2,
  },
  mediumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediumLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mediumCity: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#064e3b',
    letterSpacing: 1,
  },
  mediumHijri: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#707974',
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  timeColumn: {
    alignItems: 'center',
    gap: 8,
    opacity: 0.4,
  },
  activeColumn: {
    opacity: 1,
    transform: [{ translateY: -4 }],
  },
  timeKey: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#1b1c1a',
  },
  activeKeyText: {
    color: '#003527',
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
  },
  inactiveTimeBox: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTimeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#1b1c1a',
  },
  activeTimeBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003527',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  activeTimeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },

  // Large 4x4
  largeContainer: {
    width: width - 48,
    backgroundColor: '#fbf9f5',
    borderRadius: 48,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(191,201,195,0.2)',
    shadowColor: '#1f2937',
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 3,
  },
  largeHeroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ringContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBase: {
    position: 'absolute',
    borderColor: '#efeeea',
  },
  ringCenter: {
    alignItems: 'center',
  },
  ringLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#707974',
    letterSpacing: 2,
  },
  ringTime: {
    fontFamily: 'NotoSerif_700Bold',
    fontSize: 22,
    color: '#003527',
  },
  largeNextInfo: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: 20,
  },
  nextVakitLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#064e3b',
    letterSpacing: 2,
  },
  nextVakitName: {
    fontFamily: 'NotoSerif_700Bold',
    fontSize: 28,
    color: '#003527',
    marginTop: 4,
  },
  nextVakitTime: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#4c616c',
  },
  miniGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 20,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#f5f3ef',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#707974',
    marginBottom: 4,
  },
  miniValue: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#003527',
  },
  hadithCard: {
    backgroundColor: '#064e3b',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  quoteIconBox: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  hadithLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#80bea6',
    letterSpacing: 2,
    marginBottom: 8,
  },
  hadithText: {
    fontFamily: 'NotoSerif_400Regular',
    fontSize: 12,
    color: '#ffffff',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  hadithRef: {
    fontSize: 9,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
    marginTop: 8,
  },
});
