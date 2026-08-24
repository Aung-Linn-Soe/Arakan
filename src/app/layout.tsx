import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/i18n/LocaleContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
          <div id="app-shell">
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
        </LocaleProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
