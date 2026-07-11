import { useState, useEffect, useMemo } from "react";

export interface Province {
  name: string;
  region: string;
  key: string;
}

export interface City {
  name: string;
  province: string; // references province key
  city?: boolean;
}

export function usePhilippineLocations() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      import("@/data/ph-provinces.json").then((m) => m.default),
      import("@/data/ph-cities.json").then((m) => m.default),
    ])
      .then(([provData, cityData]) => {
        if (active) {
          setProvinces(provData);
          setCities(cityData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load Philippine location data dynamically:", err);
      });

    return () => {
      active = false;
    };
  }, []);

  // Extract distinct regions
  const regions = useMemo(() => {
    const set = new Set<string>();
    provinces.forEach((p) => {
      if (p.region) set.add(p.region);
    });
    return Array.from(set).sort();
  }, [provinces]);

  // Fetch provinces belonging to a region (memoized lookup)
  const getProvincesForRegion = useMemo(() => {
    return (regionName: string | null) => {
      if (!regionName) return [];
      return provinces
        .filter((p) => p.region === regionName)
        .sort((a, b) => a.name.localeCompare(b.name));
    };
  }, [provinces]);

  // Fetch cities/municipalities belonging to a province (memoized lookup)
  const getCitiesForProvince = useMemo(() => {
    return (provinceName: string | null) => {
      if (!provinceName) return [];
      const prov = provinces.find((p) => p.name === provinceName);
      if (!prov) return [];
      return cities
        .filter((c) => c.province === prov.key)
        .sort((a, b) => a.name.localeCompare(b.name));
    };
  }, [provinces, cities]);

  return {
    isLoading,
    regions,
    provinces,
    cities,
    getProvincesForRegion,
    getCitiesForProvince,
  };
}
