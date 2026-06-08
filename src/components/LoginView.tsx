import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, ShieldAlert, Sparkles, Info, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { AccountProvision } from './UserAccountsView';

interface LoginViewProps {
  onLoginSuccess: (session: {
    email: string;
    name: string;
    role: 'admin' | 'tutor';
    refId?: string; // matching tutor or member ID
  }) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [showDemoAcc, setShowDemoAcc] = useState(true);

  // Retrieve accounts from localStorage
  const getAccounts = (): AccountProvision[] => {
    const fallbackList: AccountProvision[] = [
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

    const saved = localStorage.getItem('provisioned_users_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Combine fallback and saved ensuring unique emails
        const combined = [...parsed];
        fallbackList.forEach(fb => {
          if (!combined.some(c => c.email.toLowerCase() === fb.email.toLowerCase())) {
            combined.push(fb);
          }
        });
        return combined;
      } catch (e) {
        return fallbackList;
      }
    }
    return fallbackList;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    // 1. Direct Admin Login check
    if (
      (inputEmail === 'admin@bimbingan.com' && inputPass === 'admin123') ||
      (inputEmail === 'admin' && inputPass === 'admin')
    ) {
      onLoginSuccess({
        email: 'admin@bimbingan.com',
        name: 'Administrator',
        role: 'admin',
      });
      return;
    }

    // 2. Custom accounts lookup
    const allAccounts = getAccounts();
    const match = allAccounts.find(acc => acc.email.toLowerCase() === inputEmail);

    if (match) {
      if (match.defaultPasswordTxt === inputPass) {
        // Successful login
        onLoginSuccess({
          email: match.email,
          name: match.name,
          role: 'tutor', // Parent login is removed, default to tutor
          refId: match.id,
        });
        return;
      } else {
        setErrorStatus('Kata sandi yang Anda masukkan salah. Silakan coba kembali.');
        return;
      }
    }

    setErrorStatus('Alamat email belum terdaftar dalam sistem bimbingan belajar.');
  };

  const handleInstantLogin = (roleType: 'admin' | 'tutor', mockEmail: string, mockPass: string) => {
    setEmail(mockEmail);
    setPassword(mockPass);
    setErrorStatus(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased" id="portal-login-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <span className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <GraduationCap className="h-10 w-10" />
          </span>
        </div>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Portal Bimbingan Belajar
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500 max-w-sm mx-auto">
          Sistem Manajemen, Absensi QR & Evaluasi Terintegrasi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200/80 shadow-md sm:rounded-2xl sm:px-10 space-y-6">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {errorStatus && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-shake">
                <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{errorStatus}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Email Login</label>
              <input
                type="text"
                required
                placeholder="cth: tutor.budi@bimbingan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 focus:border-indigo-500 bg-slate-50 rounded-xl focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kata Sandi Sesi</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                >
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs p-3 pr-10 border border-slate-200 focus:border-indigo-500 bg-slate-50 rounded-xl focus:bg-white transition-all outline-none font-mono"
                />
                {showPassword ? (
                  <EyeOff
                    onClick={() => setShowPassword(false)}
                    className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 cursor-pointer"
                  />
                ) : (
                  <Eye
                    onClick={() => setShowPassword(true)}
                    className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 cursor-pointer"
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer mt-2"
            >
              Masuk ke Dashboard Portal
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          {showDemoAcc && (
            <div className="pt-4 border-t border-slate-100 space-y-3.5">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setShowDemoAcc(true)}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Demo Kredensial Pengujian</span>
                </div>
                <span className="p-1 text-[9px] bg-slate-100 text-slate-500 rounded font-semibold">Aktif</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Admin Option */}
                <button
                  type="button"
                  onClick={() => handleInstantLogin('admin', 'admin@bimbingan.com', 'admin123')}
                  className="w-full text-left p-2.5 rounded-xl border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all text-xs flex justify-between items-center group cursor-pointer"
                >
                  <div>
                    <span className="font-semibold text-indigo-700 block text-[10px] uppercase">Rujukan 1: KOORDINATOR / ADMIN</span>
                    <span className="text-[9px] text-slate-400 font-mono">admin@bimbingan.com / admin123</span>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-600 group-hover:underline">Gunakan</span>
                </button>

                {/* Tutor Option */}
                <button
                  type="button"
                  onClick={() => handleInstantLogin('tutor', 'tutor.budi@bimbingan.com', 'TutorBudi2026!')}
                  className="w-full text-left p-2.5 rounded-xl border border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/20 transition-all text-xs flex justify-between items-center group cursor-pointer"
                >
                  <div>
                    <span className="font-semibold text-sky-700 block text-[10px] uppercase">Rujukan 2: TUTOR PENGAJAR</span>
                    <span className="text-[9px] text-slate-400 font-mono">tutor.budi@bimbingan.com / TutorBudi2026!</span>
                  </div>
                  <span className="text-[9px] font-bold text-sky-600 group-hover:underline">Gunakan</span>
                </button>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl flex items-start gap-1.5 text-[9px] leading-relaxed text-indigo-850">
                <Info className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  Kredensial di atas disinkronisasi langsung dari database rujukan lokal Anda. Anda juga dapat menggunakan akun kustom mana pun yang baru saja Anda buat di tab <strong>Provision Akun</strong> untuk menguji hak akses terbagi secara dinamis.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
