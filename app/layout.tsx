import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SocialSection from "@/components/social-section";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IMMU -GanaConmigoYa!",
  description: "¡Gana a lo grande!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        {/* ✅ Elementos fijos en todas las páginas */}
        <Header />

        {/* ✅ Aquí cambia dinámicamente el contenido */}
        <main className="min-h-screen">{children}</main>

        <SocialSection />
        <Footer />
      </body>
    </html>
  );
}
