import React, { useState } from 'react';
import { Tutor, Absen } from '../types';
import { Plus, UserPlus, CheckCircle, Flame, CalendarCheck, HelpCircle, X, Trash2, ShieldCheck } from 'lucide-react';

interface TutorViewProps {
  tutors: Tutor[];
  absensi: Absen[];
  onAddTutor: (tutor: Omit<Tutor, 'id'>) => void;
  onDeleteTutor: (id: string) => void;
  onAddAbsen: (absen: Omit<Absen, 'id'>) => void;
  onDeleteAbsen: (id: string) => void;
}

export default function TutorView({
  tutors,
  absensi,
  onAddTutor,
  onDeleteTutor,
  onAddAbsen,
  onDeleteAbsen,
}: TutorViewProps) {
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [isAbsenModalOpen, setIsAbsenModalOpen] = useState(false);

  // Tutor Form States
  const [tNama, setTNama] = useState('');
  const [tMapel, setTMapel] = useState('');
  const [tHp, setTHp] = useState('');
  const [tHonor, setTHonor] = useState(80000);
  const [tStatus, setTStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');

  // Absen Form States
  const [selectedTutorId, setSelectedTutorId] = useState(tutors[0]?.id || '');
  const [absenTgl, setAbsenTgl] = useState(new Date().toISOString().split('T')[0]);
  const [absenStatus, setAbsenStatus] = useState<'Hadir' | 'Izin' | 'Absen'>('Hadir');
  const [absenKet, setAbsenKet] = useState('');

  // Calculations for current period (June 2026 default)
  const isBulanIni = (dateStr: string) => dateStr && dateStr.startsWith('2026-06');

  const handleSubmitTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tNama) {
      alert('Nama Tutor wajib diisi!');
      return;
    }
    onAddTutor({
      nama: tNama,
      mapel: tMapel,
      hp: tHp,
      honor: tHonor,
      status: tStatus,
    });
    setTNama('');
    setTMapel('');
    setTHp('');
    setTHonor(80000);
    setTStatus('Aktif');
    setIsTutorModalOpen(false);
  };

  const handleSubmitAbsen = (e: React.FormEvent) => {
    e.preventDefault();
    const tutorId = selectedTutorId || (tutors[0]?.id ?? '');
    if (!tutorId || !absenTgl) {
      alert('Tolong pilih Tutor dan isi Tanggal!');
      return;
    }
    onAddAbsen({
      tutorId,
      tgl: absenTgl,
      status: absenStatus,
      ket: absenKet,
    });
    setAbsenKet('');
    setIsAbsenModalOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  const rp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');

  return (
    <div className="space-y-6" id="tutor-view-panel">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tutor & Kehadiran</h1>
          <p className="text-slate-500 text-xs mt-0.5">Kelola kompensasi honor tutor, jadwal keahlian mata pelajaran, dan pencatatan absensi harian.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (tutors.length === 0) {
                alert('Silakan tambah tutor telebih dahulu!');
                return;
              }
              setSelectedTutorId(tutors[0]?.id || '');
              setIsAbsenModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer border border-slate-200 shadow-xs"
            id="btn-catat-absen"
          >
            <CalendarCheck className="h-3.5 w-3.5 text-slate-500" />
            Catat Kehadiran
          </button>
          <button
            onClick={() => setIsTutorModalOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
            id="btn-tambah-tutor"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Tutor
          </button>
        </div>
      </div>

      {/* Tutors Table */}
      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden" id="tutors-table-container">
        <div className="border-b border-slate-100 px-5 py-4 bg-slate-50/40 text-xs font-semibold text-slate-700">
          Daftar Tutor dan Performa Kehadiran
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/20 border-b border-slate-200/70">
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nama Tutor</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Mata Pelajaran</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Honor / Sesi</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Kehadiran (Juni)</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pencapaian Rate</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tutors.length > 0 ? (
                tutors.map((t) => {
                  const tutorAbsen = absensi.filter((a) => a.tutorId === t.id);
                  const absenBulanIni = tutorAbsen.filter((a) => isBulanIni(a.tgl));
                  const hadirBulanIni = absenBulanIni.filter((a) => a.status === 'Hadir').length;
                  const totalLogAbsen = absenBulanIni.length;

                  // Overall
                  const totalHadirOverall = tutorAbsen.filter((a) => a.status === 'Hadir').length;

                  // Rate
                  const rateValue = totalLogAbsen ? Math.round((hadirBulanIni / totalLogAbsen) * 100) : 0;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-semibold text-[10px] border border-slate-200/60">
                            {getInitials(t.nama)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{t.nama}</p>
                            <p className="text-[10px] text-slate-400">{t.hp || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600 font-semibold">
                        {t.mapel || '—'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-800 font-bold text-right">
                        {rp(t.honor)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs">
                        <div className="font-semibold text-slate-800">
                          {hadirBulanIni} <span className="text-slate-400 text-[10px]">/ {totalLogAbsen} Hari</span>
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Kumulatif: {totalHadirOverall} Selesai</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap" style={{ width: '160px' }}>
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                          <span>{rateValue}%</span>
                          <span className={`text-[8px] font-bold px-1 py-0.2 select-none uppercase rounded ${
                            rateValue >= 85 ? 'bg-slate-100 text-slate-700' : rateValue >= 60 ? 'bg-slate-50 text-slate-600' : 'bg-slate-100/50 text-slate-400'
                          }`}>
                            {rateValue >= 85 ? 'Sangat Baik' : rateValue >= 60 ? 'Cukup' : 'Evaluasi'}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              rateValue >= 85 ? 'bg-slate-700' : rateValue >= 60 ? 'bg-slate-400' : 'bg-slate-300'
                            }`}
                            style={{ width: `${rateValue || 0}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          t.status === 'Aktif'
                            ? 'bg-slate-100 text-slate-850 border border-slate-200/65'
                            : 'bg-slate-50 text-slate-400 border border-slate-150'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data tutor ${t.nama} beserta data kehadiran yang terkait?`)) {
                              onDeleteTutor(t.id);
                            }
                          }}
                          className="p-1 px-2.5 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50/30 rounded-lg border border-slate-200/80 hover:border-rose-200/60 transition-all cursor-pointer text-xs font-medium"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs border-t">
                    Belum ada data tutor tambahan yang didaftarkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Log Absensi Kehadiran */}
      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden" id="absen-log-container">
        <div className="border-b border-slate-100 px-5 py-4 bg-slate-50/40 text-xs font-semibold text-slate-700">
          Log Kehadiran Terbaru
        </div>
        <div className="overflow-y-auto max-h-72">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/10 border-b border-slate-200/50">
                <th className="px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nama Tutor</th>
                <th className="px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Keterangan Tambahan</th>
                <th className="px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {absensi.length > 0 ? (
                [...absensi].reverse().map((a) => {
                  const tutor = tutors.find((t) => t.id === a.tutorId);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/40">
                      <td className="px-5 py-2.5 font-medium text-slate-500 whitespace-nowrap">{a.tgl}</td>
                      <td className="px-5 py-2.5 font-semibold text-slate-800">{tutor ? tutor.nama : 'Tutor Tidak Dikenal'}</td>
                      <td className="px-5 py-2.5">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          a.status === 'Hadir'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : a.status === 'Izin'
                            ? 'bg-slate-55 border border-slate-200 text-slate-600'
                            : 'bg-rose-50 border border-rose-100 text-rose-700'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-slate-400 italic font-medium">{a.ket || '—'}</td>
                      <td className="px-5 py-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteAbsen(a.id)}
                          className="text-slate-400 hover:text-rose-600 font-medium cursor-pointer text-xs"
                        >
                          Batalkan
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-405 text-slate-400">
                    Tidak ada logs kehadiran tutor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tutor Modal Entry */}
      {isTutorModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-150 p-5 bg-white text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Register Tutor Baru</h3>
              </div>
              <button
                onClick={() => setIsTutorModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTutor} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap Tutor *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak Ridwan"
                  value={tNama}
                  onChange={(e) => setTNama(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Mata Pelajaran Spesifikasi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika, Fisika, Kimia"
                  value={tMapel}
                  onChange={(e) => setTMapel(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">No. HP Tutor *</label>
                <input
                  type="text"
                  required
                  placeholder="Mulai dengan 081xxxxxxxx"
                  value={tHp}
                  onChange={(e) => setTHp(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Honor Per Sesi (Rp) *</label>
                  <input
                    type="number"
                    required
                    placeholder="80000"
                    value={tHonor}
                    onChange={(e) => setTHonor(Number(e.target.value))}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                  <select
                    value={tStatus}
                    onChange={(e) => setTStatus(e.target.value as 'Aktif' | 'Tidak Aktif')}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTutorModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-medium rounded-xl text-xs cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
                >
                  Registrasi Tutor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Absen Modal Entry */}
      {isAbsenModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-150 p-5 bg-white text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Catat Kehadiran Tutor</h3>
              </div>
              <button
                onClick={() => setIsAbsenModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAbsen} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pilih Tutor *</label>
                <select
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all font-semibold"
                >
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} ({t.mapel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tanggal Kehadiran *</label>
                <input
                  type="date"
                  required
                  value={absenTgl}
                  onChange={(e) => setAbsenTgl(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status Kehadiran *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Hadir', 'Izin', 'Absen'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAbsenStatus(v)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border cursor-pointer text-center select-none transition-colors ${
                        absenStatus === v
                          ? 'bg-slate-900 border-transparent text-white font-semibold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Catatan / Alasan Izin</label>
                <input
                  type="text"
                  placeholder="Sakit, cuti, dll (opsional)"
                  value={absenKet}
                  onChange={(e) => setAbsenKet(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAbsenModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-medium rounded-xl text-xs cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
                >
                  Simpan Absen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
