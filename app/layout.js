import { Geist } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Script from "next/script";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata = {
  title: "Grand Conference Hall - Premium Venue in Samarkand",
  description: "Book tickets for events or rent the Grand Conference Hall — Samarkand's premier conference venue with 98 seats, modern equipment, and professional service.",
  keywords: "conference hall, Samarkand, event booking, rent hall, konferensiya zali",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('gch-theme') === 'dark') {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={geist.variable} style={{ overflowX: 'hidden', maxWidth: '100vw', width: '100%' }}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

