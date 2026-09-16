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
    const tanggal = searchParams.get('tanggal'); // format: yyyy-MM-dd

    // Columns: ID_Absensi | Timestamp | Tanggal | Kelas | NIS | Nama | Status | Keterangan | DiinputOleh
    const attendanceData = await getSheetData('Absensi!A2:I');
    
    let records = attendanceData.map(row => ({
      id: row[0],
      timestamp: row[1],
      tanggal: row[2],
      kelas: row[3],
      nis: row[4],
      nama: row[5],
      status: row[6],
      keterangan: row[7],
      diinputOleh: row[8],
    }));

    if (kelas) {
      records = records.filter(r => r.kelas === kelas);
    } else if (session.role === 'Wali Kelas') {
      records = records.filter(r => r.kelas === session.kelasAmpuan);
    }
    
    if (tanggal) {
      records = records.filter(r => r.tanggal === tanggal);
    }

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attendances, tanggal, kelas } = await request.json();
    
    const timestamp = new Date().toISOString();
    const diinputOleh = session.name;

    // columns: ID_Absensi | Timestamp | Tanggal | Kelas | NIS | Nama | Status | Keterangan | DiinputOleh
    const valuesToAppend = attendances.map((a: any) => [
      `${a.nis}-${tanggal}`, 
      timestamp,
      tanggal,
      kelas,
      a.nis,
      a.nama,
      a.status,
      a.keterangan || '',
      diinputOleh
    ]);

    await appendSheetData('Absensi!A:I', valuesToAppend);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to submit attendance:', error);
    return NextResponse.json({ error: 'Failed to submit attendance' }, { status: 500 });
  }
}
