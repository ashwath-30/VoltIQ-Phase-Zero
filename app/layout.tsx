import type { Metadata } from "next";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://voltiqx.app"), // update once you have a real domain
  title: {
    default: "VoltIQX — AI-Powered Home Energy Auditor",
    template: "%s | VoltIQX",
  },
  description:
    "Understand, forecast, and reduce your home electricity costs with AI-powered energy audits.",
  openGraph: {
    title: "VoltIQX — AI-Powered Home Energy Auditor",
    description:
      "Understand, forecast, and reduce your home electricity costs with AI-powered energy audits.",
    siteName: "VoltIQX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoltIQX — AI-Powered Home Energy Auditor",
    description:
      "Understand, forecast, and reduce your home electricity costs with AI-powered energy audits.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
