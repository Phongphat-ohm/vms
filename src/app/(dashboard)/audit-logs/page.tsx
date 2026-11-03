"use client";

import * as React from "react";
import {
  History,
  Shield,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  User,
  Globe,
  Clock,
} from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listAuditLogsAction } from "@/modules/audit/actions";
import { AuditLogDto } from "@/modules/audit/types";
import { AuditDetailModal } from "@/components/audit/audit-detail-modal";

const ACTION_OPTIONS = [
  { value: "ALL", label: "การกระทำทั้งหมด" },
  { value: "SENSITIVE_VIEW", label: "เปิดดูเลขบัตร (PDPA)" },
  { value: "TRANSFER", label: "โอนย้ายที่อยู่" },
  { value: "CREATE", label: "สร้างข้อมูล (CREATE)" },
  { value: "UPDATE", label: "แก้ไขข้อมูล (UPDATE)" },
  { value: "DELETE", label: "ลบข้อมูล (DELETE)" },
  { value: "LOGIN", label: "เข้าสู่ระบบ (LOGIN)" },
];

const MODULE_OPTIONS = [
  { value: "ALL", label: "ทุกโมดูลระบบ" },
  { value: "POPULATION", label: "ประชากร (POPULATION)" },
  { value: "HOUSEHOLD", label: "บ้านและครัวเรือน (HOUSEHOLD)" },
  { value: "AUTH", label: "ตรวจสอบสิทธิ์ (AUTH)" },
  { value: "SETTINGS", label: "ตั้งค่าระบบ (SETTINGS)" },
  { value: "DOCUMENT", label: "คลังเอกสาร (DOCUMENT)" },
  { value: "ROLES", label: "บทบาทและสิทธิ์ (ROLES)" },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [selectedLog, setSelectedLog] = React.useState<AuditLogDto | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterAction, setFilterAction] = React.useState("ALL");
  const [filterModule, setFilterModule] = React.useState("ALL");

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const fetchLogs = React.useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await listAuditLogsAction(
        undefined,
        filterModule !== "ALL" ? filterModule : undefined,
        300
      );
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filterModule]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filtered logs computation
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      // Action filter
      if (filterAction !== "ALL" && log.action !== filterAction) {
        return false;
      }

      // Module filter
      if (filterModule !== "ALL" && log.module.toUpperCase() !== filterModule.toUpperCase()) {
        return false;
      }

      // Keyword search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const userNameMatch = (log.userName || "").toLowerCase().includes(query);
        const moduleMatch = (log.module || "").toLowerCase().includes(query);
        const actionMatch = (log.action || "").toLowerCase().includes(query);
        const entityMatch = (log.entityType || "").toLowerCase().includes(query);
        const ipMatch = (log.ipAddress || "").toLowerCase().includes(query);
        const detailsMatch = log.details
          ? JSON.stringify(log.details).toLowerCase().includes(query)
          : false;

        if (!userNameMatch && !moduleMatch && !actionMatch && !entityMatch && !ipMatch && !detailsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [logs, filterAction, filterModule, searchTerm]);

  // Pagination calculations
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedLogs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Reset to page 1 when filter/search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAction, filterModule, itemsPerPage]);

  const handleViewDetails = (log: AuditLogDto) => {
    setSelectedLog(log);
  };

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "ไม่มีข้อมูลสำหรับส่งออก",
        text: "ไม่พบบันทึกประวัติตามเงื่อนไขที่เลือกในขณะนี้",
        confirmButtonColor: "#3B82F6",
        customClass: { popup: "rounded-[24px]" },
      });
      return;
    }

    setIsExporting(true);
    try {
      const headers = ["ลำดับ,วันเวลา,การกระทำ,โมดูล,Entity,Entity ID,ผู้ดำเนินการ,IP Address,สถานะ"];
      const rows = filteredLogs.map((l, index) => {
        const dateStr = new Date(l.createdAt).toLocaleString("th-TH");
        return `"${index + 1}","${dateStr}","${l.action}","${l.module}","${l.entityType}","${l.entityId || "-"}","${l.userName || "เจ้าหน้าที่"}","${l.ipAddress || "-"}","${l.status}"`;
      });

      const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `vms_audit_logs_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "ส่งออกไฟล์สำเร็จ",
        text: `ดาวน์โหลดไฟล์บันทึกประวัติ (${filteredLogs.length} รายการ) เรียบร้อยแล้ว`,
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "rounded-[24px]" },
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถส่งออกข้อมูลประวัติได้",
        confirmButtonColor: "#EF4444",
        customClass: { popup: "rounded-[24px]" },
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatActionBadge = (action: string) => {
    switch (action) {
      case "SENSITIVE_VIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Shield className="h-3 w-3" />
            เปิดดูเลขบัตร (PDPA)
          </span>
        );
      case "TRANSFER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            ย้ายที่อยู่ (TRANSFER)
          </span>
        );
      case "HEAD_CHANGE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            เปลี่ยนหัวหน้าบ้าน
          </span>
        );
      case "UPDATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            แก้ไขข้อมูล (UPDATE)
          </span>
        );
      case "CREATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            สร้างข้อมูล (CREATE)
          </span>
        );
      case "LOGIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            เข้าสู่ระบบ (LOGIN)
          </span>
        );
      case "LOGOUT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            ออกจากระบบ (LOGOUT)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <History className="h-6 w-6 text-blue-600" />
            บันทึกประวัติการดำเนินงาน (Audit Trail)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
            ประวัติกิจกรรมความมั่นคงปลอดภัยแบบ Append-Only บันทึกทุกธุรกรรมเพื่อความโปร่งใสและตรวจสอบได้ตามกฎหมาย PDPA
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={isExporting || loading || filteredLogs.length === 0}
            className="h-11 rounded-xl text-xs font-semibold px-3.5 text-slate-600 hover:text-slate-900 min-h-[44px]"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1.5 text-blue-600" />
            )}
            ส่งออก CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => fetchLogs(true)}
            disabled={isRefreshing || loading}
            className="h-11 rounded-xl text-xs font-semibold px-3.5 text-slate-600 hover:text-slate-900 min-h-[44px]"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรชบันทึก
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm space-y-3">
        {/* Row 1: Search Box and Dropdown Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาตามชื่อผู้ดำเนินการ, โมดูล, การกระทำ, Entity หรือ IP Address..."
              className="pl-10 h-11 rounded-xl border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            {/* Module Filter Dropdown */}
            <div className="w-full sm:w-auto">
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="w-full sm:w-48 h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                aria-label="เลือกโมดูลระบบ"
              >
                {MODULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter Dropdown */}
            <div className="w-full sm:w-auto">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full sm:w-52 h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                aria-label="เลือกการกระทำ"
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Quick Filter Pills */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> ตัวกรองด่วน:
          </span>
          {["ALL", "SENSITIVE_VIEW", "TRANSFER", "CREATE", "UPDATE"].map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-h-[36px] ${
                filterAction === act
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {act === "ALL"
                ? "ทั้งหมด"
                : act === "SENSITIVE_VIEW"
                ? "เปิดดูเลขบัตร (PDPA)"
                : act === "TRANSFER"
                ? "โอนย้ายที่อยู่"
                : act === "CREATE"
                ? "สร้างข้อมูล"
                : "แก้ไขข้อมูล"}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Data Table */}
      <div className="rounded-[32px] bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">วันเวลาทำรายการ</th>
                <th className="py-4 px-6">การกระทำ (Action)</th>
                <th className="py-4 px-6">โมดูล / ข้อมูลที่เกี่ยวข้อง</th>
                <th className="py-4 px-6">ผู้ดำเนินการ</th>
                <th className="py-4 px-6">IP Address</th>
                <th className="py-4 px-6 text-center">สถานะ</th>
                <th className="py-4 px-6 text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="text-xs font-medium">กำลังโหลดบันทึกกิจกรรมความมั่นคงปลอดภัย...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">ไม่พบบันทึกประวัติกิจกรรม</p>
                      <p className="text-xs text-slate-500">
                        {searchTerm || filterAction !== "ALL" || filterModule !== "ALL"
                          ? "ลองปรับเปลี่ยนเงื่อนไขตัวกรองหรือคำค้นหาของคุณ"
                          : "ยังไม่มีรายการบันทึกประวัติกิจกรรมในระบบ"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isSuccess = log.status === "SUCCESS";
                  const createdAtDate = new Date(log.createdAt);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date & Time */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-900 font-medium text-xs sm:text-sm">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{createdAtDate.toLocaleDateString("th-TH")}</span>
                        </div>
                        <div className="text-xs text-slate-500 pl-5.5 font-mono">
                          {createdAtDate.toLocaleTimeString("th-TH")} น.
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-4 px-6 font-mono font-bold text-xs">
                        {formatActionBadge(log.action)}
                      </td>

                      {/* Module & Entity */}
                      <td className="py-4 px-6 text-slate-700">
                        <div className="font-semibold text-slate-900">{log.entityType}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-mono font-semibold border border-blue-100">
                            {log.module}
                          </span>
                          {log.entityId && (
                            <span className="text-xs text-slate-500 font-mono truncate max-w-[120px]">
                              #{log.entityId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-4 px-6 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold border border-slate-200 shrink-0">
                            {(log.userName || "U")[0]}
                          </div>
                          <span className="truncate max-w-[150px]">{log.userName || "เจ้าหน้าที่"}</span>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3 w-3 text-slate-400" />
                          <span>{log.ipAddress || "127.0.0.1"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isSuccess
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isSuccess ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              สำเร็จ
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 text-rose-600" />
                              ล้มเหลว
                            </>
                          )}
                        </span>
                      </td>

                      {/* Action Links */}
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                          className="h-9 rounded-xl text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 min-h-[36px]"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          ดู JSON Diff
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Standard System Pagination Bar */}
        {!loading && filteredLogs.length > 0 && (
          <div className="py-4 px-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
            {/* Left: Summary and Page Size Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <span>
                แสดง{" "}
                <strong className="text-slate-800">
                  {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </strong>{" "}
                จากทั้งหมด <strong className="text-slate-800">{totalItems}</strong> รายการ
              </span>

              <span className="hidden sm:inline text-slate-300">|</span>

              <div className="flex items-center gap-1.5">
                <span>แสดงหน้าละ:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  aria-label="เลือกจำนวนรายการต่อหน้า"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Right: Pagination Controls */}
            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg text-xs"
                title="หน้าแรก"
                aria-label="หน้าแรก"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>

              {/* Prev Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 rounded-lg text-xs font-medium"
                aria-label="หน้าก่อนหน้า"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                ก่อนหน้า
              </Button>

              {/* Current Page Pill */}
              <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                {currentPage} / {totalPages}
              </div>

              {/* Next Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2.5 rounded-lg text-xs font-medium"
                aria-label="หน้าถัดไป"
              >
                ถัดไป
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg text-xs"
                title="หน้าสุดท้าย"
                aria-label="หน้าสุดท้าย"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Standard Accessible Modal for Audit Log Details */}
      <AuditDetailModal
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
}
