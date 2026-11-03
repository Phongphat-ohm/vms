import type { Metadata } from "next";
import { Kanit, Geist_Mono } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | ระบบบริหารหมู่บ้านอัจฉริยะ (Smart Village Management System - VMS)",
  description: "ระบบบริหารหมู่บ้านอัจฉริยะ (Smart Village Management System - VMS) — ศูนย์รวมระบบงานและบริการชุมชนอัจฉริยะในที่เดียว สำหรับเจ้าหน้าที่และผู้บริหารหมู่บ้าน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${kanit.variable} ${geistMono.variable} h-full antialiased light`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full font-sans antialiased text-slate-800 bg-[#f8faff]">
        {children}
      </body>
    </html>
  );
}
