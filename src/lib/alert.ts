import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

/**
 * Custom SweetAlert2 instance styled strictly to the Village Management System (VMS)
 * "Modern Civic Workspace" design system:
 * - 28px corner curvature (rounded-[28px])
 * - Civic Cobalt primary buttons with 44px touch targets
 * - Soft neutral cancel buttons
 * - Diffuse ambient depth shadow
 * - Full Kanit & Thai typography baseline harmony
 */
export const CustomSwal = Swal.mixin({
  customClass: {
    popup: "vms-swal-popup",
    title: "vms-swal-title",
    htmlContainer: "vms-swal-html",
    confirmButton: "vms-swal-confirm",
    cancelButton: "vms-swal-cancel",
    actions: "vms-swal-actions",
  },
  buttonsStyling: true,
  confirmButtonColor: "#2563EB",
  cancelButtonColor: "#94A3B8",
});

/**
 * Convenient alert helpers with VMS system theme presets
 */
export const showAlert = {
  /**
   * Displays a success feedback alert
   */
  success: (title: string, text?: string, timer = 2000): Promise<SweetAlertResult> => {
    return CustomSwal.fire({
      icon: "success",
      title,
      text,
      timer: timer > 0 ? timer : undefined,
      showConfirmButton: timer === 0,
    });
  },

  /**
   * Displays an error or failure alert
   */
  error: (title: string, text?: string): Promise<SweetAlertResult> => {
    return CustomSwal.fire({
      icon: "error",
      title,
      text: text || "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง",
      confirmButtonColor: "#EF4444",
      confirmButtonText: "รับทราบ",
    });
  },

  /**
   * Displays a warning or validation alert
   */
  warning: (title: string, text?: string): Promise<SweetAlertResult> => {
    return CustomSwal.fire({
      icon: "warning",
      title,
      text,
      confirmButtonColor: "#F59E0B",
      confirmButtonText: "เข้าใจแล้ว",
    });
  },

  /**
   * Displays an informational notice alert
   */
  info: (title: string, text?: string): Promise<SweetAlertResult> => {
    return CustomSwal.fire({
      icon: "info",
      title,
      text,
      confirmButtonColor: "#2563EB",
      confirmButtonText: "ตกลง",
    });
  },

  /**
   * Displays a confirmation dialog returning a Promise resolving to user's decision
   */
  confirm: (
    title: string,
    text?: string,
    confirmText = "ยืนยันการทำรายการ",
    cancelText = "ยกเลิก",
    isDestructive = false
  ): Promise<SweetAlertResult> => {
    return CustomSwal.fire({
      icon: "question",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: isDestructive ? "#EF4444" : "#2563EB",
      reverseButtons: true,
    });
  },
};

export default CustomSwal;
