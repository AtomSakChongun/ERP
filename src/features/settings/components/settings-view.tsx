"use client";

import { useState } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { useNotifications } from "@/components/ui/notifications";
import { PageHeader } from "@/components/ui/primitives";
import type { LeavePolicy } from "@/features/settings/api/get-leave-policies";

/** Only "Leave policies" is built so far; the other sections are listed but disabled. */
const sections: { label: string; icon: IconName; ready?: boolean }[] = [
  { label: "Company profile", icon: "grid" },
  { label: "Leave policies", icon: "calendar", ready: true },
  { label: "Public holidays", icon: "calendar" },
  { label: "Teams & departments", icon: "users" },
  { label: "Approval workflows", icon: "check" },
  { label: "Notifications", icon: "bell" },
  { label: "Audit logs", icon: "history" },
];

export function SettingsView({ policies }: { policies: LeavePolicy[] }) {
  const { notify } = useNotifications();
  const initial = Object.fromEntries(policies.map((p) => [p.name, p.active]));
  const [saved, setSaved] = useState(initial);
  const [active, setActive] = useState(initial);
  const dirty = policies.some((p) => active[p.name] !== saved[p.name]);

  return (
    <>
      <PageHeader title="Settings" subtitle="Configure company policies, teams, holidays, and system preferences." />
      <div className="settings-layout">
        <nav className="panel settings-nav" aria-label="Settings sections">
          {sections.map((s) => (
            <button
              key={s.label}
              className={s.ready ? "active" : ""}
              aria-current={s.ready ? "page" : undefined}
              disabled={!s.ready}
              title={s.ready ? undefined : "Coming soon"}
            >
              <Icon name={s.icon} size={17} />{s.label}
            </button>
          ))}
        </nav>
        <section className="panel settings-content">
          <div className="panel-head bordered">
            <div><h2>Leave policies</h2><p>Configure leave types and annual employee allowances.</p></div>
            <button className="secondary-btn" disabled title="Coming soon"><Icon name="plus" size={17} />Add leave type</button>
          </div>
          <div className="policy-list">
            {policies.map((p) => (
              <div className="policy-row" key={p.name}>
                <div className="leave-type-icon"><Icon name="calendar" size={17} /></div>
                <span><strong>{p.name}</strong><small>{p.rule}</small></span>
                <div><small>Annual allowance</small><strong>{p.allowance}</strong></div>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={active[p.name]}
                    onChange={(e) => setActive((a) => ({ ...a, [p.name]: e.target.checked }))}
                    aria-label={`${p.name} active`}
                  />
                  <i aria-hidden="true" />
                  <span>{active[p.name] ? "Active" : "Inactive"}</span>
                </label>
              </div>
            ))}
          </div>
          <div className="settings-save">
            <p><Icon name="info" size={15} />Policy changes apply to the next leave cycle unless specified.</p>
            <button
              className="primary-btn"
              disabled={!dirty}
              onClick={() => {
                setSaved(active);
                notify("Leave policy settings saved");
              }}
            >
              Save changes
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
