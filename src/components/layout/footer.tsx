"use client";

import * as React from "react";
import { Building2, ShieldCheck } from "lucide-react";
import { publicConfig } from "@/lib/config";
import { useVillage } from "@/components/providers/village-provider";

export function Footer() {
  const currentYear = 2026;
  const { fullAddress } = useVillage();

  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/80 backdrop-blur-xs py-6 px-4 sm:px-6 lg:px-8 mt-auto select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        {/* Left Side: Village & Organization */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-xs sm:text-sm">
              {fullAddress}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              ระบบบริหารหมู่บ้านอัจฉริยะ (Smart Village Management System - VMS) • ศูนย์รวมระบบงานชุมชนในที่เดียว
            </div>
          </div>
        </div>

        {/* Center: Compliance Badges */}
        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 min-h-[36px]">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>มาตรฐาน PDPA คุ้มครองข้อมูลส่วนบุคคล</span>
          </div>
        </div>

        {/* Right Side: Version & Copyright */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1 text-xs">
          <div className="text-slate-600 font-medium">
            © {currentYear} Developer By PHONGPHAT
          </div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Smart Village System (V1.0.0)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
