import React from 'react';
import { MonthKey, MONTH_NAMES, KpiCategory, StaffName, ActiveCellInfo, KPI_CATEGORIES } from '../types/spreadsheet';
import { Search, Plus, Filter, FunctionSquare } from 'lucide-react';

interface SpreadsheetToolbarProps {
  selectedMonth: MonthKey;
  onMonthChange: (month: MonthKey) => void;
  selectedCategory: KpiCategory | 'ALL';
  onCategoryChange: (category: KpiCategory | 'ALL') => void;
  selectedStaff: StaffName | 'ALL';
  onStaffChange: (staff: StaffName | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCell: ActiveCellInfo | null;
  onFormulaBarChange?: (newVal: string) => void;
  onOpenAddModal: () => void;
  categories?: string[];
}

export const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
  selectedMonth,
  onMonthChange,
  selectedCategory,
  onCategoryChange,
  selectedStaff,
  onStaffChange,
  searchQuery,
  onSearchChange,
  activeCell,
  onOpenAddModal,
  categories = KPI_CATEGORIES,
}) => {
  const categoryOptions: (string | 'ALL')[] = ['ALL', ...categories];

  return (
    <div className="w-full bg-neutral-900 border-b border-neutral-800 p-3 flex flex-col gap-2.5">
      {/* 1. Authenticated Google Sheets Style Formula Bar */}
      <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs">
        {/* Cell Coordinate Box */}
        <div className="w-16 font-mono text-center font-semibold text-emerald-400 bg-neutral-900 px-2 py-1 rounded border border-neutral-700/80 shrink-0">
          {activeCell ? `${activeCell.col}${activeCell.row}` : 'A1'}
        </div>

        {/* FX Icon Divider */}
        <div className="flex items-center text-neutral-500 px-1 border-r border-neutral-800 shrink-0">
          <FunctionSquare className="w-4 h-4 text-emerald-500 mr-1" />
          <span className="font-serif italic font-semibold text-neutral-400 text-sm leading-none">fx</span>
        </div>

        {/* Formula Input / Viewer */}
        <div className="flex-1 font-mono text-neutral-200 overflow-hidden text-ellipsis whitespace-nowrap pl-1 select-all">
          {activeCell ? (
            <span className="text-neutral-100">{activeCell.formula || activeCell.value}</span>
          ) : (
            <span className="text-neutral-500 italic">Klik salah satu sel untuk melihat formula kalkulasi otomatis</span>
          )}
        </div>

        {activeCell && (
          <div className="text-[11px] text-neutral-500 hidden md:block shrink-0">
            Kolom: <span className="text-neutral-300 font-medium">{activeCell.colLabel}</span>
          </div>
        )}
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Month Selector Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full no-scrollbar">
          <span className="text-xs text-neutral-400 font-medium mr-1 shrink-0">Bulan:</span>
          {MONTH_NAMES.map((m) => {
            const isSelected = selectedMonth === m.key;
            return (
              <button
                key={m.key}
                onClick={() => onMonthChange(m.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 text-neutral-950 font-semibold shadow-sm'
                    : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
                title={`Pilih periode ${m.full}`}
              >
                {m.key}
              </button>
            );
          })}
        </div>

        {/* Quick Add KPI Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Indikator</span>
        </button>
      </div>

      {/* 3. Dropdowns & Search */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800/60 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800">
            <span className="text-neutral-400">Staf:</span>
            <select
              value={selectedStaff}
              onChange={(e) => onStaffChange(e.target.value as StaffName | 'ALL')}
              className="bg-transparent text-neutral-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL" className="bg-neutral-900 text-white">Semua Staf (Rizki, Gia, Sony, Kenny)</option>
              <option value="Rizki" className="bg-neutral-900 text-white">Rizki (Aplikasi & Rapor)</option>
              <option value="Gia" className="bg-neutral-900 text-white">Gia (TOBK & EPB)</option>
              <option value="Sony" className="bg-neutral-900 text-white">Sony (SPMB & Kelulusan PTN)</option>
              <option value="Kenny" className="bg-neutral-900 text-white">Kenny (Inovasi & Modul R&D)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800">
            <Filter className="w-3 h-3 text-neutral-500" />
            <span className="text-neutral-400">Jenis Kinerja:</span>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as KpiCategory | 'ALL')}
              className="bg-transparent text-neutral-200 focus:outline-none font-medium cursor-pointer max-w-[200px]"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat} className="bg-neutral-900 text-white">
                  {cat === 'ALL' ? 'Semua Jenis Kinerja' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari indikator atau media aplikasi..."
            className="w-full bg-neutral-950 text-neutral-200 text-xs pl-8 pr-3 py-1.5 rounded-md border border-neutral-800 focus:border-emerald-500/60 focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
