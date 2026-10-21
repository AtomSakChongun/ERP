"use client";

import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";

import { Icon } from "@/components/ui/icon";

/**
 * With Cache Components, Next.js keeps visited pages alive (hidden) via
 * <Activity>. Closing the dialog when it gets hidden prevents a stale modal
 * from reappearing when the user navigates back.
 *
 * The close is deferred by a microtask: in development, StrictMode runs
 * cleanup + setup back-to-back on mount, and closing synchronously there would
 * dismiss the dialog the moment it opens. Only a cleanup that is NOT followed
 * by a re-setup (i.e. the page really was hidden) closes it.
 */
function useCloseWhenHidden(onClose: () => void) {
  const ref = useRef(onClose);
  const active = useRef(false);
  useLayoutEffect(() => {
    ref.current = onClose;
  });
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      queueMicrotask(() => {
        if (!active.current) ref.current();
      });
    };
  }, []);
}

const FOCUSABLE = 'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard behaviour shared by both dialogs: Escape closes, focus moves into the
 * dialog (the `initial` selector, else the first field, else the first button),
 * Tab stays inside, and focus returns to where it was when the dialog closes.
 */
function useDialogFocus(ref: RefObject<HTMLDivElement | null>, onClose: () => void, initial?: string) {
  const close = useRef(onClose);
  useLayoutEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const first =
      (initial ? dialog.querySelector<HTMLElement>(initial) : null) ??
      dialog.querySelector<HTMLElement>("input:not([disabled]), select:not([disabled]), textarea:not([disabled])") ??
      dialog.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
      } else if (e.key === "Tab") {
        const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (!items.length) return;
        const [head, tail] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === head) {
          e.preventDefault();
          tail.focus();
        } else if (!e.shiftKey && document.activeElement === tail) {
          e.preventDefault();
          head.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [ref, initial]);
}

const TitleIdContext = createContext<string | undefined>(undefined);

/**
 * Clicking the backdrop does not close the modal: forms live in modals, and a
 * stray tap would throw the input away. Close with Escape, × or Cancel.
 */
export function Modal({ onClose, className = "", children }: { onClose: () => void; className?: string; children: ReactNode }) {
  useCloseWhenHidden(onClose);
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogFocus(ref, onClose, "[data-autofocus]");
  return (
    <div className="modal-backdrop">
      <div ref={ref} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <TitleIdContext value={titleId}>{children}</TitleIdContext>
      </div>
    </div>
  );
}

export function ModalHeader({
  title,
  subtitle,
  eyebrow,
  onClose,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onClose: () => void;
}) {
  const titleId = useContext(TitleIdContext);
  return (
    <div className="modal-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={titleId}>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <button className="icon-btn" onClick={onClose} aria-label="Close">
        <Icon name="close" />
      </button>
    </div>
  );
}

export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  cancelLabel = "Cancel",
  onClose,
  onConfirm,
}: {
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useCloseWhenHidden(onClose);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  // Start on the safe choice.
  useDialogFocus(ref, onClose, "[data-autofocus]");
  return (
    <div className="modal-backdrop">
      <div ref={ref} className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-text`}>
        <div className="warning-circle"><Icon name="warning" /></div>
        <h2 id={`${id}-title`}>{title}</h2>
        <p id={`${id}-text`}>{text}</p>
        <div>
          <button className="secondary-btn" onClick={onClose} data-autofocus>{cancelLabel}</button>
          <button className="reject-btn" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
