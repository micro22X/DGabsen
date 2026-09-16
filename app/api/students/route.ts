import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/googleSheets';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kelas = searchParams.get('kelas');

    // Columns: NIS | Nama | Kelas | Jenis Kelamin
    const studentsData = await getSheetData('Siswa!A2:D');
    
    let students = studentsData.map(row => ({
      nis: row[0],
      nama: row[1],
      kelas: row[2],
      jk: row[3],
    }));

    // If local test without data, provide dummy data
    if (students.length === 0) {
      students = [
        { nis: '1001', nama: 'Ahmad Budi', kelas: '10A', jk: 'L' },
        { nis: '1002', nama: 'Siti Aminah', kelas: '10A', jk: 'P' },
        { nis: '1003', nama: 'Caca Marica', kelas: '10B', jk: 'P' },
        { nis: '1004', nama: 'Dedi Corbuzier', kelas: '10B', jk: 'L' },
      ];
    }

    if (kelas) {
      students = students.filter(s => s.kelas === kelas);
    } else if (session.role === 'Wali Kelas') {
      students = students.filter(s => s.kelas === session.kelasAmpuan);
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error('Students error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
