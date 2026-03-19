import type { Metadata, Viewport } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "2048 on Base",
  description:
    "The classic 2048 puzzle game, built as a mini app for the Base ecosystem. Swipe to merge tiles and reach 2048!",
  openGraph: {
    title: "2048 on Base",
    description: "Play 2048 on Base — the classic puzzle game, onchain.",
    type: "website",
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
      </body>
    </html>
  );
}
