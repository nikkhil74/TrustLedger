'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    title: 'Connect Wallet',
    description: 'Sign in with your Ethereum wallet via SIWE. No passwords needed.',
    color: 'from-tl-cyan to-tl-cyan/40',
  },
  {
    step: '02',
    title: 'Grant Consent',
    description:
      'Securely share your UPI, bank, and utility data through Account Aggregator.',
    color: 'from-tl-purple to-tl-purple/40',
  },
  {
    step: '03',
    title: 'Score Computed',
    description:
      'Our ML engine combines off-chain and on-chain data into a 300-900 credit score.',
    color: 'from-tl-green to-tl-green/40',
  },
  {
    step: '04',
    title: 'Share Privately',
    description:
      'Prove your score range to lenders with zero-knowledge proofs — no raw data exposed.',
    color: 'from-tl-orange to-tl-orange/40',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-tl-text">
            How It <span className="text-tl-primary">Works</span>
          </h2>
          <p className="mt-4 text-tl-text-secondary max-w-xl mx-auto">
            Four simple steps to your portable, privacy-first credit score.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-tl-border hidden md:block" />

          <div className="space-y-12">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 md:ml-0"
              >
                {/* Number circle */}
                <div
                  className={`relative z-10 flex-shrink-0 h-16 w-16 rounded-2xl bg-tl-surface border border-tl-border flex items-center justify-center shadow-sm`}
                >
                  <span className="text-tl-deep font-bold text-lg">
                    {s.step}
                  </span>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-tl-text">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-tl-text-secondary max-w-md leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
