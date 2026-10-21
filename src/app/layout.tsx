import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppProvider } from "@/app/provider";
import "@/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s · SIRISOFT ERP",
    default: "SIRISOFT ERP",
  },
  description: "Time sheets, overtime, leave and team management.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      {/* Browser extensions (e.g. Grammarly) inject attributes on <body> before hydration. */}
      <body suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
