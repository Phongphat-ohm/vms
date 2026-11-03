"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Bell, LogOut, ChevronDown, Loader2, Check, Menu } from "lucide-react";
import Swal from "sweetalert2";
import { CustomSwal } from "@/lib/alert";
import { publicConfig } from "@/lib/config";
import { useVillage } from "@/components/providers/village-provider";
import { logoutAction, getActiveSessionAction } from "@/modules/auth/actions";
import { AuthenticatedUser } from "@/lib/auth";

export interface HeaderProps {
  onToggleMobileNav?: () => void;
}

export function Header({ onToggleMobileNav }: HeaderProps) {
  const router = useRouter();
  const [session, setSession] = React.useState<AuthenticatedUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function loadSession() {
      try {
        const res = await getActiveSessionAction();
        if (res.success && res.data) {
          setSession(res.data);
        }
      } catch (err) {
        console.error("Failed to load header session:", err);
      }
    }
    loadSession();
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const confirm = await CustomSwal.fire({
      title: "ต้องการออกจากระบบหรือไม่?",
      text: "คุณจะต้องลงชื่อเข้าใช้ใหม่อีกครั้งเพื่อเข้าถึงระบบ",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#94A3B8",
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });

    if (confirm.isConfirmed) {
      setIsLoggingOut(true);

      // แสดงสถานะกำลังออกจากระบบทันที ให้ผู้ใช้ทราบโดยไม่ต้องรอ
      CustomSwal.fire({
        title: "กำลังออกจากระบบ...",
        text: "ระบบกำลังล้างข้อมูลเซสชันความปลอดภัย กรุณารอสักครู่",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await logoutAction();

        // แจ้งผลสำเร็จชัดเจนพร้อมนับถอยหลังนำทาง
        await CustomSwal.fire({
          icon: "success",
          title: "ออกจากระบบสำเร็จ",
          text: "กำลังนำคุณกลับไปยังหน้าเข้าสู่ระบบ...",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        router.replace("/login");
        router.refresh();
      } catch (err) {
        console.error("Logout error:", err);
        await CustomSwal.fire({
          icon: "info",
          title: "ออกจากระบบเรียบร้อย",
          text: "กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...",
          timer: 1200,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        router.replace("/login");
        router.refresh();
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  const displayName = session?.fullName || "เจ้าหน้าที่ปฏิบัติการ";
  const displayRole = session?.roles?.[0]
    ? session.roles[0] === "SYSTEM_ADMIN"
      ? "ผู้ดูแลระบบสูงสุด (System Admin)"
      : session.roles[0] === "VILLAGE_ADMIN"
      ? "ผู้ดูแลระบบหมู่บ้าน (Admin)"
      : "เจ้าหน้าที่ปฏิบัติการ (Staff)"
    : "เจ้าหน้าที่";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const { fullAddress } = useVillage();
  const activeVillageDisplay = fullAddress || session?.activeVillageName;

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6">
      {/* Left side: Hamburger button on mobile + Village Context Selector */}
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger Menu Button (< lg) */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer lg:hidden"
          aria-label="เปิดเมนูนำทาง"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Current Village Context Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="min-h-[44px] min-w-[44px] flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
            aria-label="เลือกบริบทหมู่บ้าน"
          >
            <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[200px] md:max-w-xs text-left">
              {activeVillageDisplay}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0 ml-0.5" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                บริบทหมู่บ้านที่กำลังทำงาน
              </div>
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/80 text-blue-700 text-xs font-bold">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate">{activeVillageDisplay}</span>
                  </div>
                  <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                </div>
              </div>
              <div className="px-3 py-2 text-xs text-slate-500 border-t border-slate-100">
                {session?.roles.includes("SYSTEM_ADMIN")
                  ? "สิทธิ์ระดับ System Admin เข้าถึงได้ทุกหมู่บ้าน"
                  : `รหัสหมู่บ้าน: ${session?.activeVillageId?.slice(0, 8) || "-"}`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Officer Profile & Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* <button
          type="button"
          className="min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          aria-label="แจ้งเตือน"
          onClick={() => {
            CustomSwal.fire({
              title: "การแจ้งเตือนระบบ",
              text: "ไม่มีการแจ้งเตือนใหม่ในขณะนี้ ข้อมูลความมั่นคงปลอดภัยทั้งหมดเป็นปกติ",
              icon: "info",
              confirmButtonColor: "#3B82F6",
            });
          }}
        >
          <Bell className="h-4 w-4" />
        </button> */}

        <div className="h-5 w-px bg-slate-200" />

        <Link
          href="/settings/profile"
          className="min-h-[44px] min-w-[44px] px-2 py-1.5 flex items-center gap-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          title="แก้ไขข้อมูลส่วนตัวและรหัสผ่าน"
          aria-label="แก้ไขข้อมูลส่วนตัวและรหัสผ่าน"
        >
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200 uppercase shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {displayName}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {displayRole}
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer ml-0.5 sm:ml-1"
          title="ออกจากระบบ"
          aria-label="ออกจากระบบ"
        >
          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin text-rose-500" /> : <LogOut className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
