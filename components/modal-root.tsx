"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function useModal() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return { open, setOpen, ready };
}

export function useDropdown() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [ready, setReady] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setReady(true); }, []);

  function toggle() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 4,
      right: window.innerWidth - rect.right,
    });
    setOpen((v) => !v);
  }

  return { open, setOpen, pos, ready, triggerRef, toggle };
}

// Dropdown renders via Portal to avoid table overflow clipping
type DropdownProps = {
  pos: { top: number; right: number };
  onClose: () => void;
  children: React.ReactNode;
};

export function Dropdown({ pos, onClose, children }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return createPortal(
    <div
      className="codex-dropdown-menu"
      ref={ref}
      style={{
        position: "absolute",
        top: pos.top,
        right: pos.right,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "4px",
        minWidth: "fit-content",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 16px rgba(15,23,42,0.1), 0 1px 4px rgba(15,23,42,0.06)",
        zIndex: 9990,
        display: "grid",
        gap: "1px",
        overflow: "hidden",
      }}
    >
      {children}
    </div>,
    document.body
  );
}

// Modal renders via Portal at body level
type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: number;
  dismissible?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  shakeOnOverlayClick?: boolean;
};

export function Modal({
  children,
  onClose,
  maxWidth = 420,
  dismissible = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  shakeOnOverlayClick = false
}: ModalProps) {
  const [shaking, setShaking] = useState(false);
  const shakeOnly = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 180);
  };
  const closeWithShake = useCallback(() => {
    if (!dismissible) return;
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      onClose();
    }, 180);
  }, [dismissible, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (!dismissible) return;
      if (!closeOnEscape) return;
      if (e.key === "Escape") {
        closeWithShake();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [dismissible, closeOnEscape, closeWithShake]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!dismissible) return;
    if (shakeOnOverlayClick) {
      if (e.target === e.currentTarget) shakeOnly();
      return;
    }
    if (!closeOnOverlayClick) return;
    if (e.target === e.currentTarget) {
      closeWithShake();
    }
  };

  const handleModalClickCapture = (e: React.MouseEvent) => {
    if (!dismissible) return;
    const target = e.target as HTMLElement;
    const closeButton = target.closest("[data-modal-close='true']");
    if (closeButton) {
      e.preventDefault();
      e.stopPropagation();
      closeWithShake();
    }
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(15,23,42,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px 12px",
        cursor: "default",
      }}
      onClick={handleOverlayClick}
    >
      <style>{`
        @keyframes modal-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .modal-shake-anim {
          animation: modal-shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      <div
        className={shaking ? "modal-shake-anim" : ""}
        onClickCapture={handleModalClickCapture}
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "0",
          width: `min(${maxWidth}px, 96vw)`,
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 64px)",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.05)",
          transition: "transform 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
