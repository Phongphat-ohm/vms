"use client";

import * as React from "react";
import { UserCheck, Loader2, Save, Phone, Calendar, User, Briefcase, GraduationCap } from "lucide-react";
import Swal from "sweetalert2";
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
import { updatePersonAction } from "@/modules/population/actions";
import { PersonDetailDto } from "@/modules/population/types";

export interface EditPersonModalProps {
  open: boolean;
  onClose: () => void;
  person: PersonDetailDto;
  onSuccess: (updated: PersonDetailDto) => void;
}

export function EditPersonModal({ open, onClose, person, onSuccess }: EditPersonModalProps) {
  const [title, setTitle] = React.useState(person.title);
  const [firstName, setFirstName] = React.useState(person.firstName);
  const [lastName, setLastName] = React.useState(person.lastName);
  const [gender, setGender] = React.useState<"MALE" | "FEMALE" | "OTHER">(person.gender);
  const [birthDate, setBirthDate] = React.useState(person.birthDate);
  const [nationality, setNationality] = React.useState(person.nationality || "ไทย");
  const [religion, setReligion] = React.useState(person.religion || "พุทธ");
  const [phoneNumber, setPhoneNumber] = React.useState(
    person.phoneNumber ? formatThaiPhoneNumber(person.phoneNumber) : ""
  );
  const [occupation, setOccupation] = React.useState(person.occupation || "");
  const [education, setEducation] = React.useState(person.education || "");
  const [isAlive, setIsAlive] = React.useState(person.isAlive);
  const [deathDate, setDeathDate] = React.useState(person.deathDate || "");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setTitle(person.title);
      setFirstName(person.firstName);
      setLastName(person.lastName);
      setGender(person.gender);
      setBirthDate(person.birthDate);
      setNationality(person.nationality || "ไทย");
      setReligion(person.religion || "พุทธ");
      setPhoneNumber(person.phoneNumber ? formatThaiPhoneNumber(person.phoneNumber) : "");
      setOccupation(person.occupation || "");
      setEducation(person.education || "");
      setIsAlive(person.isAlive);
      setDeathDate(person.deathDate || "");
      setError(null);
    }
  }, [open, person]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (cleanFirst.length < 2 || cleanLast.length < 2) {
      setError("ชื่อและนามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร");
      return;
    }

    if (!birthDate) {
      setError("กรุณาระบุวันเดือนปีเกิด");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updatePersonAction({
        personId: person.id,
        title,
        firstName: cleanFirst,
        lastName: cleanLast,
        gender,
        birthDate,
        nationality,
        religion: religion || undefined,
        phoneNumber: cleanDigits(phoneNumber) || undefined,
        occupation: occupation || undefined,
        education: education || undefined,
        isAlive,
        deathDate: isAlive ? null : deathDate || null,
      });

      if (res.success && res.data) {
        onClose();
        await Swal.fire({
          icon: "success",
          title: "บันทึกการแก้ไขสำเร็จ",
          text: `อัปเดตข้อมูลประชากร ${res.data.fullName} เรียบร้อยแล้ว`,
          timer: 1800,
          showConfirmButton: false,
          customClass: { popup: "rounded-[24px]" },
        });
        onSuccess(res.data);
      } else {
        setError(res.error?.message || "ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (err: any) {
      setError(err.message || "การเชื่อมต่อขัดข้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !isSubmitting && onClose()}>
      <ModalContent size="lg">
        <form onSubmit={handleSubmit}>
          <ModalHeader onClose={() => !isSubmitting && onClose()}>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <UserCheck className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">งานทะเบียนประชากร</span>
            </div>
            <ModalTitle>แก้ไขข้อมูลประชากร</ModalTitle>
            <ModalDescription>
              ปรับปรุงรายละเอียดบุคคล เลขรหัสประชากร: {person.personCode} ({person.nationalIdMasked})
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="space-y-5">
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
              >
                {error}
              </div>
            )}

            {/* Row 1: คำนำหน้า, ชื่อ, นามสกุล */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="edit-title" className="text-xs font-semibold text-slate-700">
                  คำนำหน้า *
                </Label>
                <select
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="ด.ช.">ด.ช.</option>
                  <option value="ด.ญ.">ด.ญ.</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-4">
                <Label htmlFor="edit-firstname" className="text-xs font-semibold text-slate-700">
                  ชื่อจริง *
                </Label>
                <Input
                  id="edit-firstname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ชื่อจริง"
                  required
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-5">
                <Label htmlFor="edit-lastname" className="text-xs font-semibold text-slate-700">
                  นามสกุล *
                </Label>
                <Input
                  id="edit-lastname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="นามสกุล"
                  required
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Row 2: เพศ, วันเกิด */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="space-y-1.5 sm:col-span-6">
                <Label className="text-xs font-semibold text-slate-700">เพศตามทะเบียน *</Label>
                <div className="flex items-center gap-3 h-11">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="edit-gender"
                      checked={gender === "MALE"}
                      onChange={() => setGender("MALE")}
                      disabled={isSubmitting}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    ชาย
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="edit-gender"
                      checked={gender === "FEMALE"}
                      onChange={() => setGender("FEMALE")}
                      disabled={isSubmitting}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    หญิง
                  </label>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-6">
                <Label htmlFor="edit-birthdate" className="text-xs font-semibold text-slate-700">
                  วันเดือนปีเกิด *
                </Label>
                <Input
                  id="edit-birthdate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Row 3: สัญชาติ, ศาสนา, เบอร์โทร */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-nationality" className="text-xs font-semibold text-slate-700">
                  สัญชาติ
                </Label>
                <Input
                  id="edit-nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-religion" className="text-xs font-semibold text-slate-700">
                  ศาสนา
                </Label>
                <Input
                  id="edit-religion"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs font-semibold text-slate-700">
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="edit-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatThaiPhoneNumber(e.target.value))}
                  placeholder="08x-xxx-xxxx"
                  maxLength={12}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            {/* Row 4: อาชีพ, ระดับการศึกษา */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-occupation" className="text-xs font-semibold text-slate-700">
                  อาชีพ
                </Label>
                <Input
                  id="edit-occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="เช่น เกษตรกรรม, รับราชการ"
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-education" className="text-xs font-semibold text-slate-700">
                  ระดับการศึกษา
                </Label>
                <Input
                  id="edit-education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="เช่น มัธยมศึกษา, ปริญญาตรี"
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Row 5: สถานะการมีชีวิต */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isAlive}
                  onChange={(e) => setIsAlive(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                ยังมีชีวิตอยู่ (Active)
              </label>

              {!isAlive && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-deathdate" className="text-xs font-semibold text-slate-700 shrink-0">
                    วันที่เสียชีวิต:
                  </Label>
                  <Input
                    id="edit-deathdate"
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              )}
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
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  บันทึกการแก้ไข
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
