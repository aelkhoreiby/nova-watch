import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
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

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const viewport: Viewport = {
  themeColor: "#f5f2ec",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        {metaPixelId ? (
          <Script id="nova-meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);
t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
          </Script>
        ) : null}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
