import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Member, Tutor, Absen, Sesi, Pemasukan, Pengeluaran, GoogleSheetConfig, SessionLog, SyllabusMilestone, AssessmentScore, TutorClock } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import MemberView from './components/MemberView';
import TutorView from './components/TutorView';
import SesiView from './components/SesiView';
import KeuanganView from './components/KeuanganView';
import WorkspaceSyncView from './components/WorkspaceSyncView';
import QrAbsenView from './components/QrAbsenView';
import ComposeMailModal from './components/ComposeMailModal';
import TutorPortalView from './components/TutorPortalView';
import UserAccountsView from './components/UserAccountsView';
import LoginView from './components/LoginView';
import ProposalView from './components/ProposalView';

// Firebase & API Integrations
import { initAuth, googleSignIn, googleSignOut, getAccessToken, setAccessToken } from './firebase';
import { createCourseSpreadsheet, syncDataToGoogleSheets, sendGmailEmail } from './googleApi';

// Icon for toast/errors
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck, GraduationCap, Users } from 'lucide-react';

const mockData = {
  members: [
    { id: 'M-101', nama: 'Andi Pratama', kelas: 'Matematika SMP', wali: 'Budi Pratama', hp: 'ainulyqn22@gmail.com', biaya: 75000, status: 'Aktif' as const, catatan: '' },
    { id: 'M-102', nama: 'Siti Rahayu', kelas: 'Bahasa Inggris SD', wali: 'Rini Rahayu', hp: '087654321098', biaya: 65000, status: 'Aktif' as const, catatan: '' },
    { id: 'M-103', nama: 'Dimas Aditya', kelas: 'Fisika SMA', wali: 'Hendra Aditya', hp: '082198765432', biaya: 90000, status: 'Aktif' as const, catatan: '' },
  ],
  tutors: [
    { id: 'T-201', nama: 'Pak Ridwan', mapel: 'Matematika', hp: '08123456781', honor: 80000, status: 'Aktif' as const },
    { id: 'T-202', nama: 'Bu Dewi', mapel: 'Bahasa Inggris', hp: '08223344556', honor: 75000, status: 'Aktif' as const },
    { id: 'T-203', nama: 'Pak Arif', mapel: 'Fisika', hp: '08334455667', honor: 85000, status: 'Aktif' as const },
  ],
  absensi: [
    { id: 'A-301', tutorId: 'T-201', tgl: '2026-06-02', status: 'Hadir' as const, ket: '' },
    { id: 'A-302', tutorId: 'T-201', tgl: '2026-06-04', status: 'Hadir' as const, ket: '' },
    { id: 'A-303', tutorId: 'T-202', tgl: '2026-06-03', status: 'Hadir' as const, ket: '' },
    { id: 'A-304', tutorId: 'T-203', tgl: '2026-06-01', status: 'Izin' as const, ket: 'Sakit flu' },
    { id: 'A-305', tutorId: 'T-202', tgl: '2026-06-05', status: 'Hadir' as const, ket: '' },
  ],
  sesi: [
    { id: 'S-401', tgl: '2026-06-02', memberId: 'M-101', tutorId: 'T-201', mapel: 'Matematika', durasi: 95, status: 'Selesai' as const },
    { id: 'S-402', tgl: '2026-06-03', memberId: 'M-102', tutorId: 'T-202', mapel: 'Bahasa Inggris', durasi: 60, status: 'Selesai' as const },
    { id: 'S-403', tgl: '2026-06-04', memberId: 'M-101', tutorId: 'T-201', mapel: 'Matematika', durasi: 90, status: 'Selesai' as const },
    { id: 'S-404', tgl: '2026-06-05', memberId: 'M-103', tutorId: 'T-203', mapel: 'Fisika', durasi: 65, status: 'Selesai' as const },
    { id: 'S-405', tgl: '2026-06-06', memberId: 'M-102', tutorId: 'T-202', mapel: 'Bahasa Inggris', durasi: 60, status: 'Dijadwalkan' as const },
  ],
  pemasukan: [
    { id: 'IN-501', tgl: '2026-06-02', kat: 'Bayar Les' as const, memberId: 'M-101', jml: 75000, ket: 'Bayar les matematika 1 sesi' },
    { id: 'IN-502', tgl: '2026-06-03', kat: 'Bayar Les' as const, memberId: 'M-102', jml: 65000, ket: 'Bayar les bahasa inggris 1 sesi' },
    { id: 'IN-503', tgl: '2026-06-04', kat: 'Bayar Les' as const, memberId: 'M-101', jml: 75000, ket: 'Bayar les dwi sesi' },
    { id: 'IN-504', tgl: '2026-06-05', kat: 'Pendaftaran' as const, memberId: 'M-103', jml: 50000, ket: 'Iuran daftar member baru' },
    { id: 'IN-505', tgl: '2026-06-05', kat: 'Bayar Les' as const, memberId: 'M-103', jml: 90000, ket: 'Bayar les fisika 1 sesi' },
  ],
  pengeluaran: [
    { id: 'EXP-601', tgl: '2026-06-01', kat: 'ATK' as const, jml: 35000, ket: 'Beli kertas modul ujian & spidol hitam' },
    { id: 'EXP-602', tgl: '2026-06-05', kat: 'Gaji Tutor' as const, jml: 160000, ket: 'Kompensasi honor Pak Ridwan 2 sesi' },
  ],
  sessionLogs: [
    { id: 'LOG-001', siswaId: 'M-101', tutorId: 'T-201', tgl: '2026-06-02', materi: 'Persamaan & Fungsi Kuadrat', pemahaman: 4, catatan: 'Sangat kooperatif, perlu banyak latihan mandiri.' },
    { id: 'LOG-002', siswaId: 'M-102', tutorId: 'T-202', tgl: '2026-06-03', materi: 'Vocabulary & Conversation', pemahaman: 5, catatan: 'Sangat fasih diajak berkomunikasi.' },
    { id: 'LOG-003', siswaId: 'M-101', tutorId: 'T-201', tgl: '2026-06-04', materi: 'Eksponen & Bentuk Akar', pemahaman: 3, catatan: 'Review lagi karena masih bingung sifat-sifat negatif.' }
  ],
  syllabusMilestones: [
    { id: 'MIL-001', siswaId: 'M-101', topik: 'Persamaan Kuadrat', status: 'Selesai Dikuasai' as const },
    { id: 'MIL-002', siswaId: 'M-101', topik: 'Logaritma', status: 'Sedang Berjalan' as const },
    { id: 'MIL-003', siswaId: 'M-101', topik: 'Matriks & Vektor', status: 'Belum Mulai' as const },
    { id: 'MIL-004', siswaId: 'M-102', topik: 'English Vocabulary Basic', status: 'Selesai Dikuasai' as const },
    { id: 'MIL-005', siswaId: 'M-102', topik: 'Simple Past & Future Tenses', status: 'Sedang Berjalan' as const }
  ],
  assessmentScores: [
    { id: 'SC-001', siswaId: 'M-101', ujianNama: 'Evaluasi Aljabar Part 1', nilai: 85, tgl: '2026-06-01' },
    { id: 'SC-002', siswaId: 'M-101', ujianNama: 'Ulangan Persamaan Kuadrat', nilai: 92, tgl: '2026-06-04' },
    { id: 'SC-003', siswaId: 'M-102', ujianNama: 'Quiz Vocabulary Unit 1', nilai: 95, tgl: '2026-06-03' }
  ],
  tutorClocks: [
    { id: 'CLK-001', tutorId: 'T-201', clockIn: '2026-06-04T08:00:00Z', clockOut: '2026-06-04T11:00:00Z', tgl: '2026-06-04' }
  ]
};


export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // User Access Control Role ('admin' | 'tutor')
  const [userRole, setUserRole] = useState<'admin' | 'tutor'>('admin');
  const [currentUserSession, setCurrentUserSession] = useState<{ email: string; name: string; role: 'admin' | 'tutor'; refId?: string } | null>(null);

  // Core Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [absensi, setAbsensi] = useState<Absen[]>([]);
  const [sesi, setSesi] = useState<Sesi[]>([]);
  const [pemasukan, setPemasukan] = useState<Pemasukan[]>([]);
  const [pengeluaran, setPengeluaran] = useState<Pengeluaran[]>([]);

  // Advanced progress tracking states
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [syllabusMilestones, setSyllabusMilestones] = useState<SyllabusMilestone[]>([]);
  const [assessmentScores, setAssessmentScores] = useState<AssessmentScore[]>([]);
  const [tutorClocks, setTutorClocks] = useState<TutorClock[]>([]);

  // Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [oauthToken, setOauthToken] = useState<string | null>(null);

  // Sheets Sync Configuration
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>({
    spreadsheetId: null,
    spreadsheetUrl: null,
    isLinked: false,
    lastSyncedAt: null,
    autoSync: false,
  });

  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  // Email Composer states
  const [composeMail, setComposeMail] = useState<{
    isOpen: boolean;
    to: string;
    subject: string;
    htmlBody: string;
    isSending: boolean;
  }>({
    isOpen: false,
    to: '',
    subject: '',
    htmlBody: '',
    isSending: false,
  });

  // Global Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'sync'; text: string } | null>(null);

  // Trigger Toast Notification
  const showToast = (type: 'success' | 'error' | 'sync', text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Initial Load: Load database and sheets configs from localStorage
  useEffect(() => {
    const localDb = localStorage.getItem('kursusan_db');
    if (localDb) {
      try {
        const parsed = JSON.parse(localDb);
        setMembers(parsed.members || []);
        setTutors(parsed.tutors || []);
        setAbsensi(parsed.absensi || []);
        setSesi(parsed.sesi || []);
        setPemasukan(parsed.pemasukan || []);
        setPengeluaran(parsed.pengeluaran || []);
        setSessionLogs(parsed.sessionLogs || []);
        setSyllabusMilestones(parsed.syllabusMilestones || []);
        setAssessmentScores(parsed.assessmentScores || []);
        setTutorClocks(parsed.tutorClocks || []);
      } catch (err) {
        console.error('Error parsing local DB, falling back to mockData');
        loadMockData();
      }
    } else {
      loadMockData();
    }

    const localSheets = localStorage.getItem('kursusan_sheets');
    if (localSheets) {
      try {
        setSheetConfig(JSON.parse(localSheets));
      } catch (err) {
        console.error('Error parsing sheet config');
      }
    }

    // 2. Initialize Firebase authentication listener
    initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setOauthToken(token);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setOauthToken(null);
        setAccessToken(null);
      }
    );

    // 3. Load custom app session from localStorage on load
    const savedSession = localStorage.getItem('kursusan_user_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setCurrentUserSession(parsed);
        setUserRole(parsed.role);
        if (parsed.role === 'tutor') {
          setActiveTab('portal_tutor');
        } else {
          setActiveTab('dashboard');
        }
      } catch (err) {
        console.error('Error parsing custom user session');
      }
    }
  }, []);

  // Save changes to localStorage
  const saveToLocal = (newDb: {
    members: Member[];
    tutors: Tutor[];
    absensi: Absen[];
    sesi: Sesi[];
    pemasukan: Pemasukan[];
    pengeluaran: Pengeluaran[];
    sessionLogs?: SessionLog[];
    syllabusMilestones?: SyllabusMilestone[];
    assessmentScores?: AssessmentScore[];
    tutorClocks?: TutorClock[];
  }) => {
    // Merge standard state with existing session details to guarantee zero loss
    const logs = newDb.sessionLogs !== undefined ? newDb.sessionLogs : sessionLogs;
    const miles = newDb.syllabusMilestones !== undefined ? newDb.syllabusMilestones : syllabusMilestones;
    const scores = newDb.assessmentScores !== undefined ? newDb.assessmentScores : assessmentScores;
    const clocks = newDb.tutorClocks !== undefined ? newDb.tutorClocks : tutorClocks;

    const fullDb = {
      ...newDb,
      sessionLogs: logs,
      syllabusMilestones: miles,
      assessmentScores: scores,
      tutorClocks: clocks,
    };
    localStorage.setItem('kursusan_db', JSON.stringify(fullDb));
  };

  const loadMockData = () => {
    setMembers(mockData.members);
    setTutors(mockData.tutors);
    setAbsensi(mockData.absensi);
    setSesi(mockData.sesi);
    setPemasukan(mockData.pemasukan);
    setPengeluaran(mockData.pengeluaran);
    setSessionLogs(mockData.sessionLogs);
    setSyllabusMilestones(mockData.syllabusMilestones);
    setAssessmentScores(mockData.assessmentScores);
    setTutorClocks(mockData.tutorClocks);

    const initialDb = {
      members: mockData.members,
      tutors: mockData.tutors,
      absensi: mockData.absensi,
      sesi: mockData.sesi,
      pemasukan: mockData.pemasukan,
      pengeluaran: mockData.pengeluaran,
      sessionLogs: mockData.sessionLogs,
      syllabusMilestones: mockData.syllabusMilestones,
      assessmentScores: mockData.assessmentScores,
      tutorClocks: mockData.tutorClocks,
    };
    localStorage.setItem('kursusan_db', JSON.stringify(initialDb));
  };

  // Helper to sync to sheets in background on updates if autoSync enabled
  const triggerAutoSync = async (currentData: {
    members: Member[];
    tutors: Tutor[];
    absensi: Absen[];
    sesi: Sesi[];
    pemasukan: Pemasukan[];
    pengeluaran: Pengeluaran[];
    sessionLogs?: SessionLog[];
    syllabusMilestones?: SyllabusMilestone[];
    assessmentScores?: AssessmentScore[];
  }) => {
    const token = oauthToken || getAccessToken();
    if (user && token && sheetConfig.isLinked && sheetConfig.spreadsheetId && sheetConfig.autoSync) {
      try {
        showToast('sync', 'Menyinkronkan perubahan ke Google Sheets...');
        const payload = {
          ...currentData,
          sessionLogs: currentData.sessionLogs !== undefined ? currentData.sessionLogs : sessionLogs,
          syllabusMilestones: currentData.syllabusMilestones !== undefined ? currentData.syllabusMilestones : syllabusMilestones,
          assessmentScores: currentData.assessmentScores !== undefined ? currentData.assessmentScores : assessmentScores,
        };
        await syncDataToGoogleSheets(token, sheetConfig.spreadsheetId, payload);
        
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const updatedConfig = {
          ...sheetConfig,
          lastSyncedAt: `Hari ini, pukul ${timeNow} WIB`,
        };
        setSheetConfig(updatedConfig);
        localStorage.setItem('kursusan_sheets', JSON.stringify(updatedConfig));
        
        showToast('success', 'Perubahan otomatis disinkronkan ke Google Sheets!');
      } catch (err: any) {
        console.error('Auto sync error:', err.message);
        showToast('error', 'Auto sync gagal: ' + err.message);
      }
    }
  };

  // Auth logins handlers
  const handleGoogleLogin = async () => {
    try {
      showToast('sync', 'Menghubungkan dengan akun Google...');
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setOauthToken(result.accessToken);
        setAccessToken(result.accessToken);
        showToast('success', `Berhasil masuk sebagai ${result.user.displayName || 'Google User'}!`);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err.message || err);
      const isIframeConstraint = 
        String(err.message || '').includes('cancelled-popup-request') ||
        String(err.message || '').includes('internal-error') ||
        String(err.message || '').includes('popup') ||
        window.self !== window.top;

      if (isIframeConstraint) {
        showToast('error', 'Login Google dibatasi oleh Iframe pratinjau browser. Silakan klik "Buka di Tab Baru" di kanan atas pratinjau Anda untuk masuk!');
      } else {
        showToast('error', 'Gagal hubungkan Google: ' + (err.message || err));
      }
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setOauthToken(null);
      setAccessToken(null);
      showToast('success', 'Berhasil keluar akun Google.');
    } catch (err: any) {
      console.error('Logout error:', err.message);
    }
  };

  // Google Sheets Management
  const handleCreateNewSpreadsheet = async () => {
    const token = oauthToken || getAccessToken();
    if (!token) {
      showToast('error', 'Sesi login Google telah berakhir. Hubungkan kembali.');
      return;
    }

    try {
      setIsSyncingSheets(true);
      showToast('sync', 'Menghubungi Google Drive untuk membuat Spreadsheet...');
      
      const res = await createCourseSpreadsheet(token, 'Database Manajemen Kursusan - Sync');
      const timeNow = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) + 
        ', pukul ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const newConfig: GoogleSheetConfig = {
        spreadsheetId: res.spreadsheetId,
        spreadsheetUrl: res.spreadsheetUrl,
        isLinked: true,
        lastSyncedAt: `Baru dibuat, ${timeNow} WIB`,
        autoSync: true,
      };

      setSheetConfig(newConfig);
      localStorage.setItem('kursusan_sheets', JSON.stringify(newConfig));

      // Push initial data to Sheet
      showToast('sync', 'Mengisi spreadsheet baru dengan data database...');
      await syncDataToGoogleSheets(token, res.spreadsheetId, {
        members,
        tutors,
        absensi,
        sesi,
        pemasukan,
        pengeluaran,
        sessionLogs,
        syllabusMilestones,
        assessmentScores,
      });

      showToast('success', 'Google Spreadsheet berhasil dibuat dan langsung terhubung!');
    } catch (err: any) {
      console.error('Creation of Sheet failed:', err.message);
      showToast('error', 'Pembuatan Google Sheet gagal: ' + err.message);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleLinkExistingSpreadsheet = async (spreadsheetId: string) => {
    const token = oauthToken || getAccessToken();
    if (!token) {
      showToast('error', 'Harap hubungkan Google akun Anda terlebih dahulu!');
      return;
    }

    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newConfig: GoogleSheetConfig = {
      spreadsheetId: spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      isLinked: true,
      lastSyncedAt: 'Tersambung (belum diekspor)',
      autoSync: false,
    };

    setSheetConfig(newConfig);
    localStorage.setItem('kursusan_sheets', JSON.stringify(newConfig));
    showToast('success', 'Berhasil menyambungkan ke Google Spreadsheet lama.');
  };

  const handleManualSyncNow = async () => {
    const token = oauthToken || getAccessToken();
    if (!token || !sheetConfig.spreadsheetId) {
      showToast('error', 'Google spreadsheet belum tersambung!');
      return;
    }

    try {
      setIsSyncingSheets(true);
      showToast('sync', 'Mengekspor seluruh data ke Google Sheets...');
      
      await syncDataToGoogleSheets(token, sheetConfig.spreadsheetId, {
        members,
        tutors,
        absensi,
        sesi,
        pemasukan,
        pengeluaran,
        sessionLogs,
        syllabusMilestones,
        assessmentScores,
      });

      const dayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const updatedConfig = {
        ...sheetConfig,
        lastSyncedAt: `${dayStr}, pukul ${timeStr} WIB`,
      };

      setSheetConfig(updatedConfig);
      localStorage.setItem('kursusan_sheets', JSON.stringify(updatedConfig));
      showToast('success', 'Seluruh tabel berhasil di ekspor ke Google Sheets!');
    } catch (err: any) {
      console.error('Manual Sync failed:', err.message);
      showToast('error', 'Ekspor ke Google Sheets gagal: ' + err.message);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleToggleAutoSync = () => {
    const updated = {
      ...sheetConfig,
      autoSync: !sheetConfig.autoSync,
    };
    setSheetConfig(updated);
    localStorage.setItem('kursusan_sheets', JSON.stringify(updated));
    showToast('success', updated.autoSync ? 'Auto-Sync diaktifkan!' : 'Auto-Sync dinonaktifkan.');
  };

  // Gmail REST Sender handler
  const handleTriggerSendEmailGroup = async (emailData: { to: string; subject: string; htmlBody: string }): Promise<boolean> => {
    const token = oauthToken || getAccessToken();
    if (!token) {
      throw new Error('Sesi Google auth Anda belum aktif. Mohon login ulang.');
    }

    setComposeMail((prev) => ({ ...prev, isSending: true }));
    try {
      await sendGmailEmail(token, emailData);
      showToast('success', 'Email berhasil dikirim melalui akun Gmail Anda!');
      return true;
    } catch (err: any) {
      console.error('Email sending error:', err.message);
      showToast('error', 'Pengiriman email gagal: ' + err.message);
      throw err;
    } finally {
      setComposeMail((prev) => ({ ...prev, isSending: false }));
    }
  };

  // Dynamic state CRUD
  // Member
  const handleAddMember = (m: Omit<Member, 'id'>) => {
    const newId = 'M-' + (members.length > 0 ? (Math.max(...members.map(x => parseInt(x.id.split('-')[1]))) + 1) : 101);
    const newMember: Member = { ...m, id: newId };
    const updated = [...members, newMember];
    setMembers(updated);
    const nextDb = { members: updated, tutors, absensi, sesi, pemasukan, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Berhasil menambahkan member baru!');
  };

  const handleDeleteMember = (id: string) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    const nextDb = { members: updated, tutors, absensi, sesi, pemasukan, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Berhasil menghapus data member.');
  };

  // Tutor
  const handleAddTutor = (t: Omit<Tutor, 'id'>) => {
    const newId = 'T-' + (tutors.length > 0 ? (Math.max(...tutors.map(x => parseInt(x.id.split('-')[1]))) + 1) : 201);
    const newTutor: Tutor = { ...t, id: newId };
    const updated = [...tutors, newTutor];
    setTutors(updated);
    const nextDb = { members, tutors: updated, absensi, sesi, pemasukan, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Berhasil menambahkan tutor baru!');
  };

  const handleDeleteTutor = (id: string) => {
    const updated = tutors.filter((t) => t.id !== id);
    setTutors(updated);
    const nextDb = { members, tutors: updated, absensi, sesi, pemasukan, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Berhasil menghapus data tutor.');
  };

  // Absensi
  const handleAddAbsen = (a: Omit<Absen, 'id'>) => {
    const newId = 'A-' + (absensi.length > 0 ? (Math.max(...absensi.map(x => parseInt(x.id.split('-')[1]))) + 1) : 301);
    const newAbsen: Absen = { ...a, id: newId };
    const updated = [...absensi, newAbsen];
    setAbsensi(updated);
    const nextDb = { members, tutors, absensi: updated, sesi, pemasukan, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Kehadiran tutor berhasil dicatat!');
  };

  const handleDeleteAbsen = (id: string) => {
    const updated = absensi.filter((a) => a.id !== id);
    setAbsensi(updated);
    const nextDb = { members, tutors, absensi: updated, sesi, pemasukan, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Catatan kehadiran tutor dibatalkan.');
  };

  // Sesi
  const handleAddSesi = (s: Omit<Sesi, 'id'>) => {
    const newId = 'S-' + (sesi.length > 0 ? (Math.max(...sesi.map(x => parseInt(x.id.split('-')[1]))) + 1) : 401);
    const newSesi: Sesi = { ...s, id: newId };
    const updated = [...sesi, newSesi];
    setSesi(updated);

    // Auto-create income transaction if status is "Selesai" using member session price
    let nextPemasukan = pemasukan;
    if (s.status === 'Selesai') {
      const memberObj = members.find((m) => m.id === s.memberId);
      if (memberObj && memberObj.biaya > 0) {
        const newInId = 'IN-' + (pemasukan.length > 0 ? (Math.max(...pemasukan.map(x => parseInt(x.id.split('-')[1]))) + 1) : 501);
        const newIn: Pemasukan = {
          id: newInId,
          tgl: s.tgl,
          kat: 'Bayar Les',
          memberId: s.memberId,
          jml: memberObj.biaya,
          ket: `Pembayaran Sesi Selesai (Sesi: ${newId}) oleh ${memberObj.nama}`,
        };
        nextPemasukan = [...pemasukan, newIn];
        setPemasukan(nextPemasukan);
      }
    }

    const nextDb = { members, tutors, absensi, sesi: updated, pemasukan: nextPemasukan, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Sesi les berhasil ditambahkan!');
  };

  const handleDeleteSesi = (id: string) => {
    const updated = sesi.filter((s) => s.id !== id);
    setSesi(updated);
    const nextDb = { members, tutors, absensi, sesi: updated, pemasukan, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Sesi les dibatalkan dan dihapus.');
  };

  const handleUpdateSesiStatus = (id: string, newStatus: Sesi['status']) => {
    const originalSesi = sesi.find(s => s.id === id);
    if (!originalSesi) return;

    const updatedSesi = sesi.map((s) => (s.id === id ? { ...s, status: newStatus } : s));
    setSesi(updatedSesi);

    let nextPemasukan = pemasukan;
    // Auto-create income transaction if status is changed to "Selesai" and wasn't already processed
    if (newStatus === 'Selesai' && originalSesi.status !== 'Selesai') {
      const memberObj = members.find((m) => m.id === originalSesi.memberId);
      if (memberObj && memberObj.biaya > 0) {
        const newInId = 'IN-' + (pemasukan.length > 0 ? (Math.max(...pemasukan.map(x => parseInt(x.id.split('-')[1]))) + 1) : 501);
        const newIn: Pemasukan = {
          id: newInId,
          tgl: originalSesi.tgl,
          kat: 'Bayar Les',
          memberId: originalSesi.memberId,
          jml: memberObj.biaya,
          ket: `Pembayaran Sesi Selesai (Sesi: ${id}) oleh ${memberObj.nama} (via QR Scan)`,
        };
        nextPemasukan = [...pemasukan, newIn];
        setPemasukan(nextPemasukan);
      }
    }

    const nextDb = { members, tutors, absensi, sesi: updatedSesi, pemasukan: nextPemasukan, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', `Status sesi les berhasil diperbarui menjadi ${newStatus}!`);
  };

  // Pemasukan / Pengeluaran cash registers
  const handleAddPemasukan = (p: Omit<Pemasukan, 'id'>) => {
    const newId = 'IN-' + (pemasukan.length > 0 ? (Math.max(...pemasukan.map(x => parseInt(x.id.split('-')[1]))) + 1) : 501);
    const newIn: Pemasukan = { ...p, id: newId };
    const updated = [...pemasukan, newIn];
    setPemasukan(updated);
    const nextDb = { members, tutors, absensi, sesi, pemasukan: updated, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Transaksi pemasukan berhasil didaftarkan!');
  };

  const handleDeletePemasukan = (id: string) => {
    const updated = pemasukan.filter((p) => p.id !== id);
    setPemasukan(updated);
    const nextDb = { members, tutors, absensi, sesi, pemasukan: updated, pengeluaran };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Transaksi pemasukan dihapus.');
  };

  const handleAddPengeluaran = (k: Omit<Pengeluaran, 'id'>) => {
    const newId = 'EXP-' + (pengeluaran.length > 0 ? (Math.max(...pengeluaran.map(x => parseInt(x.id.split('-')[1]))) + 1) : 601);
    const newOut: Pengeluaran = { ...k, id: newId };
    const updated = [...pengeluaran, newOut];
    setPengeluaran(updated);
    const nextDb = { members, tutors, absensi, sesi, pemasukan, pengeluaran: updated };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Transaksi pengeluaran berhasil didaftarkan!');
  };

  const handleDeletePengeluaran = (id: string) => {
    const updated = pengeluaran.filter((k) => k.id !== id);
    setPengeluaran(updated);
    const nextDb = { members, tutors, absensi, sesi, pemasukan, pengeluaran: updated };
    saveToLocal(nextDb);
    triggerAutoSync(nextDb);
    showToast('success', 'Transaksi pengeluaran dihapus.');
  };

  // Handler additions for progressive student tracking states
  const handleTutorClockIn = (tutorId: string) => {
    const newClock: TutorClock = {
      id: 'CLK-' + Date.now(),
      tutorId,
      clockIn: new Date().toISOString(),
      tgl: new Date().toISOString().split('T')[0]
    };
    const updatedClocks = [...tutorClocks, newClock];
    setTutorClocks(updatedClocks);
    saveToLocal({ members, tutors, absensi, sesi, pemasukan, pengeluaran, tutorClocks: updatedClocks });
    showToast('success', 'Berhasil melakukan clock-in mengajar!');
  };

  const handleTutorClockOut = (clockId: string) => {
    const updatedClocks = tutorClocks.map(c => 
      c.id === clockId ? { ...c, clockOut: new Date().toISOString() } : c
    );
    setTutorClocks(updatedClocks);
    saveToLocal({ members, tutors, absensi, sesi, pemasukan, pengeluaran, tutorClocks: updatedClocks });
    showToast('success', 'Berhasil melakukan clock-out pulang!');
  };

  const handleAddSessionLog = (log: Omit<SessionLog, 'id'>) => {
    const newLog: SessionLog = {
      ...log,
      id: 'LOG-' + Date.now()
    };
    const updatedLogs = [...sessionLogs, newLog];
    setSessionLogs(updatedLogs);
    saveToLocal({ members, tutors, absensi, sesi, pemasukan, pengeluaran, sessionLogs: updatedLogs });
    showToast('success', 'Berhasil menyimpan Jurnal Kelas!');
  };

  const handleUpdateMilestoneStatus = (id: string, newStatus: SyllabusMilestone['status']) => {
    const updatedMilestones = syllabusMilestones.map(m => 
      m.id === id ? { ...m, status: newStatus } : m
    );
    setSyllabusMilestones(updatedMilestones);
    saveToLocal({ members, tutors, absensi, sesi, pemasukan, pengeluaran, syllabusMilestones: updatedMilestones });
    showToast('success', 'Milestone silabus diperbarui!');
  };

  const handleAddMilestone = (m: Omit<SyllabusMilestone, 'id'>) => {
    const newMilestone: SyllabusMilestone = {
      ...m,
      id: 'MIL-' + Date.now()
    };
    const updatedMilestones = [...syllabusMilestones, newMilestone];
    setSyllabusMilestones(updatedMilestones);
    saveToLocal({ members, tutors, absensi, sesi, pemasukan, pengeluaran, syllabusMilestones: updatedMilestones });
    showToast('success', 'Topik silabus baru ditambahkan!');
  };

  const handleAddAssessmentScore = (score: Omit<AssessmentScore, 'id'>) => {
    const newScore: AssessmentScore = {
      ...score,
      id: 'SC-' + Date.now()
    };
    const updatedScores = [...assessmentScores, newScore];
    setAssessmentScores(updatedScores);
    saveToLocal({ members, tutors, absensi, sesi, pemasukan, pengeluaran, assessmentScores: updatedScores });
    showToast('success', 'Skor evaluasi baru dicatat!');
  };

  const handleDeleteAssessmentScore = (id: string) => {
    const updatedScores = assessmentScores.filter(s => s.id !== id);
    setAssessmentScores(updatedScores);
    saveToLocal({ members, tutors, absensi, sesi, pemasukan, pengeluaran, assessmentScores: updatedScores });
    showToast('success', 'Skor evaluasi berhasil dihapus.');
  };

  // Open Composition Email overlay
  const handleOpenEmailComposer = (to: string, sub: string, html: string) => {
    setComposeMail({
      isOpen: true,
      to,
      subject: sub,
      htmlBody: html,
      isSending: false,
    });
  };

  const handleCloseEmailComposer = () => {
    setComposeMail((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCustomLogout = () => {
    localStorage.removeItem('kursusan_user_session');
    setCurrentUserSession(null);
  };

  if (!currentUserSession) {
    return (
      <LoginView
        onLoginSuccess={(session) => {
          setCurrentUserSession(session);
          setUserRole(session.role);
          localStorage.setItem('kursusan_user_session', JSON.stringify(session));
          
          if (session.role === 'tutor') {
            setActiveTab('portal_tutor');
          } else {
            setActiveTab('dashboard');
          }
          showToast('success', `Selamat Datang, ${session.name}!`);
        }}
      />
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans" id="applet-main-container">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        isSyncingSheets={isSyncingSheets}
        sheetsLinked={sheetConfig.isLinked}
        onSyncNow={handleManualSyncNow}
        userRole={userRole}
        customUser={currentUserSession}
        onCustomLogout={handleCustomLogout}
      />

      {/* Main Panel views scrollable */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto h-screen relative" id="main-content-scrollview">
        {/* Sticky Global App Header with Access Control Level Indicator */}
        <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md pb-4 pt-1 mb-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="global-header-role-indicator">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight">Portal Bimbingan Belajar</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 rounded text-indigo-700">v1.2.5</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Sistem Informasi, Absensi Presensi & Rapor Belajar Terpadu</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Realtime Role Badge with status indicators */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs transition-all duration-350 ${
              userRole === 'admin' 
                ? 'bg-slate-900 text-white border-slate-800' 
                : 'bg-sky-50 text-sky-800 border-sky-200/80'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  userRole === 'admin' ? 'bg-amber-400' : 'bg-sky-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  userRole === 'admin' ? 'bg-amber-500' : 'bg-sky-500'
                }`}></span>
              </span>
              
              <div className="text-left text-[10px] flex items-center gap-1.5 font-bold">
                <span className={`text-[8px] font-extrabold uppercase tracking-widest ${
                  userRole === 'admin' ? 'text-slate-400' : 'text-sky-500'
                }`}>Role Akses:</span>
                
                {userRole === 'admin' && (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                    ADMINISTRATOR
                  </span>
                )}
                {userRole === 'tutor' && (
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <GraduationCap className="h-3.5 w-3.5" />
                    TUTOR PENGAJAR
                  </span>
                )}
              </div>
            </div>

            {/* Profile badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-slate-700 text-[10px] font-semibold shadow-xs">
              <div className="w-4.5 h-4.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px]">
                {currentUserSession?.name ? currentUserSession.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="max-w-[130px] truncate">{currentUserSession?.name || 'Administrator'}</span>
            </div>
          </div>
        </div>

        {/* Role-Based Access Control Switcher - Visible only to Admins for sandbox simulation */}
        {currentUserSession.role === 'admin' && (
          <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4.5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-650 rounded-xl">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">Simulasi Otentikasi Multi Peran (RBAC Sandbox)</p>
                <p className="text-[10px] text-slate-400">Pilih role untuk beralih mode visual sesuai tingkat hak akses akun bimbingan.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setUserRole('admin');
                  setActiveTab('dashboard');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  userRole === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Koordinator / Admin (Default)
              </button>
              <button
                onClick={() => {
                  setUserRole('tutor');
                  setActiveTab('portal_tutor');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  userRole === 'tutor'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tutor Pengajar Portal
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            members={members}
            tutors={tutors}
            sesi={sesi}
            pemasukan={pemasukan}
            pengeluaran={pengeluaran}
            setActiveTab={setActiveTab}
            onSendMail={handleOpenEmailComposer}
          />
        )}

        {activeTab === 'member' && (
          <MemberView
            members={members}
            onAddMember={handleAddMember}
            onDeleteMember={handleDeleteMember}
            onSendMail={handleOpenEmailComposer}
          />
        )}

        {activeTab === 'tutor' && (
          <TutorView
            tutors={tutors}
            absensi={absensi}
            onAddTutor={handleAddTutor}
            onDeleteTutor={handleDeleteTutor}
            onAddAbsen={handleAddAbsen}
            onDeleteAbsen={handleDeleteAbsen}
          />
        )}

        {activeTab === 'sesi' && (
          <SesiView
            sesi={sesi}
            members={members}
            tutors={tutors}
            onAddSesi={handleAddSesi}
            onDeleteSesi={handleDeleteSesi}
          />
        )}

        {activeTab === 'keuangan' && (
          <KeuanganView
            pemasukan={pemasukan}
            pengeluaran={pengeluaran}
            members={members}
            onAddPemasukan={handleAddPemasukan}
            onAddPengeluaran={handleAddPengeluaran}
            onDeletePemasukan={handleDeletePemasukan}
            onDeletePengeluaran={handleDeletePengeluaran}
          />
        )}

        {activeTab === 'workspace' && (
          <WorkspaceSyncView
            user={user}
            onLogin={handleGoogleLogin}
            sheetConfig={sheetConfig}
            onLinkExisting={handleLinkExistingSpreadsheet}
            onCreateSpreadsheet={handleCreateNewSpreadsheet}
            onToggleAutoSync={handleToggleAutoSync}
            onSyncNow={handleManualSyncNow}
            isSyncing={isSyncingSheets}
            members={members}
            tutors={tutors}
            onComposeCustomMail={handleOpenEmailComposer}
          />
        )}

        {activeTab === 'qr_absen' && (
          <QrAbsenView
            members={members}
            tutors={tutors}
            sesi={sesi}
            absensi={absensi}
            onAddSesi={handleAddSesi}
            onAddAbsen={handleAddAbsen}
            onUpdateSesiStatus={handleUpdateSesiStatus}
          />
        )}

        {activeTab === 'portal_tutor' && (
          <TutorPortalView
            tutors={tutors}
            members={members}
            sesi={sesi}
            sessionLogs={sessionLogs}
            syllabusMilestones={syllabusMilestones}
            assessmentScores={assessmentScores}
            tutorClocks={tutorClocks}
            onAddClockIn={handleTutorClockIn}
            onAddClockOut={handleTutorClockOut}
            onAddSessionLog={handleAddSessionLog}
            onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
            onAddMilestone={handleAddMilestone}
            onAddAssessmentScore={handleAddAssessmentScore}
            onDeleteAssessmentScore={handleDeleteAssessmentScore}
            customUser={currentUserSession}
          />
        )}

        {activeTab === 'provision_user' && (
          <UserAccountsView onSendMail={handleOpenEmailComposer} />
        )}

        {activeTab === 'proposal_dokumen' && (
          <ProposalView />
        )}

        {/* Global floating toast center */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-xl animate-in slide-in-from-bottom-2 duration-300">
            {toast.type === 'sync' ? (
              <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400" />
            )}
            <span className="text-xs font-semibold leading-normal pr-4">{toast.text}</span>
            <button onClick={() => setToast(null)} className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>

      {/* Hover Floating ComposeMail Terminaloverlay */}
      {composeMail.isOpen && (
        <ComposeMailModal
          toEmail={composeMail.to}
          subjectLine={composeMail.subject}
          bodyHtml={composeMail.htmlBody}
          onClose={handleCloseEmailComposer}
          onSend={handleTriggerSendEmailGroup}
          isSending={composeMail.isSending}
        />
      )}
    </div>
  );
}
