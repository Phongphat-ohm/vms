"use client";

import * as React from "react";
import { UserPlus, Loader2, Mail, User, Phone, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatThaiPhoneNumber, cleanDigits } from "@/lib/formatters";
import { createUserAction } from "@/modules/users/actions";

export interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [role, setRole] = React.useState("STAFF");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [createdUser, setCreatedUser] = React.useState<{
    fullName: string;
    email: string;
    roleDisplayName: string;
  } | null>(null);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setRole("STAFF");
      setError(null);
      setCreatedUser(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 3) {
      setError("กรุณาระบุชื่อ-นามสกุลอย่างน้อย 3 ตัวอักษร");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("กรุณาระบุอีเมลทางการที่ถูกต้อง (เช่น officer@village.local)");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createUserAction({
        fullName: cleanName,
        email: cleanEmail,
        phoneNumber: cleanDigits(phoneNumber) || undefined,
        role,
      });

      if (res.success && res.data) {
        setCreatedUser({
          fullName: res.data.fullName,
          email: res.data.email,
          roleDisplayName: res.data.roleDisplayName,
        });
        onSuccess();
      } else {
        setError(res.error?.message || "ไม่สามารถสร้างบัญชีผู้ใช้งานได้");
      }
    } catch (err: any) {
      setError(err.message || "การเชื่อมต่อขัดข้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setRole("STAFF");
    setError(null);
    setCreatedUser(null);
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case "VILLAGE_ADMIN":
        return "ผู้ดูแลระดับหมู่บ้าน (VILLAGE_ADMIN)";
      case "VIEWER":
        return "ผู้ตรวจดูข้อมูล (VIEWER)";
      default:
        return "เจ้าหน้าที่ปฏิบัติการ (STAFF)";
    }
  };

  return (
    <Modal open={open} onClose={() => !isSubmitting && onClose()}>
      <ModalContent size="md">
        {!createdUser ? (
          <form onSubmit={handleSubmit}>
            <ModalHeader onClose={() => !isSubmitting && onClose()}>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <UserPlus className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">ระบบจัดการสิทธิ์ผู้ใช้</span>
              </div>
              <ModalTitle>เพิ่มบัญชีเจ้าหน้าที่ใหม่</ModalTitle>
              <ModalDescription>
                สร้างบัญชีกำหนดบทบาทและสิทธิ์การเข้าถึงข้อมูลระบบบริหารจัดการหมู่บ้าน
              </ModalDescription>
            </ModalHeader>

            <ModalBody className="space-y-4">
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
                >
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="create-user-fullname" className="text-xs font-semibold text-slate-700">
                  ชื่อ - นามสกุลเจ้าหน้าที่ <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="create-user-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="เช่น นายประสิทธิ์ พัฒนาชุมชน"
                    required
                    disabled={isSubmitting}
                    className="pl-10 h-11 rounded-xl text-xs sm:text-sm"
                  />
                  <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="create-user-email" className="text-xs font-semibold text-slate-700">
                  อีเมลทางการสำหรับเข้าสู่ระบบ <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="create-user-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@village.local"
                    required
                    disabled={isSubmitting}
                    className="pl-10 h-11 rounded-xl text-xs sm:text-sm"
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <Label htmlFor="create-user-phone" className="text-xs font-semibold text-slate-700">
                  เบอร์โทรศัพท์ติดต่อ (ไม่บังคับ)
                </Label>
                <div className="relative">
                  <Input
                    id="create-user-phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatThaiPhoneNumber(e.target.value))}
                    placeholder="081-234-5678"
                    maxLength={12}
                    disabled={isSubmitting}
                    className="pl-10 h-11 rounded-xl text-xs sm:text-sm font-mono"
                  />
                  <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="create-user-role" className="text-xs font-semibold text-slate-700">
                  บทบาทสิทธิ์การใช้งาน (Role) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="create-user-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  >
                    <option value="STAFF">เจ้าหน้าที่ปฏิบัติการ (STAFF) - สิทธิ์จัดการทั่วไป</option>
                    <option value="VIEWER">ผู้ตรวจดูข้อมูล (VIEWER) - ดูข้อมูลได้อย่างเดียว</option>
                    <option value="VILLAGE_ADMIN">ผู้ดูแลระดับหมู่บ้าน (VILLAGE_ADMIN) - บริหารจัดการเต็มรูปแบบ</option>
                  </select>
                  <Shield className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={onClose}
                className="h-11 rounded-xl text-xs font-medium"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    กำลังสร้างบัญชี...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    สร้างบัญชีผู้ใช้งาน
                  </>
                )}
              </Button>
            </ModalFooter>
          </form>
        ) : (
          /* In-Modal Success State */
          <div>
            <ModalHeader onClose={onClose}>
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">สำเร็จเรียบร้อย</span>
              </div>
              <ModalTitle>สร้างบัญชีเจ้าหน้าที่สำเร็จ</ModalTitle>
              <ModalDescription>
                ระบบได้บันทึกข้อมูลและเพิ่มสิทธิ์การใช้งานเข้าสู่ระบบเรียบร้อยแล้ว
              </ModalDescription>
            </ModalHeader>

            <ModalBody className="py-6">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ชื่อเจ้าหน้าที่:</span>
                  <span className="font-bold text-slate-900">{createdUser.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">อีเมลล็อกอิน:</span>
                  <span className="font-mono font-semibold text-slate-800">{createdUser.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">บทบาทที่ได้รับ:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    {createdUser.roleDisplayName || getRoleLabel(role)}
                  </span>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForAnother}
                className="h-11 rounded-xl text-xs font-medium"
              >
                + เพิ่มผู้ใช้คนอื่นต่อ
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 shadow-xs"
              >
                เสร็จสิ้น / ปิดหน้าต่าง
              </Button>
            </ModalFooter>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
