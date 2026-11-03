"use client";

import * as React from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Clock,
  File,
  RefreshCw,
  Loader2,
  ExternalLink,
  ShieldCheck,
  X,
  Building,
  User,
} from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listFilesAction,
  deleteFileAction,
  getFileSignedUrlAction,
  getDocumentLinkOptionsAction,
} from "@/modules/documents/actions";
import { DocumentItemDto } from "@/modules/documents/types";
import { UploadDocumentModal } from "@/components/documents/upload-document-modal";

export default function DocumentsPage() {
  const [documents, setDocuments] = React.useState<DocumentItemDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [linkOptions, setLinkOptions] = React.useState<{
    houses: { id: string; label: string }[];
    persons: { id: string; label: string }[];
  }>({ houses: [], persons: [] });

  const fetchDocuments = React.useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await listFilesAction();
      if (res.success && res.data) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const openUploadModal = async () => {
    setIsModalOpen(true);
    try {
      const res = await getDocumentLinkOptionsAction();
      if (res.success && res.data) {
        setLinkOptions(res.data);
      }
    } catch (err) {
      console.error("Failed to load link options:", err);
    }
  };

  const handleDownload = async (doc: DocumentItemDto) => {
    setDownloadingId(doc.id);
    try {
      const res = await getFileSignedUrlAction(doc.id);
      if (res.success && res.data) {
        // Open the signed download link in a new tab
        window.open(res.data.signedUrl, "_blank");
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: res.error?.message || "ไม่สามารถออกลิงก์ดาวน์โหลดได้",
          icon: "error",
          confirmButtonColor: "#3B82F6",
          customClass: { popup: "rounded-[24px]" },
        });
      }
    } catch (err: any) {
      Swal.fire("ข้อผิดพลาด", err.message || "การเชื่อมต่อขัดข้อง", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (doc: DocumentItemDto) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบเอกสาร?",
      text: `คุณต้องการลบไฟล์ "${doc.name}" ออกจากระบบถาวรหรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเอกสาร",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#94A3B8",
      customClass: { popup: "rounded-[24px]" },
    });

    if (confirm.isConfirmed) {
      setDeletingId(doc.id);
      try {
        const res = await deleteFileAction(doc.id);
        if (res.success) {
          await Swal.fire({
            title: "ลบสำเร็จ",
            text: res.message || "ลบเอกสารเรียบร้อยแล้ว",
            icon: "success",
            confirmButtonColor: "#3B82F6",
            customClass: { popup: "rounded-[24px]" },
          });
          fetchDocuments();
        } else {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: res.error?.message || "ไม่สามารถลบเอกสารได้",
            icon: "error",
            confirmButtonColor: "#3B82F6",
            customClass: { popup: "rounded-[24px]" },
          });
        }
      } catch (err: any) {
        Swal.fire("ข้อผิดพลาด", err.message || "การเชื่อมต่อขัดข้อง", "error");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            คลังเอกสารและไฟล์แนบ
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
            จัดเก็บเอกสารทะเบียนราษฎร์ สำเนาบัตร และเอกสารสิทธิใน Private Storage พร้อมระบบ Short-lived Signed URL
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => fetchDocuments(true)}
            disabled={isRefreshing || loading}
            className="h-11 rounded-xl text-xs font-semibold px-3.5 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>

          <Button
            onClick={openUploadModal}
            className="h-11 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs sm:text-sm font-semibold shadow-xs"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            อัปโหลดเอกสารใหม่
          </Button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-bold">นโยบายความมั่นคงปลอดภัยของเอกสารราชการ:</span> เอกสารทั้งหมดถูกจัดเก็บแบบ Private ไม่เปิดเผยต่อสาธารณะ การเข้าถึงต้องผ่าน Signed URL ที่มีการลงรหัส HMAC-SHA256 และจำกัดเวลา และบันทึกลง Audit Trail ทุกครั้งที่มีการเปิดดู
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500 font-medium">กำลังโหลดรายการเอกสาร...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">ยังไม่มีเอกสารในคลัง</p>
            <p className="text-xs text-slate-500 max-w-sm">
              สามารถเริ่มอัปโหลดสำเนาทะเบียนบ้าน หรือเอกสารประจำตัวเข้าสู่ระบบได้ทันที
            </p>
            <Button
              onClick={openUploadModal}
              className="mt-2 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              อัปโหลดเอกสารแรก
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">ชื่อเอกสาร</th>
                  <th className="py-4 px-4">ประเภท</th>
                  <th className="py-4 px-4">ความเชื่อมโยง</th>
                  <th className="py-4 px-4">ขนาดไฟล์</th>
                  <th className="py-4 px-4">วันที่นำเข้า</th>
                  <th className="py-4 px-4">ผู้อัปโหลด</th>
                  <th className="py-4 px-6 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <File className="h-4 w-4" />
                      </div>
                      <span className="truncate max-w-[200px] sm:max-w-xs">{doc.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">{doc.relatedEntity}</td>
                    <td className="py-4 px-4 text-slate-500 text-xs font-mono">{doc.size}</td>
                    <td className="py-4 px-4 text-slate-500 text-xs">{doc.uploadedAt}</td>
                    <td className="py-4 px-4 text-slate-600">{doc.uploader}</td>
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={downloadingId === doc.id}
                        onClick={() => handleDownload(doc)}
                        className="h-8 rounded-lg text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <Download className="h-3.5 w-3.5 mr-1" />
                        )}
                        ดาวน์โหลด
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deletingId === doc.id}
                        onClick={() => handleDelete(doc)}
                        className="h-8 rounded-lg text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Standard Accessible Modal for Uploading Documents */}
      <UploadDocumentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDocuments}
        linkOptions={linkOptions}
      />
    </div>
  );
}
