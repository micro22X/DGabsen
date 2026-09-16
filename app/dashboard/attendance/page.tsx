'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { format } from 'date-fns';
import { Loader2, Save, Calendar as CalendarIcon, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Student = { nis: string; nama: string; kelas: string };
type AttendanceRecord = { status: string; keterangan?: string };

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        
        // Check if attendance already exists for this date
        const attRes = await fetch(`/api/attendance?tanggal=${date}`);
        const attData = await attRes.json();
        
        const existingAtt: Record<string, AttendanceRecord> = {};
        if (Array.isArray(attData)) {
            attData.forEach((record: any) => {
                existingAtt[record.nis] = { status: record.status, keterangan: record.keterangan };
            });
        }
        
        // Initialize attendance state
        const initialAtt: Record<string, AttendanceRecord> = { ...existingAtt };
        data.forEach((s: Student) => {
          if (!initialAtt[s.nis]) {
            initialAtt[s.nis] = { status: 'Hadir' }; // Default Hadir
          }
        });
        setAttendance(initialAtt);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleStatusChange = (nis: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [nis]: { ...prev[nis], status }
    }));
  };

  const handleKeteranganChange = (nis: string, keterangan: string) => {
    setAttendance(prev => ({
      ...prev,
      [nis]: { ...prev[nis], keterangan }
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (students.length === 0) return;
      const kelas = students[0].kelas; 
      
      const payload = {
        tanggal: date,
        kelas,
        attendances: students.map(s => ({
          nis: s.nis,
          nama: s.nama,
          status: attendance[s.nis].status,
          keterangan: attendance[s.nis].keterangan || ''
        }))
      };

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Data absensi berhasil disimpan!' });
      } else {
        setMessage({ type: 'error', text: 'Gagal menyimpan absensi.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const StatusButton = ({ nis, currentStatus, value, label, colorClass, activeClass }: any) => {
    const isSelected = currentStatus === value;
    return (
      <button
        onClick={() => handleStatusChange(nis, value)}
        className={cn(
          "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border outline-none",
          isSelected 
            ? activeClass 
            : "border-white/10 bg-black/20 text-blue-200/70 hover:bg-white/10 hover:text-white"
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-6 pt-16 md:pt-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Input Absensi</h1>
          <p className="text-blue-200 mt-2">Catat kehadiran siswa secara massal untuk kelas Anda.</p>
        </header>

        <div className="flex items-center space-x-3 bg-black/40 p-3 rounded-xl border border-white/10">
          <CalendarIcon className="text-amber-400" size={20} />
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-white font-medium border-none focus:outline-none focus:ring-0 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-xl flex items-center border backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-4",
          message.type === 'success' ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-100" : "bg-red-500/20 border-red-500/50 text-red-100"
        )}>
          {message.type === 'success' ? <Check className="mr-3 flex-shrink-0" size={20} /> : <Info className="mr-3 flex-shrink-0" size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-blue-200">
            <Loader2 className="animate-spin mb-4 text-amber-400" size={40} />
            <p className="font-medium">Memuat data siswa...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center text-blue-200">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info size={24} className="text-amber-400" />
            </div>
            <p className="font-medium">Tidak ada data siswa ditemukan untuk kelas ini.</p>
            <p className="text-sm mt-2 opacity-70">Hubungi admin untuk menambahkan data siswa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 text-blue-100/70 text-sm uppercase tracking-wider">
                  <th className="p-5 font-semibold w-16 text-center">No</th>
                  <th className="p-5 font-semibold">Nama Siswa</th>
                  <th className="p-5 font-semibold min-w-[320px]">Status Kehadiran</th>
                  <th className="p-5 font-semibold hidden lg:table-cell w-1/4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((student, idx) => (
                  <tr key={student.nis} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 text-center text-blue-200 font-medium">{idx + 1}</td>
                    <td className="p-5">
                      <p className="font-bold text-white text-base">{student.nama}</p>
                      <p className="text-xs font-medium text-blue-300/70 mt-1">NIS: {student.nis}</p>
                      
                      {/* Mobile keterangan input */}
                      <input 
                        type="text" 
                        placeholder="Tambahkan keterangan (opsional)..."
                        value={attendance[student.nis]?.keterangan || ''}
                        onChange={(e) => handleKeteranganChange(student.nis, e.target.value)}
                        className="mt-3 w-full lg:hidden text-sm bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                      />
                    </td>
                    <td className="p-5">
                      <div className="flex flex-wrap gap-2">
                        <StatusButton 
                          nis={student.nis} 
                          currentStatus={attendance[student.nis]?.status} 
                          value="Hadir" 
                          label="Hadir"
                          activeClass="bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        />
                        <StatusButton 
                          nis={student.nis} 
                          currentStatus={attendance[student.nis]?.status} 
                          value="Sakit" 
                          label="Sakit"
                          activeClass="bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        />
                        <StatusButton 
                          nis={student.nis} 
                          currentStatus={attendance[student.nis]?.status} 
                          value="Izin" 
                          label="Izin"
                          activeClass="bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        />
                        <StatusButton 
                          nis={student.nis} 
                          currentStatus={attendance[student.nis]?.status} 
                          value="Alpa" 
                          label="Alpa"
                          activeClass="bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.2)]"
                        />
                      </div>
                    </td>
                    <td className="p-5 hidden lg:table-cell">
                      <input 
                        type="text" 
                        placeholder="Keterangan opsional..."
                        value={attendance[student.nis]?.keterangan || ''}
                        onChange={(e) => handleKeteranganChange(student.nis, e.target.value)}
                        className="w-full text-sm bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all opacity-50 group-hover:opacity-100 focus:opacity-100"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          disabled={saving || loading || students.length === 0}
          className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-bold py-3.5 px-10 rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] border border-amber-300/50 disabled:opacity-50 disabled:shadow-none"
        >
          {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
          {saving ? 'Menyimpan Data...' : 'Simpan Absensi'}
        </button>
      </div>
    </div>
  );
}
