"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { Icon } from "@/components/ui/icon";
import { useAnchoredPopover } from "@/components/ui/use-anchored-popover";

// Dates are ISO strings ("2025-05-16"), computed in UTC so server and client agree.
const DAY_MS = 86_400_000;
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toISO = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => toISO(new Date(toDate(iso).getTime() + n * DAY_MS));
const addMonths = (iso: string, n: number) => {
  const d = toDate(iso);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return toISO(d);
};
const format = (iso: string, options: Intl.DateTimeFormatOptions) =>
  toDate(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...options });
const clamp = (iso: string, min?: string, max?: string) => (min && iso < min ? min : max && iso > max ? max : iso);

/** Weeks start on Monday, like the time sheet's week strip. */
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** The 6×7 grid of days shown for the month containing `iso`. */
function monthGrid(iso: string) {
  const first = `${iso.slice(0, 7)}-01`;
  const start = addDays(first, -((toDate(first).getUTCDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

type Props = {
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  /** Today's date, for the "Today" shortcut and the today ring. Defaults to the device date. */
  today?: string;
  /** Returns a label (e.g. a holiday name) for dates that should carry a marker. */
  markOf?: (iso: string) => string | undefined;
  disabled?: boolean;
  "aria-label"?: string;
  "data-autofocus"?: boolean;
};

/**
 * A date field with the app's own calendar. The trigger is a button showing the
 * formatted date; the calendar opens in the top layer (Popover API), so modals
 * and scrolling panels never clip it.
 */
export function DatePicker({ value, onChange, min, max, today, markOf, disabled, ...rest }: Props) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  /** The day with keyboard focus; its month is the month on screen. */
  const [cursor, setCursor] = useState(value);
  const now = today ?? toISO(new Date());

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const openAt = () => {
    setCursor(clamp(value || now, min, max));
    setOpen(true);
  };

  useAnchoredPopover(open, setOpen, triggerRef, popRef);

  // Move keyboard focus to the cursor day whenever it changes.
  useEffect(() => {
    if (open) gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${cursor}"]`)?.focus();
  }, [open, cursor]);

  const inRange = (iso: string) => (!min || iso >= min) && (!max || iso <= max);
  const pick = (iso: string) => {
    if (!inRange(iso)) return;
    onChange(iso);
    close();
  };

  const onGridKey = (e: KeyboardEvent) => {
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(cursor, -1),
      ArrowRight: () => addDays(cursor, 1),
      ArrowUp: () => addDays(cursor, -7),
      ArrowDown: () => addDays(cursor, 7),
      PageUp: () => addMonths(cursor, -1),
      PageDown: () => addMonths(cursor, 1),
      Home: () => addDays(cursor, -((toDate(cursor).getUTCDay() + 6) % 7)),
      End: () => addDays(cursor, 6 - ((toDate(cursor).getUTCDay() + 6) % 7)),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setCursor(clamp(move(), min, max));
  };

  const month = cursor.slice(0, 7);
  const prevMonth = addMonths(`${month}-01`, -1);
  const nextMonth = addMonths(`${month}-01`, 1);
  const canPrev = !min || prevMonth.slice(0, 7) >= min.slice(0, 7);
  const canNext = !max || nextMonth.slice(0, 7) <= max.slice(0, 7);
  const days = monthGrid(cursor);

  return (
    <div className="date-picker">
      <button
        ref={triggerRef}
        type="button"
        className="date-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        aria-label={rest["aria-label"] ? `${rest["aria-label"]}: ${value ? format(value, { dateStyle: "full" }) : "not set"}` : undefined}
        data-autofocus={rest["data-autofocus"] || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openAt())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            openAt();
          }
        }}
      >
        <span>{value ? format(value, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Select a date"}</span>
        <Icon name="calendar" size={18} />
      </button>

      <div
        ref={popRef}
        id={id}
        popover="manual"
        role="dialog"
        aria-label="Choose a date"
        className="date-pop"
        // The field is a <label>; stop clicks in the calendar from re-activating the trigger.
        onClick={(e) => e.preventDefault()}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && !popRef.current?.contains(next) && next !== triggerRef.current) setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            close();
          }
        }}
      >
        {open && (
          <>
            <div className="date-pop-head">
              <strong aria-live="polite">{format(`${month}-01`, { month: "long", year: "numeric" })}</strong>
              <button type="button" className="date-nav" aria-label="Previous month" disabled={!canPrev} onClick={() => setCursor(clamp(addMonths(cursor, -1), min, max))}>
                <Icon name="arrow-left" size={18} />
              </button>
              <button type="button" className="date-nav" aria-label="Next month" disabled={!canNext} onClick={() => setCursor(clamp(addMonths(cursor, 1), min, max))}>
                <Icon name="arrow" size={18} />
              </button>
            </div>
            <div className="date-grid" role="grid" ref={gridRef} onKeyDown={onGridKey}>
              {WEEKDAYS.map((d) => <span key={d} className="date-weekday" aria-hidden="true">{d}</span>)}
              {days.map((iso) => {
                const mark = markOf?.(iso);
                const weekend = [0, 6].includes(toDate(iso).getUTCDay());
                const cls = [
                  "date-day",
                  iso.slice(0, 7) !== month && "other",
                  weekend && "weekend",
                  iso === now && "today",
                  iso === value && "selected",
                  mark && "marked",
                ].filter(Boolean).join(" ");
                return (
                  <button
                    type="button"
                    key={iso}
                    data-date={iso}
                    className={cls}
                    tabIndex={iso === cursor ? 0 : -1}
                    disabled={!inRange(iso)}
                    aria-pressed={iso === value}
                    aria-current={iso === now ? "date" : undefined}
                    aria-label={`${format(iso, { dateStyle: "full" })}${mark ? `, ${mark}` : ""}`}
                    title={mark}
                    onClick={() => pick(iso)}
                  >
                    {toDate(iso).getUTCDate()}
                  </button>
                );
              })}
            </div>
            <div className="date-pop-foot">
              <span className="date-legend">{markOf && <><i aria-hidden="true" />Holiday</>}</span>
              <button type="button" className="text-btn" disabled={!inRange(now)} onClick={() => pick(now)}>Today</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
