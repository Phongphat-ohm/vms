"use client";

import * as React from "react";
import Link from "next/link";
import {
  Home,
  Plus,
  Users,
  MapPin,
  ArrowRightLeft,
  Building,
  RefreshCw,
  Loader2,
  X,
  Save,
} from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listHousesAction } from "@/modules/households/actions";
import { HouseDto } from "@/modules/households/types";
import { CreateHouseModal } from "@/components/houses/create-house-modal";

export default function HousesPage() {
  const [houses, setHouses] = React.useState<HouseDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Modal State for New House
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchHouses = React.useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await listHousesAction();
      if (res.success && res.data) {
        setHouses(res.data);
      }
    } catch (err) {
      console.error("Failed to load houses:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            บ้านและทะเบียนครัวเรือน
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
            บริหารจัดการสิ่งปลูกสร้าง ครัวเรือน และการโอนย้ายบุคคลภายในหมู่บ้าน
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => fetchHouses(true)}
            disabled={isRefreshing || loading}
            className="h-11 rounded-xl text-xs font-semibold px-3.5 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>

          <Link href="/houses/h-1/transfer">
            <Button variant="outline" className="h-11 rounded-xl text-xs sm:text-sm font-semibold">
              <ArrowRightLeft className="h-4 w-4 mr-1.5 text-blue-600" />
              โอนย้ายสมาชิกครัวเรือน
            </Button>
          </Link>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-11 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs sm:text-sm font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            เพิ่มบ้านใหม่
          </Button>
        </div>
      </div>

      {/* House Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-medium">กำลังโหลดทะเบียนบ้านและครัวเรือน...</p>
        </div>
      ) : houses.length === 0 ? (
        <div className="rounded-[32px] bg-white border border-slate-100 p-12 text-center shadow-sm">
          <Home className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">ยังไม่มีข้อมูลบ้านในหมู่บ้าน</h2>
          <p className="text-xs text-slate-500 mt-1">กดปุ่ม "เพิ่มบ้านใหม่" เพื่อเริ่มต้นบันทึกข้อมูลบ้านหลังแรก</p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            เพิ่มบ้านใหม่
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {houses.map((house) => (
            <div
              key={house.id}
              className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* House Number & Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      บ้านเลขที่
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                      {house.houseNumber}
                      {house.subHouseNumber && (
                        <span className="text-sm font-medium text-slate-500 ml-2">
                          ({house.subHouseNumber})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Home className="h-5 w-5" />
                  </div>
                </div>

                {/* Building Type & Coordinates */}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <span>{house.buildingType}</span>
                  <span>•</span>
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono text-xs">{house.coordinates || "13.7563, 100.5018"}</span>
                </div>

                {/* Household Info Box */}
                <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">รหัสครัวเรือน:</span>
                    <span className="font-mono font-bold text-blue-600">{house.householdCode || "HH-2026-0001"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-2">
                    <span className="font-semibold text-slate-700">หัวหน้าครัวเรือน:</span>
                    <span className="font-bold text-slate-900">{house.headName || "ยังไม่ได้ระบุหัวหน้า"}</span>
                  </div>
                </div>

                {/* Member Summary Badges */}
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    ผู้อยู่อาศัยทั้งหมด: {house.totalResidents} คน
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-blue-700 font-medium">ทร.14: {house.officialCount ?? 0}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-amber-700 font-medium">ผู้เช่า: {house.tenantCount ?? 0}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/houses/${house.id}/transfer`}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ArrowRightLeft className="h-3 w-3" /> ย้ายคนเข้า/ออก
                </Link>

                <Link
                  href={`/houses/${house.id}`}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                >
                  ดูผังครัวเรือน &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standard Accessible Modal for Creating New House */}
      <CreateHouseModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchHouses}
      />
    </div>
  );
}
