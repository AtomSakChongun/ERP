"use client";

import { useEffect, useLayoutEffect, type Dispatch, type RefObject, type SetStateAction } from "react";

/**
 * Shows a `popover="manual"` element in the top layer while `open`, placed under
 * its anchor (or above it when there is no room), so modals and scrolling panels
 * never clip it. Closes on a pointer down outside both, and when the page is
 * hidden by navigation (cacheComponents keeps pages mounted).
 */
export function useAnchoredPopover(
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  anchorRef: RefObject<HTMLElement | null>,
  popRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const pop = popRef.current;
    const anchor = anchorRef.current;
    if (!pop || !anchor) return;
    if (!open) {
      if (pop.matches(":popover-open")) pop.hidePopover();
      return;
    }
    // Guarded: Strict Mode runs this effect twice, and showing an open popover throws in some browsers.
    if (!pop.matches(":popover-open")) pop.showPopover();
    const place = () => {
      const r = anchor.getBoundingClientRect();
      const w = pop.offsetWidth;
      const h = pop.offsetHeight;
      const left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
      const below = r.bottom + 6;
      const top = below + h > window.innerHeight - 8 && r.top - h - 6 > 8 ? r.top - h - 6 : below;
      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
      pop.style.minWidth = `${r.width}px`;
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchorRef, popRef]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !anchorRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, setOpen, anchorRef, popRef]);

  useLayoutEffect(() => () => setOpen(false), [setOpen]);
}
