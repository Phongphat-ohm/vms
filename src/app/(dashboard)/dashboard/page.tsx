"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Home,
  UserCheck,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Plus,
  RefreshCw,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicConfig } from "@/lib/config";
import { useVillage } from "@/components/providers/village-provider";
import { getDashboardStatsAction } from "@/modules/dashboard/actions";
import { DashboardStatsDto } from "@/modules/dashboard/types";

export default function DashboardPage() {
  const { villageName, moo } = useVillage();
  const [stats, setStats] = React.useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  const fetchStats = React.useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await getDashboardStatsAction();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatLogActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">เพิ่มข้อมูล (CREATE)</span>;
      case "TRANSFER":
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">ย้ายที่อยู่ (TRANSFER)</span>;
      case "HEAD_CHANGE":
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">เปลี่ยนหัวหน้า (HEAD_CHANGE)</span>;
      case "SENSITIVE_VIEW":
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">เปิดดูเลขบัตร (PDPA)</span>;
      default:
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ภาพรวมงานทะเบียนและประชากร
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
            สถิติและข้อมูลการขึ้นทะเบียน{villageName} หมู่ที่ {moo} ประจำปี 2569
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => fetchStats(true)}
            disabled={isRefreshing || loading}
            className="h-10 rounded-xl text-xs font-semibold px-3 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรชข้อมูล
          </Button>
          <Link href="/houses">
            <Button variant="outline" className="h-10 rounded-xl text-xs font-semibold">
              <Home className="h-3.5 w-3.5 mr-1.5" />
              จัดการบ้าน
            </Button>
          </Link>
          <Link href="/populations/new">
            <Button className="h-10 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold shadow-xs">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              เพิ่มประชากรใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Population */}
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ประชากรทั้งหมด
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats?.totalPopulation.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">คน</span>
              </>
            )}
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" />
            <span>เพิ่มขึ้น {stats?.quarterPopulationDelta ?? 12} คนในไตรมาสนี้</span>
          </div>
        </div>

        {/* Card 2: Official Registry (TR14) */}
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ตามทะเบียนราษฎร์ (ท.ร.14)
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats?.officialTR14Count.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  คน ({stats?.officialTR14Percent}%)
                </span>
              </>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            มีชื่อในเล่มทะเบียนบ้านทางการ
          </div>
        </div>

        {/* Card 3: Actual Residents / Tenants */}
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ประชากรแฝง / ผู้เช่า
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats?.actualResidentCount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  คน ({stats?.actualResidentPercent}%)
                </span>
              </>
            )}
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium">
            พักอาศัยจริงในพื้นที่หมู่บ้าน
          </div>
        </div>

        {/* Card 4: Houses & Households */}
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              บ้านและครัวเรือน
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Home className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats?.totalHouses.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  หลัง / {stats?.totalHouseholds} ครัวเรือน
                </span>
              </>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            เฉลี่ย {stats?.avgResidentsPerHousehold ?? 3.8} คนต่อครัวเรือน
          </div>
        </div>
      </div>

      {/* Middle Grid: Demographics & Residency Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Age Groups & Demographics */}
        <div className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-8 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">การกระจายตามช่วงอายุประชากร</h2>
              <p className="text-xs text-slate-500">สัดส่วนประชากรตามวัยในหมู่บ้าน</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              ข้อมูลปัจจุบัน
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {loading ? (
              <div className="space-y-4">
                <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
                <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
                <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
              </div>
            ) : (
              <>
                {/* Age 0-14 */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>วัยเด็ก (0 - 14 ปี)</span>
                    <span>
                      {stats?.ageDistribution.youthCount.toLocaleString()} คน ({stats?.ageDistribution.youthPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${stats?.ageDistribution.youthPercent ?? 15}%` }}
                    />
                  </div>
                </div>

                {/* Age 15-59 */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>วัยทำงาน (15 - 59 ปี)</span>
                    <span>
                      {stats?.ageDistribution.workingAgeCount.toLocaleString()} คน ({stats?.ageDistribution.workingAgePercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${stats?.ageDistribution.workingAgePercent ?? 64}%` }}
                    />
                  </div>
                </div>

                {/* Age 60+ */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>ผู้สูงอายุ (60 ปีขึ้นไป) — ได้รับเบี้ยยังชีพ</span>
                    <span>
                      {stats?.ageDistribution.elderlyCount.toLocaleString()} คน ({stats?.ageDistribution.elderlyPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats?.ageDistribution.elderlyPercent ?? 21}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Residency Breakdown */}
        <div className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
              สัดส่วนประเภทการอยู่อาศัย
            </h2>

            <div className="mt-6 space-y-3.5">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-slate-100 animate-pulse rounded-2xl" />
                  <div className="h-12 bg-slate-100 animate-pulse rounded-2xl" />
                  <div className="h-12 bg-slate-100 animate-pulse rounded-2xl" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full bg-blue-600" />
                      <span className="text-xs font-medium text-slate-700">มีชื่อและอยู่จริง (ท.ร.14)</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {stats?.residencyDistribution.official.toLocaleString()} คน
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full bg-amber-500" />
                      <span className="text-xs font-medium text-slate-700">ผู้อยู่อาศัยจริง / ผู้เช่า</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {stats?.residencyDistribution.actualResident.toLocaleString()} คน
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full bg-slate-400" />
                      <span className="text-xs font-medium text-slate-700">มีชื่อแต่ไปทำงานนอกพื้นที่</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {stats?.residencyDistribution.officialAbsent.toLocaleString()} คน
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-normal">
            * สอดคล้องตามเกณฑ์สำรวจ จปฐ. และการจัดสรรงบประมาณพัฒนาหมู่บ้าน
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900">กิจกรรมและประวัติการเปลี่ยนแปลงล่าสุด</h2>
          </div>
          <Link href="/audit-logs" className="text-xs font-semibold text-blue-600 hover:underline">
            ดูทั้งหมด &rarr;
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {loading ? (
            <div className="py-4 flex items-center justify-center text-slate-500 text-xs gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังโหลดบันทึกกิจกรรม...
            </div>
          ) : stats?.recentLogs && stats.recentLogs.length > 0 ? (
            stats.recentLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {log.details?.name
                      ? `${log.action === "CREATE" ? "เพิ่มข้อมูล" : "จัดการ"}: ${log.details.name}`
                      : log.details?.reason
                      ? `${log.details.reason}`
                      : `${log.module.toUpperCase()} - ${log.action}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    ดำเนินการโดย {log.userName || "เจ้าหน้าที่"} • {new Date(log.createdAt).toLocaleDateString("th-TH")}
                  </div>
                </div>
                {formatLogActionBadge(log.action)}
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              ยังไม่มีประวัติกิจกรรมล่าสุดในระบบ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
