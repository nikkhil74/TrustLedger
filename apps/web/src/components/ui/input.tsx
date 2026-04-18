import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-tl-text-secondary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-xl border bg-tl-card px-4 py-2.5 text-sm text-tl-text',
          'placeholder:text-tl-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-tl-cyan/40 focus:border-tl-cyan/40',
          'transition-all duration-200',
          error ? 'border-tl-pink/50' : 'border-tl-border',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-tl-pink">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
