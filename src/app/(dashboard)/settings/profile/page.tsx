"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Shield,
  Lock,
  Smartphone,
  Save,
  CheckCircle2,
  Loader2,
  Building2,
  KeyRound,
  Mail,
  Phone,
} from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatThaiPhoneNumber, cleanDigits } from "@/lib/formatters";
import { publicConfig } from "@/lib/config";
import {
  getCurrentUserProfileAction,
  updateCurrentUserProfileAction,
  changeCurrentUserPasswordAction,
} from "@/modules/settings/actions";
import { UserProfileDto } from "@/modules/settings/types";

export default function ProfileSettingsPage() {
  const [profile, setProfile] = React.useState<UserProfileDto | null>(null);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [loading, setLoading] = React.useState(true);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getCurrentUserProfileAction();
        if (res.success && res.data) {
          setProfile(res.data);
          setFullName(res.data.fullName);
          setEmail(res.data.email);
          if (res.data.phoneNumber && res.data.phoneNumber !== "-") {
            setPhone(formatThaiPhoneNumber(res.data.phoneNumber));
          } else {
            setPhone("");
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      Swal.fire("ข้อผิดพลาด", "กรุณาระบุชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร", "warning");
      return;
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      Swal.fire("ข้อผิดพลาด", "กรุณาระบุอีเมลที่ถูกต้อง", "warning");
      return;
    }

    setIsSavingProfile(true);

    try {
      const res = await updateCurrentUserProfileAction({
        fullName: cleanName,
        email: cleanEmail,
        phoneNumber: cleanDigits(phone),
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setFullName(res.data.fullName);
        setEmail(res.data.email);
        if (res.data.phoneNumber && res.data.phoneNumber !== "-") {
          setPhone(formatThaiPhoneNumber(res.data.phoneNumber));
        } else {
          setPhone("");
        }
        await Swal.fire({
          title: "บันทึกข้อมูลส่วนตัวสำเร็จ",
          text: res.message || "ปรับปรุงชื่อ อีเมล และเบอร์โทรศัพท์เรียบร้อยแล้ว",
          icon: "success",
          confirmButtonColor: "#3B82F6",
          customClass: { popup: "rounded-[24px]" },
        });
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: res.error?.message || "ไม่สามารถบันทึกข้อมูลส่วนตัวได้",
          icon: "error",
          confirmButtonColor: "#EF4444",
          customClass: { popup: "rounded-[24px]" },
        });
      }
    } catch (err: any) {
      Swal.fire("ข้อผิดพลาด", err.message || "ไม่สามารถบันทึกข้อมูลส่วนตัวได้", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire("ข้อผิดพลาด", "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน", "error");
      return;
    }

    if (newPassword.length < 8) {
      Swal.fire("รหัสผ่านสั้นเกินไป", "กรุณากำหนดรหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร", "warning");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeCurrentUserPasswordAction({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        await Swal.fire({
          title: "เปลี่ยนรหัสผ่านสำเร็จ",
          text: res.message || "ระบบได้ทำการปรับปรุงรหัสผ่านใหม่เรียบร้อยแล้ว",
          icon: "success",
          confirmButtonColor: "#3B82F6",
          customClass: { popup: "rounded-[24px]" },
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: res.error?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้",
          icon: "error",
          confirmButtonColor: "#EF4444",
          customClass: { popup: "rounded-[24px]" },
        });
      }
    } catch {
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถเปลี่ยนรหัสผ่านได้", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ตั้งค่าข้อมูลส่วนตัวและความปลอดภัย
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
          จัดการโปรไฟล์เจ้าหน้าที่ เปลี่ยนชื่อ อีเมล รหัสผ่าน และรหัสความปลอดภัย PIN
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <Link
          href="/settings/profile"
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors bg-blue-50 text-blue-700 border border-blue-100"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
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
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>รหัสความปลอดภัยส่วนตัว (PIN 6 หลัก)</span>
          </div>
        </Link>
      </div>

      {/* Profile Form (Name, Email, Phone) */}
      <Card className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-10 shadow-sm">
        {loading ? (
          <div className="py-8 flex justify-center items-center gap-2 text-slate-500 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            กำลังโหลดโปรไฟล์...
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              ข้อมูลโปรไฟล์เจ้าหน้าที่ (ชื่อ และ อีเมล)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="prof-name" className="text-xs font-semibold text-slate-700">
                  ชื่อ - นามสกุล *
                </Label>
                <div className="relative">
                  <Input
                    id="prof-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl"
                  />
                  <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="prof-email" className="text-xs font-semibold text-slate-700">
                  อีเมลทางการสำหรับเข้าสู่ระบบ *
                </Label>
                <div className="relative">
                  <Input
                    id="prof-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl"
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="prof-phone" className="text-xs font-semibold text-slate-700">
                  เบอร์โทรศัพท์ติดต่อ
                </Label>
                <div className="relative">
                  <Input
                    id="prof-phone"
                    value={phone}
                    onChange={(e) => setPhone(formatThaiPhoneNumber(e.target.value))}
                    maxLength={12}
                    className="pl-10 h-11 rounded-xl font-mono"
                  />
                  <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Roles badge */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">บทบาทที่ได้รับมอบหมาย</Label>
                <div className="h-11 flex items-center px-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs font-bold text-blue-800">
                  {profile?.roles?.join(", ") || "เจ้าหน้าที่ปฏิบัติการ (STAFF)"}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="h-10 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold disabled:opacity-50 px-5 shadow-xs"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1" />
                    บันทึกข้อมูลส่วนตัว (ชื่อ / อีเมล)
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Change Password Form */}
      <Card className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-10 shadow-sm">
        <form onSubmit={handleChangePassword} className="space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" />
            เปลี่ยนรหัสผ่านใหม่ (Password)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">รหัสผ่านปัจจุบัน</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">รหัสผ่านใหม่ *</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">ยืนยันรหัสผ่านใหม่ *</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              disabled={isChangingPassword || newPassword.length < 8 || confirmPassword.length < 8}
              className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 shadow-xs disabled:opacity-50"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-blue-400" />
                  กำลังเปลี่ยนรหัสผ่าน...
                </>
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5 mr-1" />
                  เปลี่ยนรหัสผ่าน
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
