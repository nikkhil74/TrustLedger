import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  glow?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-tl-cyan to-tl-purple text-tl-deep font-semibold hover:brightness-110',
  secondary:
    'bg-tl-card text-tl-text border border-tl-border hover:border-tl-border-hover hover:bg-tl-elevated',
  outline:
    'bg-transparent text-tl-cyan border border-tl-cyan/40 hover:bg-tl-cyan/10',
  ghost:
    'bg-transparent text-tl-text-secondary hover:text-tl-text hover:bg-white/5',
  danger:
    'bg-tl-pink/10 text-tl-pink border border-tl-pink/30 hover:bg-tl-pink/20',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        glow && variant === 'primary' && 'glow-cyan',
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
