import React, { useState, useEffect } from 'react';
import { Mail, Send, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ComposeMailModalProps {
  toEmail: string;
  subjectLine: string;
  bodyHtml: string;
  onClose: () => void;
  onSend: (emailData: { to: string; subject: string; htmlBody: string }) => Promise<boolean>;
  isSending: boolean;
}

export default function ComposeMailModal({
  toEmail,
  subjectLine,
  bodyHtml,
  onClose,
  onSend,
  isSending,
}: ComposeMailModalProps) {
  const [to, setTo] = useState(toEmail);
  const [subject, setSubject] = useState(subjectLine);
  const [htmlBody, setHtmlBody] = useState(bodyHtml);
  const [stateMessage, setStateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync inputs if props change
  useEffect(() => {
    setTo(toEmail);
    setSubject(subjectLine);
    setHtmlBody(bodyHtml);
  }, [toEmail, subjectLine, bodyHtml]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !htmlBody) {
      alert('Tolong isi semua kolom Email Tujuan, Subjek, dan Isi Email!');
      return;
    }

    if (!to.includes('@')) {
      alert('Tolong isi Email Tujuan dengan format email yang valid!');
      return;
    }

    setStateMessage(null);
    try {
      const ok = await onSend({ to, subject, htmlBody });
      if (ok) {
        setStateMessage({ type: 'success', text: 'Email berhasil terkirim melalui server Gmail REST API!' });
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setStateMessage({ type: 'error', text: err.message || 'Gagal mengirim email.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4.5 w-4.5 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-800">Kirim Email via Server Gmail</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSendEmail} className="p-6 space-y-4">
          {stateMessage && (
            <div className={`p-3.5 rounded-lg flex items-start gap-2 border text-xs ${
              stateMessage.type === 'success'
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}>
              {stateMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <p className="font-medium leading-relaxed">{stateMessage.text}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Email Tujuan Parent/Tutor *</label>
            <input
              type="text"
              required
              placeholder="Contoh: wali.siswa@gmail.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-1.5 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-colors text-slate-705"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 font-semibold">Subjek Email *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pengingat Jadwal Les"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-1.5 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none transition-colors text-slate-705"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Isi Email (Format HTML didukung) *</label>
            <textarea
              required
              rows={6}
              placeholder="Isi email anda disini..."
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2 text-xs focus:border-slate-400 focus:bg-white focus:ring-0 outline-none font-sans leading-relaxed transition-colors text-slate-705"
            />
            <p className="text-[10px] text-slate-400 pl-1 leading-relaxed">Anda dapat menuliskan tag HTML seperti &lt;strong&gt;, &lt;br/&gt;, dll. untuk mempercantik rincian.</p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-medium rounded-xl text-xs cursor-pointer transition-colors border border-transparent hover:border-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Send className="h-3 w-3" />
              {isSending ? 'Mengirim...' : 'Kirim Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
