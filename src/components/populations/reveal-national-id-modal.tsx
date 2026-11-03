"use client";

import * as React from "react";
import {
  ShieldAlert,
  KeyRound,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
  Settings,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { formatThaiNationalId } from "@/lib/formatters";
import { revealNationalIdAction } from "@/modules/population/actions";
import {
  getUserPinStatusAction,
  verifySecurityPinAction,
  setUserSecurityPinAction,
} from "@/modules/settings/actions";

export interface RevealNationalIdModalProps {
  open: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  onRevealed?: (fullId: string) => void;
}

const PRESET_REASONS = [
  "ตรวจสอบสิทธิสวัสดิการภาครัฐและเบี้ยยังชีพ",
  "ออกหนังสือรับรองถิ่นที่อยู่และสำเนาทะเบียน",
  "ยืนยันตัวตนเพื่อปรับปรุงข้อมูลทะเบียนบ้าน",
];

type ModalStep = "loading" | "setup_pin" | "verify_pin" | "enter_reason" | "revealed";

export function RevealNationalIdModal({
  open,
  onClose,
  personId,
  personName,
  onRevealed,
}: RevealNationalIdModalProps) {
  const [step, setStep] = React.useState<ModalStep>("loading");
  const [pin, setPin] = React.useState("");
  const [confirmPin, setConfirmPin] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [revealedId, setRevealedId] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = React.useState<number | null>(null);
  const [isLocked, setIsLocked] = React.useState(false);

  // Focus ref for PIN input
  const pinInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize and check PIN status when modal opens
  React.useEffect(() => {
    if (!open) return;

    setStep("loading");
    setPin("");
    setConfirmPin("");
    setReason("");
    setRevealedId(null);
    setCopied(false);
    setError(null);
    setIsLocked(false);

    async function checkStatus() {
      try {
        const res = await getUserPinStatusAction();
        if (res.success && res.data) {
          if (res.data.isLocked) {
            setIsLocked(true);
            setError(
              `บัญชีของคุณถูกระงับการตรวจสอบ PIN ชั่วคราว กรุณารออีก ${res.data.remainingMinutes || 15} นาที`
            );
            setStep("verify_pin");
          } else if (!res.data.hasPin) {
            // User hasn't set up a PIN yet
            setStep("setup_pin");
          } else {
            setRemainingAttempts(res.data.remainingAttempts ?? 5);
            setStep("verify_pin");
          }
        } else {
          setStep("verify_pin");
        }
      } catch {
        setStep("verify_pin");
      }
    }

    checkStatus();
  }, [open]);

  // Auto-focus PIN input when step changes to verify_pin or setup_pin
  React.useEffect(() => {
    if (step === "verify_pin" || step === "setup_pin") {
      const timer = setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Handle Setting up PIN for first time
  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError("กรุณากรอกรหัส PIN เป็นตัวเลข 6 หลัก");
      return;
    }

    if (pin !== confirmPin) {
      setError("รหัส PIN ทั้งสองช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setUserSecurityPinAction(pin);
      if (res.success) {
        // PIN set successfully, move directly to step 2 (Enter reason)
        setStep("enter_reason");
      } else {
        setError(res.error?.message || "ไม่สามารถตั้งค่ารหัส PIN ได้");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการตั้งรหัส PIN");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Handle PIN Verification
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError("กรุณากรอกรหัส PIN ให้ครบ 6 หลัก");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifySecurityPinAction(pin);
      if (res.success) {
        // PIN correct! Move to Step 2: Enter Reason
        setStep("enter_reason");
      } else {
        setError(res.error?.message || "รหัส PIN ไม่ถูกต้อง");
      }
    } catch (err: any) {
      setError(err.message || "รหัส PIN ไม่ถูกต้อง");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle Final Decryption with Reason
  const handleSubmitReason = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanReason = reason.trim();
    if (cleanReason.length < 5) {
      setError("กรุณาระบุเหตุผลการใช้งานอย่างน้อย 5 ตัวอักษร");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await revealNationalIdAction(personId, cleanReason, pin);
      if (res.success && res.data) {
        const fullId = res.data.fullNationalId;
        setRevealedId(fullId);
        setStep("revealed");
        if (onRevealed) onRevealed(fullId);
      } else {
        setError(res.error?.message || "ไม่สามารถเปิดดูเลขประจำตัวประชาชนได้");
      }
    } catch (err: any) {
      setError(err.message || "การเชื่อมต่อขัดข้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!revealedId) return;
    navigator.clipboard.writeText(revealedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={() => !isSubmitting && onClose()}>
      <ModalContent size="md">
        <ModalHeader onClose={() => !isSubmitting && onClose()}>
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              มาตรการคุ้มครองข้อมูล PDPA 2 ชั้น (Security PIN + Audit)
            </span>
          </div>
          <ModalTitle>ขอยืนยันการเปิดดูเลขประจำตัวประชาชน</ModalTitle>
          <ModalDescription>
            กำลังเข้าถึงข้อมูลความอ่อนไหวสูงของ{" "}
            <span className="font-semibold text-slate-800">{personName}</span>
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* Legal Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">ระบบความปลอดภัย 2 ชั้น:</span> ต้องยืนยันรหัส PIN 6 หลักส่วนตัวของเจ้าหน้าที่ และระบุวัตถุประสงค์ ทุกการเปิดดูจะถูกบันทึกรหัสลงใน <b>Security Audit Trail</b>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
            >
              {error}
            </div>
          )}

          {/* Step 0: Loading Status */}
          {step === "loading" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span>กำลังตรวจสอบสถานะความปลอดภัย...</span>
            </div>
          )}

          {/* Case: User has not set up PIN yet */}
          {step === "setup_pin" && (
            <form id="setup-pin-form" onSubmit={handleSetupPin} className="space-y-4">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                <span>คุณยังไม่ได้ตั้งค่ารหัส PIN ส่วนตัว กรุณาตั้งรหัส 6 หลักเพื่อใช้ยืนยันการเปิดดูข้อมูลสำคัญ</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="setup-new-pin" className="text-xs font-semibold text-slate-700">
                  ตั้งรหัส PIN 6 หลักใหม่ *
                </Label>
                <input
                  id="setup-new-pin"
                  aria-label="ตั้งรหัส PIN 6 หลักใหม่"
                  ref={pinInputRef}
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  required
                  disabled={isSubmitting}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl h-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="setup-confirm-pin" className="text-xs font-semibold text-slate-700">
                  ยืนยันรหัส PIN 6 หลักอีกครั้ง *
                </Label>
                <input
                  id="setup-confirm-pin"
                  aria-label="ยืนยันรหัส PIN 6 หลักอีกครั้ง"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  required
                  disabled={isSubmitting}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl h-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </form>
          )}

          {/* Step 1: Verify 6-digit PIN */}
          {step === "verify_pin" && (
            <form id="verify-pin-form" onSubmit={handleVerifyPin} className="space-y-4">
              <div className="space-y-2 text-center py-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-1">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  ขั้นที่ 1: กรุณาระบุรหัส PIN 6 หลักประจำตัว
                </div>
                <p className="text-xs text-slate-500">
                  ป้อนรหัสความปลอดภัยส่วนตัวของคุณเพื่อปลดล็อกการเข้าถึง
                </p>
              </div>

              <div className="space-y-1.5 max-w-xs mx-auto">
                <Label htmlFor="verify-pin-input" className="sr-only">
                  รหัส PIN 6 หลักประจำตัว
                </Label>
                <input
                  id="verify-pin-input"
                  aria-label="รหัส PIN 6 หลักประจำตัว"
                  ref={pinInputRef}
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  required
                  disabled={isSubmitting || isLocked}
                  className="w-full text-center tracking-[0.6em] font-mono text-2xl h-14 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                {remainingAttempts !== null && remainingAttempts < 5 && !isLocked && (
                  <p className="text-xs text-amber-600 text-center font-medium">
                    เหลือโอกาสลองอีก {remainingAttempts} ครั้ง
                  </p>
                )}
              </div>
            </form>
          )}

          {/* Step 2: Enter Reason under PDPA */}
          {step === "enter_reason" && (
            <form id="enter-reason-form" onSubmit={handleSubmitReason} className="space-y-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>ยืนยันรหัสความปลอดภัย PIN ถูกต้องเรียบร้อย</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reveal-reason" className="text-xs font-bold text-slate-800">
                  ขั้นที่ 2: ระบุวัตถุประสงค์และความจำเป็นตาม PDPA <span className="text-rose-500">*</span>
                </Label>
                <textarea
                  id="reveal-reason"
                  aria-label="วัตถุประสงค์และความจำเป็นตาม PDPA"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ระบุเหตุผลความจำเป็น เช่น ตรวจสอบสิทธิเบี้ยผู้สูงอายุ, ออกหนังสือรับรอง..."
                  required
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500">เลือกเหตุผลด่วน:</div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_REASONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReason(preset)}
                      disabled={isSubmitting}
                      className="min-h-[38px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs transition-colors font-normal cursor-pointer flex items-center text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Step 3: Result Display */}
          {step === "revealed" && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 animate-in fade-in">
              <div className="text-xs text-slate-500 font-medium">
                เลขประจำตัวประชาชน 13 หลัก (ถอดรหัสสำเร็จและบันทึก Audit แล้ว)
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 tracking-wider">
                {formatThaiNationalId(revealedId)}
              </div>
              <div className="flex justify-center pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-9 px-3 rounded-xl text-xs gap-1.5 text-slate-700 hover:text-slate-900"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">คัดลอกเรียบร้อยแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>คัดลอกเลขประจำตัวประชาชน</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {step === "setup_pin" && (
            <>
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
                form="setup-pin-form"
                disabled={isSubmitting || pin.length !== 6 || pin !== confirmPin}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    กำลังบันทึกรหัส PIN...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    บันทึกรหัส PIN และไปต่อ
                  </>
                )}
              </Button>
            </>
          )}

          {step === "verify_pin" && (
            <>
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
                form="verify-pin-form"
                disabled={isSubmitting || pin.length !== 6 || isLocked}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  <>
                    <span>ยืนยันรหัส PIN</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </>
          )}

          {step === "enter_reason" && (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setStep("verify_pin")}
                className="h-11 rounded-xl text-xs font-medium"
              >
                &larr; ย้อนกลับ
              </Button>
              <Button
                type="submit"
                form="enter-reason-form"
                disabled={isSubmitting || reason.trim().length < 5}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    กำลังถอดรหัส...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    ยืนยันและถอดรหัสข้อมูล
                  </>
                )}
              </Button>
            </>
          )}

          {step === "revealed" && (
            <Button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-11 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-6"
            >
              ปิดหน้าต่าง
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
