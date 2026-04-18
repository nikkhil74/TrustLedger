'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowOrbProps {
  color?: 'cyan' | 'purple' | 'green';
  size?: number;
  className?: string;
}

const colorMap = {
  cyan: 'bg-tl-cyan/20',
  purple: 'bg-tl-purple/20',
  green: 'bg-tl-green/20',
};

export function GlowOrb({
  color = 'cyan',
  size = 300,
  className,
}: GlowOrbProps) {
  return (
    <motion.div
      className={cn(
        'absolute rounded-full blur-[100px] pointer-events-none',
        colorMap[color],
        className,
      )}
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
