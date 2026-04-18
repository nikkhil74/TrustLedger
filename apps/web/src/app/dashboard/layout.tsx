import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { AuthGuard } from '@/components/auth/auth-guard';
import { KycBanner } from '@/components/auth/kyc-banner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex pt-16 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <AuthGuard>
            <KycBanner />
            {children}
          </AuthGuard>
        </main>
      </div>
    </>
  );
}
