"use client";

import * as React from "react";
import { VillageInfoDto } from "@/modules/settings/types";
import { getActiveVillagePublicInfoAction } from "@/modules/settings/actions";
import { publicConfig } from "@/lib/config";

export interface VillageContextValue {
  village: VillageInfoDto | null;
  isLoading: boolean;
  villageName: string;
  moo: number;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phone: string;
  fullAddress: string;
  shortBadge: string;
  refreshVillage: () => Promise<void>;
}

const VillageContext = React.createContext<VillageContextValue | null>(null);

export function VillageProvider({ children }: { children: React.ReactNode }) {
  const [village, setVillage] = React.useState<VillageInfoDto | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const fetchVillage = React.useCallback(async () => {
    try {
      const res = await getActiveVillagePublicInfoAction();
      if (res.success && res.data) {
        setVillage(res.data);
      }
    } catch (error) {
      console.error("Failed to load village details from database:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchVillage();
  }, [fetchVillage]);

  const value = React.useMemo<VillageContextValue>(() => {
    const vName = village?.name || publicConfig.defaultVillage.name;
    const vMoo = village?.moo ?? publicConfig.defaultVillage.moo;
    const vSub = village?.subdistrict || publicConfig.defaultVillage.subdistrict;
    const vDist = village?.district || publicConfig.defaultVillage.district;
    const vProv = village?.province || publicConfig.defaultVillage.province;
    const vZip = village?.postalCode || publicConfig.defaultVillage.postalCode;
    const vPhone = village?.phoneNumber || publicConfig.defaultVillage.phone;

    const fullAddress = `${vName} (หมู่ ${vMoo} ต.${vSub} อ.${vDist} จ.${vProv} ${vZip})`;
    const shortBadge = `${vName} ม.${vMoo}`;

    return {
      village,
      isLoading,
      villageName: vName,
      moo: vMoo,
      subdistrict: vSub,
      district: vDist,
      province: vProv,
      postalCode: vZip,
      phone: vPhone,
      fullAddress,
      shortBadge,
      refreshVillage: fetchVillage,
    };
  }, [village, isLoading, fetchVillage]);

  return <VillageContext.Provider value={value}>{children}</VillageContext.Provider>;
}

export function useVillage(): VillageContextValue {
  const context = React.useContext(VillageContext);
  if (!context) {
    // Provide a safe fallback object so components outside VillageProvider don't throw
    return {
      village: null,
      isLoading: false,
      villageName: publicConfig.defaultVillage.name,
      moo: publicConfig.defaultVillage.moo,
      subdistrict: publicConfig.defaultVillage.subdistrict,
      district: publicConfig.defaultVillage.district,
      province: publicConfig.defaultVillage.province,
      postalCode: publicConfig.defaultVillage.postalCode,
      phone: publicConfig.defaultVillage.phone,
      fullAddress: publicConfig.defaultVillage.fullAddress,
      shortBadge: publicConfig.defaultVillage.shortBadge,
      refreshVillage: async () => {},
    };
  }
  return context;
}
