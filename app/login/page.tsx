'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Loader2, LogIn } from 'lucide-react';
import BackgroundGradient from '@/components/BackgroundGradient';
import GlassCard from '@/components/GlassCard';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundGradient>
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white/20 p-4 rounded-full mb-4 shadow-lg border border-white/10">
              <GraduationCap size={48} className="text-amber-400 drop-shadow-md" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center tracking-tight">Sistem Absensi Modern</h1>
            <p className="text-blue-200/80 text-sm mt-1">Portal Login Guru & Admin</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-lg mb-6 text-sm text-center backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                placeholder="Masukkan username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            {/* Helper Text for testing without env */}
            <div className="text-xs text-blue-200/50 text-center">
               Untuk testing tanpa Google Sheets, gunakan: admin / admin
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center transition-all mt-6 disabled:opacity-70 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] border border-amber-300/50"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <LogIn className="mr-2" size={20} />
              )}
              {loading ? 'Memproses...' : 'Masuk Sistem'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/50">
            &copy; {new Date().getFullYear()} Sekolah Nusantara
          </div>
        </GlassCard>
      </div>
    </BackgroundGradient>
  );
}
