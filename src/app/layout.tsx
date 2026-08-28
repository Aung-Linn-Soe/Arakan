import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/i18n/LocaleContext";
import { AuthProvider } from "@/i18n/AuthContext";
import AppShell from "@/components/AppShell";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "ラカイン旅々 | Rakhine Explorer",
  description:
    "ラカイン州(ミャンマー)の観光スポットをカテゴリー別に探せるカタログアプリ。",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#c1652e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="my">
      <body>
        <LocaleProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </LocaleProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
