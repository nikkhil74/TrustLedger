'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

const stats = [
  { value: 12500, suffix: '+', label: 'Scores Generated' },
  { value: 99.7, suffix: '%', label: 'Uptime' },
  { value: 45, suffix: 'ms', label: 'Avg Compute Time' },
  { value: 300, suffix: '+', label: 'Lender Partners' },
];

function AnimatedNumber({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    value % 1 === 0 ? Math.floor(latest).toLocaleString() : latest.toFixed(1),
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [count, value]);

  return (
    <span className="text-4xl sm:text-5xl font-bold text-tl-primary">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section id="stats" className="relative py-20 border-y border-tl-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <AnimatedNumber value={s.value} suffix={s.suffix} />
              <p className="text-sm text-tl-text-muted">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
