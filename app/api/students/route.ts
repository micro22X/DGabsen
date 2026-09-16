import { NextResponse } from 'next/server';
import { getSheetData, appendSheetData } from '@/lib/googleSheets';
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

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nis, nama, kelas, jk } = await request.json();
    
    if (!nis || !nama || !kelas || !jk) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    await appendSheetData('Siswa!A:D', [[nis, nama, kelas, jk]]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add student error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan siswa' }, { status: 500 });
  }
}
