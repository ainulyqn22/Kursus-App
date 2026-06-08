import React, { useState, useEffect } from 'react';
import { Tutor, Member, Sesi, SessionLog, SyllabusMilestone, AssessmentScore, TutorClock } from '../types';
import { Clock, BookOpen, AlertTriangle, CheckCircle, Plus, Info, Award, Calendar, Layers, MapPin, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

interface TutorPortalViewProps {
  tutors: Tutor[];
  members: Member[];
  sesi: Sesi[];
  sessionLogs: SessionLog[];
  syllabusMilestones: SyllabusMilestone[];
  assessmentScores: AssessmentScore[];
  tutorClocks: TutorClock[];
  onAddClockIn: (tutorId: string) => void;
  onAddClockOut: (clockId: string) => void;
  onAddSessionLog: (log: Omit<SessionLog, 'id'>) => void;
  onUpdateMilestoneStatus: (id: string, newStatus: SyllabusMilestone['status']) => void;
  onAddMilestone: (m: Omit<SyllabusMilestone, 'id'>) => void;
  onAddAssessmentScore: (score: Omit<AssessmentScore, 'id'>) => void;
  onDeleteAssessmentScore: (id: string) => void;
  customUser?: { name: string; email: string } | null;
}

export default function TutorPortalView({
  tutors,
  members,
  sesi,
  sessionLogs,
  syllabusMilestones,
  assessmentScores,
  tutorClocks,
  onAddClockIn,
  onAddClockOut,
  onAddSessionLog,
  onUpdateMilestoneStatus,
  onAddMilestone,
  onAddAssessmentScore,
  onDeleteAssessmentScore,
  customUser,
}: TutorPortalViewProps) {
  // Active selected tutor in sandbox mode
  const [activeTutorId, setActiveTutorId] = useState<string>(tutors[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'jurnal' | 'syllabus' | 'assessment'>('attendance');

  // Auto-focus tutor if custom account logged in
  useEffect(() => {
    if (customUser) {
      const found = tutors.find(t => 
        t.nama.toLowerCase().includes(customUser.name.toLowerCase()) ||
        customUser.name.toLowerCase().includes(t.nama.toLowerCase()) ||
        t.hp === customUser.email
      );
      if (found) {
        setActiveTutorId(found.id);
      }
    }
  }, [customUser, tutors]);

  // Form states inside components
  const [selectedStudentId, setSelectedStudentId] = useState<string>(members[0]?.id || '');
  const [materiTitle, setMateriTitle] = useState('');
  const [pemahamanLevel, setPemahamanLevel] = useState<number>(3);
  const [catatanText, setCatatanText] = useState('');

  // Milestone Form
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  // Score Form
  const [scoreStudentId, setScoreStudentId] = useState<string>(members[0]?.id || '');
  const [examName, setExamName] = useState('');
  const [scoreVal, setScoreVal] = useState<number>(80);
  const [scoreDate, setScoreDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const activeTutor = tutors.find(t => t.id === activeTutorId);

  // Find active clock for today
  const todayStr = new Date().toISOString().split('T')[0];
  const activeClock = tutorClocks.find(c => c.tutorId === activeTutorId && !c.clockOut);

  // Filter sessions (Today)
  const tutorSesiToday = sesi.filter(s => s.tutorId === activeTutorId && s.tgl === todayStr);

  // Checks if tutor needs to fill out Jurnal Kelas before Clock-out
  // Tutor has sessions scheduled for today, let's verify if each today's session has a corresponding SessionLog
  const incompleteJournalsToday = tutorSesiToday.filter(s => {
    // Check if there is already a log for this student and tutor today
    return !sessionLogs.some(log => log.tutorId === activeTutorId && log.siswaId === s.memberId && log.tgl === todayStr);
  });

  const isClockOutBlocked = activeClock && incompleteJournalsToday.length > 0;

  // Handles adding syllabus topic
  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !selectedStudentId) return;
    onAddMilestone({
      siswaId: selectedStudentId,
      topik: newMilestoneTitle.trim(),
      status: 'Belum Mulai'
    });
    setNewMilestoneTitle('');
  };

  // Handles adding quiz assessment score
  const handleCreateScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !scoreStudentId) return;
    onAddAssessmentScore({
      siswaId: scoreStudentId,
      ujianNama: examName.trim(),
      nilai: scoreVal,
      tgl: scoreDate
    });
    setExamName('');
    setScoreVal(85);
  };

  // Handles Clock-out action
  const handleClockOutAttempt = () => {
    if (isClockOutBlocked) {
      alert(`⚠️ Jam pulang (Clock-Out) diblokir!\n\nAnda harus mengisi 'Jurnal Kelas' terlebih dahulu untuk ${incompleteJournalsToday.length} siswa hari ini.`);
      return;
    }
    if (activeClock) {
      onAddClockOut(activeClock.id);
    }
  };

  return (
    <div className="space-y-6" id="tutor-portal-view">
      {/* Header with Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse"></span>
            Portal Pengajar (Tutor Mode)
          </div>
          <h1 className="text-xl font-bold tracking-tight">Hai, Pengajar Mandiri!</h1>
          <p className="text-slate-400 text-xs mt-0.5">Kelola clock-in/out, jurnal kelas harian, dan pantau kurikulum siswa di sini.</p>
        </div>

        {customUser ? (
          <div className="text-right">
            <span className="text-[10px] text-sky-450 uppercase font-bold block tracking-wider">Tutor Terverifikasi</span>
            <span className="text-xs font-bold text-white bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-xl block mt-0.5">{activeTutor?.nama || customUser.name} — {activeTutor?.mapel || 'Pengajar'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold leading-normal whitespace-nowrap">Masuk sebagai:</label>
            <select
              value={activeTutorId}
              onChange={(e) => {
                setActiveTutorId(e.target.value);
              }}
              className="text-white text-xs font-semibold bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl focus:border-sky-500 focus:outline-none cursor-pointer"
            >
              {tutors.map(t => (
                <option key={t.id} value={t.id}>{t.nama} — {t.mapel}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeTutor ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Navigasi Portal</p>
            <button
              onClick={() => setActiveSubTab('attendance')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'attendance'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className="h-4 w-4" />
              Clock In / out
              {incompleteJournalsToday.length > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                  {incompleteJournalsToday.length} Log
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('jurnal')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'jurnal'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Jurnal Kelas / Sesi
            </button>

            <button
              onClick={() => setActiveSubTab('syllabus')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'syllabus'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="h-4 w-4" />
              Milestone Silabus
            </button>

            <button
              onClick={() => setActiveSubTab('assessment')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'assessment'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="h-4 w-4" />
              Evaluasi & Kuis
            </button>
          </div>

          {/* Sub Panels Container */}
          <div className="lg:col-span-3">
            {/* Tab 1: Attendance Clock In / out */}
            {activeSubTab === 'attendance' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-sky-500" />
                    Mesin Kehadiran Mandiri Tutor
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Lakukan Clock-In saat bimbingan dimulai dan Clock-Out ketika seluruh jurnal bimbingan hari ini selesai.</p>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-b border-slate-100 my-5">
                    <div className="text-center md:text-left">
                      <p className="text-xs text-slate-400 font-medium">Hari ini, Tanggal {todayStr}</p>
                      <div className="text-xl font-bold text-slate-800 mt-1 flex items-center gap-2 justify-center md:justify-start">
                        {activeClock ? (
                          <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
                        ) : (
                          <span className="inline-flex h-3 w-3 rounded-full bg-slate-300"></span>
                        )}
                        <span>{activeClock ? 'Sedang Mengajar' : 'Offline / Standby'}</span>
                      </div>
                      {activeClock && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Masuk pukul: <strong className="font-semibold text-slate-700">{new Date(activeClock.clockIn).toLocaleTimeString('id-ID')} WIB</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4">
                      {!activeClock ? (
                        <button
                          onClick={() => {
                            onAddClockIn(activeTutorId);
                          }}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Clock className="w-4 w-4" />
                          Clock-In Sekarang
                        </button>
                      ) : (
                        <button
                          onClick={handleClockOutAttempt}
                          className={`px-6 py-3 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                            isClockOutBlocked
                              ? 'bg-slate-400 hover:bg-slate-500'
                              : 'bg-rose-600 hover:bg-rose-500'
                          }`}
                        >
                          <LogOutIcon />
                          Clock-Out Pulang
                        </button>
                      )}
                    </div>
                  </div>

                  {isClockOutBlocked && (
                    <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div className="text-xs text-amber-850">
                        <p className="font-bold">Clock-Out Masih Terkunci! ({incompleteJournalsToday.length} Jurnal Belum Diisi)</p>
                        <p className="text-slate-600 mt-0.5">Sesuai aturan operasional, Anda diwajibkan menulis Jurnal Kelas (Session Log) untuk seluruh siswa hari ini sebelum diperkenankan Clock-Out.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sesi & Jurnal Kelas Hari Ini */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Kelas Mandiri Hari Ini ({tutorSesiToday.length})</h3>

                  {tutorSesiToday.length > 0 ? (
                    <div className="space-y-4">
                      {tutorSesiToday.map(s => {
                        const m = members.find(val => val.id === s.memberId);
                        const hasLog = sessionLogs.some(log => log.tutorId === activeTutorId && log.siswaId === s.memberId && log.tgl === todayStr);

                        return (
                          <div key={s.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold text-slate-850">{m?.nama || 'Siswa Tanpa Nama'}</p>
                              <p className="text-[11px] text-slate-500 mt-1">Kelas: {m?.kelas || '—'} | Mata Pelajaran: {s.mapel} | Durasi: {s.durasi} menit</p>
                            </div>
                            <div>
                              {hasLog ? (
                                <span className="inline-flex items-center gap-1.5 py-1 px-3.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">
                                  <CheckCircle className="h-3 w-3" /> Jurnal Terisi
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedStudentId(s.memberId);
                                    setActiveSubTab('jurnal');
                                    showFormAlert();
                                  }}
                                  className="py-1.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Tulis Jurnal Kelas
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-slate-400 text-xs bg-slate-25 rounded-xl border border-dashed border-slate-200">
                      Tidak ada kelas terjadwal untuk hari ini ({todayStr}).
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: New Session Log / Jurnal Bimbingan */}
            {activeSubTab === 'jurnal' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-sky-500" />
                    Penulisan Jurnal Kelas (Session Log)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Catat rangkuman materi dan tingkat pemahaman siswa pada bimbingan hari ini.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!selectedStudentId || !materiTitle.trim()) {
                      alert('Harap masukkan nama siswa dan materi pembahasan!');
                      return;
                    }
                    onAddSessionLog({
                      siswaId: selectedStudentId,
                      tutorId: activeTutorId,
                      tgl: todayStr,
                      materi: materiTitle,
                      pemahaman: pemahamanLevel,
                      catatan: catatanText
                    });

                    // Clear
                    setMateriTitle('');
                    setPemahamanLevel(3);
                    setCatatanText('');
                    alert('✅ Jurnal Berhasil disimpan!');
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Siswa / Peserta Didik *</label>
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:bg-white text-slate-800"
                      >
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{m.nama} ({m.kelas})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Tingkat Pemahaman Siswa (1 - 5) *</label>
                      <div className="flex items-center gap-2.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setPemahamanLevel(star)}
                            className={`p-2 rounded-lg text-xs font-bold transition-all border ${
                              pemahamanLevel === star
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            ⭐ {star}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Materi Yang Diajarkan *</label>
                    <input
                      type="text"
                      value={materiTitle}
                      onChange={(e) => setMateriTitle(e.target.value)}
                      placeholder="Contoh: Pemfaktoran Aljabar Linear, Grammar Simple Past tense, dll"
                      className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Catatan Khusus Bimbingan / PR</label>
                    <textarea
                      value={catatanText}
                      onChange={(e) => setCatatanText(e.target.value)}
                      placeholder="Contoh: Siswa cukup memahami materi, namun perlu latihan PR halaman 22 nomor 1 sampai 5."
                      rows={3}
                      className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white text-slate-800"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="h-4 w-4" /> Simpan Jurnal Sesi Kelas
                  </button>
                </form>

                {/* Riwayat Log Jurnal Pengajar Ini */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Riwayat Jurnal Kamu ({sessionLogs.filter(l => l.tutorId === activeTutorId).length})</h3>
                  <div className="space-y-3">
                    {sessionLogs.filter(l => l.tutorId === activeTutorId).length > 0 ? (
                      [...sessionLogs].filter(l => l.tutorId === activeTutorId).reverse().map(log => {
                        const m = members.find(val => val.id === log.siswaId);
                        return (
                          <div key={log.id} className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-850">{m?.nama || 'Siswa'}</span>
                              <span className="text-[10px] text-slate-400">{log.tgl}</span>
                            </div>
                            <p className="text-slate-700 font-semibold mt-1">Bahasan: <span className="font-normal text-slate-600">{log.materi}</span></p>
                            <p className="text-slate-600">Pemahaman: <span className="text-amber-500 font-bold">⭐ {log.pemahaman} / 5</span></p>
                            {log.catatan && <p className="text-slate-400 mt-1 italic">Notes: "{log.catatan}"</p>}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-400 text-xs italic">Belum ada jurnal bimbingan tersimpan.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Syllabus Milestone Tracker (Kanban Board) */}
            {activeSubTab === 'syllabus' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-sky-500" />
                    Syllabus Milestones Tracker
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Pantau, tambah, dan tandai target pembahasan silabus kurikulum untuk setiap siswa.</p>
                </div>

                {/* Filters student milestones */}
                <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="w-full md:w-auto text-xs font-bold text-slate-600 leading-normal">Pilih Rincian Siswa:</div>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="flex-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.nama} — {m.kelas}</option>
                    ))}
                  </select>
                </div>

                {/* Form to add quick milestone */}
                <form onSubmit={handleCreateMilestone} className="flex gap-2.5">
                  <input
                    type="text"
                    required
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="Masukkan nama topik baru (contoh: Integral Tentu, Tenses Review)"
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:bg-slate-50 text-slate-800"
                  />
                  <button
                    type="submit"
                    className="py-1 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Topik
                  </button>
                </form>

                {/* Kanban Swimlanes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1: Not Started */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Belum Mulai</h4>
                    </div>
                    <div className="space-y-2">
                      {getMilestonesFiltered('Belum Mulai').length > 0 ? (
                        getMilestonesFiltered('Belum Mulai').map(mil => (
                          <div key={mil.id} className="p-3 bg-white border border-slate-200/80 rounded-lg text-xs shadow-xs space-y-2">
                            <p className="font-semibold text-slate-800">{mil.topik}</p>
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => onUpdateMilestoneStatus(mil.id, 'Sedang Berjalan')}
                                className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md font-semibold hover:bg-sky-100 flex items-center"
                              >
                                Mulai <ChevronRight className="h-3 w-3 inline" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 italic py-4 text-center">Kosong</p>
                      )}
                    </div>
                  </div>

                  {/* Column 2: In Progress */}
                  <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-amber-805">Sedang Berjalan</h4>
                    </div>
                    <div className="space-y-2">
                      {getMilestonesFiltered('Sedang Berjalan').length > 0 ? (
                        getMilestonesFiltered('Sedang Berjalan').map(mil => (
                          <div key={mil.id} className="p-3 bg-white border border-rose-100/50 rounded-lg text-xs shadow-xs space-y-2">
                            <p className="font-semibold text-slate-800">{mil.topik}</p>
                            <div className="flex justify-between items-center">
                              <button
                                onClick={() => onUpdateMilestoneStatus(mil.id, 'Belum Mulai')}
                                className="text-[10px] text-slate-500 hover:text-slate-700 flex items-center"
                              >
                                <ChevronLeft className="h-3 w-3" /> Batalkan
                              </button>
                              <button
                                onClick={() => onUpdateMilestoneStatus(mil.id, 'Selesai Dikuasai')}
                                className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold hover:bg-emerald-100 flex items-center"
                              >
                                Mastered <ChevronRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 italic py-4 text-center">Kosong</p>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Mastered */}
                  <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-emerald-805">Selesai Dikuasai</h4>
                    </div>
                    <div className="space-y-2">
                      {getMilestonesFiltered('Selesai Dikuasai').length > 0 ? (
                        getMilestonesFiltered('Selesai Dikuasai').map(mil => (
                          <div key={mil.id} className="p-3 bg-white border border-emerald-200/50 rounded-lg text-xs shadow-xs space-y-2">
                            <p className="font-semibold text-slate-800 flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span>{mil.topik}</span>
                            </p>
                            <div className="flex justify-start">
                              <button
                                onClick={() => onUpdateMilestoneStatus(mil.id, 'Sedang Berjalan')}
                                className="text-[10px] text-slate-500 hover:text-slate-700"
                              >
                                <ChevronLeft className="h-3 w-3 inline" /> Aktifkan Lagi
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 italic py-4 text-center">Kosong</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Evaluation Quiz Score Assessment Tracker */}
            {activeSubTab === 'assessment' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="h-4 w-4 text-sky-500" />
                    Evaluasi & Grafik Nilai Siswa
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Input nilai ujian, kuis, atau tryout berkala untuk melihat perkembangan hasil studi siswa.</p>
                </div>

                <form onSubmit={handleCreateScore} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Input Nilai Baru</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Siswa *</label>
                      <select
                        value={scoreStudentId}
                        onChange={(e) => setScoreStudentId(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                      >
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{m.nama}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nama Ujian / Bab *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kuis Trigonometri"
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nilai (0-100) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={100}
                        value={scoreVal}
                        onChange={(e) => setScoreVal(Number(e.target.value))}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 flex items-end">
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Simpan Nilai
                      </button>
                    </div>
                  </div>
                </form>

                {/* Score Listing */}
                <div className="pt-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tabel Record Nilai Evaluasi</h3>
                  <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-3 font-semibold text-slate-500">Tanggal</th>
                          <th className="p-3 font-semibold text-slate-500">Nama Siswa</th>
                          <th className="p-3 font-semibold text-slate-500">Jenis Evaluasi</th>
                          <th className="p-3 font-semibold text-slate-550 text-center">Skor Akhir</th>
                          <th className="p-3 font-semibold text-slate-500 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assessmentScores.length > 0 ? (
                          [...assessmentScores].reverse().map(sc => {
                            const m = members.find(val => val.id === sc.siswaId);
                            return (
                              <tr key={sc.id} className="hover:bg-slate-50/50">
                                <td className="p-3 text-slate-400">{sc.tgl}</td>
                                <td className="p-3 font-semibold text-slate-800">{m?.nama || 'Siswa'}</td>
                                <td className="p-3 text-slate-600">{sc.ujianNama}</td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                                    sc.nilai >= 80
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                      : sc.nilai >= 60
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                                  }`}>
                                    {sc.nilai}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => onDeleteAssessmentScore(sc.id)}
                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors text-[10px]"
                                  >
                                    Hapus
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center py-6 text-slate-400 italic">Belum ada record skor evaluasi.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl p-8 text-center text-slate-505 font-medium">
          ⚠️ Mohon daftarkan minimal 1 Tutor di halaman utama terlebih dahulu untuk mengaktifkan portal pengajar.
        </div>
      )}
    </div>
  );

  function getMilestonesFiltered(status: SyllabusMilestone['status']) {
    return syllabusMilestones.filter(mil => mil.siswaId === selectedStudentId && mil.status === status);
  }

  function showFormAlert() {
    setTimeout(() => {
      const el = document.getElementById('materi-title-input');
      if (el) el.focus();
    }, 100);
  }
}

// Minimal placeholder
function LogOutIcon() {
  return (
    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
