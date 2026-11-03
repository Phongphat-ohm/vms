"use client";

import * as React from "react";
import { Plus, Home, Loader2, Save, MapPin } from "lucide-react";
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
import { createHouseAction } from "@/modules/households/actions";

export interface CreateHouseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateHouseModal({ open, onClose, onSuccess }: CreateHouseModalProps) {
  const [houseNumber, setHouseNumber] = React.useState("");
  const [subHouseNumber, setSubHouseNumber] = React.useState("");
  const [buildingType, setBuildingType] = React.useState("บ้านเดี่ยวไม้สองชั้น");
  const [latitude, setLatitude] = React.useState("");
  const [longitude, setLongitude] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setHouseNumber("");
      setSubHouseNumber("");
      setBuildingType("บ้านเดี่ยวไม้สองชั้น");
      setLatitude("");
      setLongitude("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanHouseNumber = houseNumber.trim();
    if (!cleanHouseNumber) {
      setError("กรุณาระบุเลขที่บ้าน");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createHouseAction({
        houseNumber: cleanHouseNumber,
        subHouseNumber: subHouseNumber.trim() || undefined,
        buildingType,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      });

      if (res.success) {
        onClose();
        await Swal.fire({
          icon: "success",
          title: "เพิ่มบ้านใหม่สำเร็จ",
          text: `บันทึกบ้านเลขที่ ${res.data?.houseNumber} พร้อมจัดตั้งหน่วยครัวเรือนเรียบร้อยแล้ว`,
          timer: 1800,
          showConfirmButton: false,
          customClass: { popup: "rounded-[24px]" },
        });
        onSuccess();
      } else {
        setError(res.error?.message || "ไม่สามารถเพิ่มข้อมูลบ้านได้");
      }
    } catch (err: any) {
      setError(err.message || "การเชื่อมต่อขัดข้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !isSubmitting && onClose()}>
      <ModalContent size="md">
        <form onSubmit={handleSubmit}>
          <ModalHeader onClose={() => !isSubmitting && onClose()}>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Home className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">งานทะเบียนบ้าน</span>
            </div>
            <ModalTitle>เพิ่มทะเบียนบ้านใหม่</ModalTitle>
            <ModalDescription>
              สร้างทะเบียนบ้านและจัดตั้งหน่วยครัวเรือนใหม่ในเขตพื้นที่รับผิดชอบของหมู่บ้าน
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-house-num" className="text-xs font-semibold text-slate-700">
                  เลขที่บ้าน <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="create-house-num"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="เช่น 123"
                  required
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-sub-house-num" className="text-xs font-semibold text-slate-700">
                  ทับ / แยก (ถ้ามี)
                </Label>
                <Input
                  id="create-sub-house-num"
                  value={subHouseNumber}
                  onChange={(e) => setSubHouseNumber(e.target.value)}
                  placeholder="เช่น 1, 4/2"
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-building-type" className="text-xs font-semibold text-slate-700">
                ประเภทสิ่งปลูกสร้าง
              </Label>
              <select
                id="create-building-type"
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value="บ้านเดี่ยวไม้สองชั้น">บ้านเดี่ยวไม้สองชั้น</option>
                <option value="บ้านเดี่ยวตึกชั้นเดียว">บ้านเดี่ยวตึกชั้นเดียว</option>
                <option value="บ้านเดี่ยวปูนสองชั้น">บ้านเดี่ยวปูนสองชั้น</option>
                <option value="ห้องแถวแบ่งเช่า">ห้องแถวแบ่งเช่า</option>
                <option value="อาคารพาณิชย์">อาคารพาณิชย์</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-house-lat" className="text-xs font-semibold text-slate-700">
                  พิกัดละติจูด (Lat)
                </Label>
                <Input
                  id="create-house-lat"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="13.7563"
                  disabled={isSubmitting}
                  className="h-11 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-house-lng" className="text-xs font-semibold text-slate-700">
                  พิกัดลองจิจูด (Lng)
                </Label>
                <Input
                  id="create-house-lng"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="100.5018"
                  disabled={isSubmitting}
                  className="h-11 rounded-xl font-mono text-xs"
                />
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
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกทะเบียนบ้านใหม่
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
