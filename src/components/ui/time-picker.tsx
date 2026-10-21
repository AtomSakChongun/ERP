"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { Icon } from "@/components/ui/icon";
import { useAnchoredPopover } from "@/components/ui/use-anchored-popover";

const DAY_MIN = 24 * 60;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const pad = (n: number) => String(n).padStart(2, "0");

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fromMinutes = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
/** 180 → "3h", 90 → "1h 30m" */
const span = (min: number) => `${Math.floor(min / 60) ? `${Math.floor(min / 60)}h` : ""}${min % 60 ? ` ${min % 60}m` : ""}`.trim();

/** Reads what people type: "9", "930", "0930", "9:30", "9.30", "18", "1800" → "HH:mm", or null. */
export function parseTime(text: string): string | null {
  const t = text.trim().replace(/[.\s]/g, ":");
  let h: number;
  let m: number;
  if (/^\d{1,2}$/.test(t)) [h, m] = [Number(t), 0];
  else if (/^\d{3,4}$/.test(t)) [h, m] = [Number(t.slice(0, -2)), Number(t.slice(-2))];
  else if (/^\d{1,2}:\d{1,2}$/.test(t)) [h, m] = t.split(":").map(Number) as [number, number];
  else return null;
  return h < 24 && m < 60 ? fromMinutes(h * 60 + m) : null;
}

type Props = {
  value: string;
  onChange: (hhmm: string) => void;
  /** Shows each option's distance from this time, e.g. an end time's duration from the start. */
  relativeTo?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

/**
 * A time field that keeps typing fast (type "930" for 09:30), steps one minute
 * at a time with the arrow keys (Page Up/Down for an hour), and opens hour and
 * minute columns to click.
 */
export function TimePicker({ value, onChange, relativeTo, disabled, ...rest }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  // Follow outside changes (e.g. "Save & add another" moving to the next slot).
  const [shown, setShown] = useState(value);
  if (shown !== value) {
    setShown(value);
    setDraft(value);
  }

  useAnchoredPopover(open, setOpen, inputRef, popRef);

  const current = toMinutes(parseTime(draft) ?? (value || "09:00"));
  const [hour, minute] = [Math.floor(current / 60), current % 60];

  // Keep the chosen hour and minute centred in their columns.
  useEffect(() => {
    if (!open) return;
    popRef.current?.querySelectorAll<HTMLElement>(".time-cell.selected").forEach((cell) => {
      const col = cell.parentElement!;
      col.scrollTop = cell.offsetTop - col.clientHeight / 2 + cell.clientHeight / 2;
    });
  }, [open, hour, minute]);

  const set = (min: number) => {
    const hhmm = fromMinutes(((min % DAY_MIN) + DAY_MIN) % DAY_MIN);
    setDraft(hhmm);
    if (hhmm !== value) onChange(hhmm);
  };

  /** Applies the typed text; anything unreadable falls back to the last good value. */
  const commit = () => {
    const parsed = parseTime(draft);
    if (parsed && parsed !== value) onChange(parsed);
    setDraft(parsed ?? value);
    return parsed !== null && parsed !== value;
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const steps: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 60, PageDown: -60 };
    if (e.key in steps) {
      e.preventDefault();
      set(current + steps[e.key]);
    } else if (e.key === "Enter") {
      // Applies a typed time first; when nothing changed, Enter submits the form as usual.
      setOpen(false);
      if (commit()) e.preventDefault();
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
  };

  const duration = relativeTo && current > toMinutes(relativeTo) ? span(current - toMinutes(relativeTo)) : null;

  return (
    <div className="time-picker">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-controls={id}
        aria-label={rest["aria-label"]}
        aria-keyshortcuts="ArrowUp ArrowDown PageUp PageDown"
        className="time-input"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
        onBlur={(e) => {
          if (popRef.current?.contains(e.relatedTarget as Node | null)) return;
          commit();
          setOpen(false);
        }}
      />
      <Icon name="clock" size={18} />

      <div
        ref={popRef}
        id={id}
        popover="manual"
        role="dialog"
        aria-label="Choose a time"
        className="time-pop"
        // The field is a <label>; keep focus in the input and stop clicks re-activating it.
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => e.preventDefault()}
      >
        {open && (
          <>
            <div className="time-cols">
              <div className="time-col" role="listbox" aria-label="Hour">
                {HOURS.map((h) => (
                  <div key={h} role="option" aria-selected={h === hour} className={`time-cell ${h === hour ? "selected" : ""}`} onClick={() => set(h * 60 + minute)}>
                    {pad(h)}
                  </div>
                ))}
              </div>
              <div className="time-col" role="listbox" aria-label="Minute">
                {MINUTES.map((m) => (
                  <div key={m} role="option" aria-selected={m === minute} className={`time-cell ${m === minute ? "selected" : ""}`} onClick={() => set(hour * 60 + m)}>
                    {pad(m)}
                  </div>
                ))}
              </div>
            </div>
            <p className="time-foot">
              {duration ? <><strong>{duration}</strong> from start</> : <>↑ ↓ one minute · Page ↑ ↓ one hour</>}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
