"use client";

import * as React from "react";
import { Home, Loader2, Save, Building, MapPin } from "lucide-react";
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
import { updateHouseAction } from "@/modules/households/actions";
import { HouseDetailDto } from "@/modules/households/types";

export interface EditHouseModalProps {
  open: boolean;
  onClose: () => void;
  house: HouseDetailDto;
  onSuccess: (updated: HouseDetailDto) => void;
}

const COMMON_BUILDING_TYPES = [
  "บ้านเดี่ยวไม้สองชั้น",
  "บ้านเดี่ยวปูนชั้นเดียว",
  "บ้านเดี่ยวปูนสองชั้น",
  "บ้านครึ่งตึกครึ่งไม้",
  "ทาวน์เฮาส์ / ตึกแถว",
  "เรือนไทยประยุกต์",
  "อาคารพาณิชย์",
  "ห้องพัก / ห้องเช่า",
];

export function EditHouseModal({ open, onClose, house, onSuccess }: EditHouseModalProps) {
  const [houseNumber, setHouseNumber] = React.useState(house.houseNumber);
  const [subHouseNumber, setSubHouseNumber] = React.useState(house.subHouseNumber || "");
  const [buildingType, setBuildingType] = React.useState(house.buildingType || COMMON_BUILDING_TYPES[0]);
  const [latitude, setLatitude] = React.useState(house.latitude ? String(house.latitude) : "");
  const [longitude, setLongitude] = React.useState(house.longitude ? String(house.longitude) : "");
  const [isActive, setIsActive] = React.useState(house.isActive);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setHouseNumber(house.houseNumber);
      setSubHouseNumber(house.subHouseNumber || "");
      setBuildingType(house.buildingType || COMMON_BUILDING_TYPES[0]);
      setLatitude(house.latitude ? String(house.latitude) : "");
      setLongitude(house.longitude ? String(house.longitude) : "");
      setIsActive(house.isActive);
      setError(null);
    }
  }, [open, house]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNum = houseNumber.trim();
    if (!cleanNum) {
      setError("กรุณาระบุบ้านเลขที่");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateHouseAction({
        houseId: house.id,
        houseNumber: cleanNum,
        subHouseNumber: subHouseNumber.trim() || null,
        buildingType,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isActive,
      });

      if (res.success && res.data) {
        onClose();
        await Swal.fire({
          icon: "success",
          title: "บันทึกการแก้ไขสำเร็จ",
          text: `อัปเดตข้อมูลบ้านเลขที่ ${res.data.houseNumber} เรียบร้อยแล้ว`,
          timer: 1800,
          showConfirmButton: false,
          customClass: { popup: "rounded-[24px]" },
        });
        onSuccess(res.data);
      } else {
        setError(res.error?.message || "ไม่สามารถบันทึกข้อมูลบ้านได้");
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
            <ModalTitle>แก้ไขข้อมูลทะเบียนบ้าน</ModalTitle>
            <ModalDescription>
              ปรับปรุงรายละเอียดบ้านเลขที่ {house.houseNumber} รหัสครัวเรือน: {house.householdCode}
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

            {/* House Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-houseNumber" className="text-xs font-semibold text-slate-700">
                  บ้านเลขที่หลัก <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="edit-houseNumber"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="เช่น 12 หรือ 45/1"
                  required
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-subHouseNumber" className="text-xs font-semibold text-slate-700">
                  เลขที่หลังย่อย / ป้ายกำกับ (ถ้ามี)
                </Label>
                <Input
                  id="edit-subHouseNumber"
                  value={subHouseNumber}
                  onChange={(e) => setSubHouseNumber(e.target.value)}
                  placeholder="เช่น หลังที่ 2 หรือ อาคาร B"
                  disabled={isSubmitting}
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Building Type */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-buildingType" className="text-xs font-semibold text-slate-700">
                ประเภทสิ่งปลูกสร้าง <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="edit-buildingType"
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {COMMON_BUILDING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Building className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-latitude" className="text-xs font-semibold text-slate-700">
                  ละติจูด (Latitude)
                </Label>
                <div className="relative">
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="13.7563"
                    disabled={isSubmitting}
                    className="pl-9 h-11 rounded-xl text-xs font-mono"
                  />
                  <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-longitude" className="text-xs font-semibold text-slate-700">
                  ลองจิจูด (Longitude)
                </Label>
                <div className="relative">
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="100.5018"
                    disabled={isSubmitting}
                    className="pl-9 h-11 rounded-xl text-xs font-mono"
                  />
                  <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                เปิดใช้งานตามปกติ (Active House Record)
              </label>
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
