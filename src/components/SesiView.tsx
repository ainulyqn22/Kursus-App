import React, { useState } from 'react';
import { Sesi, Member, Tutor } from '../types';
import { Plus, Search, CalendarDays, Trash2, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface SesiViewProps {
  sesi: Sesi[];
  members: Member[];
  tutors: Tutor[];
  onAddSesi: (session: Omit<Sesi, 'id'>) => void;
  onDeleteSesi: (id: string) => void;
}

export default function SesiView({
  sesi,
  members,
  tutors,
  onAddSesi,
  onDeleteSesi,
}: SesiViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [filterMemberId, setFilterMemberId] = useState('');
  const [filterTutorId, setFilterTutorId] = useState('');

  // Sesi Form states
  const [sTgl, setSTgl] = useState(new Date().toISOString().split('T')[0]);
  const [sMemberId, setSMemberId] = useState(members[0]?.id || '');
  const [sTutorId, setSTutorId] = useState(tutors[0]?.id || '');
  const [sMapel, setSMapel] = useState('');
  const [sDurasi, setSDurasi] = useState(60);
  const [sStatus, setSStatus] = useState<'Selesai' | 'Dijadwalkan' | 'Dibatalkan'>('Selesai');

  // Filter lists
  const filteredSesi = sesi.filter((s) => {
    const matchMember = !filterMemberId || s.memberId === filterMemberId;
    const matchTutor = !filterTutorId || s.tutorId === filterTutorId;
    return matchMember && matchTutor;
  });

  const isBulanIni = (dateStr: string) => dateStr && dateStr.startsWith('2026-06');

  // Aggregated Stats
  const totalSesi = filteredSesi.length;
  const sesiSelesai = filteredSesi.filter((s) => s.status === 'Selesai');
  const totalDurasiMenit = sesiSelesai.reduce((sum, current) => sum + current.durasi, 0);
  const totalJam = Math.floor(totalDurasiMenit / 60);
  const totalSisaMenit = totalDurasiMenit % 60;

  const sesiBulanIni = filteredSesi.filter((s) => isBulanIni(s.tgl)).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memberId = sMemberId || (members[0]?.id ?? '');
    const tutorId = sTutorId || (tutors[0]?.id ?? '');

    if (!sTgl || !memberId || !tutorId) {
      alert('Tolong lengkapi semua field bertanda bintang (*)!');
      return;
    }

    // Default subject mapping
    const tutorObj = tutors.find(t => t.id === tutorId);
    const chosenMapel = sMapel || (tutorObj ? tutorObj.mapel : 'Les');

    onAddSesi({
      tgl: sTgl,
      memberId,
      tutorId,
      mapel: chosenMapel,
      durasi: sDurasi,
      status: sStatus,
    });

    // Reset Form
    setSTgl(new Date().toISOString().split('T')[0]);
    setSMapel('');
    setSDurasi(60);
    setSStatus('Selesai');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6" id="sesi-view-panel">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sesi Kelas Les</h1>
          <p className="text-slate-500 text-xs mt-0.5">Review dan catat riwayat pertemuan belajar, durasi, serta status penyelesaian kelas.</p>
        </div>
        <button
          onClick={() => {
            if (members.length === 0 || tutors.length === 0) {
              alert('Paling sedikit daftarkan 1 member dan 1 tutor terlebih dahulu!');
              return;
            }
            setSMemberId(members[0].id);
            setSTutorId(tutors[0].id);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
          id="btn-tambah-sesi"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Sesi Les
        </button>
      </div>

      {/* Sesi Aggregated Scoreboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="sesi-scoreboard">
        <div className="bg-white p-4 rounded-xl border border-slate-200/70">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Sesi Terfilter</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{totalSesi}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/70">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sesi Selesai (Hadir)</p>
          <p className="text-xl font-bold text-slate-805 text-slate-800 mt-1">{sesiSelesai.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/70">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Jam Belajar</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {totalJam}<span className="text-xs font-normal text-slate-400">h</span> {totalSisaMenit}<span className="text-xs font-normal text-slate-400">m</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/70">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bulan Ini (Juni 2026)</p>
          <p className="text-xl font-bold text-slate-700 mt-1">{sesiBulanIni} Sesi</p>
        </div>
      </div>

      {/* Interactive Filters Controls row */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Filter Berdasarkan Siswa</label>
          <select
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
            className="w-full text-slate-700 text-xs font-medium outline-none bg-slate-50/50 px-2.5 py-1.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <option value="">Semua Siswa / Member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Filter Berdasarkan Tutor</label>
          <select
            value={filterTutorId}
            onChange={(e) => setFilterTutorId(e.target.value)}
            className="w-full text-slate-700 text-xs font-medium outline-none bg-slate-50/50 px-2.5 py-1.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <option value="">Semua Tutor</option>
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Sesi list Table */}
      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden" id="les-sessions-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/70">
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tutor Pengajar</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Mata Pelajaran</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Durasi</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSesi.length > 0 ? (
                [...filteredSesi].reverse().map((s) => {
                  const m = members.find((x) => x.id === s.memberId);
                  const t = tutors.find((x) => x.id === s.tutorId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 font-medium">
                        {s.tgl}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-800">{m ? m.nama : '?'}</p>
                        <p className="text-[9px] text-slate-400">ID: {s.memberId}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-800">{t ? t.nama : '?'}</p>
                        <p className="text-[9px] text-slate-400">{t ? t.mapel : '—'}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {s.mapel}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs text-slate-600 font-medium">
                        <div className="flex items-center justify-center gap-1.5">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{s.durasi} m</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          s.status === 'Selesai'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200/50'
                            : s.status === 'Dijadwalkan'
                            ? 'bg-slate-55 border border-slate-205 text-slate-600'
                            : 'bg-rose-50 border border-rose-100 text-rose-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('Batalkan dan hapus recording sesi les ini?')) {
                              onDeleteSesi(s.id);
                            }
                          }}
                          className="p-1 px-2.5 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50/30 rounded-lg border border-slate-200/80 hover:border-rose-200/60 transition-all cursor-pointer text-xs font-medium"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    Belum ada rekaman sesi les terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sesi Modal Form container */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-150 p-5 bg-white text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Catat Sesi Belajar Les</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pilih Siswa / Member *</label>
                <select
                  value={sMemberId}
                  onChange={(e) => setSMemberId(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all cursor-pointer font-medium text-slate-700"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama} — {m.kelas}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pilih Tutor Mengajar *</label>
                <select
                  value={sTutorId}
                  onChange={(e) => setSTutorId(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all cursor-pointer font-medium text-slate-700"
                >
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} (Spesialis: {t.mapel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tanggal Pertemuan *</label>
                  <input
                    type="date"
                    required
                    value={sTgl}
                    onChange={(e) => setSTgl(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Durasi (Menit)</label>
                  <input
                    type="number"
                    required
                    value={sDurasi}
                    onChange={(e) => setSDurasi(Number(e.target.value))}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all font-semibold text-slate-705 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Mata Pelajaran Diajarkan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Matematika"
                    value={sMapel}
                    onChange={(e) => setSMapel(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all text-slate-700"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Kosongkan untuk otomatis mengikuti spesialis tutor</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status Sesi</label>
                  <select
                    value={sStatus}
                    onChange={(e) => setSStatus(e.target.value as 'Selesai' | 'Dijadwalkan' | 'Dibatalkan')}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all font-medium text-slate-700"
                  >
                    <option value="Selesai">Selesai</option>
                    <option value="Dijadwalkan">Dijadwalkan</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-medium rounded-xl text-xs cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
                >
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
