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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
      <body className={geist.variable}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
