import { Member, Tutor, Sesi, Pemasukan, Pengeluaran } from '../types';
import {
  Users,
  GraduationCap,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Wallet,
  Clock,
  ArrowRight
} from 'lucide-react';
interface DashboardViewProps {
  members: Member[];
  tutors: Tutor[];
  sesi: Sesi[];
  pemasukan: Pemasukan[];
  pengeluaran: Pengeluaran[];
  setActiveTab: (tab: string) => void;
  onSendMail: (to: string, defaultSubject: string, defaultBody: string) => void;
}

export default function DashboardView({
  members,
  tutors,
  sesi,
  pemasukan,
  pengeluaran,
  setActiveTab,
  onSendMail,
}: DashboardViewProps) {
  // Helpers
  const rp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  const isBulanIni = (tglStr: string) => {
    // Current time is June 2026 based on metadata (2026-06-06). So we focus on "2026-06"
    return tglStr && tglStr.startsWith('2026-06');
  };

  // Metrics
  const totalSiswaAktif = members.filter((m) => m.status === 'Aktif').length;
  const totalTutor = tutors.length;
  const sesiSelesai = sesi.filter((s) => s.status === 'Selesai').length;
  const sesiSelesaiBulanIni = sesi.filter((s) => s.status === 'Selesai' && isBulanIni(s.tgl)).length;

  // Monthly Financial Calculations
  const pemasukanBulanIni = pemasukan
    .filter((p) => isBulanIni(p.tgl))
    .reduce((sum, item) => sum + item.jml, 0);

  const pengeluaranBulanIni = pengeluaran
    .filter((k) => isBulanIni(k.tgl))
    .reduce((sum, item) => sum + item.jml, 0);

  const profitBulanIni = pemasukanBulanIni - pengeluaranBulanIni;

  // All-time Calculations
  const totalPemasukanAllTime = pemasukan.reduce((sum, item) => sum + item.jml, 0);
  const totalPengeluaranAllTime = pengeluaran.reduce((sum, item) => sum + item.jml, 0);
  const totalSaldoAllTime = totalPemasukanAllTime - totalPengeluaranAllTime;

  // Slices for latest items
  const latestMembers = [...members].slice(-3).reverse();
  const latestSesi = [...sesi].slice(-4).reverse();


  return (
    <div className="space-y-6" id="dashboard-view-panel">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Ringkasan</h1>
        <p className="text-slate-500 text-sm">Dashboard aktivitas kursusan dan finansial real-time.</p>
      </div>

      {/* Kartu Ringkasan Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="top-summary-cards">
        {/* Total Saldo Saat Ini Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 rounded-2xl text-white shadow-xs border border-slate-800 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-slate-800/10 rounded-full blur-2xl group-hover:bg-slate-800/20 transition-all duration-300"></div>
          <div className="space-y-1 z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Kas / Saldo Kumulatif</span>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
              {rp(totalSaldoAllTime)}
            </p>
            <p className="text-[10px] text-slate-400 font-normal leading-relaxed">
              Akumulasi laba dan kas bersih dari seluruh transaksi historis
            </p>
          </div>
          <div className="p-3.5 bg-slate-800/80 text-emerald-400 rounded-xl z-10 border border-slate-700/40">
            <Wallet className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Sesi Les Selesai Bulan Ini Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-50/40 rounded-full blur-2xl group-hover:bg-indigo-100/30 transition-all duration-300"></div>
          <div className="space-y-1 z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sesi Les Selesai Bulan Ini</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {sesiSelesaiBulanIni} Sesi
            </p>
            <p className="text-[10px] text-slate-500 font-normal leading-relaxed">
              Target produktivitas aktivitas bimbingan belajar periode berjalan (Juni 2026)
            </p>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl z-10 border border-indigo-100/40">
            <CalendarDays className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="stats-grid">
        {/* Siswa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Member Aktif</span>
            <p className="text-3xl font-bold text-slate-900">{totalSiswaAktif}</p>
            <button 
              onClick={() => setActiveTab('member')} 
              className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1 mt-1 transition-all"
            >
              Kelola Siswa <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Sesi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sesi Les (Selesai)</span>
            <p className="text-3xl font-bold text-slate-900">{sesiSelesai}</p>
            <button 
              onClick={() => setActiveTab('sesi')} 
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mt-1 transition-all"
            >
              Catat Sesi <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <CalendarDays className="h-6 w-6" />
          </div>
        </div>

        {/* Profit Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Bulan Ini (Juni)</span>
            <p className={`text-2xl font-bold ${profitBulanIni >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {rp(profitBulanIni)}
            </p>
            <button 
              onClick={() => setActiveTab('keuangan')} 
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 mt-1 transition-all"
            >
              Lihat Keuangan <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className={`p-4 rounded-2xl ${profitBulanIni >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <Wallet className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Monthly Detail Cards Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="monthly-stats-detailed">
        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pemasukan (Bulan Ini)</p>
            <p className="text-sm font-semibold text-slate-800">{rp(pemasukanBulanIni)}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-rose-100 text-rose-800 rounded-lg">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pengeluaran (Bulan Ini)</p>
            <p className="text-sm font-semibold text-slate-800">{rp(pengeluaranBulanIni)}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-sky-100 text-sky-800 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tutor Terdaftar</p>
            <p className="text-sm font-semibold text-slate-800">{totalTutor} Orang Tutor</p>
          </div>
        </div>
      </div>


      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Members Cards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">Member Terbaru</h3>
            <button 
              onClick={() => setActiveTab('member')} 
              className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
            >
              Lihat semua ({members.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {latestMembers.length > 0 ? (
              latestMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-100">
                      {getInitials(m.nama)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{m.nama}</h4>
                      <p className="text-xs text-slate-500">{m.kelas}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      m.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {m.status}
                    </span>
                    <button
                      onClick={() => onSendMail(
                        m.hp.includes('@') ? m.hp : '',
                        `Informasi Pendaftaran - ${m.nama}`,
                        `Halo Bapak/Ibu ${m.wali || 'Wali Murid'},<br/><br/>Terima kasih telah mendaftarkan putra/putri Anda <strong>${m.nama}</strong> di Kursus kami untuk program <strong>${m.kelas}</strong>.<br/><br/>Salam hangat,<br/>Tim Manajemen Kursusan`
                      )}
                      className="text-xs text-sky-600 hover:text-sky-700 font-semibold hover:underline"
                    >
                      Kirim Email
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">Belum ada data member les.</p>
            )}
          </div>
        </div>

        {/* Recent Sesi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">Sesi Les Bulan Ini (Terbaru)</h3>
            <button 
              onClick={() => setActiveTab('sesi')} 
              className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
            >
              Lihat semua ({sesi.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {latestSesi.length > 0 ? (
              latestSesi.map((s) => {
                const member = members.find((m) => m.id === s.memberId);
                const tutor = tutors.find((t) => t.id === s.tutorId);
                return (
                  <div key={s.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{member ? member.nama : '?'}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{s.mapel}</span>
                        <span>·</span>
                        <span>Tutor: {tutor ? tutor.nama : '?'}</span>
                        <span>·</span>
                        <span>{s.tgl}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        s.status === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.status === 'Dijadwalkan'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">Belum ada rekaman sesi les.</p>
            )}
          </div>
        </div>
      </div>

      {/* All Time Accounting Highlights Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-md">
        <h3 className="text-base font-semibold text-indigo-200 mb-4 tracking-tight">Akuntansi Kumulatif (All-Time)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Akumulasi Pemasukan</span>
            <p className="text-xl font-bold text-emerald-400">{rp(totalPemasukanAllTime)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Akumulasi Pengeluaran</span>
            <p className="text-xl font-bold text-rose-400">{rp(totalPengeluaranAllTime)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Sisa Kas Utama</span>
            <p className={`text-xl font-bold ${totalSaldoAllTime >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
              {rp(totalSaldoAllTime)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
