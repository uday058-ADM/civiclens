import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CivicLens | Real-Time Road-Hazard Triage Platform (GVMC Visakhapatnam)',
  description: 'Mobile-first GovTech road vulnerability & pothole triage platform for gig delivery riders and municipal ward engineers in Visakhapatnam, Andhra Pradesh.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-[#0A1120] dark:text-slate-100 min-h-screen transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
