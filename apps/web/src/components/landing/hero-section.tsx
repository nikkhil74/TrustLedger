'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Lock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-tl-deep">
      {/* Subtle background gradient instead of orbs */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-tl-primary/10 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-tl-border bg-tl-surface px-4 py-1.5 shadow-sm"
        >
          <ShieldCheck size={16} className="text-tl-primary" />
          <span className="text-sm font-medium text-tl-text-secondary">
            Bank-Grade Security &middot; ZK-Private
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-tl-text"
        >
          Your Global Credit Score,
          <br />
          <span className="text-tl-primary">Verified On-Chain.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 text-lg sm:text-xl text-tl-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          TrustLedger combines traditional financial data with on-chain
          activity to generate a unified, portable credit score. 
          Share it instantly with zero-knowledge privacy.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard">
            <Button size="lg" className="group">
              Get Your Score
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Button>
          </Link>
          <Link href="/#how-it-works">
            <Button variant="secondary" size="lg">
              How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Score preview illustration - Designed like a premium widget */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
          className="mt-20 relative mx-auto max-w-2xl"
        >
          <Card glass className="p-8 border-t-tl-primary/30 border-t-2 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldCheck size={120} />
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-tl-text-muted uppercase tracking-wider mb-2">Trust Score</p>
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-6xl md:text-8xl font-bold tracking-tight text-tl-text">742</span>
                  <span className="text-xl font-medium text-tl-emerald flex items-center gap-1">
                    <Activity size={20} /> Excellent
                  </span>
                </div>
              </div>
              
              <div className="flex-1 w-full max-w-xs space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-tl-text-secondary">Traditional Data</span>
                    <span className="font-medium text-tl-text">60%</span>
                  </div>
                  <div className="h-2 w-full bg-tl-surface rounded-full overflow-hidden">
                    <div className="h-full bg-tl-primary rounded-full w-[60%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-tl-text-secondary">On-Chain Activity</span>
                    <span className="font-medium text-tl-text">40%</span>
                  </div>
                  <div className="h-2 w-full bg-tl-surface rounded-full overflow-hidden">
                    <div className="h-full bg-tl-teal rounded-full w-[40%]" />
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-2 text-xs text-tl-text-muted">
                  <Lock size={14} /> End-to-end encrypted
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
