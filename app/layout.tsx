import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import StructuredData from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shining Stars - #1 Texas Stars Fan Community",
  description: "Join the #1 Texas Stars fan community! Connect with thousands of AHL hockey fans, share game reactions, live chat during games, view player stats, and stay updated with the latest news and countdown timers.",
  keywords: [
    "Texas Stars",
    "AHL hockey",
    "Texas Stars fans",
    "hockey fan community",
    "AHL Dallas",
    "Texas Stars news",
    "Texas Stars stats",
    "hockey chat",
    "Texas Stars games",
    "H-E-B Center Cedar Park",
    "Dallas Stars AHL affiliate",
    "Texas Stars roster",
    "AHL live chat",
    "hockey fan site"
  ],
  authors: [{ name: "Shining Stars Community" }],
  creator: "Shining Stars",
  publisher: "Shining Stars",
  metadataBase: new URL('https://shiningstars-lac.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Shining Stars - #1 Texas Stars Fan Community",
    description: "Join thousands of Texas Stars fans! Live chat, player stats, game countdowns, and the latest AHL hockey news.",
    url: 'https://shiningstars-lac.vercel.app',
    siteName: 'Shining Stars',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Shining Stars - Texas Stars Fan Community',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Shining Stars - #1 Texas Stars Fan Community",
    description: "Join thousands of Texas Stars fans! Live chat, player stats, game countdowns, and the latest AHL hockey news.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // You'll add this later from Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
