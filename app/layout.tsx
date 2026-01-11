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
  title: "IMMU - GanaConmigoYa!",
  description: "¡Participa en nuestros sorteos y gana premios increíbles!",
  icons: {
    icon: "/favicon.png", // Asegúrate de que el archivo esté en la carpeta /public
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // Opcional: para iPhone
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white`}>
        <Header />
        <main>{children}</main>
        <SocialSection />
        <Footer />
      </body>
    </html>
  );
}