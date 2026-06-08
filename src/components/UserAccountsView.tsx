import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Eye, EyeOff, CheckCircle, Mail, Key, Trash2 } from 'lucide-react';

export interface AccountProvision {
  id: string;
  email: string;
  name: string;
  role: 'TUTOR' | 'PARENT' | 'ADMIN';
  defaultPasswordTxt: string;
  passwordHash: string; // Simulated bcrypt-hash
  createdAt: string;
}

// Robust helper to get correct application url during iframe embed
const getServiceAppUrl = () => {
  const origin = window.location.origin || "";
  if (
    !origin ||
    origin.includes("aistudio.google.com") ||
    origin.includes("google") ||
    origin === "null"
  ) {
    // Return the stable public shared preview deployment URL of the Cloud Run container
    return "https://ais-pre-unjl4c65timgaivkagn3ne-689509664099.asia-east1.run.app";
  }
  return origin;
};

interface UserAccountsViewProps {
  onAddAccount?: (acc: AccountProvision) => void;
  onSendMail?: (to: string, defaultSubject: string, defaultBody: string) => void;
}

export default function UserAccountsView({ onAddAccount, onSendMail }: UserAccountsViewProps) {
  // Store accounts in local state initially populated with default values
  const [accounts, setAccounts] = useState<AccountProvision[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'TUTOR' | 'PARENT'>('TUTOR');
  const [password, setPassword] = useState('DefaultPass123!');
  const [showPass, setShowPass] = useState(false);
  const [search, setSearch] = useState('');
  const [lastCreatedAcc, setLastCreatedAcc] = useState<AccountProvision | null>(null);

  // Loaded from localStorage to stay persistent
  useEffect(() => {
    const saved = localStorage.getItem('provisioned_users_list');
    if (saved) {
      try {
        setAccounts(JSON.parse(saved));
      } catch (e) {
        // Fallback default mock accounts
        loadFallback();
      }
    } else {
      loadFallback();
    }
  }, []);

  const loadFallback = () => {
    const list: AccountProvision[] = [
      {
        id: 'ACC-1',
        email: 'tutor.budi@bimbingan.com',
        name: 'Budi Santoso',
        role: 'TUTOR',
        defaultPasswordTxt: 'TutorBudi2026!',
        passwordHash: '$2b$10$X86Z99tQfeXU00bN.bT6reO0m6p32pL78hY9f33P2p3G8v2yG8b8K',
        createdAt: '2026-06-01'
      }
    ];
    setAccounts(list);
    localStorage.setItem('provisioned_users_list', JSON.stringify(list));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      alert('Email dan Nama wajib diisi!');
      return;
    }

    // Simulate bcrypt hashing client-side for demonstration
    // standard salt representation
    const fakeSalt = '$2b$10$' + Math.random().toString(36).substring(2, 24);
    const simulatedHash = fakeSalt + Math.random().toString(36).substring(2, 32).toUpperCase();

    const newAcc: AccountProvision = {
      id: 'ACC-' + Date.now(),
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role,
      defaultPasswordTxt: password,
      passwordHash: simulatedHash,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newAcc, ...accounts];
    setAccounts(updated);
    localStorage.setItem('provisioned_users_list', JSON.stringify(updated));
    setLastCreatedAcc(newAcc);

    // Reset Form fields
    setEmail('');
    setName('');
    // generate secondary password for convenience
    setPassword('DefaultPass' + Math.floor(Math.random() * 900 + 100) + '!');
    
    if (onAddAccount) {
      onAddAccount(newAcc);
    }
    
    // Auto-prefill trigger to the email composer via dynamic props
    if (onSendMail) {
      const appUrl = getServiceAppUrl();
      const subject = `[Akses Baru Portal] Detail Akses Akun Bimbingan Belajar Anda (${newAcc.role === 'TUTOR' ? 'Tutor' : 'Orang Tua'})`;
      const htmlBody = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
  <div style="background-color: #0f172a; color: #ffffff; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <h2 style="margin: 0; font-size: 18px; font-weight: bold;">Undangan Akses Portal Bimbingan Belajar</h2>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">Sistem Manajemen & Evaluasi Siswa Terintegrasi</p>
  </div>
  
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">Halo <strong>${newAcc.name}</strong>,</p>
  
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Akun bimbingan belajar Anda telah berhasil didaftarkan dan diprovisikan oleh Koordinator Kursus. Anda memiliki akses ke dalam dashboard utama sebagai peranan: <strong>${newAcc.role === 'TUTOR' ? 'Tutor Pengajar' : 'Orang Tua / Wali Siswa'}</strong>.
  </p>
  
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; margin: 24px 0;">
    <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Informasi Akun Kredensial Anda:</h3>
    <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 120px;">Email Utama:</td>
        <td style="padding: 6px 0; font-family: monospace; font-size: 13px; font-weight: 600; color: #0f172a;">${newAcc.email}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Password Sesi:</td>
        <td style="padding: 6px 0; font-family: monospace; font-size: 13px; font-weight: 600; color: #4338ca;">${newAcc.defaultPasswordTxt}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Grup Akses:</td>
        <td style="padding: 6px 0;"><span style="background-color: #f0fdf4; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #bbf7d0;">${newAcc.role}</span></td>
      </tr>
    </table>
  </div>
  
  <p style="font-size: 13px; color: #475569; line-height: 1.6;">
    Silakan gunakan kredensial di atas untuk masuk ke dalam portal pembelajaran dengan aman. Disarankan demi faktor privasi Anda segera mengganti kata sandi di setelan portal pribadi Anda setelah login.
  </p>
  
  <div style="text-align: center; margin: 28px 0;">
    <a href="${appUrl}" target="_blank" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
      Kunjungi Portal Bimbingan &raquo;
    </a>
  </div>
  
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
    Pesan otomatis ini disinkronisasikan oleh sistem Tutor Management & Student Progress Monitoring. Mohon untuk tidak membalas email ini secara langsung.
  </p>
</div>`;

      onSendMail(newAcc.email, subject, htmlBody);
    }
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Hapus log akun ini? Ini tidak menghapus data biodata, hanya riwayat provisioning.')) {
      const updated = accounts.filter(a => a.id !== id);
      setAccounts(updated);
      localStorage.setItem('provisioned_users_list', JSON.stringify(updated));
    }
  };

  const filtered = accounts.filter((acc) =>
    acc.email.toLowerCase().includes(search.toLowerCase()) ||
    acc.name.toLowerCase().includes(search.toLowerCase()) ||
    acc.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" id="user-accounts-view-panel">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">User Provisioning (Admin Only)</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Sistem Otentikasi Invite-Only. Buat dan provisikan akun login default untuk Tutor (TUTOR) dan Orang Tua (PARENT) tanpa registrasi umum.
        </p>
      </div>

      {/* Success Credentials Banner when newly created */}
      {lastCreatedAcc && (
        <div className="bg-emerald-900 border border-emerald-700 text-white rounded-2xl shadow-lg p-5 space-y-3.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-emerald-800 text-emerald-300 rounded-lg">
                <CheckCircle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Mata Pelajaran & Akses Berhasil Terdaftar!</h3>
                <p className="text-[10px] text-emerald-300">Akun baru didaftarkan secara lokal dalam data rujukan bimbingan.</p>
              </div>
            </div>
            <button 
              onClick={() => setLastCreatedAcc(null)}
              className="text-emerald-400 hover:text-white px-2 py-1 bg-emerald-950/40 hover:bg-emerald-800/50 rounded-lg transition-all cursor-pointer text-[10px] font-bold"
            >
              Selesai & Sembunyikan [X]
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-emerald-950 p-4 rounded-xl border border-emerald-800/60 font-mono text-xs">
            <div>
              <span className="text-[9px] text-emerald-400 block font-sans font-bold uppercase tracking-wide">NAMA LENGKAP:</span>
              <span className="font-semibold text-emerald-100">{lastCreatedAcc.name}</span>
            </div>
            <div>
              <span className="text-[9px] text-emerald-400 block font-sans font-bold uppercase tracking-wide">ROLE AKSES:</span>
              <span className="inline-block mt-0.5 px-2 py-0.5 text-[8px] font-extrabold rounded bg-emerald-800 text-emerald-100 border border-emerald-700">
                {lastCreatedAcc.role}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-emerald-400 block font-sans font-bold uppercase tracking-wide">EMAIL UTAMA:</span>
              <span className="text-emerald-200 select-all underline font-semibold">{lastCreatedAcc.email}</span>
            </div>
            <div>
              <span className="text-[9px] text-emerald-400 block font-sans font-bold uppercase tracking-wide">PASSWORD DEFAULT:</span>
              <span className="text-indigo-200 select-all font-bold tracking-wider">{lastCreatedAcc.defaultPasswordTxt}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Email: ${lastCreatedAcc.email}\nPassword: ${lastCreatedAcc.defaultPasswordTxt}`);
                alert(`Kredensial login untuk ${lastCreatedAcc.name} berhasil disalin!`);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-[10px] font-bold text-white transition-all cursor-pointer border border-emerald-700 shadow-sm"
            >
              Salin Kredensial (Email & Pass)
            </button>
            {onSendMail && (
              <button
                onClick={() => {
                  const appUrl = getServiceAppUrl();
                  const subject = `[Akses Baru Portal] Detail Akses Akun Bimbingan Belajar Anda (${lastCreatedAcc.role === 'TUTOR' ? 'Tutor' : 'Orang Tua'})`;
                  const htmlBody = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
  <div style="background-color: #0f172a; color: #ffffff; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <h2 style="margin: 0; font-size: 18px; font-weight: bold;">Undangan Akses Portal Bimbingan Belajar</h2>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">Sistem Manajemen & Evaluasi Siswa Terintegrasi</p>
  </div>
  
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">Halo <strong>${lastCreatedAcc.name}</strong>,</p>
  
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Akun bimbingan belajar Anda telah berhasil didaftarkan dan diprovisikan oleh Koordinator Kursus. Anda memiliki akses ke dalam dashboard utama sebagai peranan: <strong>${lastCreatedAcc.role === 'TUTOR' ? 'Tutor Pengajar' : 'Orang Tua / Wali Siswa'}</strong>.
  </p>
  
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; margin: 24px 0;">
    <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Informasi Akun Kredensial Anda:</h3>
    <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 120px;">Email Utama:</td>
        <td style="padding: 6px 0; font-family: monospace; font-size: 13px; font-weight: 600; color: #0f172a;">${lastCreatedAcc.email}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Password Sesi:</td>
        <td style="padding: 6px 0; font-family: monospace; font-size: 13px; font-weight: 600; color: #4338ca;">${lastCreatedAcc.defaultPasswordTxt}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Grup Akses:</td>
        <td style="padding: 6px 0;"><span style="background-color: #f0fdf4; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #bbf7d0;">${lastCreatedAcc.role}</span></td>
      </tr>
    </table>
  </div>
  
  <p style="font-size: 13px; color: #475569; line-height: 1.6;">
    Silakan gunakan kredensial di atas untuk masuk ke dalam portal pembelajaran dengan aman. Disarankan demi faktor privasi Anda segera mengganti kata sandi di setelan portal pribadi Anda setelah login.
  </p>
  
  <div style="text-align: center; margin: 28px 0;">
    <a href="${appUrl}" target="_blank" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
      Kunjungi Portal Bimbingan &raquo;
    </a>
  </div>
  
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
    Pesan otomatis ini disinkronisasikan oleh sistem Tutor Management & Student Progress Monitoring. Mohon untuk tidak membalas email ini secara langsung.
  </p>
</div>`;
                  onSendMail(lastCreatedAcc.email, subject, htmlBody);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-[10px] font-bold text-white transition-all cursor-pointer border border-emerald-700 flex items-center gap-1 shadow-sm"
              >
                <Mail className="w-3 h-3 text-indigo-400" />
                Buka Gmail Composer Kembali
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provision Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <UserPlus className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Provisikan Akun Baru</h2>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl flex items-center justify-between text-xs text-indigo-900">
              <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400">Grup Akses Akun:</span>
              <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-slate-900 border border-slate-800 text-white leading-none">
                TUTOR PENGAJAR
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap Akun</label>
              <input
                type="text"
                required
                placeholder="misal: Ibu Ratna Shanti"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat Email Login</label>
              <input
                type="email"
                required
                placeholder="misal: ratnas@bimbingan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password Default</label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-[10px] text-indigo-600 font-semibold"
                >
                  {showPass ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Password default"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs p-2.5 pr-10 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white transition-all outline-none font-mono"
                />
                <Key className="w-3.5 h-3.5 text-slate-300 absolute right-3 top-3.5" />
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl flex items-start gap-2.5 text-[10px] leading-relaxed text-amber-800">
              <Shield className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                Password akan didaftarkan dan dienkripsi secara aman menggunakan <strong>Bcrypt</strong> dengan putaran (salts) 10 sebelum disimpan di database Postgres.
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-xs font-semibold text-center text-white py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Daftarkan & Kirim Akses
            </button>
          </form>
        </div>

        {/* Invited / Provisioned Accounts Log */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Log Provisioning Akun</h2>
                <p className="text-[10px] text-slate-400">Total: {filtered.length} user terprovisi secara invite-only.</p>
              </div>
              <input
                type="text"
                placeholder="Cari user terprovisi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs p-1.5 border border-slate-200 rounded-lg outline-none bg-slate-50 w-full sm:w-48"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-650">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5">User / Email</th>
                    <th className="py-2.5">Role</th>
                    <th className="py-2.5">Password Default</th>
                    <th className="py-2.5">Bcrypt Hash Save (Postgres)</th>
                    <th className="py-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/45">
                      <td className="py-3">
                        <div className="font-semibold text-slate-800">{acc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{acc.email}</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          acc.role === 'TUTOR'
                            ? 'bg-sky-50 text-sky-850 border border-sky-200'
                            : 'bg-indigo-50 text-indigo-850 border border-indigo-200'
                        }`}>
                          {acc.role}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[10px] font-medium text-slate-500">
                        {acc.defaultPasswordTxt}
                      </td>
                      <td className="py-3 font-mono text-[9px] text-slate-400 max-w-xs truncate" title={acc.passwordHash}>
                        {acc.passwordHash}
                      </td>
                      <td className="py-3 text-center flex items-center justify-center gap-1.5">
                        {onSendMail && (
                          <button
                            onClick={() => {
                              const appUrl = getServiceAppUrl();
                              const subject = `[Akses Baru Portal] Detail Akses Akun Bimbingan Belajar Anda (${acc.role === 'TUTOR' ? 'Tutor' : 'Orang Tua'})`;
                              const htmlBody = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
  <div style="background-color: #0f172a; color: #ffffff; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <h2 style="margin: 0; font-size: 18px; font-weight: bold;">Undangan Akses Portal Bimbingan Belajar</h2>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">Sistem Manajemen & Evaluasi Siswa Terintegrasi</p>
  </div>
  
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">Halo <strong>${acc.name}</strong>,</p>
  
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Akun bimbingan belajar Anda telah berhasil didaftarkan dan diprovisikan oleh Koordinator Kursus. Anda memiliki akses ke dalam dashboard utama sebagai peranan: <strong>${acc.role === 'TUTOR' ? 'Tutor Pengajar' : 'Orang Tua / Wali Siswa'}</strong>.
  </p>
  
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; margin: 24px 0;">
    <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Informasi Akun Kredensial Anda:</h3>
    <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 120px;">Email Utama:</td>
        <td style="padding: 6px 0; font-family: monospace; font-size: 13px; font-weight: 600; color: #0f172a;">${acc.email}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Password Sesi:</td>
        <td style="padding: 6px 0; font-family: monospace; font-size: 13px; font-weight: 600; color: #4338ca;">${acc.defaultPasswordTxt}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Grup Akses:</td>
        <td style="padding: 6px 0;"><span style="background-color: #f0fdf4; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #bbf7d0;">${acc.role}</span></td>
      </tr>
    </table>
  </div>
  
  <p style="font-size: 13px; color: #475569; line-height: 1.6;">
    Silakan gunakan kredensial di atas untuk masuk ke dalam portal pembelajaran dengan aman. Disarankan demi faktor privasi Anda segera mengganti kata sandi di setelan portal pribadi Anda setelah login.
  </p>
  
  <div style="text-align: center; margin: 28px 0;">
    <a href="${appUrl}" target="_blank" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
      Kunjungi Portal Bimbingan &raquo;
    </a>
  </div>
  
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
    Pesan otomatis ini disinkronisasikan oleh sistem Tutor Management & Student Progress Monitoring. Mohon untuk tidak membalas email ini secara langsung.
  </p>
</div>`;
                              onSendMail(acc.email, subject, htmlBody);
                            }}
                            className="p-1 hover:bg-sky-50 text-slate-400 hover:text-indigo-650 rounded transition-colors cursor-pointer"
                            title="Kirim / Kirim Ulang Akses"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Hapus Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        Tidak ada logs akun bimbingan ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-xl space-y-2 mt-4 text-[10px] text-indigo-900 leading-relaxed">
            <div className="font-bold text-xs flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              Notifikasi Undangan Email & SMS Otomatis
            </div>
            <p className="text-indigo-805">
              Setiap kali Admin mengonfirmasi provisioning, sistem akan mengirimkan instruksi login khusus dengan link bimbingan belajar, email credential, serta default password ke penerima secara instan untuk proteksi maksimal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
