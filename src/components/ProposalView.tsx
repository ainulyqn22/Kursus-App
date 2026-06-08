import React from 'react';
import { 
  Printer, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Compass, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Database,
  Mail,
  QrCode,
  TrendingUp,
  Cpu,
  ChevronRight,
  UserCheck,
  GraduationCap
} from 'lucide-react';

export default function ProposalView() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="proposal-wrapper">
      {/* Interactive Controls (Hidden during printing) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-900/50 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-bold font-mono">PDF EXPORT</span>
            <h2 className="text-lg font-bold">Proposal Sistem & Panduan Stakeholder</h2>
          </div>
          <p className="text-xs text-indigo-200/80 max-w-xl">
            Gunakan tombol cetak di samping untuk langsung menyimpan dokumen ini sebagai file **PDF Resmi**. Gunakan mode cetak "Save as PDF", orientasi "Portrait", dan aktifkan "Background graphics" untuk hasil terbaik.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Cetak PDF Sekarang
        </button>
      </div>

      {/* Structured Clean Proposal Container (Optimized for both view & printing) */}
      <div className="bg-white border border-slate-200/80 shadow-lg rounded-2xl p-8 md:p-12 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto text-slate-800 leading-relaxed font-sans" id="proposal-document">
        
        {/* ================= PAGE 1: COVER ================= */}
        <div className="flex flex-col justify-between min-h-[90vh] pb-12 print:min-h-screen print:pb-0" id="proposal-page-1">
          <div className="space-y-12">
            {/* Header Identity */}
            <div className="flex items-center justify-between border-b border-indigo-150 pb-6">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-indigo-600 text-white rounded-xl">
                  <Award className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">KURSUSAN COOPERATIVE</h3>
                  <span className="text-[10px] text-slate-400 font-mono tracking-widest font-bold block uppercase">Bimbingan Belajar Digital v1.2</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-semibold font-mono">Kategori: Usulan Pengadaan</span>
            </div>

            {/* Document Title */}
            <div className="pt-16 space-y-4">
              <span className="p-1 px-3 bg-indigo-50 border border-indigo-150 text-[10px] rounded-full font-bold text-indigo-700 uppercase tracking-widest">
                PROPOSAL TEKNOLOGI INFORMASI
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight pt-2">
                Sistem Informasi Manajemen Bimbel,<br/>
                Absensi Presensi QR, & Rapor Realtime Terintegrasi
              </h1>
              <p className="text-sm text-slate-500 max-w-2xl pt-2">
                Digitalisasi administrasi, penanganan rekapitulasi keuangan, optimalisasi pencatatan silabus pengajar, pelaporan otomatis orang tua, serta synchronizer nirkabel dengan platform Google Workspace.
              </p>
            </div>

            {/* Key Advantages Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Absensi QR Instan</h4>
                <p className="text-[11px] text-slate-500 leading-normal">Pencatatan sesi mandiri oleh pengajar dengan validasi real-time presensi berbasis QR Code.</p>
              </div>
              <div className="p-4.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
                <Mail className="w-5 h-5 text-sky-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Notifikasi Otomatis</h4>
                <p className="text-[11px] text-slate-500 leading-normal">Integrasi Gmail API untuk pengiriman kuitansi digital, jadwal, dan rapor langsung ke email wali.</p>
              </div>
              <div className="p-4.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
                <Database className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Sinkronisasi Cloud</h4>
                <p className="text-[11px] text-slate-500 leading-normal">Kombinasi database lokal yang terenkripsi dengan Google Drive/Google Sheets komputasi awan.</p>
              </div>
            </div>
          </div>

          <div className="pt-16 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-semibold font-mono">
            <div>
              <p>Dipersiapkan untuk:</p>
              <p className="text-slate-700 font-bold">Direksi & Stakeholder Bimbingan Belajar (Lembaga Bimbel)</p>
            </div>
            <div className="sm:text-right">
              <p>Dibuat Tanggal: Juni 2026</p>
              <p className="text-slate-700 font-bold">Sistem Integrator Solusi Digital</p>
            </div>
          </div>
        </div>

        {/* Page breaks only in print */}
        <div className="print:page-break-before-always py-10" id="proposal-page-2">
          
          {/* ================= SECTION 1: RINGKASAN EKSEKUTIF ================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1 px-2.5 bg-slate-150 text-slate-700 text-[10px] rounded font-bold font-mono">BAB I</span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ringkasan Eksekutif</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Manajemen operasional institusi Bimbingan Belajar seringkali dihadapkan pada tantangan pelaporan manual, pembukuan yang tidak sinkron, koordinasi absensi tutor yang lambat, serta ketidakpuasan orang tua akibat kurangnya transparansi perkembangan belajar anak mereka. 
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Oleh karena itu, sistem <strong>Portal Bimbingan Belajar Terintegrasi</strong> dirancang untuk menyelesaikan kesenjangan tersebut melalui implementasi satu atap terpadu yang membagi hak akses ke dalam tiga pilar operasional:
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Pillar 1: Koordinator / Administrasi</span>
                  <p className="text-[11px] text-slate-500">Memiliki wewenang penuh atas inventarisasi pengajar & member, otorisasi keuangan (pembayaran & pengeluaran), penjadwalan komprehensif, serta penghubung saluran nirkabel (Google Sheets & Gmail) guna menjamin data tersentralisasi sempurna.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Pillar 2: Portal Pengajar / Tutor</span>
                  <p className="text-[11px] text-slate-500">Antarmuka mandiri bagi pengajar untuk mendokumentasikan silabus harian, mengoreksi nilai ujian berkala siswa (Rapor), dan mencatatkan waktu kehadiran (Clock-in / Clock-out) secara instan tanpa perlu berkas fisik kertas.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Pillar 3: Portal Rapor Siswa & Wali</span>
                  <p className="text-[11px] text-slate-500">Menyajikan grafik perkembangan akademis yang interaktif, persentase kehadiran tatap muka, daftar topik kurikulum yang telah tuntas, serta jurnal catatan emosional/pendukung perkembangan dari tutor pengajar secara transparan.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION 2: ARSITEKTUR TEKNIS ================= */}
          <section className="space-y-4 pt-10">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1 px-2.5 bg-slate-150 text-slate-700 text-[10px] rounded font-bold font-mono">BAB II</span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Detail Arsitektur & Teknologi</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl space-y-1.5 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-indigo-700">
                  <Database className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Penyimpanan Terdistribusi</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">State Persistence Enkripsi</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menyimpan seluruh basis data di penyimpanan lokal browser yang terstruktur dalam format JSON. Dilengkapi mekanisme backup otomatis nirkabel mencegah kehilangan data sesi.
                </p>
              </div>

              <div className="p-4 border border-slate-100 rounded-xl space-y-1.5 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-sky-700">
                  <Cpu className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Antarmuka QR Engine</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Presensi Tanpa Sentuh</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Mengenerate kode QR unik dari setiap tutor. Proses absensi dituntaskan dalam waktu kurang dari 2 detik menggunakan QR scanner kamera internal atau simulasi token berenkripsi.
                </p>
              </div>

              <div className="p-4 border border-slate-100 rounded-xl space-y-1.5 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-amber-700">
                  <Layers className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">G-Sheets Synchronizer</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Spreadsheet Berkecepatan Tinggi</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Sinkronisasi tak terbatas ke spreadsheet Google Drive secara dua arah dengan visualisasi data otomatis. Melindungi dokumen keuangan tetap tersimpan dalam sistem terarsip.
                </p>
              </div>

              <div className="p-4 border border-slate-100 rounded-xl space-y-1.5 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-rose-700">
                  <Mail className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Gmail Dispatcher</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Distributor Otomatis Sesi</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Protokol pengiriman email instan untuk verifikasi sesi, pengingat iuran tunggakan, dan kiriman Rapor Belajar yang dikirimkan secara langsung dari nama domain organisasi Anda.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Page breaks only in print */}
        <div className="print:page-break-before-always py-10" id="proposal-page-3">
          
          {/* ================= SECTION 3: FLOW KERJA APLIKASI ================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1 px-2.5 bg-slate-150 text-slate-700 text-[10px] rounded font-bold font-mono">BAB III</span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Modul & Alur Kerja Fungsional</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Keandalan sistem ini didasarkan pada siklus alur kerja yang logis dari awal pendaftaran siswa hingga distribusi laporan akademis ke wali murid:
            </p>

            {/* Workflow Step Diagrams */}
            <div className="relative border-l border-indigo-150 ml-4 pl-6 space-y-8 py-2">
              <div className="relative">
                <div className="absolute -left-[31px] top-0 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
                  1
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase">Tahapan Otorisasi Akun (Provisioning)</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-1">
                  Koordinator menggunakan tab **Provision Akun** untuk memasukkan data guru atau siswa ke database lokal, menghasilkan ID Kredensial unik yang didasarkan pada email dan sandi standar aman.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
                  2
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase">Verifikasi Log In Pengguna Terbagi</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-1">
                  Guru dan wali murid mengakses Portal Login menggunakan akun yang terdaftar. Role dideteksi secara otomatis untuk mengarahkan pengguna ke visualisasi menu yang tepat (Portal Tutor atau Portal Siswa/Anak).
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
                  3
                </div>
                <h4 className="text-xs font-extrabold text-slate-1000 uppercase">Proses KBM, Pencatatan Silabus & Evaluasi Nilai</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-1">
                  Tutor melakukan absensi QR untuk memicu status hadir. Di akhir sesi kelas mandiri, tutor memasukkan detail materi yang dipelajari (Jurnal), menuntaskan checklist silabus topik kurikulum, serta menginput nilai ujian/quis secara real-time.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
                  4
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase">Kalkulasi Keuangan & Otomatisasi Distribusi Laporan</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-1">
                  Sistem mengalkulasikan biaya les berdasarkan sesi kelas yang diselesaikan dan merekam laporan keuangan. Koordinator dapat menekan satu tombol untuk memicu email otomatis berisi kuitansi tanda terima, rekapan jadwal baru, dan kartu evaluasi belajar anak via integrasi Gmail.
                </p>
              </div>
            </div>
          </section>

          {/* ================= SECTION 4: CARA PENGGUNAAN ================= */}
          <section className="space-y-4 pt-10">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1 px-2.5 bg-slate-150 text-slate-700 text-[10px] rounded font-bold font-mono">BAB IV</span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Panduan Pengoperasian Sistem</h2>
            </div>

            <div className="space-y-4.5 text-xs text-slate-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-[11px] uppercase text-indigo-700">
                  <UserCheck className="w-4 h-4" />
                  Panduan Bagi Koordinator (Admin)
                </h4>
                <p className="mb-2 text-[11px] text-slate-500">
                  Koordinator berfungsi sebagai pengatur sentral sistem bimbingan belajar:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[10.5px] text-slate-500">
                  <li><strong>Entri Data:</strong> Tambahkan rekap siswa di "Data Member" dan pengajar di tab "Tutor & Absensi".</li>
                  <li><strong>Manajemen Keuangan:</strong> Catat setiap transaksi masuk/keluar. Biaya les otomatis direferensikan berdasarkan durasi les yang disukai anggota.</li>
                  <li><strong>Instalasi Cloud Workspace:</strong> Pada tab "Workspace Sync", gunakan Google Sign-In untuk otorisasi Gmail & Spreadsheet. Hubungkan atau buat file spreadsheet sekali klik untuk redundansi data awan.</li>
                  <li><strong>Distribusi Hasil Belajar:</strong> Klik tombol surat (Email) pada profil siswa untuk mengirimkan kuitansi atau Rapor evaluasi belajar langsung ke email terdaftar secara instan.</li>
                </ul>
              </div>

              <div className="pt-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-[11px] uppercase text-sky-700">
                  <GraduationCap className="w-4 h-4" />
                  Panduan Portal Bagi Pengajar (Tutor)
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-[10.5px] text-slate-500">
                  <li><strong>Log In Pengajar:</strong> Masuk ke platform untuk mengaktifkan antarmuka visual khusus guru secara otomatis.</li>
                  <li><strong>Presensi Mandiri:</strong> Lakukan scanning kode QR sesi Anda di tab yang disediakan untuk mendaftarkan jam mengajar (Clock-In) dan mengakhiri shift (Clock-Out).</li>
                  <li><strong>Evaluasi Harian:</strong> Tulis jurnal materi yang Anda bahas hari ini, berikan catatan kompetensi pribadi siswa, dan berikan skor evaluasi kuantitatif untuk performa akademis siswa dalam format dinamis.</li>
                </ul>
              </div>

              <div className="pt-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-[11px] uppercase text-violet-700">
                  <StudentPortalViewDummyLabel className="w-4 h-4" />
                  Panduan Portal Wali & Siswa (Orang Tua)
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-[10.5px] text-slate-500">
                  <li><strong>Transparansi Rapor:</strong> Wali murid dapat masuk untuk segera melihat rangkuman grafik linear perkembangan belajar siswa, riwayat nilai ujian, serta target kurikulum yang sudah dicapai atau yang sedang direncanakan di masa depan.</li>
                  <li><strong>Akses Presensi:</strong> Memverifikasi kehadiran anak pada jurnal les secara transparan dan aman demi mencegah terjadinya kecurangan kehadiran bimbel.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Page breaks only in print */}
        <div className="print:page-break-before-always py-10" id="proposal-page-4">
          
          {/* ================= SECTION 5: MANFAAT OPERASIONAL ================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1 px-2.5 bg-slate-150 text-slate-700 text-[10px] rounded font-bold font-mono">BAB V</span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Analisis Keunggulan Operasional</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dengan mengimplementasikan sistem yang diusulkan ini, instansi Bimbingan Belajar akan memperoleh serangkaian manfaat nyata yang signifikan:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 pt-2">
              <div className="p-4 border border-slate-100 rounded-xl space-y-1">
                <span className="text-xs font-bold text-indigo-700">95% Penghematan Kertas</span>
                <p className="text-[10.5px] text-slate-500">Seluruh dokumen laporan belajar, slip kuitansi fisik, dan kartu catatan guru sepenuhnya dialihkan ke komputasi awan yang dapat dicetak secara digital.</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl space-y-1">
                <span className="text-xs font-bold text-indigo-700">Transparansi Wali 100% Real-Time</span>
                <p className="text-[10.5px] text-slate-500">Orang tua siswa dapat melacak riwayat nilai, kehadiran kelas, dan kompetensi anak kapan saja tanpa harus menunggu laporan bulanan fisik.</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl space-y-1">
                <span className="text-xs font-bold text-indigo-700">Verifikasi Presensi QR Ganda</span>
                <p className="text-[10.5px] text-slate-500">Mencegah penyimpangan jam mengajar tutor secara ketat karena presensi menggunakan token kode QR instan yang terintegrasi dwi-arah.</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl space-y-1">
                <span className="text-xs font-bold text-indigo-700">Kemudahan Laporan Pajak & Keuangan</span>
                <p className="text-[10.5px] text-slate-500">Seluruh arus pengeluaran honor tutor, sewa gedung, operasional ATK, dan pembayaran dari wali murid direkam dalam tabel buku kas digital interaktif.</p>
              </div>
            </div>
          </section>

          {/* ================= SIGNATURE AREA ================= */}
          <section className="pt-16 pb-6">
            <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-8 text-xs">
              <div className="space-y-12 text-center md:text-left">
                <p className="font-semibold text-slate-400 font-mono">Dibuat Oleh,</p>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-slate-800 underline">Ainul Yaqin, S.Kom.</p>
                  <p className="text-[10px] text-slate-400 font-medium">Lead Developer & Systems Integrator</p>
                </div>
              </div>

              <div className="space-y-12 text-center md:text-right">
                <p className="font-semibold text-slate-400 font-mono">Disetujui Oleh,</p>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-slate-800">......................................................</p>
                  <p className="text-[10px] text-slate-400 font-medium">Perwakilan Stakeholder / Direktur Bimbel</p>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

// Dummy helper UI icon inside component file for clean modularity
function StudentPortalViewDummyLabel(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
