import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'cyan' | 'purple' | 'green' | 'orange' | 'pink' | 'muted';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  cyan: 'bg-tl-cyan/10 text-tl-cyan border-tl-cyan/20',
  purple: 'bg-tl-purple/10 text-tl-purple border-tl-purple/20',
  green: 'bg-tl-green/10 text-tl-green border-tl-green/20',
  orange: 'bg-tl-orange/10 text-tl-orange border-tl-orange/20',
  pink: 'bg-tl-pink/10 text-tl-pink border-tl-pink/20',
  muted: 'bg-white/5 text-tl-text-secondary border-white/10',
};

export function Badge({ className, variant = 'cyan', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
