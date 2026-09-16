'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, ClipboardList, LogOut, Menu, X, BarChart3, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from './GlassCard';

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = user.role === 'Admin';

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: ClipboardList, label: 'Absensi', href: '/dashboard/attendance' },
    ...(isAdmin ? [
      { icon: Users, label: 'Data Siswa', href: '/dashboard/students' },
      { icon: BarChart3, label: 'Laporan', href: '/dashboard/reports' }
    ] : [])
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <GlassCard className={cn(
        "fixed md:static inset-y-0 left-0 z-40 w-72 md:w-64 h-[calc(100vh-32px)] m-4 flex flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-8 pt-10 md:pt-2 flex flex-col items-center border-b border-white/10 pb-6">
            <div className="bg-amber-500/20 p-3 rounded-full mb-3 border border-amber-500/30">
               <GraduationCap size={32} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Edu<span className="text-amber-400">Sync</span></h2>
            
            <div className="mt-4 p-3 bg-black/20 w-full rounded-xl border border-white/10 text-center">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-amber-300/80 mt-1 font-medium">{user.role} {user.kelasAmpuan ? `• ${user.kelasAmpuan}` : ''}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
                    isActive 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium" 
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon size={20} className={isActive ? "text-amber-400" : ""} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 border border-transparent hover:border-rose-500/30 transition-all mt-auto"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Keluar</span>
          </button>
        </div>
      </GlassCard>
    </>
  );
}
