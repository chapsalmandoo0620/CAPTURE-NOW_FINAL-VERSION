import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from '@/context/language-context';

export const metadata: Metadata = {
  title: "CAPTURE NOW | Sports Highlights & Meetups",
  description: "Share your sports moments and find your crew.",
};

export const viewport: Viewport = {
  themeColor: "#39FF14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
