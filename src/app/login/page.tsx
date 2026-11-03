"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Loader2, ArrowRight, KeyRound, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/modules/auth/actions";
import { publicConfig } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกอีเมล",
        text: "โปรดระบุอีเมลผู้ใช้งานเพื่อเข้าสู่ระบบ",
        confirmButtonColor: "#3B82F6",
        customClass: { popup: "rounded-[24px]" },
      });
      return;
    }

    if (!password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกรหัสผ่าน",
        text: "โปรดระบุรหัสผ่านเพื่อเข้าสู่ระบบ",
        confirmButtonColor: "#3B82F6",
        customClass: { popup: "rounded-[24px]" },
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAction({ email, password });
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          text: res.message || "ยินดีต้อนรับเข้าสู่ระบบ VMS",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "rounded-[24px]" },
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          text: res.error?.message || "โปรดตรวจสอบอีเมลและรหัสผ่านอีกครั้ง",
          confirmButtonColor: "#EF4444",
          customClass: { popup: "rounded-[24px]" },
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อกับระบบตรวจสอบสิทธิ์ได้",
        confirmButtonColor: "#EF4444",
        customClass: { popup: "rounded-[24px]" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Shield className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          เข้าสู่ระบบบริหารหมู่บ้านอัจฉริยะ
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-500 max-w">
          {publicConfig.appName}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                อีเมลเจ้าหน้าที่ / ผู้ดูแล
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@village.local"
                  startIcon={<Mail className="h-4 w-4" />}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                รหัสผ่านเข้าใช้งาน
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  startIcon={<Lock className="h-4 w-4" />}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl transition-colors cursor-pointer"
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังตรวจสอบสิทธิ์...
                </>
              ) : (
                <>
                  เข้าสู่ระบบ
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center text-xs text-slate-500">
          ระบบบริหารหมู่บ้านอัจฉริยะ รวบรวมงานชุมชนในที่เดียว มั่นคงปลอดภัยตามมาตรฐาน PDPA
        </div>
      </div>
    </div>
  );
}
