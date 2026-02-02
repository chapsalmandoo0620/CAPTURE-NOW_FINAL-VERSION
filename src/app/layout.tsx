import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from '@/context/language-context';

export const metadata: Metadata = {
  title: "CAPTURE NOW | Sports Highlights & Meetups",
  description: "Share your sports moments and find your crew. The ultimate playground for sports highlights and lightning meetups.",
  openGraph: {
    title: "CAPTURE NOW | Sports Highlights & Meetups",
    description: "Share your sports moments and find your crew.",
    url: "https://capture-now.vercel.app", // Assuming Vercel deployment or similar placeholder
    siteName: "CAPTURE NOW",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 600,
        alt: "CAPTURE NOW Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAPTURE NOW | Sports Highlights & Meetups",
    description: "Share your sports moments and find your crew.",
    images: ["/logo.jpg"],
  },
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
