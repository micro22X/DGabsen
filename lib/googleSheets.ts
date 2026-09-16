import { db } from './firebase';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';

export async function getSheetData(range: string) {
  try {
    if (range.startsWith('Users')) {
      const snapshot = await getDocs(collection(db, 'Users'));
      return snapshot.docs.map(doc => {
        const d = doc.data();
        return [d.UserID, d.Username, d.Password, d.Nama, d.Role, d.KelasAmpuan];
      });
    } else if (range.startsWith('Siswa')) {
      const snapshot = await getDocs(collection(db, 'Siswa'));
      return snapshot.docs.map(doc => {
        const d = doc.data();
        return [d.NIS, d.Nama, d.Kelas, d.JenisKelamin];
      });
    } else if (range.startsWith('Absensi')) {
      const snapshot = await getDocs(collection(db, 'Absensi'));
      return snapshot.docs.map(doc => {
        const d = doc.data();
        return [d.ID_Absensi, d.Timestamp, d.Tanggal, d.Kelas, d.NIS, d.Nama, d.Status, d.Keterangan, d.DiinputOleh];
      });
    }
    return [];
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    return [];
  }
}

export async function appendSheetData(range: string, values: any[][]) {
  try {
    if (range.startsWith('Absensi')) {
      for (const row of values) {
        await addDoc(collection(db, 'Absensi'), {
          ID_Absensi: row[0] || '',
          Timestamp: row[1] || new Date().toISOString(),
          Tanggal: row[2] || '',
          Kelas: row[3] || '',
          NIS: row[4] || '',
          Nama: row[5] || '',
          Status: row[6] || '',
          Keterangan: row[7] || '',
          DiinputOleh: row[8] || ''
        });
      }
    } else if (range.startsWith('Users')) {
       for (const row of values) {
        await addDoc(collection(db, 'Users'), {
          UserID: row[0], Username: row[1], Password: row[2], Nama: row[3], Role: row[4], KelasAmpuan: row[5]
        });
      }
    } else if (range.startsWith('Siswa')) {
       for (const row of values) {
        await addDoc(collection(db, 'Siswa'), {
          NIS: row[0], Nama: row[1], Kelas: row[2], JenisKelamin: row[3]
        });
      }
    }
    
    return { updates: { updatedRows: values.length } };
  } catch (error) {
    console.error('Error appending data to Firestore:', error);
    throw error;
  }
}
