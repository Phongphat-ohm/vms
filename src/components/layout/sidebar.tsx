"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Home,
  FileText,
  UserCheck,
  ShieldAlert,
  Settings,
  History,
  Building2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { publicConfig } from "@/lib/config";
import { useVillage } from "@/components/providers/village-provider";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "ภาพรวมระบบ",
    items: [
      {
        title: "แดชบอร์ดภาพรวม",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "ทะเบียนและชุมชน",
    items: [
      {
        title: "ทะเบียนประชากร",
        href: "/populations",
        icon: Users,
      },
      {
        title: "บ้านและครัวเรือน",
        href: "/houses",
        icon: Home,
      },
      {
        title: "คลังเอกสารและไฟล์",
        href: "/documents",
        icon: FileText,
      },
    ],
  },
  {
    label: "การจัดการและผู้ดูแล",
    items: [
      {
        title: "จัดการผู้ใช้งาน",
        href: "/users",
        icon: UserCheck,
      },
      {
        title: "บทบาทและสิทธิ์",
        href: "/roles",
        icon: ShieldAlert,
      },
      {
        title: "บันทึกประวัติ (Audit)",
        href: "/audit-logs",
        icon: History,
      },
      {
        title: "ตั้งค่าระบบและโปรไฟล์",
        href: "/settings/profile",
        icon: Settings,
      },
    ],
  },
];

interface SidebarContentProps {
  pathname: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

function SidebarContent({
  pathname,
  onClose,
  showCloseButton = false,
}: SidebarContentProps) {
  const { shortBadge } = useVillage();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50/80 border border-blue-100 text-blue-600 shadow-sm shadow-blue-500/5">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              ระบบหมู่บ้านอัจฉริยะ
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Smart Village Hub
            </div>
          </div>
        </div>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer lg:hidden"
            aria-label="ปิดเมนูนำทาง"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu Grouped (Independently Scrollable) */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-3.5 pt-1 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {group.label}
            </div>

            {group.items.map((item) => {
              const isActive = item.href.startsWith("/settings")
                ? pathname.startsWith("/settings")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-blue-50/90 text-blue-700 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer System Status (Sticky bottom inside sidebar) */}
      <div className="shrink-0 p-4 border-t border-slate-100 m-2 rounded-2xl bg-[#F8FAFF] border border-blue-50/60">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800">ระบบพร้อมใช้งาน</span>
        </div>
        <p className="mt-1 text-xs text-slate-500 leading-tight">
          {shortBadge}
        </p>
      </div>
    </div>
  );
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close mobile drawer whenever route changes
  React.useEffect(() => {
    onClose?.();
  }, [pathname, onClose]);

  // Close on Escape key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling while mobile drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Desktop Persistent Sidebar (>= lg) */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-200/80 bg-white h-full flex-col select-none">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile & Tablet Slide-over Drawer (< lg) */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-300",
          isOpen ? "visible" : "invisible pointer-events-none"
        )}
        aria-modal="true"
        role="dialog"
        aria-label="เมนูนำทางหลัก"
      >
        {/* Backdrop overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Slide-over panel */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white border-r border-slate-200/80 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out select-none",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent
            pathname={pathname}
            onClose={onClose}
            showCloseButton
          />
        </aside>
      </div>
    </>
  );
}
