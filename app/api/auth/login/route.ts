import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/googleSheets';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Fetch users from sheet
    // Columns: UserID | Username | Password | Nama | Role | KelasAmpuan
    const users = await getSheetData('Users!A2:F');
    
    // For local testing if sheet is empty/not configured
    if (users.length === 0 && username === 'admin' && password === 'admin') {
      const dummySession = { userId: '1', username: 'admin', name: 'Super Admin', role: 'Admin', kelasAmpuan: '' };
      const encryptedSessionData = await encrypt(dummySession);
      const cookieStore = await cookies();
      cookieStore.set('session', encryptedSessionData, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 });
      return NextResponse.json({ success: true, user: dummySession });
    }

    const user = users.find(u => u[1] === username && u[2] === password);

    if (user) {
      const sessionData = {
        userId: user[0],
        username: user[1],
        name: user[3],
        role: user[4],
        kelasAmpuan: user[5],
      };

      const encryptedSessionData = await encrypt(sessionData);
      
      const cookieStore = await cookies();
      cookieStore.set('session', encryptedSessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return NextResponse.json({ success: true, user: sessionData });
    } else {
      return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server. Periksa konfigurasi Google Sheets.' }, { status: 500 });
  }
}
