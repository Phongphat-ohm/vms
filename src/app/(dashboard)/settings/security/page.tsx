"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Building2,
  AlertTriangle,
  Loader2,
  Save,
  User,
} from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  getUserPinStatusAction,
  setUserSecurityPinAction,
} from "@/modules/settings/actions";

export default function SecuritySettingsPage() {
  const [hasPin, setHasPin] = React.useState(false);
  const [isLocked, setIsLocked] = React.useState(false);
  const [remainingMinutes, setRemainingMinutes] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form states
  const [currentPin, setCurrentPin] = React.useState("");
  const [newPin, setNewPin] = React.useState("");
  const [confirmPin, setConfirmPin] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserPinStatusAction();
      if (res.success && res.data) {
        setHasPin(res.data.hasPin);
        setIsLocked(res.data.isLocked);
        setRemainingMinutes(res.data.remainingMinutes || null);
      }
    } catch (err) {
      console.error("Failed to load PIN status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (hasPin && (!currentPin || currentPin.length !== 6)) {
      setError("กรุณากรอกรหัส PIN เดิม 6 หลัก");
      return;
    }

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setError("รหัส PIN ใหม่ต้องเป็นตัวเลข 6 หลัก");
      return;
    }

    if (newPin !== confirmPin) {
      setError("รหัส PIN ใหม่และยืนยันรหัส PIN ไม่ตรงกัน");
      return;
    }

    // Basic strength check
    if (/^(\d)\1{5}$/.test(newPin)) {
      setError("รหัส PIN ไม่ปลอดภัย: ห้ามใช้ตัวเลขซ้ำกันทั้งหมด เช่น 111111");
      return;
    }
    if (newPin === "123456" || newPin === "654321") {
      setError("รหัส PIN ไม่ปลอดภัย: ห้ามใช้ตัวเลขเรียงลำดับ เช่น 123456");
      return;
    }

    setIsSaving(true);
    try {
      const res = await setUserSecurityPinAction(newPin, hasPin ? currentPin : undefined);
      if (res.success) {
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
        await Swal.fire({
          icon: "success",
          title: "บันทึกรหัส PIN สำเร็จ",
          text: hasPin
            ? "เปลี่ยนรหัสความปลอดภัย PIN 6 หลักเรียบร้อยแล้ว"
            : "ตั้งค่ารหัสความปลอดภัย PIN 6 หลักส่วนบุคคลเรียบร้อยแล้ว",
          confirmButtonColor: "#3B82F6",
          customClass: { popup: "rounded-[24px]" },
        });
        fetchStatus();
      } else {
        setError(res.error?.message || "ไม่สามารถตั้งค่ารหัส PIN ได้");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกรหัส PIN");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          การตั้งค่าระบบและความปลอดภัย
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
          จัดการข้อมูลหมู่บ้าน และตั้งค่ารหัสความปลอดภัยส่วนตัวสำหรับการเข้าถึงข้อมูลสำคัญตามมาตรฐาน PDPA
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
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>ข้อมูลทั่วไปของหมู่บ้าน</span>
          </div>
        </Link>
        <Link
          href="/settings/security"
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors bg-blue-50 text-blue-700 border border-blue-100"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <span>รหัสความปลอดภัยส่วนตัว (PIN 6 หลัก)</span>
          </div>
        </Link>
      </div>

      <Card className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-10 shadow-sm space-y-6">
        {loading ? (
          <div className="py-12 flex justify-center items-center gap-2 text-slate-500 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            กำลังโหลดข้อมูลความปลอดภัย...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Card Banner */}
            <div className="p-4 rounded-2xl bg-[#F8FAFF] border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    hasPin
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  {hasPin ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    สถานะรหัสความปลอดภัย 6 หลัก:{" "}
                    <span className={hasPin ? "text-emerald-700" : "text-amber-700"}>
                      {hasPin ? "เปิดใช้งานแล้ว (คุ้มครอง PDPA 2 ชั้น)" : "ยังไม่ได้ตั้งค่า"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {hasPin
                      ? "เข้ารหัสปลอดภัยด้วย PBKDF2-HMAC-SHA512 + Salt เฉพาะบุคคล (100,000 Rounds) ในระดับผู้ใช้"
                      : "กรุณาตั้งรหัส PIN 6 หลักเพื่อใช้ยืนยันก่อนเปิดดูเลขประจำตัวประชาชน 13 หลัก"}
                  </div>
                </div>
              </div>

              {isLocked && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  ถูกล็อคชั่วคราว ({remainingMinutes} นาที)
                </span>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
              >
                {error}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 max-w-md">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-blue-600" />
                {hasPin ? "เปลี่ยนรหัสความปลอดภัย PIN 6 หลัก" : "ตั้งค่ารหัส PIN 6 หลักใหม่"}
              </h2>

              {hasPin && (
                <div className="space-y-1.5">
                  <Label htmlFor="current-pin" className="text-xs font-semibold text-slate-700">
                    รหัส PIN 6 หลักปัจจุบัน *
                  </Label>
                  <input
                    id="current-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    required
                    disabled={isSaving || isLocked}
                    className="w-full tracking-[0.5em] font-mono text-lg h-11 px-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="new-pin" className="text-xs font-semibold text-slate-700">
                  {hasPin ? "รหัส PIN 6 หลักใหม่ *" : "รหัส PIN 6 หลักที่ต้องการตั้ง *"}
                </Label>
                <input
                  id="new-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  required
                  disabled={isSaving || isLocked}
                  className="w-full tracking-[0.5em] font-mono text-lg h-11 px-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                <p className="text-xs text-slate-500">
                  * กำหนดเป็นตัวเลข 6 หลัก (ห้ามใช้ตัวเลขซ้ำกันทั้งหมด เช่น 111111 หรือ 123456)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-pin" className="text-xs font-semibold text-slate-700">
                  ยืนยันรหัส PIN 6 หลักอีกครั้ง *
                </Label>
                <input
                  id="confirm-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  required
                  disabled={isSaving || isLocked}
                  className="w-full tracking-[0.5em] font-mono text-lg h-11 px-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="submit"
                disabled={isSaving || isLocked || newPin.length !== 6 || confirmPin.length !== 6}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    กำลังบันทึกรหัส PIN...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1.5" />
                    บันทึกรหัส PIN 6 หลัก
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
