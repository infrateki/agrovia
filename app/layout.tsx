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
  title: "AgroVIA — Inteligencia Postcosecha 3D | INFRATEK",
  description:
    "Cockpit ejecutivo 3D para inteligencia postcosecha con operador IA. Decisiones en menos de 60 segundos: riesgo, reclamos y cadena de frío.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AgroVIA — Inteligencia Postcosecha 3D",
    description:
      "Cockpit ejecutivo 3D para inteligencia postcosecha con operador IA",
    url: siteUrl,
    type: "website",
    siteName: "AgroVIA",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgroVIA — Inteligencia Postcosecha 3D",
    description:
      "Cockpit ejecutivo 3D para inteligencia postcosecha con operador IA",
  },
};

// Inline FOUC-prevention: read theme from localStorage and set data-theme
// on <html> BEFORE first paint. Runs as a blocking script with no React.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('agrovia.theme');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

export default RootLayout;
