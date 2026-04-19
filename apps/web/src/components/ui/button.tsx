import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  glow?: boolean; // Kept for backward compatibility, but won't do anything neon anymore
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-tl-primary text-white font-medium shadow-sm hover:bg-tl-primary-hover active:scale-[0.98]',
  secondary:
    'bg-tl-card text-tl-text border border-tl-border hover:border-tl-border-hover hover:bg-tl-elevated active:scale-[0.98]',
  outline:
    'bg-transparent text-tl-text border border-tl-border hover:bg-tl-surface active:scale-[0.98]',
  ghost:
    'bg-transparent text-tl-text-secondary hover:text-tl-text hover:bg-tl-surface active:scale-[0.98]',
  danger:
    'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 active:scale-[0.98]',
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
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
