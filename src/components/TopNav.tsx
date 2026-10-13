import React from 'react';
import { SheetTab, MonthKey, MONTH_NAMES } from '../types/spreadsheet';
import { Download, Copy, RotateCcw, Table2, Check, HelpCircle } from 'lucide-react';

interface TopNavProps {
  currentTab: SheetTab;
  onTabChange: (tab: SheetTab) => void;
  selectedMonth: MonthKey;
  onExportCSV: () => void;
  onCopyClipboard: () => void;
  onResetData: () => void;
  onOpenGuide: () => void;
  copiedState: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onTabChange,
  selectedMonth,
  onExportCSV,
  onCopyClipboard,
  onResetData,
  onOpenGuide,
  copiedState,
}) => {
  const currentMonthName = MONTH_NAMES.find((m) => m.key === selectedMonth)?.label || selectedMonth;

  return (
    <header className="w-full bg-neutral-900 border-b border-neutral-800 px-4 lg:px-6 py-3 shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Table2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>Spreadsheet R&D Aplikasi & Rapor</span>
            </h1>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Monitoring Kinerja Staf: Rizki · Gia · Sony · Kenny · Periode {currentMonthName} 2026
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-950/60 p-1 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={() => onTabChange('consolidated')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'consolidated'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Konsolidasi 4 Staf
          </button>
          <button
            onClick={() => onTabChange('rizki')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'rizki'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Staf Rizki
          </button>
          <button
            onClick={() => onTabChange('gia')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'gia'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Staf Gia
          </button>
          <button
            onClick={() => onTabChange('sony')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'sony'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Staf Sony
          </button>
          <button
            onClick={() => onTabChange('kenny')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'kenny'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Staf Kenny
          </button>
          <button
            onClick={() => onTabChange('matrix_12m')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'matrix_12m'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Matriks Bulanan
          </button>
          <button
            onClick={() => onTabChange('executive')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              currentTab === 'executive'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Ringkasan Eksekutif
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            title="Lihat panduan dan formula Google Sheets"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/80 rounded-lg border border-emerald-500/40 transition-colors shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panduan Sheets</span>
          </button>

          <button
            onClick={onCopyClipboard}
            title="Salin data tabel dengan format TSV untuk paste langsung ke Google Sheets / Excel"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded-lg border border-neutral-700 transition-colors shrink-0"
          >
            {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedState ? 'Disalin!' : 'Salin ke Sheets'}</span>
          </button>
          
          <button
            onClick={onExportCSV}
            title="Unduh file format .CSV lengkap"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 rounded-lg border border-emerald-500/30 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>

          <button
            onClick={onResetData}
            title="Reset ke data awal"
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
