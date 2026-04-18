'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowOrb } from '@/components/effects/glow-orb';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Glow orbs */}
      <GlowOrb color="cyan" size={400} className="-top-40 -left-40" />
      <GlowOrb color="purple" size={350} className="-bottom-32 -right-32" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-tl-cyan/20 bg-tl-cyan/5 px-4 py-1.5"
        >
          <Shield size={14} className="text-tl-cyan" />
          <span className="text-xs font-medium text-tl-cyan">
            Powered by Polygon &middot; ZK-Private
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
        >
          Your Credit Score,
          <br />
          <span className="gradient-text">On-Chain &amp; Private</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 text-lg sm:text-xl text-tl-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          TrustLedger combines your UPI, bank, and utility data with on-chain
          DeFi activity to generate a portable credit score (300&ndash;900).
          Share it with lenders using zero-knowledge proofs &mdash; no raw data
          ever exposed.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard">
            <Button size="lg" glow className="group">
              Get Your Score
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Button>
          </Link>
          <Link href="/#how-it-works">
            <Button variant="outline" size="lg">
              How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Score preview illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-16 relative mx-auto max-w-md"
        >
          <div className="glass-card p-8 text-center glow-cyan">
            <p className="text-sm text-tl-text-secondary mb-2">Sample Score</p>
            <p className="text-7xl font-bold gradient-text-score">742</p>
            <p className="text-sm text-tl-green mt-2 font-medium">Good</p>
            <div className="mt-4 flex justify-center gap-6 text-xs text-tl-text-muted">
              <span>Off-chain: 60%</span>
              <span>On-chain: 40%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
