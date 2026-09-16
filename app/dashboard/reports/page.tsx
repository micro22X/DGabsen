'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { Printer, Filter, Loader2, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kelas, setKelas] = useState('');
  
  // Fetch available classes from students or just unique classes from attendance
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/students');
        if (res.ok) {
          const data = await res.json();
          const uniqueClasses = Array.from(new Set(data.map((s: any) => s.kelas))) as string[];
          setAvailableClasses(uniqueClasses);
        }
      } catch(e) {}
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (tanggal) query.append('tanggal', tanggal);
        if (kelas) query.append('kelas', kelas);

        const res = await fetch(`/api/attendance?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setAttendances(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [tanggal, kelas]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pt-16 md:pt-0 print-page">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Laporan Absensi</h1>
          <p className="text-blue-200 mt-2">Pratinjau dan cetak laporan kehadiran siswa.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          <Printer size={18} />
          <span>Cetak Laporan</span>
        </button>
      </header>

      {/* Filter Section - Hidden when printing */}
      <GlassCard className="p-4 md:p-6 no-print">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
              <Calendar size={16} /> Tanggal
            </label>
            <input 
              type="date" 
              value={tanggal}
              onChange={e => setTanggal(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
              <Filter size={16} /> Kelas
            </label>
            <select 
              value={kelas}
              onChange={e => setKelas(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
            >
              <option value="" className="bg-slate-800">Semua Kelas</option>
              {availableClasses.map(c => (
                <option key={c} value={c} className="bg-slate-800">Kelas {c}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Printable Report Section */}
      <GlassCard className="p-6 md:p-8 bg-white print:bg-white print:shadow-none print:border-none print-container">
        {/* Report Header for Print */}
        <div className="text-center mb-8 pb-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 uppercase">Laporan Kehadiran Siswa</h2>
          <p className="text-gray-600 mt-2 text-lg">
            {kelas ? `Kelas ${kelas}` : 'Semua Kelas'} • Tanggal: {tanggal ? new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Semua Tanggal'}
          </p>
        </div>

        {loading ? (
           <div className="flex justify-center items-center h-40 no-print">
             <Loader2 className="animate-spin text-amber-500" size={32} />
           </div>
        ) : attendances.length === 0 ? (
           <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             Tidak ada catatan absensi untuk kriteria ini.
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse print:text-black">
              <thead>
                <tr className="bg-gray-100/50 border-y border-gray-200 text-gray-700">
                  <th className="py-3 px-4 font-semibold w-16 text-center">No</th>
                  <th className="py-3 px-4 font-semibold w-24">NIS</th>
                  <th className="py-3 px-4 font-semibold">Nama Lengkap</th>
                  <th className="py-3 px-4 font-semibold w-24 text-center">Kelas</th>
                  <th className="py-3 px-4 font-semibold w-32 text-center">Status</th>
                  <th className="py-3 px-4 font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((record, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-center text-gray-600">{i + 1}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{record.nis}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{record.nama}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{record.kelas}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${record.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : ''}
                        ${record.status === 'Sakit' ? 'bg-amber-100 text-amber-700 border border-amber-200' : ''}
                        ${record.status === 'Izin' ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' : ''}
                        ${record.status === 'Alpa' ? 'bg-rose-100 text-rose-700 border border-rose-200' : ''}
                      `}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{record.keterangan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Print Footer Summary */}
            <div className="mt-8 flex justify-end">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 w-64">
                <h4 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Ringkasan</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Hadir</span><span className="font-medium text-emerald-600">{attendances.filter(a => a.status === 'Hadir').length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Sakit</span><span className="font-medium text-amber-600">{attendances.filter(a => a.status === 'Sakit').length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Izin</span><span className="font-medium text-cyan-600">{attendances.filter(a => a.status === 'Izin').length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Alpa</span><span className="font-medium text-rose-600">{attendances.filter(a => a.status === 'Alpa').length}</span></div>
                  <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 font-bold"><span className="text-gray-900">Total</span><span className="text-gray-900">{attendances.length}</span></div>
                </div>
              </div>
            </div>
            
            {/* Signature Area for Print */}
            <div className="mt-16 hidden print:flex justify-end pr-12">
               <div className="text-center text-black">
                 <p className="mb-16">Mengetahui,<br/>Wali Kelas / Guru</p>
                 <p className="font-bold underline uppercase">( ________________________ )</p>
               </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
