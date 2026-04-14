import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface NotificationOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const { width, height } = Dimensions.get('window');

export const NotificationOnboardingModal: React.FC<NotificationOnboardingModalProps> = ({
  visible,
  onClose,
  onAccept,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Main Modal Container */}
        <View style={styles.container}>
          {/* Hero Illustration Section */}
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvFjVUg-HjaHN0m4PQGQsTktyRgb11NQgiiCyoXwrF2jRw8Ud_OWevlYTSbBYHm-hhQYDV5SBs7zJ8F2ySSCIDwuZDsDW88uiiNixfGE77tsVfQ1Nkd74rmHw3Y3-npbHTX22KfHEUtM6APqp4e8pfmm9vgo1Sxjf71xyRhwUMcyqpOKQgDaxZzstUeRK9MWCtiz47_BesVK5ArMHkxmAOAtwz5tl2CvwHn_P-cxNDZa2aGSqhdihdgYHHb6vK6nufkJGZFVOda8o' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Gradient Overlay for the bottom of image */}
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,1)']}
              style={styles.imageGradient}
            />
            {/* Floating Decorative Bell Icon */}
            <View style={styles.floatingIconContainer}>
              <View style={styles.floatingIcon}>
                <MaterialIcons name="notifications-active" size={24} color="#ffffff" />
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            <Text style={styles.headline}>Vakitleri kaçırmayın</Text>

            {/* Benefits List */}
            <View style={styles.benefitsList}>
              {/* Item 1 */}
              <View style={styles.benefitItem}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="schedule" size={24} color="#003527" />
                </View>
                <View style={styles.benefitTextContent}>
                  <Text style={styles.benefitTitle}>Namaz vakitleri bildirimleri</Text>
                  <Text style={styles.benefitDescription}>
                    Ezan vakitlerinden önce ve vakit girdiğinde hatırlatıcılar alın.
                  </Text>
                </View>
              </View>

              {/* Item 2 */}
              <View style={styles.benefitItem}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="auto-stories" size={24} color="#003527" />
                </View>
                <View style={styles.benefitTextContent}>
                  <Text style={styles.benefitTitle}>Günlük Ayet ve Hadisler</Text>
                  <Text style={styles.benefitDescription}>
                    Günün her saati ilham verici içeriklerle maneviyatınızı tazeleyin.
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={onAccept} activeOpacity={0.9}>
                <LinearGradient
                  colors={['#003527', '#064e3b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Bildirimleri Aç</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={styles.secondaryButton}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>Daha Sonra</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 53, 39, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#1f2937',
    shadowOpacity: 0.1,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  floatingIconContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  floatingIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
  headline: {
    fontFamily: 'NotoSerif_700Bold',
    fontSize: 28,
    color: '#003527',
    marginBottom: 24,
    marginTop: 8,
    lineHeight: 36,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 40,
    gap: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f5f3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextContent: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1b1c1a',
    marginBottom: 4,
  },
  benefitDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#404944',
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003527',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#003527',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
