import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LightRays } from "@/components/ui/light-rays";
import Header from "@/components/header";
import FooterSection from "@/components/ui/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixel-scout",
  description: "Created by KikoDevv",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        {children}
        <LightRays color="rgba(100, 200, 255, 0.2)" count={7} blur={36} speed={14} />
        <FooterSection />
      </body>
    </html>
  );
}
