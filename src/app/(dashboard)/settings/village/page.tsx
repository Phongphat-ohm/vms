"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Save, ShieldCheck, MapPin, Phone, Loader2, Lock, User } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatThaiPhoneNumber, cleanDigits } from "@/lib/formatters";
import { publicConfig } from "@/lib/config";
import { CustomSwal } from "@/lib/alert";
import { useVillage } from "@/components/providers/village-provider";
import { getVillageInfoAction, updateVillageInfoAction } from "@/modules/settings/actions";

export default function VillageSettingsPage() {
  const { refreshVillage } = useVillage();
  const [villageName, setVillageName] = React.useState(publicConfig.defaultVillage.name);
  const [moo, setMoo] = React.useState(String(publicConfig.defaultVillage.moo));
  const [subdistrict, setSubdistrict] = React.useState(publicConfig.defaultVillage.subdistrict);
  const [district, setDistrict] = React.useState(publicConfig.defaultVillage.district);
  const [province, setProvince] = React.useState(publicConfig.defaultVillage.province);
  const [postalCode, setPostalCode] = React.useState(publicConfig.defaultVillage.postalCode);
  const [phoneNumber, setPhoneNumber] = React.useState(publicConfig.defaultVillage.phone);
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    async function loadVillageInfo() {
      try {
        const res = await getVillageInfoAction();
        if (res.success && res.data) {
          setVillageName(res.data.name);
          setMoo(String(res.data.moo));
          setSubdistrict(res.data.subdistrict);
          setDistrict(res.data.district);
          setProvince(res.data.province);
          setPostalCode(res.data.postalCode);
          if (res.data.phoneNumber) {
            setPhoneNumber(formatThaiPhoneNumber(res.data.phoneNumber));
          } else {
            setPhoneNumber("");
          }
        }
      } catch (err) {
        console.error("Failed to load village settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVillageInfo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updateVillageInfoAction({
        name: villageName,
        moo: Number(moo),
        subdistrict,
        district,
        province,
        postalCode,
        phoneNumber: cleanDigits(phoneNumber),
      });

      if (res.success) {
        await refreshVillage();
        await CustomSwal.fire({
          title: "บันทึกการตั้งค่าสำเร็จ",
          text: "ข้อมูลหมู่บ้านได้รับการปรับปรุงเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonColor: "#3B82F6",
        });
      } else {
        CustomSwal.fire({
          title: "เกิดข้อผิดพลาด",
          text: res.error?.message || "ไม่สามารถบันทึกข้อมูลได้",
          icon: "error",
          confirmButtonColor: "#3B82F6",
        });
      }
    } catch (err: any) {
      CustomSwal.fire("ข้อผิดพลาด", err.message || "การเชื่อมต่อขัดข้อง", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          การตั้งค่าข้อมูลหมู่บ้าน
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
          กำหนดรายละเอียดทางการ ที่อยู่ และข้อมูลการติดต่อของหมู่บ้าน
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <Link
          href="/settings/profile"
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>ข้อมูลส่วนตัวและรหัสผ่าน</span>
          </div>
        </Link>
        <Link
          href="/settings/village"
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors bg-blue-50 text-blue-700 border border-blue-100"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span>ข้อมูลทั่วไปของหมู่บ้าน</span>
          </div>
        </Link>
        <Link
          href="/settings/security"
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>รหัสความปลอดภัยส่วนตัว (PIN 6 หลัก)</span>
          </div>
        </Link>
      </div>

      <Card className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-10 shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center items-center gap-2 text-slate-500 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            กำลังโหลดข้อมูลหมู่บ้าน...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="border-b border-slate-100 pb-6">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-blue-600" />
                ข้อมูลทั่วไปประจำหมู่บ้าน
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="vName" className="text-xs font-semibold text-slate-700">
                    ชื่อหมู่บ้าน / ชุมชน *
                  </Label>
                  <Input
                    id="vName"
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="vMoo" className="text-xs font-semibold text-slate-700">
                    หมู่ที่ *
                  </Label>
                  <Input
                    id="vMoo"
                    value={moo}
                    onChange={(e) => setMoo(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-6">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-blue-600" />
                ที่ตั้งทางการปกครอง
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vSub" className="text-xs font-semibold text-slate-700">
                    ตำบล *
                  </Label>
                  <Input
                    id="vSub"
                    value={subdistrict}
                    onChange={(e) => setSubdistrict(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vDist" className="text-xs font-semibold text-slate-700">
                    อำเภอ *
                  </Label>
                  <Input
                    id="vDist"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vProv" className="text-xs font-semibold text-slate-700">
                    จังหวัด *
                  </Label>
                  <Input
                    id="vProv"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vZip" className="text-xs font-semibold text-slate-700">
                    รหัสไปรษณีย์ *
                  </Label>
                  <Input
                    id="vZip"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Phone className="h-4 w-4 text-blue-600" />
                การติดต่อสำนักงานหมู่บ้าน
              </h2>

              <div className="space-y-1.5 max-w-sm">
                <Label htmlFor="vPhone" className="text-xs font-semibold text-slate-700">
                  เบอร์โทรศัพท์สำนักงาน
                </Label>
                <Input
                  id="vPhone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatThaiPhoneNumber(e.target.value))}
                  placeholder="0xx-xxx-xxxx หรือ 02-xxx-xxxx"
                  className="h-11 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-11 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    กำลังบันทึกข้อมูล...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1.5" />
                    บันทึกการตั้งค่าหมู่บ้าน
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
