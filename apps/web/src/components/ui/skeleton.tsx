import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-tl-card animate-pulse',
        className,
      )}
    />
  );
}
