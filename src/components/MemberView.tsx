import React, { useState } from 'react';
import { Member } from '../types';
import { Plus, Search, Trash2, Mail, UserPlus, Eye, X } from 'lucide-react';

interface MemberViewProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  onSendMail: (to: string, defaultSubject: string, defaultBody: string) => void;
}

export default function MemberView({
  members,
  onAddMember,
  onDeleteMember,
  onSendMail,
}: MemberViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [wali, setWali] = useState('');
  const [hp, setHp] = useState('');
  const [biaya, setBiaya] = useState(75000);
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');
  const [catatan, setCatatan] = useState('');

  // Search filter
  const filteredMembers = members.filter((m) =>
    m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.kelas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !kelas) {
      alert('Nama Lengkap dan Program/Kelas wajib diisi!');
      return;
    }
    onAddMember({
      nama,
      kelas,
      wali,
      hp,
      biaya,
      status,
      catatan,
    });
    // Reset Form
    setNama('');
    setKelas('');
    setWali('');
    setHp('');
    setBiaya(75000);
    setStatus('Aktif');
    setCatatan('');
    setIsModalOpen(false);
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

  const openMailComposerForInvoice = (member: Member) => {
    // Generate prefilled payment notification template
    const subject = `Tagihan Pembayaran Les - ${member.nama}`;
    const body = `Halo Bapak/Ibu ${member.wali || 'Wali Murid'},<br/><br/>
      Kami menginformasikan rincian biaya les untuk putra/putri Anda <strong>${member.nama}</strong> yang mengambil program <strong>${member.kelas}</strong>.<br/><br/>
      Biaya les: <strong>${rp(member.biaya)} per pertemuan (sesi)</strong>.<br/><br/>
      Mohon abaikan email ini jika Anda sudah melunasi pembayaran sebelum tanggal jatuh tempo.<br/><br/>
      Salam Hangat,<br/>
      <strong>Staf Administrasi Kursusan App</strong>`;
    
    // We check if member.hp looks like an email or not, or let the user type custom email
    const emailToUse = member.hp.includes('@') ? member.hp : '';
    onSendMail(emailToUse, subject, body);
  };

  return (
    <div className="space-y-6" id="member-view-panel">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Member (Siswa)</h1>
          <p className="text-slate-500 text-xs mt-0.5">Kelola siswa aktif, biaya per sesi, program les, dan data wali murid.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-sm text-xs cursor-pointer transition-all self-start sm:self-center"
          id="btn-tambah-member-modal"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Member
        </button>
      </div>

      {/* Control Row with Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/70 flex items-center gap-3 shadow-xs">
        <Search className="text-slate-400 h-4 w-4 ml-1 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cari nama siswa atau mata pelajaran..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
          id="search-member-input"
        />
      </div>

      {/* Main Members Table */}
      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden" id="members-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/70">
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Program / Kelas</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Orang Tua/Wali</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kontak / Email</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Biaya / Sesi</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-55/40 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-semibold text-[10px] border border-slate-200/60">
                          {getInitials(m.nama)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{m.nama}</p>
                          <p className="text-[10px] text-slate-400">ID: {m.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600 font-medium">
                      {m.kelas}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {m.wali || '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      <div>
                        <p className="font-medium text-slate-700">{m.hp || '—'}</p>
                        {m.hp?.includes('@') ? (
                          <span className="text-[9px] text-slate-400 font-medium bg-slate-50 border border-slate-200 rounded px-1.5 py-0.2">Email</span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">No. HP</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-800 font-semibold text-right">
                      {rp(m.biaya)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        m.status === 'Aktif'
                          ? 'bg-slate-100 text-slate-850 border border-slate-200/65'
                          : 'bg-slate-50 text-slate-400 border border-slate-150'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Send Email Template */}
                        <button
                          onClick={() => openMailComposerForInvoice(m)}
                          className="p-1 px-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200/80 flex items-center gap-1 text-[11px] font-medium cursor-pointer transition-all"
                          title="Kirim Invoice Tagihan via Gmail"
                        >
                          <Mail className="h-3 w-3 text-slate-400" /> Tagih Les
                        </button>
                        
                        {/* Delete member */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data member ${m.nama}? Tindakan ini bersifat permanen.`)) {
                              onDeleteMember(m.id);
                            }
                          }}
                          className="p-1 px-2.5 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50/30 rounded-lg border border-slate-200/80 hover:border-rose-200/60 transition-colors cursor-pointer text-[11px] font-medium"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    Tidak ditemukan data member sesuai penelusuran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Title */}
            <div className="border-b border-slate-150 p-5 bg-white text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Tambah Member (Siswa Baru)</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Andi Pratama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Program / Mata Pelajaran *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Matematika SMP"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nama Wali / Orang Tua</label>
                  <input
                    type="text"
                    placeholder="Nama bapak/ibu wali"
                    value={wali}
                    onChange={(e) => setWali(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kontak HP atau Email *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: ainulyqn22@gmail.com atau 0812xx"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Masukkan alamat email untuk fitur kirim Invoice langsung.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Biaya Les Per Sesi (Rp)</label>
                  <input
                    type="number"
                    placeholder="75000"
                    value={biaya}
                    onChange={(e) => setBiaya(Number(e.target.value))}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Tidak Aktif')}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-all"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Catatan Lainnya</label>
                <textarea
                  placeholder="Opsional"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-3 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none resize-none transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-medium rounded-xl text-xs cursor-pointer transition-all border border-transparent hover:border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs cursor-pointer transition-all shadow-xs"
                  id="btn-submit-tambah-siswa"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
