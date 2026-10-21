import Image from "next/image";

import { Icon, type IconName } from "@/components/ui/icon";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import type { Account } from "@/types/api";

const JOBS: { icon: IconName; label: string }[] = [
  { icon: "clock", label: "Time sheets by project and task" },
  { icon: "bolt", label: "Overtime requests" },
  { icon: "calendar", label: "Leave and company holidays" },
  { icon: "users", label: "Team approvals" },
];

export function LoginView({ demoAccounts, demoPassword }: { demoAccounts: Account[]; demoPassword: string }) {
  return (
    <div className="auth-shell">
      {/* The green field becomes the sidebar after sign-in: the brand row sits exactly where the sidebar's does. */}
      <aside className="auth-brand">
        <div className="brand">
          <div className="brand-logo">
            <Image src="/logo-mark.png" alt="" width={194} height={250} priority />
          </div>
          <div>
            <strong>SIRISOFT</strong>
            <small>ERP · WORKFORCE</small>
          </div>
        </div>
        <div className="auth-brand-body">
          <h2>Your working week, in one place.</h2>
          <ul>
            {JOBS.map((job) => (
              <li key={job.label}>
                <Icon name={job.icon} />
                {job.label}
              </li>
            ))}
          </ul>
        </div>
        <p className="auth-brand-foot">For SIRISOFT staff. Need an account? Ask HR / IT.</p>
      </aside>

      <main className="auth-main">
        <SignInForm demoAccounts={demoAccounts} demoPassword={demoPassword} />
      </main>
    </div>
  );
}
