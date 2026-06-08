import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  CircleDollarSign,
  Share2,
  RefreshCw,
  LogOut,
  Sparkles,
  QrCode,
  ShieldCheck,
  BookOpen,
  Award,
  FileText
} from 'lucide-react';
import { User } from 'firebase/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  onLogin: () => void;
  isSyncingSheets: boolean;
  sheetsLinked: boolean;
  onSyncNow: () => void;
  userRole?: 'admin' | 'tutor';
  customUser?: { name: string; email: string } | null;
  onCustomLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  onLogin,
  isSyncingSheets,
  sheetsLinked,
  onSyncNow,
  userRole = 'admin',
  customUser,
  onCustomLogout,
}: SidebarProps) {
  return (
    <div className="w-64 bg-slate-900 text-slate-150 flex flex-col h-screen border-r border-slate-800" id="sidebar-panel">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-sky-400" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Kursus App</h1>
            <p className="text-xs text-slate-400">Manajemen Kursusan</p>
          </div>
        </div>
      </div>

      {/* Navigation based on userRole */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {userRole === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id="nav-dashboard"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('member')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'member'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id="nav-member"
            >
              <Users className="h-5 w-5" />
              Data Member
            </button>

            <button
              onClick={() => setActiveTab('tutor')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tutor'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id="nav-tutor"
            >
              <GraduationCap className="h-5 w-5" />
              Tutor & Absensi
            </button>

            <button
              onClick={() => setActiveTab('sesi')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sesi'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id="nav-sesi"
            >
              <CalendarCheck className="h-5 w-5" />
              Sesi Les
            </button>

            <button
              onClick={() => setActiveTab('qr_absen')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'qr_absen'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id="nav-qr-absen"
            >
              <QrCode className="h-5 w-5" />
              Absensi QR Code
            </button>

            <button
              onClick={() => setActiveTab('keuangan')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'keuangan'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id="nav-keuangan"
            >
              <CircleDollarSign className="h-5 w-5" />
              Catatan Keuangan
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'workspace'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id="nav-workspace"
            >
              <Share2 className="h-5 w-5" />
              Workspace Sync
            </button>

            <button
              onClick={() => setActiveTab('provision_user')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'provision_user'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id="nav-provision-user"
            >
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              Provision Akun (Admin)
            </button>
          </>
        )}

        {userRole === 'tutor' && (
          <>
            <button
              onClick={() => setActiveTab('portal_tutor')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'portal_tutor'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id="nav-tutor-portal"
            >
              <BookOpen className="h-5 w-5 text-sky-400" />
              Tutor Portal
            </button>

            <button
              onClick={() => setActiveTab('qr_absen')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'qr_absen'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              id="nav-qr-absen"
            >
              <QrCode className="h-5 w-5" />
              Scan QR Absen
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('proposal_dokumen')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all print:hidden ${
            activeTab === 'proposal_dokumen'
              ? 'bg-indigo-600 text-white shadow-md font-bold'
              : 'text-amber-400 hover:bg-slate-800/80 hover:text-amber-300'
          }`}
          id="nav-proposal-view"
        >
          <FileText className="h-5 w-5" />
          Proposal & Manual
        </button>
      </nav>

      {/* Sync Status Button if linked */}
      {userRole === 'admin' && user && sheetsLinked && (
        <div className="px-4 py-2">
          <button
            onClick={onSyncNow}
            disabled={isSyncingSheets}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-teal-800/50 hover:bg-teal-700/60 disabled:bg-slate-800 border border-teal-600/30 rounded-lg text-xs font-medium text-teal-200 transition-all cursor-pointer"
            id="quick-sync-btn"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
            {isSyncingSheets ? 'Menyinkronkan...' : 'Sinkron Google Sheet'}
          </button>
        </div>
      )}

      {/* User Connection Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/45 space-y-3.5">
        {/* Custom Application User Session Info */}
        {customUser && (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div>
              <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Aktivasi Sesi:</p>
              <p className="text-xs font-semibold text-white truncate">{customUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{customUser.email}</p>
            </div>
            <button
              onClick={onCustomLogout}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/30 text-rose-300 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              id="applet-logout-btn"
            >
              <LogOut className="h-3 w-3 text-rose-400" />
              Log Out Aplikasi
            </button>
          </div>
        )}

        {/* Administrator Google Integration Details */}
        {userRole === 'admin' && (
          <div className="pt-2 border-t border-slate-800/80">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'OAuth User'}
                      className="h-8 w-8 rounded-full border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.displayName || 'Google User'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 hover:bg-red-950/30 border border-transparent hover:border-red-900/30 text-red-400 hover:text-red-350 rounded-md text-[10px] font-medium transition-all cursor-pointer"
                  id="google-logout-btn"
                >
                  <RefreshCw className="h-3 w-3" />
                  Putus Google Drive
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="p-1 px-2 rounded-full bg-slate-800 text-[10px] text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> Workspace Offline
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">Hubungkan akun Google Coordinator untuk sync GSheets & Gmail.</p>
                <button
                  onClick={onLogin}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-[10px] font-bold cursor-pointer transition-all shadow-sm"
                  id="google-login-sidebar"
                >
                  Hubungkan Google
                </button>
                {window.self !== window.top && (
                  <p className="text-[9px] text-amber-400 mt-1.5 leading-normal">
                    Iframe memblokir login popup. Klik <strong>'Buka di Tab Baru'</strong> di pratinjau Anda untuk menghubungkan.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
