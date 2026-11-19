import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LiffProvider } from '@/contexts/LiffContext';
import { LoginGate } from '@/components/auth/LoginGate';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Footer } from '@/components/layout/Footer';
import { RouteProgressBar } from '@/components/layout/RouteProgressBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { ModalScrollLock } from '@/components/layout/ModalScrollLock';

export const metadata: Metadata = {
  title: 'Young FTI ELITE 11 | Member Connect Hub',
  description: 'หลักสูตรนักอุตสาหกรรมรุ่นใหม่ Young FTI ELITE 11 - Executive Cohort Portal',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  other: {
    robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate',
    googlebot: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
    bingbot: 'noindex, nofollow, noarchive, nosnippet',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&family=Prompt:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-[#F7F7F5] text-[#1F2937] min-h-screen flex flex-col antialiased selection:bg-[#C59B38] selection:text-white">
        <RouteProgressBar />
        <ModalScrollLock />
        <LiffProvider>
          <LoginGate>
            <div className="w-full min-h-screen flex flex-col bg-[#F7F7F5]">
              <TopHeader />
              <main className="flex-1 w-full pb-24 md:pb-8">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <BottomNavigation />
            </div>
          </LoginGate>
        </LiffProvider>
      </body>
    </html>
  );
}
