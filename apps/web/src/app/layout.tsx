import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Web3Provider } from '@/providers/web3-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { PageTransitionProvider } from '@/providers/page-transition';
import { GridBackground } from '@/components/effects/grid-background';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TrustLedger — Hybrid Web3 Credit Scoring',
  description:
    'Portable credit scores (300-900) combining UPI, bank, utility data with on-chain DeFi activity. ZK-private, Polygon-powered.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-tl-deep text-tl-text">
        <Web3Provider>
          <AuthProvider>
            <GridBackground />
            <PageTransitionProvider>
              {children}
            </PageTransitionProvider>
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
