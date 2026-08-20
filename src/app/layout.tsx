import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LiffProvider } from '@/contexts/LiffContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

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
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-[#EAEFF8] text-[#1F2937] min-h-screen flex flex-col antialiased selection:bg-[#FB7170] selection:text-white">
        <LiffProvider>
          <div className="w-full max-w-md mx-auto min-h-screen flex flex-col relative bg-[#F6F7FB] shadow-xl border-x border-slate-200">
            <TopHeader />
            <main className="flex-1 pb-20 px-3.5 pt-3 overflow-y-auto">
              {children}
            </main>
            <BottomNavigation />
          </div>
        </LiffProvider>
      </body>
    </html>
  );
}

