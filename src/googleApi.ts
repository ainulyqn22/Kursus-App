import { Member, Tutor, Absen, Sesi, Pemasukan, Pengeluaran, SessionLog, SyllabusMilestone, AssessmentScore } from './types';

// Format helper for Indonesian Currency
function formatRp(value: number) {
  return 'Rp ' + Number(value).toLocaleString('id-ID');
}

/**
 * Creates a brand new Google Spreadsheet with structured sheets
 */
export async function createCourseSpreadsheet(
  accessToken: string,
  title: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        { properties: { title: 'Siswa / Member' } },
        { properties: { title: 'Tutor' } },
        { properties: { title: 'Kehadiran Tutor' } },
        { properties: { title: 'Sesi Les' } },
        { properties: { title: 'Keuangan' } },
        { properties: { title: 'Evaluasi & Jurnal Sesi' } },
        { properties: { title: 'Perkembangan Silabus' } },
        { properties: { title: 'Nilai Ujian / Assessment' } },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal membuat Google Sheets baru');
  }

  const result = await response.json();
  return {
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`,
  };
}

/**
 * Encodes values into 2D rows for Sheets updating
 */
export async function syncDataToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  data: {
    members: Member[];
    tutors: Tutor[];
    absensi: Absen[];
    sesi: Sesi[];
    pemasukan: Pemasukan[];
    pengeluaran: Pengeluaran[];
    sessionLogs?: SessionLog[];
    syllabusMilestones?: SyllabusMilestone[];
    assessmentScores?: AssessmentScore[];
  }
) {
  const { 
    members, 
    tutors, 
    absensi, 
    sesi, 
    pemasukan, 
    pengeluaran,
    sessionLogs = [],
    syllabusMilestones = [],
    assessmentScores = []
  } = data;

  // Ensure all required sheets exist in the spreadsheet (Self-Healing Creation)
  try {
    const metaResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (metaResponse.ok) {
      const meta = await metaResponse.json();
      const existingTitles: string[] = meta.sheets?.map((s: any) => s.properties?.title) || [];
      const requiredTitles = [
        'Siswa / Member',
        'Tutor',
        'Kehadiran Tutor',
        'Sesi Les',
        'Keuangan',
        'Evaluasi & Jurnal Sesi',
        'Perkembangan Silabus',
        'Nilai Ujian / Assessment'
      ];

      const addRequests = requiredTitles
        .filter((title) => !existingTitles.includes(title))
        .map((title) => ({
          addSheet: {
            properties: { title }
          }
        }));

      if (addRequests.length > 0) {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: addRequests
          }),
        });
      }
    }
  } catch (err) {
    console.warn('Failed self-healing sheet check, assuming sheets exist:', err);
  }

  // 1. Prepare data for "Siswa / Member" sheet
  const memberRows = [
    ['MEMBER ID', 'NAMA SISWA', 'KELAS / PROGRAM', 'NAMA WALI', 'NO. HP WALI', 'BIAYA PER SESI', 'STATUS', 'CATATAN'],
    ...members.map((m) => [
      m.id,
      m.nama,
      m.kelas,
      m.wali || '-',
      m.hp || '-',
      m.biaya,
      m.status,
      m.catatan || '',
    ]),
  ];

  // 2. Prepare data for "Tutor" sheet
  const tutorRows = [
    ['TUTOR ID', 'NAMA TUTOR', 'MATA PELAJARAN', 'NO. HP', 'HONOR PER SESI', 'STATUS'],
    ...tutors.map((t) => [
      t.id,
      t.nama,
      t.mapel || '-',
      t.hp || '-',
      t.honor,
      t.status,
    ]),
  ];

  // 3. Prepare data for "Kehadiran Tutor" sheet
  const absensiRows = [
    ['ID ABSEN', 'TANGGAL', 'TUTOR ID', 'NAMA TUTOR', 'STATUS KEHADIRAN', 'KETERANGAN'],
    ...absensi.map((a) => {
      const tutor = tutors.find((t) => t.id === a.tutorId);
      return [
        a.id,
        a.tgl,
        a.tutorId,
        tutor ? tutor.nama : '?',
        a.status,
        a.ket || '-',
      ];
    }),
  ];

  // 4. Prepare data for "Sesi Les" sheet
  const sesiRows = [
    ['SESI ID', 'TANGGAL', 'MEMBER ID', 'NAMA MEMBER', 'TUTOR ID', 'NAMA TUTOR', 'MATA PELAJARAN', 'DURASI (MENIT)', 'STATUS'],
    ...sesi.map((s) => {
      const member = members.find((m) => m.id === s.memberId);
      const tutor = tutors.find((t) => t.id === s.tutorId);
      return [
        s.id,
        s.tgl,
        s.memberId,
        member ? member.nama : '?',
        s.tutorId,
        tutor ? tutor.nama : '?',
        s.mapel || '-',
        s.durasi,
        s.status,
      ];
    }),
  ];

  // 5. Prepare data for "Keuangan" sheet
  const keuanganRows = [
    ['TRANSAKSI ID', 'TANGGAL', 'JENIS', 'KATEGORI', 'PIHAK / MEMBER', 'JUMLAH (RP)', 'KETERANGAN'],
    ...pemasukan.map((p) => {
      const member = members.find((m) => m.id === p.memberId);
      return [
        p.id,
        p.tgl,
        'PEMASUKAN',
        p.kat,
        member ? `${member.nama} (Member)` : 'Umum',
        p.jml,
        p.ket || '-',
      ];
    }),
    ...pengeluaran.map((k) => [
      k.id,
      k.tgl,
      'PENGELUARAN',
      k.kat,
      'Umum / Instansi',
      k.jml,
      k.ket || '-',
    ]),
  ].sort((a, b) => String(a[1]).localeCompare(String(b[1]))); // Sort by date ascending

  // 6. Prepare data for "Evaluasi & Jurnal Sesi" sheet
  const sessionLogRows = [
    ['LOG ID', 'TANGGAL', 'ID SISWA', 'NAMA SISWA', 'ID TUTOR', 'NAMA TUTOR', 'MATERI / TOPIK', 'TINGKAT PEMAHAMAN (1-5)', 'CATATAN EVALUASI'],
    ...sessionLogs.map((l) => {
      const member = members.find((m) => m.id === l.siswaId);
      const tutor = tutors.find((t) => t.id === l.tutorId);
      return [
        l.id,
        l.tgl,
        l.siswaId,
        member ? member.nama : '?',
        l.tutorId,
        tutor ? tutor.nama : '?',
        l.materi,
        l.pemahaman,
        l.catatan || '',
      ];
    }),
  ];

  // 7. Prepare data for "Perkembangan Silabus" sheet
  const milestoneRows = [
    ['MILESTONE ID', 'ID SISWA', 'NAMA SISWA', 'TOPIK KURIKULUM', 'STATUS PENGUASAAN'],
    ...syllabusMilestones.map((m) => {
      const member = members.find((mb) => mb.id === m.siswaId);
      return [
        m.id,
        m.siswaId,
        member ? member.nama : '?',
        m.topik,
        m.status,
      ];
    }),
  ];

  // 8. Prepare data for "Nilai Ujian / Assessment" sheet
  const scoreRows = [
    ['SCORE ID', 'TANGGAL', 'ID SISWA', 'NAMA SISWA', 'NAMA UJIAN / ASSESSMENT', 'NILAI (0-100)'],
    ...assessmentScores.map((s) => {
      const member = members.find((mb) => mb.id === s.siswaId);
      return [
        s.id,
        s.tgl,
        s.siswaId,
        member ? member.nama : '?',
        s.ujianNama,
        s.nilai,
      ];
    }),
  ];

  const valueRanges = [
    { range: "'Siswa / Member'!A1:H2000", values: memberRows },
    { range: "'Tutor'!A1:F2000", values: tutorRows },
    { range: "'Kehadiran Tutor'!A1:F2000", values: absensiRows },
    { range: "'Sesi Les'!A1:I2000", values: sesiRows },
    { range: "'Keuangan'!A1:G2000", values: keuanganRows },
    { range: "'Evaluasi & Jurnal Sesi'!A1:I2000", values: sessionLogRows },
    { range: "'Perkembangan Silabus'!A1:E2000", values: milestoneRows },
    { range: "'Nilai Ujian / Assessment'!A1:F2000", values: scoreRows },
  ];

  // Complete batch update via Google Sheets API
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: valueRanges,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal mengekspor data ke Google Sheets');
  }

  return true;
}

/**
 * Encodes a string in RFC 2822 format and Base64Url for sending via Gmail REST API
 */
function makeRawEmail(to: string, subject: string, bodyText: string): string {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    bodyText,
  ];

  const emailStr = emailLines.join('\r\n');
  
  // Base64Url encoding (replace '+' with '-', '/' with '_', and strip trailing '=')
  const base64 = btoa(unescape(encodeURIComponent(emailStr)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Sends an email using Gmail API on behalf of the signed-in user
 */
export async function sendGmailEmail(
  accessToken: string,
  emailData: { to: string; subject: string; htmlBody: string }
): Promise<boolean> {
  const { to, subject, htmlBody } = emailData;
  const raw = makeRawEmail(to, subject, htmlBody);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: raw,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal mengirim email melalui Gmail REST API');
  }

  return true;
}
