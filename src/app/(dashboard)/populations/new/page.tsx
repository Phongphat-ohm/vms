"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { validateThaiNationalIdCheckDigit } from "@/lib/crypto";
import { formatThaiNationalId, formatThaiPhoneNumber, cleanDigits } from "@/lib/formatters";
import { createPersonAction } from "@/modules/population/actions";

export default function NewPopulationPage() {
  const router = useRouter();
  const [nationalId, setNationalId] = React.useState("");
  const [title, setTitle] = React.useState("นาย");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [gender, setGender] = React.useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [birthDate, setBirthDate] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [occupation, setOccupation] = React.useState("");
  const [education, setEducation] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Live Check Digit validation
  const cleanId = nationalId.replace(/\D/g, "");
  const is13Digits = cleanId.length === 13;
  const isCheckDigitValid = is13Digits && validateThaiNationalIdCheckDigit(cleanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCheckDigitValid) {
      Swal.fire({
        title: "เลขบัตรประชาชนไม่ถูกต้อง",
        text: "กรุณาตรวจสอบเลขประจำตัวประชาชน 13 หลัก (Check Digit ไม่ตรงตามมาตรฐานทะเบียนราษฎร์)",
        icon: "error",
        confirmButtonColor: "#3B82F6",
        customClass: { popup: "rounded-[24px]" },
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await createPersonAction({
        nationalId: cleanId,
        title,
        firstName,
        lastName,
        gender,
        birthDate,
        phoneNumber: cleanDigits(phoneNumber) || undefined,
        occupation,
        education,
      });

      if (response.success) {
        await Swal.fire({
          title: "บันทึกข้อมูลประชากรสำเร็จ",
          text: `รหัสประชากร: ${response.data?.personCode} (ข้อมูลเลขบัตรถูกเข้ารหัส AES-256-GCM เรียบร้อยแล้ว)`,
          icon: "success",
          confirmButtonColor: "#3B82F6",
          customClass: { popup: "rounded-[24px]" },
        });
        router.push("/populations");
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: response.error?.message || "ไม่สามารถบันทึกข้อมูลได้",
          icon: "error",
          confirmButtonColor: "#3B82F6",
          customClass: { popup: "rounded-[24px]" },
        });
      }
    } catch {
      Swal.fire("ข้อผิดพลาด", "การเชื่อมต่อขัดข้อง กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/populations"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              เพิ่มข้อมูลประชากรใหม่
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-normal">
              บันทึกข้อมูลบุคคลขึ้นทะเบียนหมู่บ้าน พร้อมระบบเข้ารหัส PDPA อัตโนมัติ
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identification & Security */}
          <div className="border-b border-slate-100 pb-6">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              ข้อมูลประจำตัวและเลขบัตรประชาชน (PDPA Encrypted)
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="nationalId" className="text-xs font-semibold text-slate-700">
                เลขประจำตัวประชาชน 13 หลัก *
              </Label>
              <div className="relative">
                <Input
                  id="nationalId"
                  value={nationalId}
                  onChange={(e) => setNationalId(formatThaiNationalId(e.target.value))}
                  placeholder="X-XXXX-XXXXX-XX-X"
                  required
                  maxLength={17}
                  className="font-mono h-11 rounded-xl text-xs sm:text-sm tracking-wider"
                />
                {is13Digits && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-medium">
                    {isCheckDigitValid ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> ถูกต้อง
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Check Digit ไม่ถูกต้อง
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                * ข้อมูลจะถูกเข้ารหัสระดับฟิลด์ด้วย AES-256-GCM ทันที และสร้าง Blind Index สำหรับการค้นหา
              </p>
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div className="border-b border-slate-100 pb-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">ข้อมูลส่วนบุคคล</h2>

            {/* Row 1: คำนำหน้า, ชื่อจริง, นามสกุล (12-column grid, spans: 2 + 5 + 5 = 12) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="space-y-1.5 sm:col-span-3 lg:col-span-2">
                <Label htmlFor="title" className="text-xs font-semibold text-slate-700">
                  คำนำหน้า *
                </Label>
                <select
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                >
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="ด.ช.">ด.ช.</option>
                  <option value="ด.ญ.">ด.ญ.</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-9 lg:col-span-5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">
                  ชื่อจริง *
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ชื่อจริง"
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-12 lg:col-span-5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">
                  นามสกุล *
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="นามสกุล"
                  required
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Row 2: เพศตามทะเบียน, วันเดือนปีเกิด (12-column grid, spans: 6 + 6 = 12) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="space-y-1.5 sm:col-span-6">
                <Label className="text-xs font-semibold text-slate-700">
                  เพศตามทะเบียน *
                </Label>
                <div className="flex items-center gap-3 h-11">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "MALE"}
                      onChange={() => setGender("MALE")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    ชาย
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "FEMALE"}
                      onChange={() => setGender("FEMALE")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    หญิง
                  </label>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-6">
                <Label htmlFor="birthDate" className="text-xs font-semibold text-slate-700">
                  วันเดือนปีเกิด *
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Occupation & Contact */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900">ข้อมูลติดต่อและอาชีพ</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-xs font-semibold text-slate-700">
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatThaiPhoneNumber(e.target.value))}
                  placeholder="08x-xxx-xxxx"
                  maxLength={12}
                  className="font-mono h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="occupation" className="text-xs font-semibold text-slate-700">
                  อาชีพ
                </Label>
                <Input
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="เช่น เกษตรกรรม, ค้าขาย"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="education" className="text-xs font-semibold text-slate-700">
                  ระดับการศึกษา
                </Label>
                <Input
                  id="education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="เช่น มัธยมศึกษา, ปริญญาตรี"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link href="/populations">
              <Button type="button" variant="outline" className="h-11 rounded-xl px-5 text-xs font-semibold">
                ยกเลิก
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isLoading || !isCheckDigitValid}
              className="h-11 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  กำลังบันทึกข้อมูล...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  บันทึกข้อมูลประชากร
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
