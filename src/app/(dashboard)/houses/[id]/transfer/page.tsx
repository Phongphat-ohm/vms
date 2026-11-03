"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  User,
  Home,
  Calendar,
  Loader2,
  Building,
} from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Autocomplete, AutocompleteOption } from "@/components/ui/autocomplete";
import {
  getHouseByIdAction,
  listTargetHouseholdsAction,
  transferPersonAction,
} from "@/modules/households/actions";
import { HouseDetailDto } from "@/modules/households/types";

export default function HouseholdTransferPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-medium">กำลังโหลดแบบฟอร์มย้ายทะเบียน...</p>
        </div>
      }
    >
      <HouseholdTransferContent />
    </React.Suspense>
  );
}

function HouseholdTransferContent() {
  const router = useRouter();
  const params = useParams();
  const houseId = (params?.id as string) || "";

  const [house, setHouse] = React.useState<HouseDetailDto | null>(null);
  const [targetOptions, setTargetOptions] = React.useState<
    { householdId: string; houseNumber: string; headName: string }[]
  >([]);
  const [loading, setLoading] = React.useState(true);

  // Form State
  const [selectedPersonId, setSelectedPersonId] = React.useState("");
  const [targetHouseholdId, setTargetHouseholdId] = React.useState("");
  const [relationship, setRelationship] = React.useState("ผู้อาศัย");
  const [residenceType, setResidenceType] = React.useState<
    "OFFICIAL" | "ACTUAL_RESIDENT" | "OFFICIAL_ABSENT"
  >("OFFICIAL");
  const [effectiveDate, setEffectiveDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [reason, setReason] = React.useState("ย้ายเข้าอยู่อาศัยในครัวเรือนใหม่");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      if (!houseId) return;
      setLoading(true);
      try {
        const [houseRes, targetsRes] = await Promise.all([
          getHouseByIdAction(houseId),
          listTargetHouseholdsAction(houseId),
        ]);

        if (houseRes.success && houseRes.data) {
          setHouse(houseRes.data);
          if (houseRes.data.residents && houseRes.data.residents.length > 0) {
            setSelectedPersonId(houseRes.data.residents[0].personId);
          }
        }

        if (targetsRes.success && targetsRes.data) {
          setTargetOptions(targetsRes.data);
          if (targetsRes.data.length > 0) {
            setTargetHouseholdId(targetsRes.data[0].householdId);
          }
        }
      } catch (err) {
        console.error("Failed to load transfer data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [houseId]);

  const selectedPersonObj = house?.residents.find((r) => r.personId === selectedPersonId);
  const selectedTargetObj = targetOptions.find((t) => t.householdId === targetHouseholdId);

  const handleConfirmTransfer = async () => {
    if (!house?.householdId || !selectedPersonId || !targetHouseholdId) {
      Swal.fire("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกบุคคลและครัวเรือนปลายทาง", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "ยืนยันการโอนย้ายประชากรข้ามบ้าน?",
      html: `
        <div style="font-size: 14px; color: #334155; text-align: left; line-height: 1.6;">
          <p><b>บุคคล:</b> ${selectedPersonObj?.fullName || "-"}</p>
          <p><b>ต้นทาง:</b> บ้านเลขที่ ${house.houseNumber} (${house.householdCode})</p>
          <p><b>ปลายทาง:</b> ${selectedTargetObj?.houseNumber || "-"} (หัวหน้า: ${selectedTargetObj?.headName || "-"})</p>
          <p><b>ความสัมพันธ์:</b> ${relationship}</p>
          <p><b>วันที่มีผล:</b> ${effectiveDate}</p>
          <p style="margin-top: 8px; color: #d97706; font-weight: 600;">
            * การย้ายจะถูกประมวลผลด้วย ACID Transaction และบันทึกลง household_events แบบถาวร
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยันการย้ายทันที",
      cancelButtonText: "กลับไปแก้ไข",
      confirmButtonColor: "#3B82F6",
      cancelButtonColor: "#94A3B8",
      customClass: { popup: "rounded-[24px]" },
    });

    if (confirm.isConfirmed) {
      setIsSubmitting(true);
      try {
        const res = await transferPersonAction({
          personId: selectedPersonId,
          sourceHouseholdId: house.householdId,
          targetHouseholdId,
          relationshipToHead: relationship,
          residenceType,
          effectiveDate,
          reason,
        });

        if (res.success) {
          await Swal.fire({
            title: "โอนย้ายสำเร็จ",
            text: res.message || "ปรับปรุงสถานะสมาชิกครัวเรือนและบันทึกประวัติการย้ายเรียบร้อยแล้ว",
            icon: "success",
            confirmButtonColor: "#3B82F6",
            customClass: { popup: "rounded-[24px]" },
          });
          router.push(`/houses/${house.id}`);
          router.refresh();
        } else {
          Swal.fire({
            title: "การโอนย้ายไม่สำเร็จ",
            text: res.error?.message || "เกิดข้อผิดพลาดในการทำรายการ",
            icon: "error",
            confirmButtonColor: "#EF4444",
            customClass: { popup: "rounded-[24px]" },
          });
        }
      } catch (err: any) {
        Swal.fire("ผิดพลาด", err.message || "การย้ายขัดข้อง กรุณาลองใหม่อีกครั้ง", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลการโอนย้าย...</p>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-slate-900">ไม่พบข้อมูลบ้านต้นทาง</h2>
        <Link href="/houses" className="mt-4 inline-block">
          <Button variant="outline" className="rounded-xl text-xs">
            &larr; กลับหน้ารายการบ้าน
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/houses/${house.id}`}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            โอนย้ายประชากรข้ามบ้าน
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            ย้ายทะเบียนสมาชิกจาก บ้านเลขที่ {house.houseNumber} ไปยังครัวเรือนอื่นในหมู่บ้าน
          </p>
        </div>
      </div>

      {/* Main Transfer Form Card */}
      <Card className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Step 1: Source Member Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            1. เลือกสมาชิกในบ้านเลขที่ {house.houseNumber} ที่ต้องการย้าย *
          </Label>
          {house.residents.length === 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-800">
              บ้านเลขที่นี้ยังไม่มีสมาชิกที่อยู่อาศัยในปัจจุบัน จึงไม่สามารถทำการย้ายได้
            </div>
          ) : (
            <Autocomplete
              value={selectedPersonId}
              onChange={setSelectedPersonId}
              placeholder="-- ค้นหาและเลือกสมาชิกในบ้าน --"
              searchPlaceholder="ค้นหาตามชื่อ หรือบทบาท..."
              options={house.residents.map((r) => ({
                value: r.personId,
                label: r.fullName,
                subLabel: r.relationshipToHead,
                badge: r.isHead ? "หัวหน้าครัวเรือน" : undefined,
              }))}
            />
          )}
        </div>

        {/* Step 2: Target Household Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-600" />
            2. เลือกครัวเรือน/บ้านปลายทาง *
          </Label>
          {targetOptions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              ไม่มีบ้านหลังอื่นในหมู่บ้านที่พร้อมรับการย้ายเข้า
            </div>
          ) : (
            <Autocomplete
              value={targetHouseholdId}
              onChange={setTargetHouseholdId}
              placeholder="-- ค้นหาและเลือกบ้านปลายทาง --"
              searchPlaceholder="ค้นหาตามบ้านเลขที่ หรือชื่อหัวหน้าครัวเรือน..."
              options={targetOptions.map((t) => ({
                value: t.householdId,
                label: `บ้านเลขที่ ${t.houseNumber}`,
                subLabel: `หัวหน้า: ${t.headName}`,
              }))}
            />
          )}
        </div>

        {/* Step 3: Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              ความสัมพันธ์กับหัวหน้าครัวเรือนใหม่ *
            </Label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="ผู้อาศัย">ผู้อาศัย</option>
              <option value="บุตร">บุตร</option>
              <option value="คู่สมรส">คู่สมรส</option>
              <option value="บิดา/มารดา">บิดา / มารดา</option>
              <option value="ญาติ">ญาติ</option>
              <option value="หัวหน้าครัวเรือน">หัวหน้าครัวเรือน (แต่งตั้งแทน)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              สถานะการอยู่อาศัย *
            </Label>
            <select
              value={residenceType}
              onChange={(e) => setResidenceType(e.target.value as any)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="OFFICIAL">มีชื่อในทะเบียนบ้านและอาศัยอยู่จริง</option>
              <option value="ACTUAL_RESIDENT">อาศัยอยู่จริงแต่ไม่มีชื่อในทะเบียน</option>
              <option value="OFFICIAL_ABSENT">มีชื่อในทะเบียนแต่ตัวไม่อยู่</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              วันที่มีผลการย้าย *
            </Label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              เหตุผลการย้าย *
            </Label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="เช่น ย้ายเข้าแต่งงาน, รวมครอบครัว"
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href={`/houses/${house.id}`}>
            <Button variant="outline" className="rounded-xl text-xs font-semibold h-11 px-5">
              ยกเลิก
            </Button>
          </Link>
          <Button
            onClick={handleConfirmTransfer}
            disabled={isSubmitting || house.residents.length === 0 || targetOptions.length === 0}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold h-11 px-6 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                กำลังทำรายการ Transaction...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                ดำเนินการย้ายประชากร
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
