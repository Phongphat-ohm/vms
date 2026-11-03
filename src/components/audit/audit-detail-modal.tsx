"use client";

import * as React from "react";
import { ShieldCheck, Calendar, User, Globe, Activity, FileJson } from "lucide-react";
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
import { AuditLogDto } from "@/modules/audit/types";

export interface AuditDetailModalProps {
  open: boolean;
  onClose: () => void;
  log: AuditLogDto | null;
}

export function AuditDetailModal({ open, onClose, log }: AuditDetailModalProps) {
  if (!log) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent size="lg">
        <ModalHeader onClose={onClose}>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">บันทึกเหตุการณ์ความมั่นคงปลอดภัย</span>
          </div>
          <ModalTitle>รายละเอียด Security Audit Event</ModalTitle>
          <ModalDescription>
            บันทึกการตรวจสอบย้อนหลังตามมาตรการคุ้มครองข้อมูลส่วนบุคคล (PDPA Safe Delta)
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">การกระทำ (Action)</span>
              <span className="font-mono font-bold text-blue-600">{log.action}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">โมดูลที่เกี่ยวข้อง</span>
              <span className="font-semibold text-slate-800">{log.module} ({log.entityType})</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">ผู้ดำเนินการ</span>
              <span className="font-semibold text-slate-800">{log.userName || "เจ้าหน้าที่ในระบบ"}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">IP Address</span>
              <span className="font-mono text-slate-700">{log.ipAddress || "127.0.0.1"}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-0.5 font-medium">วันและเวลาที่บันทึก</span>
              <span className="font-semibold text-slate-800">
                {new Date(log.createdAt).toLocaleString("th-TH", {
                  dateStyle: "full",
                  timeStyle: "medium",
                })}
              </span>
            </div>
          </div>

          {/* Safe Delta JSON Details */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <FileJson className="h-4 w-4 text-slate-500" />
                <span>ข้อมูลการเปลี่ยนแปลง (Safe Delta JSON)</span>
              </div>
              <span className="text-xs font-normal text-slate-400">
                * ข้อมูลความลับถูก Sanitized อัตโนมัติ
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
              <pre>{JSON.stringify(log.details || {}, null, 2)}</pre>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto h-11 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-6"
          >
            ปิดหน้าต่าง
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
