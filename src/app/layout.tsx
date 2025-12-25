import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Strava Rewind | Your Year in Sport",
  description:
    "Discover your personal year in sport with Strava Rewind. View your running, cycling, and workout statistics in a beautiful recap.",
  keywords: [
    "Strava",
    "Year in Sport",
    "Running",
    "Cycling",
    "Fitness",
    "Statistics",
  ],
  openGraph: {
    title: "Strava Rewind | Your Year in Sport",
    description:
      "Discover your personal year in sport with beautiful statistics and insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
