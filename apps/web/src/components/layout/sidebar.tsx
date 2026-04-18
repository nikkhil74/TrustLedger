'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Gauge,
  History,
  ShieldCheck,
  Coins,
  Settings,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_NAV } from '@/lib/constants';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Gauge,
  History,
  ShieldCheck,
  Coins,
  Settings,
  UserCheck,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-tl-border bg-tl-surface/50 min-h-[calc(100vh-4rem)]">
      <nav className="flex-1 px-3 py-6 space-y-1">
        {DASHBOARD_NAV.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-tl-cyan/10 text-tl-cyan'
                  : 'text-tl-text-secondary hover:text-tl-text hover:bg-white/5',
              )}
            >
              {Icon && <Icon size={18} />}
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-tl-cyan" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom card */}
      <div className="p-3 mb-4">
        <div className="rounded-xl border border-tl-border bg-tl-card p-4">
          <p className="text-xs font-medium text-tl-text-secondary mb-1.5">
            Need help?
          </p>
          <p className="text-xs text-tl-text-muted mb-3">
            Check our docs or reach out via WhatsApp bot.
          </p>
          <Link
            href="#"
            className="inline-flex items-center text-xs font-medium text-tl-cyan hover:underline"
          >
            View Documentation
          </Link>
        </div>
      </div>
    </aside>
  );
}
