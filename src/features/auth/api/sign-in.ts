import { accounts, DEMO_PASSWORD } from "@/testing/mocks/db";
import type { Account } from "@/types/api";

export type SignInInput = { email: string; password: string; remember: boolean };

export type SignInResult = { ok: true; account: Account } | { ok: false; error: "invalid-credentials" };

/**
 * Mock sign-in: any demo account with the shared demo password.
 * `remember` has no effect until a real session exists.
 */
export async function signIn({ email, password }: SignInInput): Promise<SignInResult> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  const account = accounts.find((a) => a.email === email.trim().toLowerCase());
  if (!account || password !== DEMO_PASSWORD) return { ok: false, error: "invalid-credentials" };
  return { ok: true, account };
}

export async function getDemoAccounts(): Promise<{ accounts: Account[]; password: string }> {
  return { accounts, password: DEMO_PASSWORD };
}
