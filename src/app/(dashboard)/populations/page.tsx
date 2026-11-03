"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus, Eye, Filter, UserCheck, Shield, RefreshCw, Loader2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchPopulationAction, exportPopulationAction } from "@/modules/population/actions";
import { formatThaiNationalId } from "@/lib/formatters";
import { PersonDto } from "@/modules/population/types";
import { RevealNationalIdModal } from "@/components/populations/reveal-national-id-modal";

export default function PopulationsPage() {
  const [populationList, setPopulationList] = React.useState<PersonDto[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [genderFilter, setGenderFilter] = React.useState<string>("ALL");
  const [revealedIds, setRevealedIds] = React.useState<Record<string, string>>({});
  const [revealModalTarget, setRevealModalTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [isExporting, setIsExporting] = React.useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 10;

  const fetchPopulation = React.useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await searchPopulationAction({
        query: searchTerm,
        gender: genderFilter !== "ALL" ? genderFilter : undefined,
        limit: 100,
      });

      if (res.success && res.data) {
        setPopulationList(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch population list:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchTerm, genderFilter]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchPopulation();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPopulation]);

  const handleRevealSensitiveId = (personId: string, personName: string) => {
    setRevealModalTarget({ id: personId, name: personName });
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await exportPopulationAction();
      if (res.success && res.data?.csvContent) {
        // Create download blob
        const blob = new Blob(["\uFEFF" + res.data.csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `vms_population_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Swal.fire({
          icon: "success",
          title: "ส่งออกไฟล์สำเร็จ",
          text: "ดาวน์โหลดไฟล์ข้อมูลประชากร (CSV) เรียบร้อยแล้ว",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถส่งออกข้อมูลได้",
          text: res.error?.message || "เกิดข้อผิดพลาดในการประมวลผลไฟล์",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถส่งออกข้อมูลประชากรได้",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(populationList.length / itemsPerPage) || 1;
  const paginatedList = populationList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getResidenceLabel = (residenceType?: string) => {
    switch (residenceType) {
      case "ACTUAL_RESIDENT":
        return "ผู้อยู่อาศัยจริง / ผู้เช่า";
      case "OFFICIAL_ABSENT":
        return "มีชื่อแต่ไปทำงานนอกพื้นที่";
      default:
        return "ตามทะเบียนราษฎร์ (ท.ร.14)";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ระบบทะเบียนประชากร
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
            จัดการและตรวจสอบข้อมูลประชากรรายบุคคล คุ้มครองความปลอดภัยตามมาตรฐาน PDPA
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={isExporting || loading}
            className="h-11 rounded-xl text-xs font-semibold px-3.5 text-slate-600 hover:text-slate-900"
          >
            {isExporting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5 text-blue-600" />}
            ส่งออก CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => fetchPopulation(true)}
            disabled={isRefreshing || loading}
            className="h-11 rounded-xl text-xs font-semibold px-3.5 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>

          <Link href="/populations/new">
            <Button className="h-11 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs sm:text-sm font-semibold shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" />
              เพิ่มประชากรใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="ค้นหาด้วยชื่อ-สกุล, รหัสประชากร หรือเลขบัตร 13 หลัก..."
            className="pl-10 h-11 rounded-xl border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={genderFilter === "ALL" ? "default" : "outline"}
            onClick={() => {
              setGenderFilter("ALL");
              setCurrentPage(1);
            }}
            className="h-11 rounded-xl text-xs font-semibold px-3.5"
          >
            ทั้งหมด
          </Button>
          <Button
            variant={genderFilter === "MALE" ? "default" : "outline"}
            onClick={() => {
              setGenderFilter("MALE");
              setCurrentPage(1);
            }}
            className="h-11 rounded-xl text-xs font-semibold px-3.5"
          >
            ชาย
          </Button>
          <Button
            variant={genderFilter === "FEMALE" ? "default" : "outline"}
            onClick={() => {
              setGenderFilter("FEMALE");
              setCurrentPage(1);
            }}
            className="h-11 rounded-xl text-xs font-semibold px-3.5"
          >
            หญิง
          </Button>
        </div>
      </div>

      {/* Population Data Table */}
      <div className="rounded-[32px] bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">รหัสประชากร</th>
                <th className="py-3.5 px-6">ชื่อ - นามสกุล</th>
                <th className="py-3.5 px-6">เลขประจำตัวประชาชน (PDPA)</th>
                <th className="py-3.5 px-6">เพศ/อายุ</th>
                <th className="py-3.5 px-6">บ้านเลขที่</th>
                <th className="py-3.5 px-6">สถานะการอยู่อาศัย</th>
                <th className="py-3.5 px-6 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span>กำลังโหลดข้อมูลประชากร...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    ไม่พบข้อมูลประชากรที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                paginatedList.map((person) => {
                  const isRevealed = Boolean(revealedIds[person.id]);
                  const displayId = isRevealed
                    ? formatThaiNationalId(revealedIds[person.id])
                    : person.nationalIdMasked;
                  const isCurrentlyRevealing = revealModalTarget?.id === person.id;
                  const resLabel = getResidenceLabel(person.residenceType);

                  return (
                    <tr key={person.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Person Code */}
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-blue-600">
                        {person.personCode}
                      </td>

                      {/* Full Name */}
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {person.fullName || `${person.title}${person.firstName} ${person.lastName}`}
                      </td>

                      {/* Masked National ID with Reveal Button */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-2">
                          <span
                            className={`font-mono text-xs px-2.5 py-1 rounded-lg ${
                              isRevealed
                                ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {displayId}
                          </span>
                          {!isRevealed && (
                            <button
                              onClick={() => handleRevealSensitiveId(person.id, person.fullName || `${person.firstName} ${person.lastName}`)}
                              disabled={isCurrentlyRevealing}
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50 min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                              title="ขอเปิดดูเลขตัวเต็ม (บันทึก Audit)"
                              aria-label="ขอดูเลขประจำตัวประชาชนตัวเต็ม"
                            >
                              {isCurrentlyRevealing ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Gender & Age */}
                      <td className="py-4 px-6 text-slate-600">
                        {person.gender === "MALE" ? "ชาย" : person.gender === "FEMALE" ? "หญิง" : "อื่นๆ"} • {person.age} ปี
                      </td>

                      {/* House Number */}
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {person.houseNumber || "-"}
                      </td>

                      {/* Residency Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            resLabel.includes("ท.ร.14")
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : resLabel.includes("ผู้เช่า")
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {resLabel}
                        </span>
                      </td>

                      {/* Action Links */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/populations/${person.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          รายละเอียด &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {!loading && populationList.length > 0 && (
          <div className="py-3.5 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              แสดง {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, populationList.length)} จากทั้งหมด{" "}
              {populationList.length} คน
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 rounded-lg text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                ก่อนหน้า
              </Button>
              <span className="px-2 text-xs font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 rounded-lg text-xs"
              >
                ถัดไป
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Standard Accessible Modal for Revealing Full National ID under PDPA */}
      <RevealNationalIdModal
        open={Boolean(revealModalTarget)}
        onClose={() => setRevealModalTarget(null)}
        personId={revealModalTarget?.id || ""}
        personName={revealModalTarget?.name || ""}
        onRevealed={(fullId) => {
          if (revealModalTarget) {
            setRevealedIds((prev) => ({ ...prev, [revealModalTarget.id]: fullId }));
          }
        }}
      />
    </div>
  );
}
