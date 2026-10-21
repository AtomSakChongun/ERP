import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";

import type { Status } from "@/types/api";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <span />
      {status}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  required,
  span,
  children,
}: {
  label: string;
  required?: boolean;
  span?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`field ${span ? "field-span" : ""}`}>
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      {children}
    </label>
  );
}

/** Inline validation message under a field. Renders nothing without a message. */
export function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null;
  return <small className="field-error" id={id} role="alert"><Icon name="info" size={14} />{message}</small>;
}

export function Avatar({ initials, size = "default", className = "" }: { initials: string; size?: "default" | "small"; className?: string }) {
  return <div className={`avatar ${size === "small" ? "small" : ""} ${className}`}>{initials}</div>;
}
