"use client";

import * as React from "react";
import { Upload, FileText, Loader2, Building, User, FileUp } from "lucide-react";
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
import { Autocomplete } from "@/components/ui/autocomplete";
import { uploadFileAction } from "@/modules/documents/actions";

export interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  linkOptions: {
    houses: { id: string; label: string }[];
    persons: { id: string; label: string }[];
  };
}

export function UploadDocumentModal({
  open,
  onClose,
  onSuccess,
  linkOptions,
}: UploadDocumentModalProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [category, setCategory] = React.useState("HOUSE_REGISTRATION");
  const [linkTargetType, setLinkTargetType] = React.useState<"none" | "house" | "person">("none");
  const [selectedTargetId, setSelectedTargetId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setCategory("HOUSE_REGISTRATION");
      setLinkTargetType("none");
      setSelectedTargetId("");
      setNotes("");
      setError(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("ขนาดไฟล์ต้องไม่เกิน 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError("โปรดเลือกไฟล์เอกสารที่ต้องการอัปโหลด");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", category);
      if (linkTargetType === "house" && selectedTargetId) {
        formData.append("houseId", selectedTargetId);
      } else if (linkTargetType === "person" && selectedTargetId) {
        formData.append("personId", selectedTargetId);
      }
      if (notes) formData.append("notes", notes);

      const res = await uploadFileAction(formData);
      if (res.success) {
        onClose();
        await Swal.fire({
          icon: "success",
          title: "อัปโหลดสำเร็จ",
          text: res.message || "บันทึกเอกสารลง Private Storage เรียบร้อยแล้ว",
          timer: 1800,
          showConfirmButton: false,
          customClass: { popup: "rounded-[24px]" },
        });
        onSuccess();
      } else {
        setError(res.error?.message || "ไม่สามารถอัปโหลดไฟล์ได้");
      }
    } catch (err: any) {
      setError(err.message || "การเชื่อมต่อขัดข้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !isUploading && onClose()}>
      <ModalContent size="lg">
        <form onSubmit={handleSubmit}>
          <ModalHeader onClose={() => !isUploading && onClose()}>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Upload className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">คลังเอกสารราชการ</span>
            </div>
            <ModalTitle>อัปโหลดเอกสารแนบใหม่</ModalTitle>
            <ModalDescription>
              จัดเก็บไฟล์เอกสารใน Private Storage พร้อมการรักษาความปลอดภัยตามมาตรฐาน PDPA
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

            {/* File Upload Zone */}
            <div className="space-y-1.5">
              <Label htmlFor="modal-file-upload" className="text-xs font-bold text-slate-700">
                เลือกไฟล์เอกสาร (PDF, PNG, JPG ขนาดไม่เกิน 10MB) <span className="text-rose-500">*</span>
              </Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer">
                <div className="space-y-2 text-center">
                  <FileUp className="mx-auto h-8 w-8 text-blue-600" />
                  <div className="flex text-xs text-slate-600 justify-center">
                    <label
                      htmlFor="modal-file-upload"
                      className="relative cursor-pointer rounded-md font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>คลิกเพื่อเลือกไฟล์</span>
                      <input
                        id="modal-file-upload"
                        name="modal-file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.png,.jpg,.jpeg"
                        disabled={isUploading}
                      />
                    </label>
                    <p className="pl-1 text-slate-500">หรือลากไฟล์มาวางที่นี่</p>
                  </div>
                  {selectedFile ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">PDF, PNG, JPG ไม่เกิน 10MB</p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Category */}
            <div className="space-y-1.5">
              <Label htmlFor="modal-doc-category" className="text-xs font-bold text-slate-700">
                หมวดหมู่เอกสาร <span className="text-rose-500">*</span>
              </Label>
              <select
                id="modal-doc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isUploading}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="HOUSE_REGISTRATION">สำเนาทะเบียนบ้าน (ทร.14)</option>
                <option value="ID_CARD_COPY">สำเนาบัตรประจำตัวประชาชน</option>
                <option value="LAND_TITLE_DEED">โฉนดที่ดิน / นส.3ก / ส.ป.ก.</option>
                <option value="BIRTH_CERTIFICATE">สูติบัตร</option>
                <option value="DEATH_CERTIFICATE">มรณบัตร</option>
                <option value="OTHER">เอกสารทั่วไป / อื่นๆ</option>
              </select>
            </div>

            {/* Link to Entity */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">
                ผูกเอกสารกับข้อมูลในระบบ
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLinkTargetType("none");
                    setSelectedTargetId("");
                  }}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center ${
                    linkTargetType === "none"
                      ? "bg-blue-50 text-blue-700 border-blue-300"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  ไม่ผูกกับข้อมูลใด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkTargetType("house");
                    setSelectedTargetId(linkOptions.houses[0]?.id || "");
                  }}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    linkTargetType === "house"
                      ? "bg-blue-50 text-blue-700 border-blue-300"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Building className="h-3.5 w-3.5" />
                  ผูกกับบ้าน
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkTargetType("person");
                    setSelectedTargetId(linkOptions.persons[0]?.id || "");
                  }}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    linkTargetType === "person"
                      ? "bg-blue-50 text-blue-700 border-blue-300"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  ผูกกับบุคคล
                </button>
              </div>

              {linkTargetType === "house" && (
                <div className="mt-2">
                  <Autocomplete
                    value={selectedTargetId}
                    onChange={setSelectedTargetId}
                    placeholder="-- ค้นหาและเลือกบ้านเลขที่ --"
                    searchPlaceholder="พิมพ์ค้นหาบ้านเลขที่..."
                    disabled={isUploading}
                    options={linkOptions.houses.map((h) => ({
                      value: h.id,
                      label: h.label,
                    }))}
                  />
                </div>
              )}

              {linkTargetType === "person" && (
                <div className="mt-2">
                  <Autocomplete
                    value={selectedTargetId}
                    onChange={setSelectedTargetId}
                    placeholder="-- ค้นหาและเลือกบุคคล --"
                    searchPlaceholder="พิมพ์ค้นหาชื่อ หรือเลขประจำตัว..."
                    disabled={isUploading}
                    options={linkOptions.persons.map((p) => ({
                      value: p.id,
                      label: p.label,
                    }))}
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="modal-doc-notes" className="text-xs font-bold text-slate-700">
                หมายเหตุเพิ่มเติม (ถ้ามี)
              </Label>
              <Input
                id="modal-doc-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น สำเนาฉบับปรับปรุงปี 2569"
                disabled={isUploading}
                className="h-11 rounded-xl text-xs sm:text-sm"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={onClose}
              className="h-11 rounded-xl text-xs font-medium"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  กำลังอัปโหลด...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  บันทึกและอัปโหลด
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
