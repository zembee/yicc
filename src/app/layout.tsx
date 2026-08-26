import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LiffProvider } from '@/contexts/LiffContext';
import { LoginGate } from '@/components/auth/LoginGate';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Footer } from '@/components/layout/Footer';

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
      <body className="bg-[#F8FAFC] text-[#1F2937] min-h-screen flex flex-col antialiased selection:bg-[#FB7170] selection:text-white">
        <LiffProvider>
          <LoginGate>
            <div className="w-full min-h-screen flex flex-col bg-[#F8FAFC]">
              <TopHeader />
              <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
                {children}
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
