import { ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeInit } from "../.flowbite-react/init";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const montserrat = localFont({
  src: [
    {
      path: "../public/assets/fonts/Montserrat-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Montserrat-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Montserrat-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Montserrat-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

const kronaOne = localFont({
  src: "../public/assets/fonts/KronaOne-Regular.ttf",
  variable: "--font-krona",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IMMAX - Intensive Monitoring Maximum System",
  description: "Satu Sistem untuk Keunggulan Operasional Harian LRT Jabodebek",
  icons: {
    icon: "/assets/immax-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ThemeModeScript defaultMode="light" />
      </head>
      <body
        className={`${montserrat.variable} ${kronaOne.variable} font-paragraph antialiased`}
      >
        <ThemeInit />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
