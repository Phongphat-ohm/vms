"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getActiveSessionAction } from "@/modules/auth/actions";

export default function HomePage() {
  const router = useRouter();

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const res = await getActiveSessionAction();
        if (res.success && res.data) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    }
    checkAuth();
  }, [router]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen flex flex-col items-center justify-center bg-slate-50"
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
      <p className="text-xs text-slate-500 font-medium">กำลังเข้าสู่ระบบบริหารหมู่บ้านอัจฉริยะ...</p>
      <span className="sr-only">กำลังโหลดและตรวจสอบสถานะการเข้าสู่ระบบ</span>
    </div>
  );
}
