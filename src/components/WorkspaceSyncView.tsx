import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { GoogleSheetConfig, Member, Tutor } from '../types';
import {
  FileSpreadsheet,
  Link,
  RefreshCw,
  Plus,
  Mail,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Clock,
  CheckCircle,
  FolderSync
} from 'lucide-react';

interface WorkspaceSyncViewProps {
  user: User | null;
  onLogin: () => void;
  sheetConfig: GoogleSheetConfig;
  onLinkExisting: (spreadsheetId: string) => void;
  onCreateSpreadsheet: () => void;
  onToggleAutoSync: () => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  members: Member[];
  tutors: Tutor[];
  onComposeCustomMail: (to: string, sub: string, html: string) => void;
}

export default function WorkspaceSyncView({
  user,
  onLogin,
  sheetConfig,
  onLinkExisting,
  onCreateSpreadsheet,
  onToggleAutoSync,
  onSyncNow,
  isSyncing,
  members,
  tutors,
  onComposeCustomMail,
}: WorkspaceSyncViewProps) {
  const [manualId, setManualId] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<'invoice' | 'reminder' | 'payroll'>('invoice');

  // Mail preset forms variables
  const [selectedRecipientType, setSelectedRecipientType] = useState<'siswa' | 'tutor'>('siswa');
  const [selectedSiswaId, setSelectedSiswaId] = useState(members[0]?.id || '');
  const [selectedTutorId, setSelectedTutorId] = useState(tutors[0]?.id || '');
  const [nominalCustom, setNominalCustom] = useState(150000);
  const [pertemuanCount, setPertemuanCount] = useState(4);

  const rp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId) return;

    // Extract spreadsheet ID if they pasted a full URL
    let parsedId = manualId.trim();
    if (parsedId.includes('docs.google.com/spreadsheets/d/')) {
      const match = parsedId.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        parsedId = match[1];
      }
    }

    onLinkExisting(parsedId);
    setManualId('');
  };

  const handleCreateTemplatesMail = () => {
    if (activeTemplate === 'invoice') {
      const m = members.find((x) => x.id === selectedSiswaId) || members[0];
      if (!m) {
        alert('Toleransi pendaftaran minimum 1 member siswa');
        return;
      }
      const subject = `Tagihan / Kwitansi Pembayaran Kursus - Siswa: ${m.nama}`;
      const email = m.hp.includes('@') ? m.hp : '';
      const totalAmount = pertemuanCount * m.biaya;

      const body = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
          <h2 style="color: #0c447c; text-align: center; border-bottom: 2px solid #0c447c; padding-bottom: 10px;">Laporan Tagihan Les Bulanan</h2>
          <p>Yth. Bapak/Ibu <strong>${m.wali || 'Wali Murid'}</strong>,</p>
          <p>Semoga Anda dalam keadaan baik. Berikut kami sampaikan rincian tagihan program les bulanan untuk siswa:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr style="background: #fcfcfc; border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Siswa</td>
              <td style="padding: 8px;">${m.nama}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Program / Kelas</td>
              <td style="padding: 8px;">${m.kelas}</td>
            </tr>
            <tr style="background: #fcfcfc; border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Harga Per Sesi</td>
              <td style="padding: 8px;">${rp(m.biaya)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Jumlah Pertemuan</td>
              <td style="padding: 8px;">${pertemuanCount} Sesi</td>
            </tr>
            <tr style="background: #f9fbfd; font-size: 16px; border-top: 2px solid #0c447c;">
              <td style="padding: 10px; font-weight: bold; color: #0c447c;">Total Nominal Transfer</td>
              <td style="padding: 10px; font-weight: bold; color: #0c447c;">${rp(totalAmount)}</td>
            </tr>
          </table>
          <div style="background: #fff8eb; border-left: 4px solid #f59e0b; padding: 10px; border-radius: 4px; margin-top: 15px; font-size: 13px;">
            <strong>Informasi Transfer:</strong><br/>
            Pembayaran dapat ditransfer ke rekening Bank Central (BCA) No: 123-4567-890 an. Kursusan App. Mohon lampirkan bukti bayar ke nomor Whatsapp penanggung jawab kami.
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #777; text-align: center;">Email dikirim otomatis dari layanan Manajemen Kursusan App.</p>
        </div>
      `;

      onComposeCustomMail(email, subject, body);
    } else if (activeTemplate === 'reminder') {
      const m = members.find((x) => x.id === selectedSiswaId) || members[0];
      if (!m) {
        alert('Toleransi pendaftaran minimum 1 member siswa');
        return;
      }
      const subject = `Pengingat Jadwal Pembelajaran Les - ${m.nama}`;
      const email = m.hp.includes('@') ? m.hp : '';

      const body = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
          <h2 style="color: #4f46e5; text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">Pengingat Jadwal Les</h2>
          <p>Yth. Bapak/Ibu <strong>${m.wali || 'Wali Murid'}</strong>,</p>
          <p>Dengan email ini kami mengingatkan bahwa ananda <strong>${m.nama}</strong> memiliki jadwal les rutin terdekat untuk program <strong>${m.kelas}</strong>.</p>
          <p>Mohon mempersiapkan ananda 15 menit sebelum tutor tiba di tempat atau sebelum jam kelas dimulai.</p>
          <div style="background: #f5f3ff; border: 1px solid #ddd; padding: 12px; border-radius: 8px; margin-top: 15px; text-align: center; font-size: 14px;">
            <strong>Harap persiapkan materi dan buku panduan program ${m.kelas}.</strong>
          </div>
          <p style="margin-top: 20px;">Terima kasih atas kerja samanya.</p>
          <p style="font-size: 13px;">Salam hangat,<br/><strong>Manajemen Kursusan Team</strong></p>
        </div>
      `;

      onComposeCustomMail(email, subject, body);
    } else if (activeTemplate === 'payroll') {
      const t = tutors.find((x) => x.id === selectedTutorId) || tutors[0];
      if (!t) {
        alert('Toleransi pendaftaran minimum 1 tutor');
        return;
      }
      const subject = `Slip Gaji / Honorarium Tutor - ${t.nama}`;
      const email = t.hp.includes('@') ? t.hp : '';
      const totalHonor = pertemuanCount * t.honor;

      const body = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
          <h2 style="color: #059669; text-align: center; border-bottom: 2px solid #059669; padding-bottom: 10px;">SLIP HONORARIUM TUTOR</h2>
          <p>Halo Rekan Tutor, <strong>${t.nama}</strong>,</p>
          <p>Terima kasih atas dedikasi dan profesionalisme Anda dalam menemani siswa belajar. Berikut adalah rincian slip honor pengajaran Anda:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr style="background: #fdfdfd; border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Nama Tutor</td>
              <td style="padding: 8px;">${t.nama}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Spesifikasi</td>
              <td style="padding: 8px;">${t.mapel}</td>
            </tr>
            <tr style="background: #fdfdfd; border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Honor Per Pertemuan</td>
              <td style="padding: 8px;">${rp(t.honor)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Pertemuan Selesai</td>
              <td style="padding: 8px;">${pertemuanCount} Sesi</td>
            </tr>
            <tr style="background: #f0fdf4; font-size: 16px; border-top: 2px solid #059669;">
              <td style="padding: 10px; font-weight: bold; color: #059669;">Total Nominal Gaji</td>
              <td style="padding: 10px; font-weight: bold; color: #059669;">${rp(totalHonor)}</td>
            </tr>
          </table>
          <p style="margin-top: 15px; font-size: 13px; font-style: italic; color: #666;">Dana tersebut telah dikirimkan ke rekening bank terdaftar Anda. Harap segera konfirmasi ke bagian administrasi jika terdapat ketimpangan data.</p>
          <p style="margin-top: 20px; font-size: 11px; text-align: center; color: #777;">Hormat kami,<br/>Divisi Finansial Kursus App</p>
        </div>
      `;

      onComposeCustomMail(email, subject, body);
    }
  };

  return (
    <div className="space-y-6" id="workspace-sync-panel">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Workspace Sync & Email</h1>
        <p className="text-slate-500 text-xs mt-0.5 font-normal">Hubungkan database aplikasi lokal dengan Google Drive, Google Sheets, dan kirim pengumuman via Gmail API.</p>
      </div>

      {/* OFFLINE CALL-TO-ACTION */}
      {!user ? (
        <div className="space-y-4" id="offline-cta">
          <div className="bg-white p-6 rounded-xl border border-slate-200/70 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200/60">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">Aktifkan Sinkronisasi Google Sheets & Email</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-normal">
                Untuk mengekspor database Kursusan langsung ke Google Drive secara live, dan mengirimkan email tagihan, remidial, atau gaji kustom via Gmail, hubungkan dengan Akun Google Anda.
              </p>
            </div>

            <div className="flex justify-center pt-1 animate-pulse">
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-4  py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs cursor-pointer transition-colors"
                id="google-login-workspace-cta"
              >
                Hubungkan Akun Google
              </button>
            </div>
          </div>

          {window.self !== window.top && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-lg mx-auto space-y-2 text-[11px] leading-relaxed text-amber-900">
              <div className="flex items-start gap-2 font-bold text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Penting untuk Pengguna AI Studio Preview:</span>
              </div>
              <p>
                Browser melarang autentikasi pihak ketiga (Google OAuth iframe sandboxing/third-party cookies) dalam kontainer tersemat. Silakan <strong>buka aplikasi di tab baru</strong> dengan mengeklik tombol <strong>'Buka di Tab Baru'</strong> di pratinjau AI Studio Anda agar login dapat berhasil.
              </p>
              <div className="pt-1.5">
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors no-underline"
                >
                  Buka Aplikasi di Tab Baru <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6" id="online-panels">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Google Sheets Card Config */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 font-semibold">
                <FileSpreadsheet className="h-5 w-5 text-slate-600" />
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Google Sheets Integrator</h3>
                  <p className="text-[10px] text-slate-400">Sinkronisasi tabular data Siswa, Tutor, Absensi & Keuangan.</p>
                </div>
              </div>

              {sheetConfig.isLinked ? (
                <div className="space-y-4" id="sheets-linked-details">
                  <div className="p-4 bg-slate-50/50 border border-slate-200/70 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Status: Terhubung</span>
                      <a
                        href={sheetConfig.spreadsheetUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors"
                      >
                        Buka Google Sheet <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 font-medium truncate">
                        ID: {sheetConfig.spreadsheetId}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium mt-1">
                        Terakhir Sinkron: {sheetConfig.lastSyncedAt || 'Belum disinkronkan'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Auto Sync Toggle */}
                    <div className="flex items-center gap-2">
                       <button
                        onClick={onToggleAutoSync}
                        className="p-1 rounded text-slate-400 hover:bg-slate-100 transition-all cursor-pointer"
                        title={sheetConfig.autoSync ? 'Matikan Auto-Sync' : 'Aktifkan Auto-Sync'}
                        id="toggle-auto-sync-btn"
                      >
                        {sheetConfig.autoSync ? (
                          <ToggleRight className="h-8 w-8 text-slate-800" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-slate-400" />
                        )}
                      </button>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-800">Sinkronisasi Otomatis</p>
                        <p className="text-[9px] text-slate-400">Database menyalin instan data baru secara otomatis</p>
                      </div>
                    </div>

                    {/* Sync Trigger button */}
                    <button
                      onClick={onSyncNow}
                      disabled={isSyncing}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ml-auto"
                      id="export-sheet-now-btn"
                    >
                      <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Sinkron...' : 'Ekspor Manual'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4" id="sheets-unlinked-details">
                  <div className="p-4 bg-slate-50/50 border border-slate-200/70 rounded-lg text-center space-y-3">
                    <p className="text-xs text-slate-500 font-medium font-normal text-slate-400">Buku Kas dan Siswa belum memiliki sambungan master Spreadsheet Google.</p>
                    <button
                      onClick={onCreateSpreadsheet}
                      disabled={isSyncing}
                      className="w-full py-2 px-4 bg-slate-950 hover:bg-slate-850 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
                      id="btn-create-sheets-auto"
                    >
                      <Plus className="h-4 w-4" />
                      {isSyncing ? 'Memproses pembuatan...' : 'Buat Spreadsheet Baru Secara Otomatis'}
                    </button>
                  </div>

                  <form onSubmit={handleLinkSubmit} className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Atau Sambungkan dengan Google Sheet ID Yang Sudah Ada</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Masukkan URL / ID Spreadsheet"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        className="flex-1 text-xs border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-1.5 outline-none focus:border-slate-400 focus:bg-white text-slate-705 placeholder:text-slate-400 transition-colors"
                        id="paste-spreadsheet-input"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg cursor-pointer transition-colors"
                        id="link-existing-btn"
                      >
                        Hubungkan ID
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Email Templating Panel */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Mail className="h-5 w-5 text-slate-600" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">Kirim Email Berdasarkan Template Preset</h3>
                  <p className="text-[10px] text-slate-400 font-medium font-normal">Formulasi email invoice penagihan siswa atau slip gaji tutor instan.</p>
                </div>
              </div>

              {/* Presets tab selection */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg">
                {(['invoice', 'reminder', 'payroll'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setActiveTemplate(t);
                    }}
                    className={`py-1 text-[10px] font-semibold rounded-md capitalize cursor-pointer transition-all ${
                      activeTemplate === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t === 'invoice' ? 'Tagihan SPP' : t === 'reminder' ? 'Pengingat' : 'Gaji Tutor'}
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-1">
                {activeTemplate === 'invoice' && (
                  <div className="space-y-3">
                    <div className="space-y-1 font-medium">
                      <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Pilih Penerima Siswa</label>
                      <select
                        value={selectedSiswaId}
                        onChange={(e) => setSelectedSiswaId(e.target.value)}
                        className="w-full text-xs font-medium border border-slate-200 bg-slate-50/50 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-705"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nama} ({m.kelas})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Pertemuan Bulanan Sesi</label>
                      <select
                        value={pertemuanCount}
                        onChange={(e) => setPertemuanCount(Number(e.target.value))}
                        className="w-full text-xs font-semibold border border-slate-200 bg-slate-50/50 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-705"
                      >
                        <option value={1}>1 Sesi</option>
                        <option value={2}>2 Sesi</option>
                        <option value={4}>4 Sesi (Rutin Bulanan)</option>
                        <option value={8}>8 Sesi (Dwi-Mingguan)</option>
                        <option value={12}>12 Sesi</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTemplate === 'reminder' && (
                  <div className="space-y-1 font-medium">
                    <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider pl-1 font-semibold text-slate-405">Silakan Pilih Siswa</label>
                    <select
                      value={selectedSiswaId}
                      onChange={(e) => setSelectedSiswaId(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-200 bg-slate-50/50 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-705"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nama} — {m.kelas}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTemplate === 'payroll' && (
                  <div className="space-y-3">
                    <div className="space-y-1 font-medium">
                      <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Pilih Tutor Penerima Gaji</label>
                      <select
                        value={selectedTutorId}
                        onChange={(e) => setSelectedTutorId(e.target.value)}
                        className="w-full text-xs font-medium border border-slate-200 bg-slate-50/50 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-705"
                      >
                        {tutors.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nama} (Keahlian: {t.mapel})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Jumlah Kehadiran Pertemuan Selesai</label>
                      <select
                        value={pertemuanCount}
                        onChange={(e) => setPertemuanCount(Number(e.target.value))}
                        className="w-full text-xs font-semibold border border-slate-200 bg-slate-50/50 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-705"
                      >
                        <option value={1}>1 Pertemuan</option>
                        <option value={2}>2 Pertemuan</option>
                        <option value={4}>4 Pertemuan (Rutin)</option>
                        <option value={6}>6 Pertemuan</option>
                        <option value={8}>8 Pertemuan (Intensif)</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCreateTemplatesMail}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium items-center justify-center flex gap-1.5 cursor-pointer transition-colors mt-3"
                  id="compose-from-template-btn"
                >
                  <Mail className="h-3 w-3" />
                  Gubah dan Buka Composer Email
                </button>
              </div>
            </div>
          </div>

          {/* Activity Sync log metrics list */}
          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl" id="sync-logs-panel">
            <div className="flex items-center gap-2 mb-2.5">
              <FolderSync className="h-4 w-4 text-slate-600" />
              <h4 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">Histori & Laporan Sinkronisasi</h4>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="bg-white p-2.5 border border-slate-200/60 rounded-lg flex justify-between items-center text-[11px] font-medium text-slate-500">
                <span>Dukungan Multi-Tab</span>
                <span className="text-[9px] font-bold text-slate-700 bg-slate-100/50 px-2.5 py-0.5 rounded border border-slate-200/50">
                  Tabular: Siswa, Tutor, Kehadiran, Sesi Les, Keuangan
                </span>
              </div>
              <div className="bg-white p-2.5 border border-slate-200/60 rounded-lg flex justify-between items-center text-[11px] font-medium text-slate-500">
                <span>Format Kunci Sinkronisasi</span>
                <span className="text-[9px] font-bold text-slate-700 bg-slate-100/50 px-2.5 py-0.5 rounded border border-slate-200/50">
                  Google Sheet REST API Client v4
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
