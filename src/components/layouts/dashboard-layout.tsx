"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { Avatar } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { navItems, paths } from "@/config/paths";
import { canAccess, useRole } from "@/lib/authorization";
import { useDecisions } from "@/lib/decisions";
import type { Role } from "@/types/api";

const ROLES: Role[] = ["Employee", "Team Lead", "HR / Admin", "Management"];

export function DashboardLayout({ children, badges = {} }: { children: ReactNode; badges?: Partial<Record<Role, Record<string, number[]>>> }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole } = useRole();

  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const pages = navItems.filter((item) => canAccess(role, item.roles));
  const { decided } = useDecisions();
  const badgeCount = (href: string) => (badges[role]?.[href] ?? []).filter((id) => !decided.has(id)).length;

  const closeSidebar = () => setSidebarOpen(false);

  // ⌘K / Ctrl+K jumps to the page search; Escape closes the mobile drawer.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const goToPage = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    const match = q && (pages.find((p) => p.label.toLowerCase() === q) ?? pages.find((p) => p.label.toLowerCase().includes(q)));
    if (!match) return;
    router.push(match.href);
    setQuery("");
    searchRef.current?.blur();
  };

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="mobile-overlay" onClick={closeSidebar} />}
      <aside id="app-sidebar" className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-logo">
            <Image src="/logo-mark.png" alt="SIRISOFT" width={194} height={250} priority />
          </div>
          <div>
            <strong>SIRISOFT</strong>
            <small>ERP · WORKFORCE</small>
          </div>
        </div>
        <nav>
          {pages.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                onNavigate={closeSidebar}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {badgeCount(item.href) ? <b><span className="sr-only">, </span>{badgeCount(item.href)}<span className="sr-only"> waiting for review</span></b> : null}
              </Link>
            );
          })}
        </nav>
        <Link href={paths.login.href} className="signout">
          <Icon name="logout" />
          <span>Sign out</span>
        </Link>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            <Icon name="menu" />
          </button>
          <form className="top-search" role="search" onSubmit={goToPage}>
            <Icon name="search" size={18} />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              list="page-list"
              placeholder="Go to page…"
              aria-label="Go to page"
            />
            <datalist id="page-list">
              {pages.map((p) => <option key={p.href} value={p.label} />)}
            </datalist>
            <kbd aria-hidden="true">⌘ K</kbd>
          </form>
          <div className="top-actions">
            <label className="role-switch">
              <span>View as</span>
              <select
                aria-label="View as role"
                value={role}
                onChange={(e) => {
                  const next = e.target.value as Role;
                  setRole(next);
                  // Stay on the current page when the new role may see it.
                  const current = Object.values(paths).find((p) => pathname.startsWith(p.href));
                  if (!current || !canAccess(next, current.roles)) router.push(paths.dashboard.href);
                }}
              >
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
            <div className="profile">
              <Avatar initials="AM" />
              <div>
                <strong>Alex Morgan</strong>
                <small>{role}</small>
              </div>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
