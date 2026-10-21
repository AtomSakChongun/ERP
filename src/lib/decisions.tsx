"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type Decision = "Approved" | "Rejected";

/**
 * Approval decisions made in this session, shared app-wide so every view of a
 * request (sidebar badge, dashboard, My Team, History) agrees.
 * Mock only: with a real backend this becomes a refetch after each decision.
 */
type DecisionsValue = { decided: ReadonlyMap<number, Decision>; markDecided: (id: number, decision: Decision) => void };

const DecisionsContext = createContext<DecisionsValue | null>(null);

export function DecisionsProvider({ children }: { children: ReactNode }) {
  const [decided, setDecided] = useState<ReadonlyMap<number, Decision>>(() => new Map());
  const markDecided = useCallback((id: number, decision: Decision) => setDecided((prev) => new Map(prev).set(id, decision)), []);
  return <DecisionsContext value={{ decided, markDecided }}>{children}</DecisionsContext>;
}

export function useDecisions() {
  const ctx = useContext(DecisionsContext);
  if (!ctx) throw new Error("useDecisions must be used within <DecisionsProvider>");
  return ctx;
}
