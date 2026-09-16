'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { UserPlus, Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Form State
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [jk, setJk] = useState('L');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis, nama, kelas, jk }),
      });

      if (res.ok) {
        setMessage('Siswa berhasil ditambahkan!');
        setNis('');
        setNama('');
        setKelas('');
        setJk('L');
        fetchStudents();
        router.refresh();
      } else {
        const err = await res.json();
        setMessage(err.error || 'Gagal menambahkan siswa.');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.nama?.toLowerCase().includes(search.toLowerCase()) || 
    s.nis?.includes(search) ||
    s.kelas?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pt-16 md:pt-0">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Kelola Data Siswa</h1>
        <p className="text-blue-200 mt-2">Tambah dan lihat master data siswa.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus className="text-amber-400" /> Tambah Siswa Baru
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">NIS</label>
                <input 
                  type="text" 
                  required
                  value={nis}
                  onChange={e => setNis(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Contoh: 202301"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Kelas</label>
                <input 
                  type="text" 
                  required
                  value={kelas}
                  onChange={e => setKelas(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Contoh: 10A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Jenis Kelamin</label>
                <select 
                  value={jk}
                  onChange={e => setJk(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
                >
                  <option value="L" className="bg-slate-800">Laki-laki (L)</option>
                  <option value="P" className="bg-slate-800">Perempuan (P)</option>
                </select>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('berhasil') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 rounded-xl transition-colors mt-2 flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Data'}
              </button>
            </form>
          </GlassCard>
        </div>

        <div className="md:col-span-2">
          <GlassCard className="p-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-white">Daftar Siswa</h2>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama, NIS, kelas..." 
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin text-amber-400" size={32} />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-10 text-blue-200/60">
                  Tidak ada data siswa ditemukan.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-blue-200 text-sm">
                      <th className="py-3 px-4 font-medium">NIS</th>
                      <th className="py-3 px-4 font-medium">Nama Lengkap</th>
                      <th className="py-3 px-4 font-medium">Kelas</th>
                      <th className="py-3 px-4 font-medium">L/P</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((siswa, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white text-sm font-medium">{siswa.nis}</td>
                        <td className="py-3 px-4 text-white text-sm">{siswa.nama}</td>
                        <td className="py-3 px-4 flex items-center gap-2">
                           <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs font-medium border border-blue-500/20">
                             {siswa.kelas}
                           </span>
                        </td>
                        <td className="py-3 px-4 text-white text-sm">
                          {siswa.jk === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
