"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { Icon } from "@/components/ui/icon";
import { useNotifications } from "@/components/ui/notifications";
import { Field, FieldError } from "@/components/ui/primitives";
import { paths } from "@/config/paths";
import { signIn } from "@/features/auth/api/sign-in";
import { COMPANY_DOMAIN, validateCompanyEmail } from "@/features/auth/utils/email";
import { useRole } from "@/lib/authorization";
import type { Account } from "@/types/api";

type Status = "idle" | "submitting" | "success";
type Errors = { email?: string; password?: string };

// Matches the brand panel collapsing into the sidebar in globals.css.
const HANDOFF_MS = 520;

export function SignInForm({ demoAccounts, demoPassword }: { demoAccounts: Account[]; demoPassword: string }) {
  const router = useRouter();
  const { setRole } = useRole();
  const { notify } = useNotifications();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [authFailed, setAuthFailed] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    router.prefetch(paths.dashboard.href);
  }, [router]);

  // The page stays mounted (hidden) after sign-in; come back to a fresh form, not a half-finished one.
  useLayoutEffect(() => {
    return () => {
      setPassword("");
      setShowPassword(false);
      setErrors({});
      setAuthFailed(false);
      setCapsLock(false);
      setForgotOpen(false);
      setStatus("idle");
    };
  }, []);

  const busy = status !== "idle";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const next: Errors = {
      email: validateCompanyEmail(email),
      password: password ? undefined : "Enter your password.",
    };
    setErrors(next);
    setAuthFailed(false);
    if (next.email) return emailRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();

    setStatus("submitting");
    const result = await signIn({ email, password, remember });
    if (!result.ok) {
      setStatus("idle");
      setAuthFailed(true);
      setPassword("");
      passwordRef.current?.focus();
      return;
    }

    setRole(result.account.role);
    setStatus("success");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      router.push(paths.dashboard.href);
      notify(`Signed in as ${result.account.name}`);
    }, reduced ? 0 : HANDOFF_MS);
  };

  const onPasswordKey = (e: KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState("CapsLock"));

  const fillDemo = (account: Account) => {
    setEmail(account.email);
    setPassword(demoPassword);
    setErrors({});
    setAuthFailed(false);
    submitRef.current?.focus();
  };

  return (
    <form className="auth-form" data-state={status} onSubmit={onSubmit} noValidate aria-busy={status === "submitting"}>
      <div className="auth-head">
        <h1>Sign in</h1>
        <p>Use your SIRISOFT company account.</p>
      </div>

      {authFailed && (
        <div className="auth-alert" role="alert">
          <Icon name="warning" size={18} />
          <p>That email and password don’t match. Check both and try again.</p>
        </div>
      )}

      <Field label="Company email">
        <input
          ref={emailRef}
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          placeholder={`name@${COMPANY_DOMAIN}`}
          value={email}
          disabled={busy}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((x) => ({ ...x, email: validateCompanyEmail(e.target.value) }));
          }}
          onBlur={() => email && setErrors((x) => ({ ...x, email: validateCompanyEmail(email) }))}
        />
      </Field>
      <FieldError id="email-error" message={errors.email} />

      <Field label="Password">
        <span className="auth-password">
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            value={password}
            disabled={busy}
            aria-invalid={!!errors.password}
            aria-describedby={[errors.password && "password-error", capsLock && "caps-hint"].filter(Boolean).join(" ") || undefined}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password && e.target.value) setErrors((x) => ({ ...x, password: undefined }));
            }}
            onKeyDown={onPasswordKey}
            onKeyUp={onPasswordKey}
            onBlur={() => setCapsLock(false)}
          />
          <button
            type="button"
            className="auth-reveal"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            disabled={busy}
            onClick={() => setShowPassword((v) => !v)}
          >
            <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
          </button>
        </span>
      </Field>
      <FieldError id="password-error" message={errors.password} />
      {capsLock && (
        <small className="auth-caps" id="caps-hint">
          <Icon name="info" size={14} />
          Caps Lock is on.
        </small>
      )}

      <div className="auth-row">
        <label className="auth-check">
          <input type="checkbox" checked={remember} disabled={busy} onChange={(e) => setRemember(e.target.checked)} />
          Keep me signed in
        </label>
        <button
          type="button"
          className="text-btn"
          aria-expanded={forgotOpen}
          aria-controls="forgot-note"
          onClick={() => setForgotOpen((v) => !v)}
        >
          Forgot password?
        </button>
      </div>
      {forgotOpen && (
        <p className="auth-note" id="forgot-note">
          Passwords are reset by HR / IT. Contact them and they’ll send you a new one.
        </p>
      )}

      <button ref={submitRef} type="submit" className="primary-btn auth-submit" disabled={busy}>
        {status === "idle" ? "Sign in" : <><span className="auth-spinner" aria-hidden="true" />Signing in…</>}
      </button>

      <section className="auth-demo" aria-labelledby="demo-title">
        <h2 id="demo-title">
          Demo accounts <span>password “{demoPassword}”</span>
        </h2>
        <ul>
          {demoAccounts.map((account) => (
            <li key={account.email}>
              <button type="button" disabled={busy} onClick={() => fillDemo(account)}>
                <strong>{account.role}</strong>
                <span>{account.email}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </form>
  );
}
