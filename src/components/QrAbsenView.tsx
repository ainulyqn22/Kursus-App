import React, { useState, useEffect, useRef } from 'react';
import { Member, Tutor, Sesi, Absen } from '../types';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Camera,
  Download,
  CheckCircle,
  Calendar,
  User,
  GraduationCap,
  X,
  AlertTriangle,
  Info,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  Printer
} from 'lucide-react';

interface QrAbsenViewProps {
  members: Member[];
  tutors: Tutor[];
  sesi: Sesi[];
  absensi: Absen[];
  onAddSesi: (session: Omit<Sesi, 'id'>) => void;
  onAddAbsen: (absen: Omit<Absen, 'id'>) => void;
  onUpdateSesiStatus: (id: string, newStatus: Sesi['status']) => void;
}

interface ScanLog {
  time: string;
  name: string;
  role: 'Siswa' | 'Tutor';
  status: string;
  type: 'success' | 'warning' | 'info';
}

export default function QrAbsenView({
  members,
  tutors,
  sesi,
  absensi,
  onAddSesi,
  onAddAbsen,
  onUpdateSesiStatus,
}: QrAbsenViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'scan' | 'generate'>('scan');

  // Sound Config
  const [soundEnabled, setSoundEnabled] = useState(true);

  // QR Generate States
  const [selectedItemType, setSelectedItemType] = useState<'siswa' | 'tutor'>('siswa');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // QR Scan States
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);

  // Scan Action Flow States
  const [detectedItem, setDetectedItem] = useState<{
    type: 'member' | 'tutor';
    id: string;
    name: string;
    detail: string;
    data: any;
  } | null>(null);

  // Instant Sesi Form States (for student scanned without active session)
  const [instantTutorId, setInstantTutorId] = useState(tutors[0]?.id || '');
  const [instantMapel, setInstantMapel] = useState('');
  const [instantDurasi, setInstantDurasi] = useState(60);

  // Reference to Hhtml5Qrcode instance
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // ------------------------- Auditory Feedback -------------------------
  const playBeep = (freq = 800, duration = 0.12, repeatCount = 1) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playOne = (timeOffset = 0) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime + timeOffset);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + parseFloat(duration.toString()) + timeOffset);
        oscillator.start(audioCtx.currentTime + timeOffset);
        oscillator.stop(audioCtx.currentTime + parseFloat(duration.toString()) + timeOffset);
      };

      for (let i = 0; i < repeatCount; i++) {
        playOne(i * 0.15);
      }
    } catch (err) {
      console.error('Audio synthesizer beep failed:', err);
    }
  };

  // ------------------------- QR Code Generation -------------------------
  useEffect(() => {
    if (activeSubTab === 'generate' && qrCanvasRef.current && selectedItemId) {
      const formattedValue = `${selectedItemType === 'siswa' ? 'MEMBER' : 'TUTOR'}_QR:${selectedItemId}`;
      QRCode.toCanvas(
        qrCanvasRef.current,
        formattedValue,
        {
          width: 180,
          margin: 1,
          color: {
            dark: '#1e293b', // slate-800
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Failed to generate offline QR Canvas:', error);
        }
      );
    }
  }, [activeSubTab, selectedItemId, selectedItemType]);

  // Handle Item select defaults
  useEffect(() => {
    if (selectedItemType === 'siswa') {
      const activeMembers = members.filter(m => m.status === 'Aktif');
      const filtered = activeMembers.filter(m => m.nama.toLowerCase().includes(searchQuery.toLowerCase()));
      if (filtered.length > 0) {
        setSelectedItemId(filtered[0].id);
      } else {
        setSelectedItemId('');
      }
    } else {
      const activeTutors = tutors.filter(t => t.status === 'Aktif');
      const filtered = activeTutors.filter(t => t.nama.toLowerCase().includes(searchQuery.toLowerCase()));
      if (filtered.length > 0) {
        setSelectedItemId(filtered[0].id);
      } else {
        setSelectedItemId('');
      }
    }
  }, [selectedItemType, searchQuery, members, tutors]);

  const handleDownloadQr = () => {
    if (!qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    
    // Find name
    let name = 'QR_Code';
    if (selectedItemType === 'siswa') {
      const m = members.find(x => x.id === selectedItemId);
      if (m) name = m.nama;
    } else {
      const t = tutors.find(x => x.id === selectedItemId);
      if (t) name = t.nama;
    }

    link.download = `QR_${selectedItemId}_${name.replace(/\s+/g, '_')}.png`;
    link.href = url;
    link.click();
  };

  const handlePrintCard = () => {
    const cardElement = document.getElementById('digital-id-card-element');
    if (!cardElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Kartu Anggota Digital</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="border border-slate-300 rounded-2xl overflow-hidden shadow-lg p-1 bg-white" style="width: 380px;">
            ${cardElement.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ------------------------- QR Camera Scanning -------------------------
  const startCameraScan = () => {
    setScanError(null);
    setScannedResult(null);
    setDetectedItem(null);
    setIsScanning(true);

    // Give browser brief window to load HTML structure before starting Html5Qrcode
    setTimeout(() => {
      if (!isMountedRef.current) return;
      try {
        let scanner = html5QrCodeRef.current;
        if (!scanner) {
          scanner = new Html5Qrcode('qr-reader');
          html5QrCodeRef.current = scanner;
        }

        if (scanner.isScanning) {
          return;
        }

        scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: (width, height) => {
              const shorterDim = width < height ? width : height;
              const qrboxSize = Math.floor(shorterDim * 0.7);
              return { width: qrboxSize, height: qrboxSize };
            }
          },
          (decodedText) => {
            // Success handler
            handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Keep fail silent (triggers for every frame without QR code)
          }
        ).catch(err => {
          console.error('Camera initialization failed:', err);
          if (isMountedRef.current) {
            setScanError('Gagal mengakses kamera. Harap pastikan izin kamera diberikan.');
            setIsScanning(false);
          }
        });
      } catch (err: any) {
        console.error('Html5Qrcode setup error:', err);
        if (isMountedRef.current) {
          setScanError(err.message || 'Error memulai kamera');
          setIsScanning(false);
        }
      }
    }, 100);
  };

  const stopCameraScan = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  };

  // Auto clean-up scanner on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error('Cleanup stop failed:', err));
      }
    };
  }, []);

  // ------------------------- Parse & Process QR Scan -------------------------
  const handleScanSuccess = (decodedText: string) => {
    // Play quick positive scan tick feedback
    playBeep(920, 0.08);

    setScannedResult(decodedText);
    stopCameraScan(); // Pause stream to handle action

    // Parse data: formats supported:
    // 1. MEMBER_QR:M-101
    // 2. TUTOR_QR:T-201
    // 3. Raw IDs (M-101, T-201)
    let cleaned = decodedText.trim();
    let type: 'member' | 'tutor' | null = null;
    let targetId = cleaned;

    if (cleaned.includes(':')) {
      const parts = cleaned.split(':');
      if (parts[0] === 'MEMBER_QR') {
        type = 'member';
        targetId = parts[1];
      } else if (parts[0] === 'TUTOR_QR') {
        type = 'tutor';
        targetId = parts[1];
      } else {
        // general find starting characters
        for (const part of parts) {
          if (part.startsWith('M-')) { type = 'member'; targetId = part; }
          else if (part.startsWith('T-')) { type = 'tutor'; targetId = part; }
        }
      }
    } else {
      if (cleaned.startsWith('M-')) type = 'member';
      else if (cleaned.startsWith('T-')) type = 'tutor';
    }

    // Resolve details physically from lists
    if (type === 'member' || targetId.startsWith('M-')) {
      const found = members.find(m => m.id === targetId);
      if (found) {
        setDetectedItem({
          type: 'member',
          id: targetId,
          name: found.nama,
          detail: `Kelas: ${found.kelas} | Wali: ${found.wali}`,
          data: found
        });
        
        // Auto select tutor standard default
        if (tutors.length > 0) {
          setInstantTutorId(tutors[0].id);
          setInstantMapel(tutors[0].mapel);
        }
      } else {
        triggerUnrecognizedLog(decodedText);
      }
    } else if (type === 'tutor' || targetId.startsWith('T-')) {
      const found = tutors.find(t => t.id === targetId);
      if (found) {
        setDetectedItem({
          type: 'tutor',
          id: targetId,
          name: found.nama,
          detail: `Spesialis: ${found.mapel} | HP: ${found.hp}`,
          data: found
        });
        // Auto process tutor attendance immediately
        processAutoTutorAttendance(found);
      } else {
        triggerUnrecognizedLog(decodedText);
      }
    } else {
      triggerUnrecognizedLog(decodedText);
    }
  };

  const triggerUnrecognizedLog = (code: string) => {
    // Error feedback sound
    playBeep(300, 0.25, 2);
    setScanError(`Kode QR tidak dikenali: "${code}"`);
    
    setScanLogs(prev => [
      {
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        name: 'Gagal Scan',
        role: 'Siswa',
        status: `Eror: Kode QR tidak terdaftar (${code.substring(0,18)}...)`,
        type: 'warning'
      },
      ...prev
    ]);
  };

  // Process Tutor check-in as 'Hadir' instantly
  const processAutoTutorAttendance = (tutorObj: Tutor) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Check if attendance already recorded today for this tutor
    const alreadyLoggedToday = absensi.some(a => a.tutorId === tutorObj.id && a.tgl === todayStr);

    if (alreadyLoggedToday) {
      playBeep(550, 0.2, 1); // warning beep
      setScanLogs(prev => [
        {
          time: timeNowStr,
          name: tutorObj.nama,
          role: 'Tutor',
          status: 'Gagal: Kehadiran sudah dicatat hari ini',
          type: 'info'
        },
        ...prev
      ]);
      return;
    }

    // Call add absen
    onAddAbsen({
      tutorId: tutorObj.id,
      tgl: todayStr,
      status: 'Hadir',
      ket: `Hadir via QR Code Scan otomatis pukul ${timeNowStr} WIB`
    });

    // Play chord beep indicating absolute success
    playBeep(1200, 0.15, 2);

    setScanLogs(prev => [
      {
        time: timeNowStr,
        name: tutorObj.nama,
        role: 'Tutor',
        status: `HADIR otomatis (Pukul ${timeNowStr} WIB)`,
        type: 'success'
      },
      ...prev
    ]);
  };

  // Action: Confirm scheduled session is completed
  const handleConfirmScheduledSesi = (sessionObj: Sesi) => {
    onUpdateSesiStatus(sessionObj.id, 'Selesai');
    playBeep(1000, 0.1, 2); // double Success beep

    const timeNowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setScanLogs(prev => [
      {
        time: timeNowStr,
        name: detectedItem?.name || 'Siswa',
        role: 'Siswa',
        status: `Sesi ${sessionObj.id} Selesai — Pembayaran Terbukukan`,
        type: 'success'
      },
      ...prev
    ]);

    // Close action detail
    setDetectedItem(null);
  };

  // Action: Create an instant finished sessions
  const handleCreateInstantSesi = () => {
    if (!detectedItem || detectedItem.type !== 'member') return;

    const todayStr = new Date().toISOString().split('T')[0];
    const chosenTutor = tutors.find(t => t.id === instantTutorId);
    if (!chosenTutor) {
      alert('Pilih tutor yang mengajar terlebih dahulu!');
      return;
    }

    const finalMapel = instantMapel || chosenTutor.mapel;

    // Call add Sesi as completed ('Selesai')
    onAddSesi({
      tgl: todayStr,
      memberId: detectedItem.id,
      tutorId: instantTutorId,
      mapel: finalMapel,
      durasi: instantDurasi,
      status: 'Selesai',
    });

    playBeep(1000, 0.1, 2); // Double beep

    const timeNowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setScanLogs(prev => [
      {
        time: timeNowStr,
        name: detectedItem.name,
        role: 'Siswa',
        status: `Absen Les Selesai (${finalMapel}, ${instantDurasi} Menit dengan ${chosenTutor.nama})`,
        type: 'success'
      },
      ...prev
    ]);

    // Close action detail
    setDetectedItem(null);
  };

  // Check if student has scheduled sessions of today
  const getTodayScheduledSessions = (memberId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sesi.filter(s => s.memberId === memberId && s.tgl === todayStr && s.status === 'Dijadwalkan');
  };

  // ------------------------- Rendering Helper -------------------------
  const rp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');

  const selectedItemData = () => {
    if (selectedItemType === 'siswa') {
      return members.find(m => m.id === selectedItemId);
    } else {
      return tutors.find(t => t.id === selectedItemId);
    }
  };

  const itemDetails = selectedItemData();

  // Filter items in lookup
  const getFilteredItemsForSelection = () => {
    if (selectedItemType === 'siswa') {
      return members
        .filter(m => m.status === 'Aktif')
        .filter(m => m.nama.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
      return tutors
        .filter(t => t.status === 'Aktif')
        .filter(t => t.nama.toLowerCase().includes(searchQuery.toLowerCase()));
    }
  };

  const filteredSelectionItems = getFilteredItemsForSelection();

  return (
    <div className="space-y-6" id="qr-attendance-view-panel">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <QrCode className="h-6 w-6 text-sky-600" />
            Absensi QR Code
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Sistem modern pencatatan kehadiran instan. Scan QR Code anggota untuk pencatatan bimbingan belajar terintegrasi kas.
          </p>
        </div>

        {/* Audio feedback button controls */}
        <button
          onClick={() => {
            const nextVal = !soundEnabled;
            setSoundEnabled(nextVal);
            if (nextVal) {
              // Quick trigger tone testing
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                osc.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.08);
              } catch (e) {}
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
            soundEnabled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
          id="toggle-beep-feedback"
          title="Ubah notifikasi suara audio saat mesin berhasil membaca kode"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="h-3.5 w-3.5" /> Suara Aktif
            </>
          ) : (
            <>
              <VolumeX className="h-3.5 w-3.5" /> Suara Senyap
            </>
          )}
        </button>
      </div>

      {/* Primary Sub-Tabs Navigation controls */}
      <div className="flex border-b border-slate-200/80 gap-6" id="qr-submenu-panel">
        <button
          onClick={() => {
            stopCameraScan();
            setDetectedItem(null);
            setScanError(null);
            setActiveSubTab('scan');
          }}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeSubTab === 'scan' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
          }`}
          id="qr-absen-tab-scan"
        >
          {activeSubTab === 'scan' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
          )}
          Scan QR Kehadiran
        </button>
        <button
          onClick={() => {
            stopCameraScan();
            setActiveSubTab('generate');
          }}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeSubTab === 'generate' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
          }`}
          id="qr-absen-tab-generate"
        >
          {activeSubTab === 'generate' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
          )}
          Buat Kartu QR Anggota
        </button>
      </div>

      {/* ------------------------- SCAN SUB-TAB VIEW CONTENT ------------------------- */}
      {activeSubTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="scan-view-scaffold">
          {/* Left Scan Pane: Camera Stream OR Scan Prompter (7/12 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between" id="scanner-visual-controller">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800">Pemindai QR Code Kamera</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Posisikan barcode atau kartu kehadiran siswa/tutor di hadapan webcam laptop. Sistem akan mendeteksi informasi secara real-time.
              </p>
            </div>

            {/* Error notifications if camera lookup fails */}
            {scanError && (
              <div className="p-3 bg-rose-50 border border-rose-100/80 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Scanner Canvas Box container */}
            <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-800">
              {isScanning ? (
                <>
                  <div id="qr-reader" className="w-full h-full object-cover">
                    {/* Html5Qrcode injects high performance camera view here */}
                  </div>
                  {/* Styling Scan Crosshairs overlay mockup to look beautiful */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Laser scanning line animation effect */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>

                    <div className="w-48 h-48 sm:w-60 sm:h-60 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center relative bg-emerald-950/5">
                      <div className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 border-t-4 border-l-4 border-emerald-500 rounded-tl-sm"></div>
                      <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 border-t-4 border-r-4 border-emerald-500 rounded-tr-sm"></div>
                      <div className="absolute -bottom-1.5 -left-1.5 w-4.5 h-4.5 border-b-4 border-l-4 border-emerald-500 rounded-bl-sm"></div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-4.5 h-4.5 border-b-4 border-r-4 border-emerald-500 rounded-br-sm"></div>
                      
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest pl-1 bg-slate-950/60 px-2 py-0.5 rounded-md">
                        Membaca QR...
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 px-4 py-8">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center shadow-inner">
                    <Camera className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-300 text-xs font-semibold">Webcam Pemindai Dinonaktifkan</p>
                    <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                      Aktifkan akses visual kamera untuk memulai absensi digital.
                    </p>
                  </div>
                  <button
                    onClick={startCameraScan}
                    className="py-2 px-5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-md cursor-pointer inline-flex items-center gap-1.5"
                    id="btn-start-camera-scan"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Mulai Scanner Aktif
                  </button>
                </div>
              )}
            </div>

            {/* Stop current Scan flow */}
            {isScanning && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={stopCameraScan}
                  className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  id="btn-stop-camera-scan"
                >
                  Matikan Kamera
                </button>
              </div>
            )}
          </div>

          {/* Right Action Dialog Pane: Results or History Lists (5/12 cols) */}
          <div className="lg:col-span-5 space-y-6" id="scan-feedback-results-panel">
            
            {/* 1. DETECTED TARGET INTERACTION PANEL */}
            {detectedItem ? (
              <div className="bg-white p-5 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/10 shadow-xs space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle className="h-4 w-4" />
                    <span>Anggota Terdeteksi</span>
                  </div>
                  <button
                    onClick={() => {
                      setDetectedItem(null);
                      // Resume scan
                      startCameraScan();
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-lg hover:bg-slate-100"
                    title="Batal / Tutup"
                    id="btn-close-detected-card"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Profile detail card */}
                <div className="flex items-start gap-3">
                  <div className={`h-11 w-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm ${
                    detectedItem.type === 'member' 
                      ? 'bg-sky-50 text-sky-600 border border-sky-100' 
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {detectedItem.type === 'member' ? <User className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 truncate tracking-tight">{detectedItem.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{detectedItem.id} — <span className="capitalize">{detectedItem.type === 'member' ? 'Siswa' : 'Tutor'}</span></p>
                    <p className="text-[10px] text-slate-500 font-normal mt-0.5 truncate">{detectedItem.detail}</p>
                  </div>
                </div>

                {/* FLOW FOR MEMBER: Check in session */}
                {detectedItem.type === 'member' && (() => {
                  const memberId = detectedItem.id;
                  const scheduledToday = getTodayScheduledSessions(memberId);

                  if (scheduledToday.length > 0) {
                    return (
                      <div className="space-y-3 bg-white p-3.5 rounded-xl border border-emerald-200 shadow-3xs">
                        <div className="space-y-1">
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold uppercase px-1.5 py-0.2 rounded border border-emerald-400/20">
                            Sesi Terjadwal Ditemukan
                          </span>
                          <p className="text-[11px] text-slate-600 font-semibold mt-1">
                            {scheduledToday[0].mapel} ({scheduledToday[0].durasi} menit)
                          </p>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            Siswa terdaftar pada bimbingan terjadwal hari ini. Klik konfirmasi untuk menandainya SELESAI dan mencatat kehadiran.
                          </p>
                        </div>
                        <button
                          onClick={() => handleConfirmScheduledSesi(scheduledToday[0])}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
                          id="btn-confirm-scheduled-session"
                        >
                          Hadir & Selesaikan Sesi
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 mt-2">
                        <div className="flex gap-1.5 items-center text-amber-600 text-[11px] font-semibold border-b border-slate-100 pb-1.5">
                          <Info className="h-3.5 w-3.5" />
                          <span>Tidak Ada Sesi Terjadwal Hari Ini</span>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-500 leading-relaxed font-normal">
                            Siswa tidak memiliki bimbingan terjadwal tanggal ini. Silakan buat sesi instan langsung dengan menetapkan guru dan durasi.
                          </p>
                          
                          {/* Instan session form */}
                          <div className="space-y-3 pt-1">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Guru Pengajar *</label>
                              <select
                                value={instantTutorId}
                                onChange={(e) => {
                                  setInstantTutorId(e.target.value);
                                  const tObj = tutors.find(x => x.id === e.target.value);
                                  if (tObj) setInstantMapel(tObj.mapel);
                                }}
                                className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none cursor-pointer focus:bg-white font-semibold"
                                id="instant-tutor-select"
                              >
                                {tutors.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.nama} ({t.mapel})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Mapel Diajarkan</label>
                                <input
                                  type="text"
                                  placeholder="Mapel"
                                  value={instantMapel}
                                  onChange={(e) => setInstantMapel(e.target.value)}
                                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:bg-white"
                                  id="instant-mapel-input"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Durasi (Menit)</label>
                                <input
                                  type="number"
                                  value={instantDurasi || 60}
                                  onChange={(e) => setInstantDurasi(Number(e.target.value))}
                                  className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:bg-white font-bold"
                                  id="instant-durasi-input"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleCreateInstantSesi}
                              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer transition-colors mt-1"
                              id="btn-create-instant-session"
                            >
                              Buat Sesi & Tandai Selesai
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}

                {/* FLOW FOR TUTOR: Auto Recorded Kehadiran details */}
                {detectedItem.type === 'tutor' && (
                  <div className="space-y-2 bg-emerald-500/5 p-3.5 border border-emerald-200 rounded-xl">
                    <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" /> Absen Masuk Berhasil!
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Kehadiran harian <strong>{detectedItem.name}</strong> telah otomatis terbukukan ke Log Kehadiran harian sebagai <strong>HADIR</strong>. Tidak memerlukan tindakan lanjutan.
                    </p>
                    <button
                      onClick={() => {
                        setDetectedItem(null);
                        startCameraScan();
                      }}
                      className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg cursor-pointer"
                      id="btn-close-after-tutor"
                    >
                      Scan Berikutnya
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Informational prompt when scanner is ready but no member is scanned yet */
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex gap-2 items-start shrink-0 text-slate-400">
                  <div className="bg-slate-50 p-2 text-slate-500 rounded-xl border border-slate-100">
                    <Sparkles className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Menunggu Pemindaian</h3>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-normal mt-0.5">
                      Pilihan auto-proses akan muncul di panel ini saat salah satu kartu QR berhasil terekam kamera.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. REAL-TIME LOG OF ACTIONS DONE IN THIS VIEW */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5" id="scan-latest-logs-container">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Log Aktivitas Scan Hari Ini</h3>
                <span className="text-[10px] text-slate-400 font-semibold">{scanLogs.length} Aktivitas</span>
              </div>

              <div className="space-y-3.5 max-h-56 overflow-y-auto">
                {scanLogs.length > 0 ? (
                  scanLogs.map((log, index) => (
                    <div key={index} className="flex items-start justify-between text-xs border-b border-slate-50 pb-2">
                      <div className="space-y-0.5 flex-1 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-800 tracking-tight">{log.name}</span>
                          <span className={`text-[8px] font-semibold px-1 rounded-sm ${
                            log.role === 'Siswa' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {log.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal font-medium">{log.status}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold shrink-0">{log.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-[11px]">
                    Belum ada scan diproses dalam sesi ini.
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* ------------------------- GENERATE SUB-TAB VIEW CONTENT ------------------------- */}
      {activeSubTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="generate-view-scaffold">
          
          {/* Left Panel: Search & Select Member/Tutor (5/12 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4" id="id-lookup-selectors">
            {/* Mode switch selectors Button groups */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Pilih Kategori Anggota</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    setSelectedItemType('siswa');
                    setSearchQuery('');
                  }}
                  className={`py-2 text-xs font-semibold rounded-xl border select-none text-center transition-all cursor-pointer ${
                    selectedItemType === 'siswa'
                      ? 'bg-slate-900 text-white border-transparent shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  id="tab-select-siswa"
                >
                  Siswa / Member
                </button>
                <button
                  onClick={() => {
                    setSelectedItemType('tutor');
                    setSearchQuery('');
                  }}
                  className={`py-2 text-xs font-semibold rounded-xl border select-none text-center transition-all cursor-pointer ${
                    selectedItemType === 'tutor'
                      ? 'bg-slate-900 text-white border-transparent shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  id="tab-select-tutor"
                >
                  Tutor Pengajar
                </button>
              </div>
            </div>

            {/* Live Search Lookup filter input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Cari Nama Anggota</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="Cari anggota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition-colors"
                  id="inp-search-qr"
                />
              </div>
            </div>

            {/* Result items scrollbox */}
            <div className="space-y-2 max-h-80 overflow-y-auto pt-1">
              {filteredSelectionItems.length > 0 ? (
                filteredSelectionItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      selectedItemId === item.id
                        ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold ring-1 ring-sky-200/50'
                        : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-650 text-slate-700'
                    }`}
                  >
                    <div className="overflow-hidden pr-3">
                      <p className="font-semibold truncate">{item.nama}</p>
                      <p className="text-[9px] text-slate-405 text-slate-400 mt-0.5 font-medium">
                        ID: {item.id} | {selectedItemType === 'siswa' ? (item as Member).kelas : (item as Tutor).mapel}
                      </p>
                    </div>
                    <span className="text-[10px] shrink-0 font-bold bg-slate-50 border border-slate-200 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                      {item.id}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Tidak ada data anggota aktif ditemukan.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Digital ID Card with QR Canvas Rendering (7/12 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between items-center" id="qr-id-card-presenter">
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Desain Kartu Anggota Digital</h3>
                <p className="text-slate-400 text-[10px]">Tinjauan visual kartu ID Card lengkap dengan QR Code statis download.</p>
              </div>
            </div>

            {selectedItemId && itemDetails ? (
              <div className="space-y-6 w-full flex flex-col items-center">
                {/* Visual Representation of elegant Member Badge / ID Card */}
                <div
                  id="digital-id-card-element"
                  className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 overflow-hidden relative"
                  style={{ width: '315px', height: '440px' }}
                >
                  {/* Styling background circles decorations */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                  {/* Header visual branding overlay */}
                  <div className="p-4 border-b border-slate-800/80 bg-slate-950/30 text-center space-y-0.5 relative">
                    <div className="flex items-center justify-center gap-1.5">
                      <GraduationCap className="h-5 w-5 text-sky-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Kursus App</span>
                    </div>
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Kartu Anggota Resmi / Tutor</p>
                  </div>

                  {/* Body details element section */}
                  <div className="p-5 flex flex-col items-center justify-between h-[360px] text-center">
                    
                    {/* User profile brief details */}
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="h-11 w-11 rounded-full bg-slate-800/80 text-sky-400 border border-slate-700/80 flex items-center justify-center font-bold text-sm">
                        {itemDetails.nama.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 pr-2 pl-2 truncate max-w-[260px]">{itemDetails.nama}</h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-sky-400 bg-sky-505/10 border border-sky-502/20 bg-sky-400/10 px-2 py-0.3 rounded-full inline-block">
                        {selectedItemType === 'siswa' ? 'Siswa / Member' : 'Tutor Pengajar'}
                      </span>
                    </div>

                    {/* QR CANVAS CONTAINER FRAME */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-center">
                      <canvas ref={qrCanvasRef} className="h-32 w-32 object-contain" />
                    </div>

                    {/* Footer text descriptions */}
                    <div className="space-y-0.5 text-[10px]">
                      <p className="font-bold text-slate-300 font-mono tracking-wider">{itemDetails.id}</p>
                      <p className="text-slate-500 font-normal">
                        {selectedItemType === 'siswa' 
                          ? `Program: ${(itemDetails as Member).kelas}` 
                          : `Spesialis: ${(itemDetails as Tutor).mapel}`
                        }
                      </p>
                    </div>

                  </div>
                </div>

                {/* Print and Save Download buttons row */}
                <div className="flex items-center gap-3 w-full max-w-[315px]">
                  <button
                    onClick={handlePrintCard}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex justify-center items-center gap-1.5 border border-slate-200"
                    id="btn-print-card"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Cetak Kartu
                  </button>
                  <button
                    onClick={handleDownloadQr}
                    className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex justify-center items-center gap-1.5 shadow-sm"
                    id="btn-download-qr"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Unduh QR PNG
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Silakan pilih siswa atau tutor di panel sebelah kiri untuk merender Kartu QR.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
