import type { Metadata, Viewport } from "next";
import Providers from "./providers";
import FrameReady from "@/components/FrameReady";
import "./globals.css";

export const metadata: Metadata = {
  title: "2048 on Base",
  description:
    "The classic 2048 puzzle game, built as a mini app for the Base ecosystem. Swipe to merge tiles and reach 2048!",
  applicationName: "2048 on Base",
  manifest: "/manifest.json",
  openGraph: {
    title: "2048 on Base",
    description: "Play 2048 on Base — the classic puzzle game, onchain.",
    type: "website",
    siteName: "2048 on Base",
    images: [
      {
        url: "https://2048onbased.vercel.app/app-thumbnail.png",
        width: 1200,
        height: 628,
        alt: "2048 on Base",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "2048 on Base",
    description: "Play 2048 on Base — the classic puzzle game, onchain.",
    images: ["https://2048onbased.vercel.app/app-thumbnail.png"],
  },
  other: {
    "base:app_id": "69bc6bd4945e0bb74a271f7c",
    "apple-mobile-web-app-title": "2048 on Base",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f0f2f5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <FrameReady />
      </body>
    </html>
  );
}
