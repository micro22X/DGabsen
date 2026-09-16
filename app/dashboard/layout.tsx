import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import BackgroundGradient from '@/components/BackgroundGradient';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <BackgroundGradient>
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={session} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-20">
            {children}
          </div>
        </main>
      </div>
    </BackgroundGradient>
  );
}
