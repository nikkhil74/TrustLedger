'use client';

import { motion } from 'framer-motion';
import {
  Wallet,
  ShieldCheck,
  BarChart3,
  Zap,
  Lock,
  Globe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: BarChart3,
    title: 'Hybrid Scoring',
    description:
      'Combines UPI, bank statements, utility payments with DeFi loans, wallet age, and on-chain behavior.',
    color: 'text-tl-cyan',
  },
  {
    icon: Lock,
    title: 'ZK Privacy',
    description:
      'Share score ranges with lenders via zero-knowledge proofs. No raw data ever exposed.',
    color: 'text-tl-purple',
  },
  {
    icon: Wallet,
    title: 'Soulbound Tokens',
    description:
      'Non-transferable behavior tokens reward positive financial actions on-chain.',
    color: 'text-tl-green',
  },
  {
    icon: ShieldCheck,
    title: 'Consent-First',
    description:
      'You control your data. Granular consent management with Account Aggregator integration.',
    color: 'text-tl-orange',
  },
  {
    icon: Zap,
    title: 'Real-Time Pipeline',
    description:
      'Five-stage async pipeline: data fetch, compute, attest, and notify in seconds.',
    color: 'text-tl-pink',
  },
  {
    icon: Globe,
    title: 'Multi-Channel Access',
    description:
      'Access your score via web dashboard, API, or WhatsApp bot — wherever you are.',
    color: 'text-tl-cyan',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-tl-text">
            Built for <span className="text-tl-primary">Trust</span>
          </h2>
          <p className="mt-4 text-tl-text-secondary max-w-2xl mx-auto">
            A credit scoring platform that respects your privacy while giving
            lenders the confidence they need.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}>
              <Card glass className="h-full hover:border-tl-border-hover group">
                <CardContent>
                  <div
                    className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform`}
                  >
                    <f.icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-tl-text mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-tl-text-secondary leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
