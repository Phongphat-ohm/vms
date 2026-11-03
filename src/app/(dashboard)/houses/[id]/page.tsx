"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Home,
  Building,
  Users,
  MapPin,
  ArrowRightLeft,
  Shield,
  Loader2,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { publicConfig } from "@/lib/config";
import { useVillage } from "@/components/providers/village-provider";
import { getHouseByIdAction } from "@/modules/households/actions";
import { HouseDetailDto } from "@/modules/households/types";
import { EditHouseModal } from "@/components/houses/edit-house-modal";

export default function HouseDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลบ้าน...</p>
        </div>
      }
    >
      <HouseDetailContent />
    </React.Suspense>
  );
}

function HouseDetailContent() {
  const { shortBadge } = useVillage();
  const params = useParams();
  const houseId = (params?.id as string) || "h-1";

  const [house, setHouse] = React.useState<HouseDetailDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadHouse() {
      setLoading(true);
      try {
        const res = await getHouseByIdAction(houseId);
        if (res.success && res.data) {
          setHouse(res.data);
        }
      } catch (err) {
        console.error("Failed to load house detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHouse();
  }, [houseId]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลบ้านและครัวเรือน...</p>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-slate-900">ไม่พบข้อมูลบ้าน</h2>
        <p className="text-xs text-slate-500 mt-1">ข้อมูลบ้านที่ระบุอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <Link href="/houses" className="mt-4 inline-block">
          <Button variant="outline" className="rounded-xl text-xs">
            &larr; กลับหน้ารายการบ้าน
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/houses"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                บ้านเลขที่ {house.houseNumber}
                {house.subHouseNumber && ` (${house.subHouseNumber})`}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                มีผู้อยู่อาศัย {house.totalResidents} คน
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              รหัสครัวเรือน: {house.householdCode} • {shortBadge}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="h-10 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 border-slate-200"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            แก้ไขข้อมูลบ้าน
          </Button>

          <Link href={`/houses/${house.id}/transfer`}>
            <Button className="h-10 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold shadow-xs">
              <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
              โอนย้ายสมาชิก
            </Button>
          </Link>
        </div>
      </div>

      {/* House Property Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[32px] bg-white border border-slate-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-600" />
            ข้อมูลสิ่งปลูกสร้าง
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">ประเภทสิ่งปลูกสร้าง</span>
              <span className="text-slate-800 font-semibold text-sm">{house.buildingType}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">พิกัดทางภูมิศาสตร์ (GPS)</span>
              <span className="text-slate-800 font-mono font-semibold">{house.coordinates || "13.7563, 100.5018"}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">สถานะ</span>
              <span className={`font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                house.isActive ? "text-emerald-700 bg-emerald-50" : "text-slate-600 bg-slate-100"
              }`}>
                {house.isActive ? "ใช้งานปกติ (ACTIVE)" : "ระงับการใช้งาน"}
              </span>
            </div>
          </div>
        </Card>

        {/* Household Members Table */}
        <Card className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-7 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              สมาชิกในครัวเรือน ({house.residents.length} คน)
            </h2>
            <span className="text-xs text-slate-500 font-mono">{house.householdCode}</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {house.residents.map((resident) => (
              <div key={resident.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {resident.fullName}
                    {resident.isHead && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        หัวหน้าครัวเรือน
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 mt-1">
                    อายุ {resident.age} ปี • {resident.gender} • อาชีพ {resident.occupation}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      resident.residenceType === "OFFICIAL"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : resident.residenceType === "ACTUAL_RESIDENT"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {resident.residenceType === "OFFICIAL"
                      ? "ตาม ท.ร.14"
                      : resident.residenceType === "ACTUAL_RESIDENT"
                      ? "ผู้เช่า / ผู้อาศัยจริง"
                      : "ทำงานนอกพื้นที่"}
                  </span>

                  <Link href={`/populations/${resident.personId}`}>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs text-blue-600">
                      ดูประวัติ &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <EditHouseModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        house={house}
        onSuccess={(updated) => setHouse(updated)}
      />
    </div>
  );
}
