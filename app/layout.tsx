import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = "https://agrovia.infratek.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "FRESCO 3D Pipeline Intelligence | INFRATEK",
  description:
    "Cockpit ejecutivo 3D para inteligencia postcosecha, reclamos y cadena de frío en agroexportación peruana.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "FRESCO 3D Pipeline Intelligence",
    description: "Cockpit ejecutivo 3D para inteligencia postcosecha",
    url: siteUrl,
    type: "website",
    siteName: "FRESCO",
  },
  twitter: {
    card: "summary_large_image",
    title: "FRESCO 3D Pipeline Intelligence",
    description: "Cockpit ejecutivo 3D para inteligencia postcosecha",
  },
};

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

export default RootLayout;
