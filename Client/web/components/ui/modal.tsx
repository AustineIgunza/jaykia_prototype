"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
      // Trigger enter animation
      requestAnimationFrame(() => {
        dialog.classList.add("modal-visible");
      });
    } else {
      dialog.classList.remove("modal-visible");
      // Wait for exit animation before closing
      const timeout = setTimeout(() => dialog.close(), 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className="bg-surface border border-border rounded-[var(--radius-lg)] p-0 text-foreground max-w-lg w-full opacity-0 scale-95 transition-all duration-200 ease-out [&.modal-visible]:opacity-100 [&.modal-visible]:scale-100 backdrop:bg-black/60 backdrop:transition-opacity backdrop:duration-200"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="p-6">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="font-display text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </dialog>
  );
}

export { Modal };
