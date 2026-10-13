import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowUpAZ, 
  ArrowDownAZ, 
  ArrowUpDown, 
  Filter, 
  Check, 
  X, 
  Search, 
  RotateCcw,
  CheckSquare,
  Square
} from 'lucide-react';

interface ColumnFilterPopoverProps {
  colLetter: string;
  colName: string;
  isNumeric?: boolean;
  currentSort: 'asc' | 'desc' | null;
  onSortChange: (direction: 'asc' | 'desc' | null) => void;
  allValues: string[];
  selectedValues: string[] | null; // null means no active filter (all included)
  onFilterChange: (values: string[] | null) => void;
  onClose: () => void;
  align?: 'left' | 'right';
}

export const ColumnFilterPopover: React.FC<ColumnFilterPopoverProps> = ({
  colLetter,
  colName,
  isNumeric = false,
  currentSort,
  onSortChange,
  allValues,
  selectedValues,
  onFilterChange,
  onClose,
  align = 'left',
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute unique values with frequencies
  const uniqueValueStats = useMemo(() => {
    const counts = new Map<string, number>();
    allValues.forEach((val) => {
      const displayVal = val === '' ? '(Kosong)' : val;
      counts.set(displayVal, (counts.get(displayVal) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value, 'id', { numeric: true }));
  }, [allValues]);

  const allUniqueValues = useMemo(() => uniqueValueStats.map((s) => s.value), [uniqueValueStats]);

  // Local state for checkboxes while editing inside popover
  const [checkedValues, setCheckedValues] = useState<Set<string>>(() => {
    if (selectedValues === null) {
      return new Set(allUniqueValues);
    }
    return new Set(selectedValues);
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Click outside and escape handling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Filter values list by local search input
  const displayedValues = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return uniqueValueStats;
    return uniqueValueStats.filter((item) =>
      item.value.toLowerCase().includes(q)
    );
  }, [uniqueValueStats, searchTerm]);

  const handleToggleValue = (val: string) => {
    setCheckedValues((prev) => {
      const next = new Set(prev);
      if (next.has(val)) {
        next.delete(val);
      } else {
        next.add(val);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setCheckedValues(new Set(allUniqueValues));
  };

  const handleClearAll = () => {
    setCheckedValues(new Set());
  };

  const handleApplyFilter = () => {
    if (checkedValues.size === allUniqueValues.length) {
      // All checked = no filter needed
      onFilterChange(null);
    } else {
      onFilterChange(Array.from(checkedValues));
    }
    onClose();
  };

  const handleResetFilter = () => {
    setCheckedValues(new Set(allUniqueValues));
    onFilterChange(null);
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className={`absolute z-40 top-full mt-1.5 ${
        align === 'right' ? 'right-0' : 'left-0'
      } w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-3 text-left font-sans text-xs select-text`}
      style={{ minWidth: '18rem' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-neutral-800">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-mono font-bold text-[11px] flex items-center justify-center">
            {colLetter}
          </span>
          <span className="font-semibold text-white truncate max-w-[170px]" title={colName}>
            {colName}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Tutup"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. SECTION: PENGURUTAN (SORT A-Z / Z-A) */}
      <div className="mb-3">
        <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
          <span>Urutkan Kolom</span>
          {currentSort && (
            <span className="text-[10px] text-emerald-400 font-medium lowercase">
              aktif: {currentSort === 'asc' ? (isNumeric ? '0→9' : 'A→Z') : (isNumeric ? '9→0' : 'Z→A')}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {/* Sort A - Z */}
          <button
            type="button"
            onClick={() => onSortChange('asc')}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              currentSort === 'asc'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-900/40'
                : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border-neutral-700/80 hover:text-white'
            }`}
          >
            <ArrowUpAZ className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isNumeric ? '0 → 9 (Menaik)' : 'A → Z (Menaik)'}</span>
          </button>

          {/* Sort Z - A */}
          <button
            type="button"
            onClick={() => onSortChange('desc')}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              currentSort === 'desc'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-900/40'
                : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border-neutral-700/80 hover:text-white'
            }`}
          >
            <ArrowDownAZ className="w-3.5 h-3.5 text-amber-400" />
            <span>{isNumeric ? '9 → 0 (Menurun)' : 'Z → A (Menurun)'}</span>
          </button>
        </div>

        {currentSort && (
          <button
            type="button"
            onClick={() => onSortChange(null)}
            className="w-full mt-1.5 py-1 text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Pengurutan Kolom Ini</span>
          </button>
        )}
      </div>

      {/* 2. SECTION: PENYARINGAN NILAI (FILTER BY VALUES) */}
      <div className="pt-2 border-t border-neutral-800">
        <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
          <span>Filter Nilai Kolom</span>
          {selectedValues !== null && (
            <span className="text-[10px] text-teal-400 font-medium">
              {checkedValues.size} dari {allUniqueValues.length} dipilih
            </span>
          )}
        </div>

        {/* Search input within values */}
        <div className="relative mb-2">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari nilai di kolom ini..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg pl-7 pr-6 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2 top-2 pointer-events-none" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 text-neutral-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Quick select / clear buttons */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5 px-0.5">
          <button
            type="button"
            onClick={handleSelectAll}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <CheckSquare className="w-3 h-3" />
            <span>Pilih Semua</span>
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <Square className="w-3 h-3" />
            <span>Hapus Semua</span>
          </button>
        </div>

        {/* Values Checkbox List */}
        <div className="max-h-40 overflow-y-auto space-y-0.5 bg-neutral-950/70 border border-neutral-800 rounded-lg p-1.5 mb-2.5 custom-scrollbar">
          {displayedValues.length === 0 ? (
            <div className="py-3 text-center text-neutral-500 text-[11px]">
              Tidak ada nilai yang cocok
            </div>
          ) : (
            displayedValues.map((item) => {
              const isChecked = checkedValues.has(item.value);
              return (
                <label
                  key={item.value}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-neutral-800/80 cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleValue(item.value)}
                      className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                    />
                    <span className={`truncate ${isChecked ? 'text-neutral-200' : 'text-neutral-500'}`}>
                      {item.value}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                    ({item.count})
                  </span>
                </label>
              );
            })
          )}
        </div>

        {/* Filter Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplyFilter}
            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan Filter</span>
          </button>
          {selectedValues !== null && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs transition-colors"
              title="Reset Filter"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
