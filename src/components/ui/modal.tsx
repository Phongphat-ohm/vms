"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalContextValue {
  titleId: string;
  descriptionId: string;
  onClose?: () => void;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export function Modal({
  open,
  onClose,
  children,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  ariaLabelledBy,
  ariaDescribedBy,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);

  const baseId = React.useId();
  const titleId = ariaLabelledBy || `modal-title-${baseId}`;
  const descriptionId = ariaDescribedBy || `modal-desc-${baseId}`;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Save active element before modal opens, and restore focus to it when the modal closes
  React.useEffect(() => {
    if (open) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;

      // Focus first focusable element inside modal dialog
      const timer = setTimeout(() => {
        if (!dialogRef.current) return;
        const focusableSelector =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter(
          (el) =>
            el.offsetParent !== null ||
            el.offsetWidth > 0 ||
            el.offsetHeight > 0 ||
            el === document.activeElement
        );

        if (focusables.length > 0) {
          if (!dialogRef.current.contains(document.activeElement)) {
            focusables[0]?.focus();
          }
        } else {
          dialogRef.current.focus();
        }
      }, 50);

      return () => {
        clearTimeout(timer);
      };
    } else {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus?.();
        previousActiveElementRef.current = null;
      }
    }
  }, [open]);

  // Restore focus if modal component unmounts while open
  React.useEffect(() => {
    return () => {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus?.();
      }
    };
  }, []);

  // Handle keyboard navigation: Focus trap (Tab / Shift+Tab) & ESC key press
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEsc) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        if (!dialogRef.current) return;

        const focusableSelector =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter(
          (el) =>
            el.offsetParent !== null ||
            el.offsetWidth > 0 ||
            el.offsetHeight > 0 ||
            el === document.activeElement
        );

        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (event.shiftKey) {
          // Shift + Tab (Backward cycling)
          if (
            document.activeElement === firstElement ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab (Forward cycling)
          if (
            document.activeElement === lastElement ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEsc, onClose]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <ModalContext.Provider value={{ titleId, descriptionId, onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
          onClick={() => {
            if (closeOnBackdropClick) onClose();
          }}
          aria-hidden="true"
        />

        {/* Modal Dialog Content Container with Focus Trap and WAI-ARIA Semantics */}
        <div className="relative z-10 w-full flex items-center justify-center pointer-events-none">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="w-full pointer-events-auto transition-all duration-200 animate-in zoom-in-95 fade-in focus:outline-none"
          >
            {children}
          </div>
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  );
}

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-5xl",
};

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, size = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full rounded-[28px] bg-white border border-slate-200/80 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] text-slate-800",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModalContent.displayName = "ModalContent";

export function ModalHeader({
  className,
  children,
  onClose,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }) {
  const context = React.useContext(ModalContext);
  const handleClose = onClose || context?.onClose;

  return (
    <div
      className={cn("flex items-start justify-between gap-4 pb-4 border-b border-slate-100", className)}
      {...props}
    >
      <div className="space-y-1 pr-6 flex-1">{children}</div>
      {handleClose && (
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer -mr-2 -mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function ModalTitle({
  className,
  children,
  id,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const context = React.useContext(ModalContext);
  return (
    <h2
      id={id || context?.titleId}
      className={cn("text-lg sm:text-xl font-bold tracking-tight text-slate-900", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function ModalDescription({
  className,
  children,
  id,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const context = React.useContext(ModalContext);
  return (
    <p
      id={id || context?.descriptionId}
      className={cn("text-xs sm:text-sm text-slate-500 font-normal leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function ModalBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-4 text-xs sm:text-sm text-slate-700", className)} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-4 border-t border-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
