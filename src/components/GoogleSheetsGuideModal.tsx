import React, { useState } from 'react';
import { X, Copy, Check, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface GoogleSheetsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyAllTSV: () => void;
  copiedState: boolean;
}

export const GoogleSheetsGuideModal: React.FC<GoogleSheetsGuideModalProps> = ({
  isOpen,
  onClose,
  onCopyAllTSV,
  copiedState,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyFormula = (key: string, formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formulas = [
    {
      key: 'pct',
      title: '1. Rumus % Capaian Otomatis (Kolom H baris 4)',
      formula: '=IFERROR((F4/G4)*100, 0)',
      desc: 'F4 = Target, G4 = Realisasi. Rumus: Target / Realisasi (Otomatis aman dari error #DIV/0! jika realisasi bernilai 0).',
    },
    {
      key: 'status',
      title: '2. Rumus Status Kinerja Otomatis (Kolom I baris 4)',
      formula: '=IFS(H4>=100, "Melampaui Target", H4>=90, "On-Track", H4>=75, "Cukup", TRUE, "Perlu Perhatian")',
      desc: 'Mengkategorikan status secara dinamis berdasarkan nilai persentase capaian.',
    },
    {
      key: 'prod_rizki',
      title: '3. Rumus Skor Produktivitas Staf Rizki (Rata-rata % Capaian)',
      formula: '=ROUND(AVERAGEIF($B$4:$B$21, "Rizki", $H$4:$H$21), 1)',
      desc: 'Menghitung rata-rata capaian khusus baris yang bernama "Rizki" dari kolom B.',
    },
    {
      key: 'prod_gia',
      title: '4. Rumus Skor Produktivitas Staf Gia',
      formula: '=ROUND(AVERAGEIF($B$4:$B$21, "Gia", $H$4:$H$21), 1)',
      desc: 'Menghitung rata-rata capaian khusus baris yang bernama "Gia" dari kolom B.',
    },
    {
      key: 'prod_sony',
      title: '5. Rumus Skor Produktivitas Staf Sony',
      formula: '=ROUND(AVERAGEIF($B$4:$B$21, "Sony", $H$4:$H$21), 1)',
      desc: 'Menghitung rata-rata capaian khusus baris yang bernama "Sony" dari kolom B.',
    },
    {
      key: 'prod_kenny',
      title: '6. Rumus Skor Produktivitas Staf Kenny',
      formula: '=ROUND(AVERAGEIF($B$4:$B$21, "Kenny", $H$4:$H$21), 1)',
      desc: 'Menghitung rata-rata capaian khusus baris yang bernama "Kenny" dari kolom B.',
    },
    {
      key: 'total_tim',
      title: '7. Rumus Rata-rata Produktivitas Keseluruhan Tim',
      formula: '=ROUND(AVERAGE($H$4:$H$21), 1)',
      desc: 'Mengambil rata-rata aritmatika dari seluruh indikator kinerja tim.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Panduan Memindahkan ke Google Sheets Asli</h3>
              <p className="text-xs text-neutral-400">Susunan kolom: No, Nama Staf, Jenis Kinerja, Indikator, Media Aplikasi, Target, Realisasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-neutral-300">
          {/* CARA CEPAT 10 DETIK */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cara Paling Cepat (Cukup Salin & Tempel)</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-3">
              Format TSV sudah diperbarui tanpa kolom Kode dan Tanggal, dilengkapi kolom Media Aplikasi yang terhubung langsung:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 bg-neutral-950/80 p-2.5 rounded-lg border border-neutral-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">1</span>
                <div>
                  <span className="font-semibold text-white">Klik tombol "Salin ke Sheets":</span>
                  <div className="mt-1.5">
                    <button
                      onClick={onCopyAllTSV}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md shadow-sm transition-colors text-xs"
                    >
                      {copiedState ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedState ? 'Berhasil Disalin ke Clipboard!' : 'Salin Data Spreadsheet Sekarang'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-neutral-950/80 p-2.5 rounded-lg border border-neutral-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">2</span>
                <div>
                  <span className="font-semibold text-white">Buka dokumen baru di Google Sheets:</span>
                  <p className="text-neutral-400 mt-0.5">
                    Ketik <strong className="text-emerald-300 font-mono">sheets.new</strong> di browser Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-neutral-950/80 p-2.5 rounded-lg border border-neutral-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">3</span>
                <div>
                  <span className="font-semibold text-white">Klik sel A1 lalu tekan Paste (<kbd className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-200">Ctrl + V</kbd>):</span>
                  <p className="text-neutral-400 mt-0.5">
                    Seluruh tabel dengan header baru langsung rapi dan formula persentase langsung aktif.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DAFTAR FORMULA GOOGLE SHEETS */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>Daftar Formula Asli Google Sheets</span>
            </h4>
            <div className="space-y-3">
              {formulas.map((f) => (
                <div key={f.key} className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-neutral-200">{f.title}</span>
                    <button
                      onClick={() => copyFormula(f.key, f.formula)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-[11px] transition-colors"
                      title="Salin rumus formula"
                    >
                      {copiedKey === f.key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === f.key ? 'Disalin' : 'Salin Rumus'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-emerald-400 bg-neutral-900 px-2.5 py-1.5 rounded border border-neutral-800 select-all overflow-x-auto text-[11px]">
                    {f.formula}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-neutral-500">
            Kompatibel 100% dengan Google Sheets & Microsoft Excel
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
