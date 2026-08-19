import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LiffProvider } from '@/contexts/LiffContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export const metadata: Metadata = {
  title: 'YFTI Connect | Executive Cohort Hub',
  description: 'Mobile-first Community & Networking Web App for Executive Cohorts',
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
      <body className="bg-[#F8F9FC] text-[#292929] min-h-screen flex flex-col antialiased selection:bg-[#FB7170] selection:text-white">
        <LiffProvider>
          <div className="w-full max-w-md mx-auto min-h-screen flex flex-col relative bg-[#F8F9FC] shadow-2xl border-x border-[#EEEEEE]">
            <TopHeader />
            <main className="flex-1 pb-24 px-4 pt-3 overflow-y-auto">
              {children}
            </main>
            <BottomNavigation />
          </div>
        </LiffProvider>
      </body>
    </html>
  );
}
