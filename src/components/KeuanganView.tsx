import React, { useState } from 'react';
import { Pemasukan, Pengeluaran, Member } from '../types';
import { Plus, ToggleLeft, ArrowUpRight, ArrowDownRight, Briefcase, Filter, X } from 'lucide-react';

interface KeuanganViewProps {
  pemasukan: Pemasukan[];
  pengeluaran: Pengeluaran[];
  members: Member[];
  onAddPemasukan: (p: Omit<Pemasukan, 'id'>) => void;
  onAddPengeluaran: (k: Omit<Pengeluaran, 'id'>) => void;
  onDeletePemasukan: (id: string) => void;
  onDeletePengeluaran: (id: string) => void;
}

export default function KeuanganView({
  pemasukan,
  pengeluaran,
  members,
  onAddPemasukan,
  onAddPengeluaran,
  onDeletePemasukan,
  onDeletePengeluaran,
}: KeuanganViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pemasukan' | 'pengeluaran' | 'rekapitulasi'>('pemasukan');
  const [isPemasukanModalOpen, setIsPemasukanModalOpen] = useState(false);
  const [isPengeluaranModalOpen, setIsPengeluaranModalOpen] = useState(false);

  // Pemasukan Form States
  const [pTgl, setPTgl] = useState(new Date().toISOString().split('T')[0]);
  const [pKat, setPKat] = useState<'Bayar Les' | 'Pendaftaran' | 'Modul/Buku' | 'Lainnya'>('Bayar Les');
  const [pMemberId, setPMemberId] = useState('');
  const [pJml, setPJml] = useState(0);
  const [pKet, setPKet] = useState('');

  // Pengeluaran Form States
  const [kTgl, setKTgl] = useState(new Date().toISOString().split('T')[0]);
  const [kKat, setKKat] = useState<'Gaji Tutor' | 'Sewa Tempat' | 'ATK' | 'Listrik/Air' | 'Lainnya'>('Gaji Tutor');
  const [kJml, setKJml] = useState(0);
  const [kKet, setKKet] = useState('');

  const isBulanIni = (dStr: string) => dStr && dStr.startsWith('2026-06');
  const rp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');

  // Submit handlers
  const handlePemasukanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTgl || pJml <= 0) {
      alert('Tolong isi Tanggal dan Jumlah nominal pemasukan dengan valid!');
      return;
    }
    const chosenMember = pMemberId || '';
    const autoKet = pKet || `${pKat} ${chosenMember ? `- Siswa: ${members.find(m => m.id === chosenMember)?.nama}` : '(Siswa Umum)'}`;

    onAddPemasukan({
      tgl: pTgl,
      kat: pKat,
      memberId: chosenMember,
      jml: pJml,
      ket: autoKet,
    });

    setPTgl(new Date().toISOString().split('T')[0]);
    setPKat('Bayar Les');
    setPMemberId('');
    setPJml(0);
    setPKet('');
    setIsPemasukanModalOpen(false);
  };

  const handlePengeluaranSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kTgl || kJml <= 0) {
      alert('Tolong isi Tanggal dan Jumlah nominal pengeluaran dengan valid!');
      return;
    }
    const autoKet = kKet || kKat;
    onAddPengeluaran({
      tgl: kTgl,
      kat: kKat,
      jml: kJml,
      ket: autoKet,
    });

    setKTgl(new Date().toISOString().split('T')[0]);
    setKKat('Gaji Tutor');
    setKJml(0);
    setKKet('');
    setIsPengeluaranModalOpen(false);
  };

  // Metrics calculating
  const totalPemasukanBulanIni = pemasukan.filter((p) => isBulanIni(p.tgl)).reduce((sum, current) => sum + current.jml, 0);
  const totalPemasukanKumulatif = pemasukan.reduce((sum, current) => sum + current.jml, 0);

  const totalPengeluaranBulanIni = pengeluaran.filter((k) => isBulanIni(k.tgl)).reduce((sum, current) => sum + current.jml, 0);
  const totalPengeluaranKumulatif = pengeluaran.reduce((sum, current) => sum + current.jml, 0);

  const profitKumulatif = totalPemasukanKumulatif - totalPengeluaranKumulatif;

  // Breakdown by Category
  const incomeCategoryTotals = pemasukan.reduce((acc: Record<string, number>, p) => {
    acc[p.kat] = (acc[p.kat] || 0) + p.jml;
    return acc;
  }, {});

  const expenseCategoryTotals = pengeluaran.reduce((acc: Record<string, number>, k) => {
    acc[k.kat] = (acc[k.kat] || 0) + k.jml;
    return acc;
  }, {});

  return (
    <div className="space-y-6" id="keuangan-view-panel">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pencatatan Keuangan</h1>
          <p className="text-slate-500 text-xs mt-0.5">Review pemasukan biaya pendaftaran, iuran SPP les siswa, pembayaran tutor, dan alokasi operasional.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeSubTab === 'pemasukan' && (
            <button
              onClick={() => setIsPemasukanModalOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              id="btn-catat-masuk"
            >
              <Plus className="h-3.5 w-3.5" />
              Catat Pemasukan
            </button>
          )}
          {activeSubTab === 'pengeluaran' && (
            <button
              onClick={() => setIsPengeluaranModalOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              id="btn-catat-keluar"
            >
              <Plus className="h-3.5 w-3.5" />
              Catat Pengeluaran
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs Toggle Navigation BAR */}
      <div className="flex items-center gap-1 border-b border-slate-200" id="keuangan-subtabs-row">
        {(['pemasukan', 'pengeluaran', 'rekapitulasi'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 capitalize transition-all cursor-pointer -mb-[2px] ${
              activeSubTab === tab
                ? 'border-slate-900 text-slate-950 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab === 'rekapitulasi' ? 'rekap' : tab}
          </button>
        ))}
      </div>

      {/* VIEW: PEMASUKAN */}
      {activeSubTab === 'pemasukan' && (
        <div className="space-y-6" id="subtab-pemasukan-view">
          {/* Statistics Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/70">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pemasukan Bulan Ini</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{rp(totalPemasukanBulanIni)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/70">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Pemasukan (All Time)</p>
              <p className="text-xl font-bold text-slate-805 text-slate-800 mt-1">{rp(totalPemasukanKumulatif)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/70">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Transaksi Terhitung</p>
              <p className="text-xl font-bold text-slate-700 mt-1">{pemasukan.length} Transaksi</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/70">
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kaitan Member</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Keterangan</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Jumlah (Rp)</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pemasukan.length > 0 ? (
                    [...pemasukan].reverse().map((p) => {
                      const member = members.find((m) => m.id === p.memberId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                          <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">{p.tgl}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {p.kat}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-800">
                            {member ? member.nama : <span className="text-slate-400 font-normal italic">Pengguna Umum</span>}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate font-medium">{p.ket}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900 text-right">{rp(p.jml)}</td>
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => onDeletePemasukan(p.id)}
                              className="text-slate-400 hover:text-rose-600 font-semibold cursor-pointer transition-colors"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs shadow-xs">
                        Belum ada transaksi pemasukan masuk.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: PENGELUARAN */}
      {activeSubTab === 'pengeluaran' && (
        <div className="space-y-6" id="subtab-pengeluaran-view">
          {/* Statistics Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/70">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pengeluaran Bulan Ini</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{rp(totalPengeluaranBulanIni)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/70">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Pengeluaran (All Time)</p>
              <p className="text-xl font-bold text-slate-805 text-slate-800 mt-1">{rp(totalPengeluaranKumulatif)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/70">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Transaksi Terhitung</p>
              <p className="text-xl font-bold text-slate-700 mt-1">{pengeluaran.length} Transaksi</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/70">
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Keterangan</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Jumlah (Rp)</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pengeluaran.length > 0 ? (
                    [...pengeluaran].reverse().map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">{k.tgl}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                            {k.kat}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate font-medium">{k.ket}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900 text-right">{rp(k.jml)}</td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => onDeletePengeluaran(k.id)}
                            className="text-slate-400 hover:text-rose-600 font-semibold cursor-pointer transition-colors"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                        Belum ada transaksi pengeluaran.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: REKAPITULASI */}
      {activeSubTab === 'rekapitulasi' && (
        <div className="space-y-6" id="subtab-rekap-view">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Pemasukan</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{rp(totalPemasukanKumulatif)}</p>
              </div>
              <ArrowUpRight className="h-6 w-6 text-slate-300" />
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Pengeluaran</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{rp(totalPengeluaranKumulatif)}</p>
              </div>
              <ArrowDownRight className="h-6 w-6 text-slate-300" />
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-xl shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Saldo Bersih (Kumulatif)</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{rp(profitKumulatif)}</p>
              </div>
              <Briefcase className="h-6 w-6 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income categories breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-slate-800 pb-2 border-b border-slate-100">Pemasukan Berdasarkan Kategori</h3>
              <div className="space-y-2">
                {Object.keys(incomeCategoryTotals).length > 0 ? (
                  Object.entries(incomeCategoryTotals).map(([kat, sum]) => (
                    <div key={kat} className="flex items-center justify-between py-1.5 text-xs border-b border-dashed border-slate-100 last:border-0 font-medium">
                      <span className="text-slate-500">{kat}</span>
                      <span className="text-slate-800 font-semibold">{rp(sum)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">Belum ada rincian pemasukan.</p>
                )}
              </div>
            </div>

            {/* Expenses categories breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-slate-800 pb-2 border-b border-slate-100">Pengeluaran Berdasarkan Kategori</h3>
              <div className="space-y-2">
                {Object.keys(expenseCategoryTotals).length > 0 ? (
                  Object.entries(expenseCategoryTotals).map(([kat, sum]) => (
                    <div key={kat} className="flex items-center justify-between py-1.5 text-xs border-b border-dashed border-slate-100 last:border-0 font-medium">
                      <span className="text-slate-500">{kat}</span>
                      <span className="text-slate-850 text-slate-705 font-semibold">{rp(sum)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">Belum ada rincian pengeluaran.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pemasukan Modal FORM Container */}
      {isPemasukanModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-150 p-5 bg-white text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Catat Transaksi Pemasukan</h3>
              </div>
              <button
                onClick={() => setIsPemasukanModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePemasukanSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    required
                    value={pTgl}
                    onChange={(e) => setPTgl(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kategori *</label>
                  <select
                    value={pKat}
                    onChange={(e) => setPKat(e.target.value as any)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all cursor-pointer font-medium text-slate-700"
                  >
                    <option value="Bayar Les">Bayar Les</option>
                    <option value="Pendaftaran">Pendaftaran</option>
                    <option value="Modul/Buku">Modul/Buku</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kaitkan dengan Member (Siswa)</label>
                <select
                  value={pMemberId}
                  onChange={(e) => setPMemberId(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all cursor-pointer font-medium text-slate-700"
                >
                  <option value="">Umum (Bukan Member Khusus)</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama} — {m.kelas}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Jumlah Nominal Pemasukan *</label>
                <input
                  type="number"
                  required
                  placeholder="250000"
                  value={pJml || ''}
                  onChange={(e) => setPJml(Number(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Keterangan Catatan</label>
                <input
                  type="text"
                  placeholder="Keterangan tambahan (opsional)"
                  value={pKet}
                  onChange={(e) => setPKet(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all text-slate-700"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPemasukanModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-medium rounded-xl text-xs cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
                >
                  Simpan Pemasukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pengeluaran Modal FORM Container */}
      {isPengeluaranModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-150 p-5 bg-white text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Catat Transaksi Pengeluaran</h3>
              </div>
              <button
                onClick={() => setIsPengeluaranModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePengeluaranSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    required
                    value={kTgl}
                    onChange={(e) => setKTgl(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kategori *</label>
                  <select
                    value={kKat}
                    onChange={(e) => setKKat(e.target.value as any)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all cursor-pointer font-medium text-slate-700"
                  >
                    <option value="Gaji Tutor">Gaji Tutor</option>
                    <option value="Sewa Tempat">Sewa Tempat</option>
                    <option value="ATK">ATK</option>
                    <option value="Listrik/Air">Listrik/Air</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Jumlah Nominal Pengeluaran *</label>
                <input
                  type="number"
                  required
                  placeholder="100000"
                  value={kJml || ''}
                  onChange={(e) => setKJml(Number(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Keterangan Catatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembayaran ATK bulanan kertas spidol"
                  value={kKet}
                  onChange={(e) => setKKet(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all text-slate-700"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPengeluaranModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-medium rounded-xl text-xs cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
