"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Home,
  FileText,
  History,
  Shield,
  Calendar,
  Phone,
  Briefcase,
  GraduationCap,
  Eye,
  Loader2,
  RefreshCw,
  Archive,
  Edit3,
} from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { publicConfig } from "@/lib/config";
import { useVillage } from "@/components/providers/village-provider";
import { formatThaiNationalId, formatThaiPhoneNumber } from "@/lib/formatters";
import { getPersonByIdAction, archivePersonAction } from "@/modules/population/actions";
import { PersonDetailDto } from "@/modules/population/types";
import { RevealNationalIdModal } from "@/components/populations/reveal-national-id-modal";
import { EditPersonModal } from "@/components/populations/edit-person-modal";

export default function PopulationDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลประชากร...</p>
        </div>
      }
    >
      <PopulationDetailContent />
    </React.Suspense>
  );
}

function PopulationDetailContent() {
  const { shortBadge } = useVillage();
  const params = useParams();
  const router = useRouter();
  const personId = (params?.id as string) || "p-001";

  const [person, setPerson] = React.useState<PersonDetailDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"overview" | "history" | "docs">("overview");
  const [revealedNationalId, setRevealedNationalId] = React.useState<string | null>(null);
  const [isRevealModalOpen, setIsRevealModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);

  const loadPerson = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPersonByIdAction(personId);
      if (res.success && res.data) {
        setPerson(res.data);
      }
    } catch (err) {
      console.error("Failed to load person detail:", err);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  React.useEffect(() => {
    loadPerson();
  }, [loadPerson]);

  const handleRevealNationalId = () => {
    if (!person) return;
    setIsRevealModalOpen(true);
  };

  const handleArchivePerson = async () => {
    if (!person) return;

    const result = await Swal.fire({
      title: "ขอยืนยันการเก็บถาวร (Archive)",
      text: `ต้องการย้ายข้อมูลของ ${person.fullName} เข้าสู่คลังถาวรหรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยันเก็บถาวร",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#94A3B8",
    });

    if (result.isConfirmed) {
      setIsArchiving(true);
      try {
        const res = await archivePersonAction(person.id);
        if (res.success) {
          await Swal.fire({
            icon: "success",
            title: "เก็บถาวรสำเร็จ",
            text: "ข้อมูลประชากรถูกย้ายเข้าสู่คลังถาวรแล้ว",
            timer: 1500,
            showConfirmButton: false,
          });
          router.push("/populations");
          router.refresh();
        } else {
          Swal.fire("ข้อผิดพลาด", res.error?.message || "ไม่สามารถดำเนินการได้", "error");
        }
      } catch {
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
      } finally {
        setIsArchiving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลประชากร...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-slate-900">ไม่พบข้อมูลประชากร</h2>
        <p className="text-xs text-slate-500 mt-1">รหัสประชากรที่ระบุอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <Link href="/populations" className="mt-4 inline-block">
          <Button variant="outline" className="rounded-xl text-xs">
            &larr; กลับหน้ารายการประชากร
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/populations"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {person.fullName || `${person.title}${person.firstName} ${person.lastName}`}
              </h1>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                person.isAlive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-700 border-slate-300"
              }`}>
                {person.isAlive ? "มีชีวิต (สถานะปกติ)" : "เสียชีวิตแล้ว"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 font-mono">
              รหัสประชากร: {person.personCode} • ข้อมูลขึ้นทะเบียน{shortBadge}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="h-10 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 border-slate-200"
          >
            <Edit3 className="h-4 w-4 mr-1.5 text-blue-600" />
            แก้ไขข้อมูล
          </Button>
          <Link href={`/houses/${person.houseId || "h-1"}/transfer`}>
            <Button variant="outline" className="h-10 rounded-xl text-xs font-semibold">
              โอนย้ายครัวเรือน
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleArchivePerson}
            disabled={isArchiving}
            className="h-10 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            {isArchiving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Archive className="h-4 w-4 mr-1 text-rose-500" />}
            เก็บถาวร
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "overview"
              ? "bg-blue-50 text-blue-700 border border-blue-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          ข้อมูลทั่วไป & ที่อยู่
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "history"
              ? "bg-blue-50 text-blue-700 border border-blue-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          ประวัติการอยู่อาศัย & การย้าย ({person.timeline.length})
        </button>
        <button
          onClick={() => setActiveTab("docs")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "docs"
              ? "bg-blue-50 text-blue-700 border border-blue-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          เอกสารประจำตัวแนบ ({person.documents.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[32px] bg-white border border-slate-100 p-6 shadow-sm md:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                ข้อมูลส่วนบุคคลพื้นฐาน
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-xs">
                <div>
                  <span className="text-slate-500 block font-medium">คำนำหน้า</span>
                  <span className="text-slate-800 font-semibold text-sm">{person.title}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">ชื่อจริง</span>
                  <span className="text-slate-800 font-semibold text-sm">{person.firstName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">นามสกุล</span>
                  <span className="text-slate-800 font-semibold text-sm">{person.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">เพศ</span>
                  <span className="text-slate-800 font-semibold text-sm">
                    {person.gender === "MALE" ? "ชาย" : person.gender === "FEMALE" ? "หญิง" : "อื่นๆ"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">วันเดือนปีเกิด</span>
                  <span className="text-slate-800 font-semibold text-sm">{person.birthDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">อายุ</span>
                  <span className="text-slate-800 font-semibold text-sm">{person.age} ปี</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">สัญชาติ / ศาสนา</span>
                  <span className="text-slate-800 font-semibold text-sm">
                    {person.nationality} / {person.religion || "พุทธ"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">อาชีพ</span>
                  <span className="text-slate-800 font-semibold text-sm">{person.occupation || "ไม่ได้ระบุ"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">เบอร์โทรศัพท์</span>
                  <span className="text-slate-800 font-semibold text-sm font-mono">
                    {formatThaiPhoneNumber(person.phoneNumber) || "ไม่ได้ระบุ"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                การคุ้มครองข้อมูลอ่อนไหวตาม PDPA
              </h2>
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">เลขประจำตัวประชาชน (คุ้มครองความปลอดภัย)</div>
                  <div className="font-mono text-sm font-bold text-slate-800 mt-0.5 tracking-wider">
                    {revealedNationalId ? formatThaiNationalId(revealedNationalId) : person.nationalIdMasked}
                  </div>
                </div>

                {!revealedNationalId ? (
                  <Button
                    size="sm"
                    onClick={handleRevealNationalId}
                    className="h-8 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    เปิดดูเลขเต็ม (บันทึก Audit)
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ถอดรหัสสำเร็จแล้ว (PDPA Logged)
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Current House Box */}
          <Card className="rounded-[32px] bg-white border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-600" />
                ที่อยู่อาศัยปัจจุบัน
              </h2>

              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-slate-500 text-xs block font-medium">บ้านเลขที่</span>
                  <span className="text-2xl font-extrabold text-slate-900">{person.houseNumber || "123"}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block font-medium">รหัสครัวเรือน</span>
                  <span className="font-mono text-xs font-bold text-blue-600">{person.householdCode || "HH-2026-0001"}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block font-medium">ความสัมพันธ์ในครัวเรือน</span>
                  <span className="text-xs font-bold text-slate-800">{person.relationshipToHead || "สมาชิก"}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block font-medium">ประเภทการอยู่อาศัย</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 inline-block mt-1">
                    {person.residenceType === "ACTUAL_RESIDENT"
                      ? "ผู้อยู่อาศัยจริง / ผู้เช่า"
                      : person.residenceType === "OFFICIAL_ABSENT"
                      ? "มีชื่อแต่ไปทำงานนอกพื้นที่"
                      : "ตามทะเบียนราษฎร์ (ท.ร.14)"}
                  </span>
                </div>
              </div>
            </div>

            <Link href={person.houseId ? `/houses/${person.houseId}` : "/houses"} className="text-xs font-semibold text-blue-600 hover:underline mt-6 pt-3 border-t border-slate-100 block text-center">
              ดูข้อมูลบ้านหลังนี้ &rarr;
            </Link>
          </Card>
        </div>
      )}

      {/* Tab 2: Transfer History */}
      {activeTab === "history" && (
        <Card className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="h-4 w-4 text-blue-600" />
            ประวัติการอยู่อาศัยและการย้าย (Household Events Timeline)
          </h2>
          <p className="text-xs text-slate-500">
            บันทึกประวัติการอยู่อาศัยแบบถาวร ห้ามลบข้อมูลตามระเบียบงานทะเบียน
          </p>

          <div className="mt-6 border-l-2 border-blue-200 ml-4 space-y-6 pl-6 py-2">
            {person.timeline.map((event, index) => (
              <div key={event.id || index} className="relative">
                <span className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  index === 0 ? "bg-blue-600" : "bg-slate-300"
                }`} />
                <div className="text-xs font-bold text-slate-900">
                  {event.eventType === "TRANSFER"
                    ? "โอนย้ายครัวเรือน"
                    : event.eventType === "HEAD_CHANGE"
                    ? "แต่งตั้งหัวหน้าครัวเรือน"
                    : event.eventType}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {event.fromHousehold ? `ย้ายจาก: ${event.fromHousehold} ` : ""}
                  {event.toHousehold ? `ไปที่: บ้านเลขที่ ${event.toHousehold}` : ""} • {event.eventDate}
                </div>
                {event.reason && (
                  <div className="text-xs text-slate-500 mt-0.5">สาเหตุ: {event.reason}</div>
                )}
                <div className="text-xs text-slate-500 mt-1">บันทึกโดย: {event.recordedBy || "เจ้าหน้าที่"}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Documents */}
      {activeTab === "docs" && (
        <Card className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">เอกสารประจำตัวแนบ</h2>
            <Link href="/documents">
              <Button size="sm" className="h-9 rounded-xl text-xs font-semibold bg-blue-600 text-white">
                แนบเอกสารเพิ่ม
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {person.documents.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-semibold text-slate-900">{doc.fileName}</div>
                    <div className="text-xs text-slate-500">
                      อัปโหลดเมื่อ {doc.uploadedAt} • {(doc.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                </div>
                <Link href="/documents">
                  <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold text-blue-600">
                    เปิดดู
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Standard Accessible Modal for Revealing National ID under PDPA */}
      <RevealNationalIdModal
        open={isRevealModalOpen}
        onClose={() => setIsRevealModalOpen(false)}
        personId={person?.id || ""}
        personName={person?.fullName || ""}
        onRevealed={(fullId) => setRevealedNationalId(fullId)}
      />

      {/* Edit Person Modal */}
      {person && (
        <EditPersonModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          person={person}
          onSuccess={(updated) => setPerson(updated)}
        />
      )}
    </div>
  );
}
