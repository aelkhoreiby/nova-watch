import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOVA — TIME. YOUR WAY.",
  description: "NOVA watches. Designed for the way you move.",
  applicationName: "NOVA Watch",
  keywords: ["NOVA watches", "watches UAE", "Nova Store UAE", "TIME. YOUR WAY."],
  authors: [{ name: "NOVA" }],
  creator: "NOVA",
  publisher: "NOVA",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "NOVA — TIME. YOUR WAY.",
    description: "Explore the NOVA watch collection.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOVA — TIME. YOUR WAY.",
    description: "Explore the NOVA watch collection.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f2ec",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
