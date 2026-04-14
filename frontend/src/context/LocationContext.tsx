import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as Location from "expo-location";

interface LocationData {
  lat: number;
  lon: number;
  city: string;
  country: string;
  granted: boolean;
  loading: boolean;
  refreshLocation: () => Promise<void>;
}

const DEFAULT: LocationData = {
  lat: 41.0082,
  lon: 28.9784,
  city: "İstanbul",
  country: "TR",
  granted: false,
  loading: true,
  refreshLocation: async () => {},
};

const LocationContext = createContext<LocationData>(DEFAULT);

export function useLocation() {
  return useContext(LocationContext);
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState<LocationData>(DEFAULT);

  const requestLocation = async (isManual = false) => {
    if (isManual) setLoc((prev) => ({ ...prev, loading: true }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoc((prev) => ({ ...prev, loading: false }));
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      let city = "Bilinmeyen";
      let country = "";
      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geo) {
          city = geo.city || geo.subregion || geo.region || "Bilinmeyen";
          country = geo.isoCountryCode || geo.country || "";
        }
      } catch {
        // fallback
      }

      setLoc({
        lat: latitude,
        lon: longitude,
        city,
        country,
        granted: true,
        loading: false,
        refreshLocation,
      });
    } catch (err) {
      console.error("Location error:", err);
      setLoc((prev) => ({ ...prev, loading: false }));
    }
  };

  const refreshLocation = async () => {
    await requestLocation(true);
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ ...loc, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
}
