'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowOrb } from '@/components/effects/glow-orb';

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <GlowOrb color="purple" size={300} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Build Your{' '}
            <span className="gradient-text">On-Chain Reputation</span>?
          </h2>
          <p className="mt-4 text-tl-text-secondary max-w-xl mx-auto">
            Connect your wallet, grant consent, and get your hybrid credit score
            in under a minute.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" glow className="group">
                Launch App
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Button>
            </Link>
            <Link href="#">
              <Button variant="secondary" size="lg">
                Read Docs
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
