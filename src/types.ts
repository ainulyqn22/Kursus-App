export interface Member {
  id: string; // We'll use Firestore document IDs or unique tokens
  nama: string;
  kelas: string;
  wali: string;
  hp: string;
  biaya: number;
  status: 'Aktif' | 'Tidak Aktif';
  catatan?: string;
  createdAt?: string;
}

export interface Tutor {
  id: string;
  nama: string;
  mapel: string;
  hp: string;
  honor: number;
  status: 'Aktif' | 'Tidak Aktif';
  createdAt?: string;
}

export interface Absen {
  id: string;
  tutorId: string;
  tgl: string;
  status: 'Hadir' | 'Izin' | 'Absen';
  ket?: string;
  createdAt?: string;
}

export interface Sesi {
  id: string;
  tgl: string;
  memberId: string;
  tutorId: string;
  mapel: string;
  durasi: number;
  status: 'Selesai' | 'Dijadwalkan' | 'Dibatalkan';
  createdAt?: string;
}

export interface Pemasukan {
  id: string;
  tgl: string;
  kat: 'Bayar Les' | 'Pendaftaran' | 'Modul/Buku' | 'Lainnya';
  memberId: string | ''; // Empty string if "Umum" (general)
  jml: number;
  ket: string;
  createdAt?: string;
}

export interface Pengeluaran {
  id: string;
  tgl: string;
  kat: 'Gaji Tutor' | 'Sewa Tempat' | 'ATK' | 'Listrik/Air' | 'Lainnya';
  jml: number;
  ket: string;
  createdAt?: string;
}

export interface GoogleSheetConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  isLinked: boolean;
  lastSyncedAt: string | null;
  autoSync: boolean;
}

export interface SessionLog {
  id: string;
  siswaId: string;
  tutorId: string;
  tgl: string;
  materi: string;
  pemahaman: number; // 1-5 rating
  catatan?: string;
}

export interface SyllabusMilestone {
  id: string;
  siswaId: string;
  topik: string;
  status: 'Belum Mulai' | 'Sedang Berjalan' | 'Selesai Dikuasai';
}

export interface AssessmentScore {
  id: string;
  siswaId: string;
  ujianNama: string;
  nilai: number; // 0-100
  tgl: string;
}

export interface TutorClock {
  id: string;
  tutorId: string;
  clockIn: string; // ISO datetime
  clockOut?: string; // ISO datetime
  tgl: string;
}
