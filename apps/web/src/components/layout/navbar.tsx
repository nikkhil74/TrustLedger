'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Loader2 } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { ConnectWallet } from '@/components/web3/connect-wallet';
import { useAuth } from '@/providers/auth-provider';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { isConnected } = useAccount();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-tl-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-tl-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">TL</span>
            </div>
            <span className="text-lg font-bold text-tl-text tracking-tight">
              Trust<span className="text-tl-primary">Ledger</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-tl-text-secondary hover:text-tl-text transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ConnectWallet />
            {isConnected && isLoading && (
              <div className="flex items-center gap-2 text-sm text-tl-text-muted">
                <Loader2 size={14} className="animate-spin" />
                <span>Securely signing in...</span>
              </div>
            )}
            {isAuthenticated && (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-tl-text-secondary hover:text-tl-text"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-tl-border glass overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block text-sm font-medium text-tl-text-secondary hover:text-tl-text transition-colors py-2',
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 pb-2 border-t border-tl-border space-y-4">
                <ConnectWallet />
                {isAuthenticated && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full"
                  >
                    <Button className="w-full">Dashboard</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
