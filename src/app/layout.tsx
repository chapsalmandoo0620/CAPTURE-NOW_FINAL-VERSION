import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAPTURE NOW | Sports Highlights & Meetups",
  description: "Share your sports moments and find your crew.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
