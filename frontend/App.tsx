import "./global.css";
import React, { useCallback } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  NotoSerif_400Regular,
  NotoSerif_700Bold,
} from "@expo-google-fonts/noto-serif";

import { LocationProvider } from "./src/context/LocationContext";
import { HomePrayerScreen } from "./src/screens/HomePrayerScreen";
import { QuranReadingScreen } from "./src/screens/QuranReadingScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { QiblaCompassScreen } from "./src/screens/QiblaCompassScreen";
import { HadithSirahListScreen } from "./src/screens/HadithSirahListScreen";
import { HadithDetailScreen } from "./src/screens/HadithDetailScreen";
import { SirahDetailScreen } from "./src/screens/SirahDetailScreen";
import { NotificationSettingsScreen } from "./src/screens/NotificationSettingsScreen";

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const QuranStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const HadithStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomePrayerScreen} />
      <HomeStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </HomeStack.Navigator>
  );
}

function QuranStackScreen() {
  return (
    <QuranStack.Navigator screenOptions={{ headerShown: false }}>
      <QuranStack.Screen name="QuranMain" component={QuranReadingScreen} />
      <QuranStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </QuranStack.Navigator>
  );
}

function SearchStackScreen() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchMain" component={SearchScreen} />
      <SearchStack.Screen name="HadithDetail" component={HadithDetailScreen} />
      <SearchStack.Screen name="SirahDetail" component={SirahDetailScreen} />
      <SearchStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </SearchStack.Navigator>
  );
}

function HadithStackScreen() {
  return (
    <HadithStack.Navigator screenOptions={{ headerShown: false }}>
      <HadithStack.Screen name="HadithSirahList" component={HadithSirahListScreen} />
      <HadithStack.Screen name="HadithDetail" component={HadithDetailScreen} />
      <HadithStack.Screen name="SirahDetail" component={SirahDetailScreen} />
      <HadithStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </HadithStack.Navigator>
  );
}

function MoreStackScreen() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="QiblaMain" component={QiblaCompassScreen} />
      <MoreStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </MoreStack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    NotoSerif_400Regular,
    NotoSerif_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <LocationProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName: any = "device-unknown";

                  if (route.name === "AnaSayfa") {
                    iconName = focused ? "home" : "home";
                  } else if (route.name === "Kuran") {
                    iconName = "menu-book";
                  } else if (route.name === "Hadis") {
                    iconName = "auto-stories";
                  } else if (route.name === "Arama") {
                    iconName = "search";
                  } else if (route.name === "Diger") {
                    iconName = "explore";
                  }

                  return <MaterialIcons name={iconName} size={28} color={color} />;
                },
                tabBarActiveTintColor: "#003527",
                tabBarInactiveTintColor: "rgba(6, 78, 59, 0.4)",
                tabBarStyle: {
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  paddingBottom: 24,
                  paddingTop: 12,
                  backgroundColor: "rgba(251, 249, 245, 0.95)",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  borderTopWidth: 0,
                  elevation: 24,
                  shadowColor: "#1f2937",
                  shadowOpacity: 0.05,
                  shadowRadius: 32,
                  shadowOffset: { width: 0, height: -12 },
                },
                tabBarItemStyle: {
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                },
                tabBarLabelStyle: {
                  fontFamily: "Inter_500Medium",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginTop: 4,
                },
                tabBarShowLabel: true,
              })}
            >
              <Tab.Screen
                name="AnaSayfa"
                component={HomeStackScreen}
                options={{ tabBarLabel: "Ana Sayfa" }}
              />
              <Tab.Screen
                name="Kuran"
                component={QuranStackScreen}
                options={{ tabBarLabel: "Kur'an" }}
              />
              <Tab.Screen
                name="Hadis"
                component={HadithStackScreen}
                options={{ tabBarLabel: "Hadis" }}
              />
              <Tab.Screen
                name="Arama"
                component={SearchStackScreen}
                options={{ tabBarLabel: "Arama" }}
              />
              <Tab.Screen
                name="Diger"
                component={MoreStackScreen}
                options={{ tabBarLabel: "Kıble" }}
              />
            </Tab.Navigator>
          </NavigationContainer>
          <StatusBar style="dark" />
        </View>
      </LocationProvider>
    </SafeAreaProvider>
  );
}
