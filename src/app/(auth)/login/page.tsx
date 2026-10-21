import type { Metadata } from "next";

import { paths } from "@/config/paths";
import { getDemoAccounts } from "@/features/auth/api/sign-in";
import { LoginView } from "@/features/auth/components/login-view";

export const metadata: Metadata = { title: paths.login.label };

export default async function LoginPage() {
  const { accounts, password } = await getDemoAccounts();
  return <LoginView demoAccounts={accounts} demoPassword={password} />;
}
