export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const SCORE_TIERS = [
  { min: 800, max: 900, label: 'Excellent', color: '#00FF88' },
  { min: 700, max: 799, label: 'Good', color: '#00F0FF' },
  { min: 600, max: 699, label: 'Fair', color: '#8B5CF6' },
  { min: 450, max: 599, label: 'Below Average', color: '#FF8800' },
  { min: 300, max: 449, label: 'Poor', color: '#FF006E' },
] as const;

export function getScoreTier(score: number) {
  return (
    SCORE_TIERS.find((t) => score >= t.min && score <= t.max) ?? SCORE_TIERS[4]
  );
}

export const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#stats', label: 'Stats' },
] as const;

export const DASHBOARD_NAV = [
  { href: '/dashboard', label: 'Overview', icon: 'LayoutDashboard' },
  { href: '/dashboard/kyc', label: 'KYC', icon: 'UserCheck' },
  { href: '/dashboard/score', label: 'My Score', icon: 'Gauge' },
  { href: '/dashboard/history', label: 'History', icon: 'History' },
  { href: '/dashboard/consent', label: 'Data Consent', icon: 'ShieldCheck' },
  { href: '/dashboard/tokens', label: 'Tokens', icon: 'Coins' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
] as const;
