import React, { useState, useMemo } from 'react';
import { KpiIndicator, MonthKey, MONTH_NAMES, ActiveCellInfo, KpiCategory, KPI_CATEGORIES } from '../types/spreadsheet';
import { calculatePercentage, getPerformanceStatus } from '../utils/spreadsheetMath';
import { 
  Edit3, 
  Check, 
  TrendingUp, 
  Plus, 
  Trash2, 
  ChevronDown,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUpDown,
  Filter,
  RotateCcw,
  X
} from 'lucide-react';
import { CategoryPickerPopover } from './CategoryPickerPopover';
import { ColumnFilterPopover } from './ColumnFilterPopover';

interface SpreadsheetGridProps {
  indicators: KpiIndicator[];
  selectedMonth: MonthKey;
  activeCell: ActiveCellInfo | null;
  onSelectCell: (cell: ActiveCellInfo) => void;
  onUpdateField: (
    id: string,
    field: 'name' | 'category' | 'staff' | 'mediaAplikasi' | 'date' | 'target' | 'actual' | 'notes',
    value: string | number
  ) => void;
  onDeleteIndicator: (id: string) => void;
  onQuickAddRow: () => void;
  categories?: string[];
  onAddCategory?: (category: string) => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  indicators,
  selectedMonth,
  activeCell,
  onSelectCell,
  onUpdateField,
  onDeleteIndicator,
  onQuickAddRow,
  categories = KPI_CATEGORIES,
  onAddCategory,
}) => {
  const [activeCategoryPickerId, setActiveCategoryPickerId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: 'name' | 'category' | 'staff' | 'mediaAplikasi' | 'date' | 'target' | 'actual' | 'notes';
    tempValue: string;
  } | null>(null);

  // Sorting & Column Filtering State
  const [sortConfig, setSortConfig] = useState<{ col: string; direction: 'asc' | 'desc' } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [openFilterCol, setOpenFilterCol] = useState<string | null>(null);

  const monthName = MONTH_NAMES.find((m) => m.key === selectedMonth)?.label || selectedMonth;

  // Header column definitions (A to K) with key and type
  const columns: {
    letter: string;
    name: string;
    key: string;
    width: string;
    isEditable?: boolean;
    isNumeric?: boolean;
  }[] = [
    { letter: 'A', name: 'No', key: 'no', width: 'w-16 text-center', isNumeric: true },
    { letter: 'B', name: 'Nama Staf', key: 'staff', width: 'w-36', isEditable: true },
    { letter: 'C', name: 'Jenis Kinerja', key: 'category', width: 'w-48', isEditable: true },
    { letter: 'D', name: 'Indikator Target Capaian', key: 'name', width: 'min-w-[320px]', isEditable: true },
    { letter: 'E', name: 'Media Aplikasi', key: 'mediaAplikasi', width: 'min-w-[220px]', isEditable: true },
    { letter: 'F', name: `Target (${selectedMonth})`, key: 'target', width: 'w-32 text-right', isEditable: true, isNumeric: true },
    { letter: 'G', name: `Realisasi (${selectedMonth})`, key: 'actual', width: 'w-32 text-right', isEditable: true, isNumeric: true },
    { letter: 'H', name: '% Capaian (Otomatis)', key: 'percentage', width: 'w-48 text-right', isNumeric: true },
    { letter: 'I', name: 'Status Kinerja', key: 'status', width: 'w-40' },
    { letter: 'J', name: 'Catatan & Evaluasi', key: 'notes', width: 'min-w-[240px]', isEditable: true },
    { letter: 'K', name: 'Hapus', key: 'delete', width: 'w-16 text-center' },
  ];

  // Map indicators to full row data objects with calculated fields
  const rowItems = useMemo(() => {
    return indicators.map((ind, originalIdx) => {
      const target = ind.target ?? ind.monthlyTargets?.[selectedMonth] ?? 0;
      const actual = ind.actual ?? ind.monthlyActuals?.[selectedMonth] ?? 0;
      const percentage = calculatePercentage(target, actual);
      const statusObj = getPerformanceStatus(percentage);
      const notes = (typeof ind.notes === 'string' ? ind.notes : (ind.notes as any)?.[selectedMonth]) || '-';

      return {
        ind,
        originalIndex: originalIdx,
        no: originalIdx + 1,
        staff: ind.staff || '',
        category: ind.category || '',
        name: ind.name || '',
        mediaAplikasi: ind.mediaAplikasi || '',
        target,
        actual,
        percentage,
        status: statusObj.label,
        notes,
      };
    });
  }, [indicators, selectedMonth]);

  // Extract all unique values for a column (used by ColumnFilterPopover)
  const getColumnAllValues = (colKey: string): string[] => {
    return rowItems.map((row) => {
      switch (colKey) {
        case 'no':
          return String(row.no);
        case 'staff':
          return row.staff;
        case 'category':
          return row.category;
        case 'name':
          return row.name;
        case 'mediaAplikasi':
          return row.mediaAplikasi;
        case 'target':
          return String(row.target);
        case 'actual':
          return String(row.actual);
        case 'percentage':
          return `${row.percentage}%`;
        case 'status':
          return row.status;
        case 'notes':
          return row.notes;
        default:
          return '';
      }
    });
  };

  // 1. Filter rows by columnFilters
  const filteredRows = useMemo(() => {
    const filterEntries = Object.entries(columnFilters);
    if (filterEntries.length === 0) return rowItems;

    return rowItems.filter((row) => {
      for (const [colLetter, allowedVals] of filterEntries) {
        if (!allowedVals || allowedVals.length === 0) continue;
        const colDef = columns.find((c) => c.letter === colLetter);
        if (!colDef) continue;

        let cellStr = '';
        switch (colDef.key) {
          case 'no':
            cellStr = String(row.no);
            break;
          case 'staff':
            cellStr = row.staff;
            break;
          case 'category':
            cellStr = row.category;
            break;
          case 'name':
            cellStr = row.name;
            break;
          case 'mediaAplikasi':
            cellStr = row.mediaAplikasi;
            break;
          case 'target':
            cellStr = String(row.target);
            break;
          case 'actual':
            cellStr = String(row.actual);
            break;
          case 'percentage':
            cellStr = `${row.percentage}%`;
            break;
          case 'status':
            cellStr = row.status;
            break;
          case 'notes':
            cellStr = row.notes;
            break;
          default:
            cellStr = '';
        }

        if (cellStr === '') cellStr = '(Kosong)';

        if (!allowedVals.includes(cellStr)) {
          return false;
        }
      }
      return true;
    });
  }, [rowItems, columnFilters, columns]);

  // 2. Sort rows by sortConfig (A-Z, Z-A, 0-9, 9-0)
  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows;

    const colDef = columns.find((c) => c.letter === sortConfig.col);
    if (!colDef) return filteredRows;

    const key = colDef.key;
    const isNumeric = colDef.isNumeric;
    const multiplier = sortConfig.direction === 'asc' ? 1 : -1;

    return [...filteredRows].sort((a, b) => {
      if (isNumeric) {
        const valA = (a as any)[key] ?? 0;
        const valB = (b as any)[key] ?? 0;
        return (valA - valB) * multiplier;
      } else {
        const valA = String((a as any)[key] ?? '');
        const valB = String((b as any)[key] ?? '');
        return valA.localeCompare(valB, 'id', { numeric: true, sensitivity: 'base' }) * multiplier;
      }
    });
  }, [filteredRows, sortConfig, columns]);

  // Quick toggle sort for a column
  const handleToggleSort = (colLetter: string) => {
    if (sortConfig?.col !== colLetter) {
      setSortConfig({ col: colLetter, direction: 'asc' });
    } else if (sortConfig.direction === 'asc') {
      setSortConfig({ col: colLetter, direction: 'desc' });
    } else {
      setSortConfig(null);
    }
  };

  // Clear all filters and sort
  const handleClearAllFiltersAndSort = () => {
    setSortConfig(null);
    setColumnFilters({});
    setOpenFilterCol(null);
  };

  const handleStartEdit = (
    id: string,
    field: 'name' | 'category' | 'staff' | 'mediaAplikasi' | 'date' | 'target' | 'actual' | 'notes',
    currentValue: string | number
  ) => {
    setEditingCell({ id, field, tempValue: currentValue.toString() });
  };

  const handleCommitEdit = () => {
    if (!editingCell) return;
    const { id, field, tempValue } = editingCell;

    if (field === 'target' || field === 'actual') {
      const num = parseFloat(tempValue);
      if (!isNaN(num) && num >= 0) {
        onUpdateField(id, field, num);
      }
    } else {
      onUpdateField(id, field, tempValue.trim());
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommitEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Grand summary calculations based on visible sorted/filtered rows
  const totalTarget = sortedRows.reduce((acc, curr) => acc + curr.target, 0);
  const totalActual = sortedRows.reduce((acc, curr) => acc + curr.actual, 0);

  const avgPercentage = sortedRows.length > 0
    ? Number(
        (
          sortedRows.reduce((acc, curr) => acc + curr.percentage, 0) / sortedRows.length
        ).toFixed(1)
      )
    : 0;

  const hasActiveFilterOrSort = Boolean(sortConfig || Object.keys(columnFilters).length > 0);

  return (
    <div className="w-full bg-neutral-950 flex-1 overflow-auto select-none flex flex-col">
      {/* Active Filter & Sort Indicator Banner */}
      {hasActiveFilterOrSort && (
        <div className="bg-neutral-900/90 border-b border-emerald-900/50 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter & Urutan Aktif:</span>
            </span>

            {/* Sort badge */}
            {sortConfig && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/80 text-emerald-300 font-medium">
                {sortConfig.direction === 'asc' ? (
                  <ArrowUpAZ className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ArrowDownAZ className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>
                  Kolom {sortConfig.col} ({columns.find((c) => c.letter === sortConfig.col)?.name}):{' '}
                  <strong className="text-white">
                    {sortConfig.direction === 'asc'
                      ? columns.find((c) => c.letter === sortConfig.col)?.isNumeric
                        ? '0 → 9 (Menaik)'
                        : 'A → Z (Menaik)'
                      : columns.find((c) => c.letter === sortConfig.col)?.isNumeric
                      ? '9 → 0 (Menurun)'
                      : 'Z → A (Menurun)'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSortConfig(null)}
                  className="hover:text-white text-emerald-400/80 ml-0.5 p-0.5 rounded hover:bg-neutral-800"
                  title="Hapus urutan"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Column filter badges */}
            {Object.entries(columnFilters).map(([colLetter, vals]) => {
              const colDef = columns.find((c) => c.letter === colLetter);
              return (
                <span
                  key={colLetter}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-950 border border-teal-700/80 text-teal-300 font-medium"
                >
                  <Filter className="w-3 h-3 text-teal-400" />
                  <span>
                    {colDef?.name || `Kolom ${colLetter}`}:{' '}
                    <strong className="text-white">{vals.length} dipilih</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setColumnFilters((prev) => {
                        const next = { ...prev };
                        delete next[colLetter];
                        return next;
                      });
                    }}
                    className="hover:text-white text-teal-400/80 ml-0.5 p-0.5 rounded hover:bg-neutral-800"
                    title="Hapus filter kolom ini"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            <span className="text-neutral-500 text-[11px]">
              (Menampilkan {sortedRows.length} dari {indicators.length} baris)
            </span>
          </div>

          <button
            type="button"
            onClick={handleClearAllFiltersAndSort}
            className="inline-flex items-center gap-1.5 text-[11px] text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-750 px-2.5 py-1 rounded-lg border border-neutral-700 transition-colors shrink-0"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span>Reset Semua Filter & Urutan</span>
          </button>
        </div>
      )}

      <div className="min-w-[1400px] flex-1">
        {/* Spreadsheet Table */}
        <table className="w-full border-collapse text-xs font-mono">
          {/* Topmost Column Letter Row (A, B, C, D...) */}
          <thead className="sticky top-0 z-20 bg-neutral-900 border-b border-neutral-700">
            <tr className="bg-neutral-900/90 text-neutral-400 text-[10px] uppercase font-semibold">
              <th className="w-10 py-1 px-1 border-r border-neutral-800 text-center font-normal text-neutral-600 bg-neutral-950">
                #
              </th>
              {columns.map((col) => {
                const isColActive = activeCell?.col === col.letter;
                const isColSorted = sortConfig?.col === col.letter;
                const isColFiltered = Boolean(columnFilters[col.letter]);

                return (
                  <th
                    key={col.letter}
                    className={`py-1 px-2 border-r border-neutral-800 text-center transition-colors ${
                      isColActive ? 'bg-emerald-950 text-emerald-300 font-bold' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{col.letter}</span>
                      {isColSorted && (
                        <span
                          className="px-1 py-0.2 text-[9px] rounded bg-emerald-600 text-white font-mono"
                          title={`Kolom ${col.letter} terurut`}
                        >
                          {sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'}
                        </span>
                      )}
                      {isColFiltered && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"
                          title="Filter aktif"
                        />
                      )}
                      {col.isEditable && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" title="Kolom dapat diedit langsung" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>

            {/* Column Label / Field Names with Sort & Filter Controls */}
            <tr className="bg-neutral-850 text-neutral-300 font-semibold text-xs border-b border-neutral-700">
              <th className="py-2.5 px-2 border-r border-neutral-800 text-center text-neutral-500 bg-neutral-900">
                •
              </th>
              {columns.map((col) => {
                const isColSorted = sortConfig?.col === col.letter;
                const isColFiltered = Boolean(columnFilters[col.letter]);
                const isFilterOpen = openFilterCol === col.letter;

                return (
                  <th
                    key={col.letter}
                    className={`py-2 px-2.5 border-r border-neutral-800 tracking-tight ${col.width} font-sans relative`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 truncate">
                        <span className="truncate">{col.name}</span>
                        {col.isEditable && (
                          <span className="text-[10px] text-emerald-400 font-normal opacity-70">
                            ✎
                          </span>
                        )}
                      </div>

                      {/* Filter & Sort Controls for Columns A to J */}
                      {col.key !== 'delete' && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          {/* 1. Quick Sort Button (A-Z / Z-A) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSort(col.letter);
                            }}
                            title={`Urutkan ${col.name} (${
                              isColSorted
                                ? sortConfig.direction === 'asc'
                                  ? 'A-Z aktif, klik untuk Z-A'
                                  : 'Z-A aktif, klik untuk reset'
                                : 'Klik untuk urutkan A-Z'
                            })`}
                            className={`p-1 rounded transition-colors ${
                              isColSorted
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/50'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            }`}
                          >
                            {isColSorted ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUpAZ className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <ArrowDownAZ className="w-3.5 h-3.5 text-white" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-neutral-500 hover:text-neutral-300" />
                            )}
                          </button>

                          {/* 2. Filter & Sort Popover Trigger */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenFilterCol(isFilterOpen ? null : col.letter);
                            }}
                            title={`Filter & Urutkan Kolom ${col.name}`}
                            className={`p-1 rounded transition-colors relative ${
                              isColFiltered
                                ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-sm shadow-teal-900/50'
                                : isFilterOpen
                                ? 'bg-neutral-800 text-emerald-400'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            }`}
                          >
                            <Filter className="w-3 h-3" />
                            {isColFiltered && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-300" />
                            )}
                          </button>

                          {/* Popover */}
                          {isFilterOpen && (
                            <ColumnFilterPopover
                              colLetter={col.letter}
                              colName={col.name}
                              isNumeric={col.isNumeric}
                              currentSort={sortConfig?.col === col.letter ? sortConfig.direction : null}
                              onSortChange={(dir) => {
                                if (dir === null) {
                                  if (sortConfig?.col === col.letter) setSortConfig(null);
                                } else {
                                  setSortConfig({ col: col.letter, direction: dir });
                                }
                              }}
                              allValues={getColumnAllValues(col.key)}
                              selectedValues={columnFilters[col.letter] || null}
                              onFilterChange={(values) => {
                                setColumnFilters((prev) => {
                                  const next = { ...prev };
                                  if (values === null) {
                                    delete next[col.letter];
                                  } else {
                                    next[col.letter] = values;
                                  }
                                  return next;
                                });
                              }}
                              onClose={() => setOpenFilterCol(null)}
                              align={col.letter === 'H' || col.letter === 'I' || col.letter === 'J' ? 'right' : 'left'}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-neutral-800 bg-neutral-950 text-neutral-200">
            {indicators.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-neutral-400 font-sans">
                  <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-200 text-sm">
                        Belum ada isian kegiatan di bulan {monthName} 2026
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Setiap bulan memiliki isian kegiatan tersendiri. Mengisi bulan September tidak akan mengisi bulan {monthName}.
                      </p>
                    </div>
                    <button
                      onClick={onQuickAddRow}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Kegiatan Bulan {selectedMonth} (+)</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : sortedRows.length === 0 ? (
              /* When rows exist but are all filtered out by column filters */
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-neutral-400 font-sans">
                  <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500">
                      <Filter className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-200 text-sm">
                        Tidak ada data yang cocok dengan filter kolom
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Silakan sesuaikan filter kolom atau klik reset untuk melihat semua baris.
                      </p>
                    </div>
                    <button
                      onClick={handleClearAllFiltersAndSort}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold border border-neutral-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                      <span>Reset Semua Filter Kolom</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sortedRows.map((row, index) => {
                const ind = row.ind;
                const rowNum = index + 1;
                const target = row.target;
                const actual = row.actual;
                const date = ind.date || ind.dates?.[selectedMonth] || '2026-09-15';
                const percentage = row.percentage;
                const status = getPerformanceStatus(percentage);
                const note = row.notes;

                const isCellActive = (colLetter: string) =>
                  activeCell?.row === rowNum && activeCell?.col === colLetter;

                return (
                  <tr
                    key={ind.id}
                    className={`hover:bg-neutral-900/60 transition-colors ${
                      activeCell?.row === rowNum ? 'bg-neutral-900/30' : ''
                    }`}
                  >
                    {/* Sticky Row Number Column */}
                    <td
                      className={`py-2 px-2 border-r border-neutral-800 text-center text-[11px] font-mono text-neutral-500 bg-neutral-950/90 ${
                        activeCell?.row === rowNum ? 'text-emerald-400 font-bold bg-neutral-900' : ''
                      }`}
                    >
                      {rowNum}
                    </td>

                    {/* Col A: Number */}
                    <td
                      onClick={() =>
                        onSelectCell({
                          row: rowNum,
                          col: 'A',
                          colLabel: 'No',
                          indicatorId: ind.id,
                          field: 'name',
                          value: rowNum,
                          formula: `${rowNum}`,
                        })
                      }
                      className={`sheet-cell py-2 px-2 text-center text-neutral-400 cursor-pointer ${
                        isCellActive('A') ? 'outline outline-2 outline-emerald-500 bg-emerald-950/20' : ''
                      }`}
                    >
                      {rowNum}
                    </td>

                    {/* Col B: Nama Staf (Dapat Diedit Langsung) */}
                    <td
                      onClick={() =>
                        onSelectCell({
                          row: rowNum,
                          col: 'B',
                          colLabel: 'Nama Staf',
                          indicatorId: ind.id,
                          field: 'staff',
                          value: ind.staff,
                          formula: `"${ind.staff}"`,
                        })
                      }
                      onDoubleClick={() => handleStartEdit(ind.id, 'staff', ind.staff)}
                      className={`sheet-cell py-2 px-3 font-sans font-medium cursor-pointer group relative ${
                        isCellActive('B') ? 'outline outline-2 outline-emerald-500 bg-emerald-950/20' : ''
                      }`}
                    >
                      {editingCell?.id === ind.id && editingCell.field === 'staff' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            list="staff-suggestions"
                            value={editingCell.tempValue}
                            onChange={(e) => setEditingCell({ ...editingCell, tempValue: e.target.value })}
                            onKeyDown={handleKeyDown}
                            onBlur={handleCommitEdit}
                            placeholder="Nama Staf"
                            className="w-full bg-neutral-900 text-emerald-400 font-bold text-xs px-2 py-1 rounded border border-emerald-500 focus:outline-none"
                          />
                          <datalist id="staff-suggestions">
                            <option value="Rizki" />
                            <option value="Gia" />
                            <option value="Sony" />
                            <option value="Kenny" />
                          </datalist>
                          <button onClick={handleCommitEdit} className="p-1 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-semibold ${
                              ind.staff === 'Rizki'
                                ? 'text-sky-400'
                                : ind.staff === 'Gia'
                                ? 'text-purple-400'
                                : ind.staff === 'Sony'
                                ? 'text-amber-400'
                                : ind.staff === 'Kenny'
                                ? 'text-teal-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {ind.staff}
                          </span>
                          <Edit3 className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      )}
                    </td>

                    {/* Col C: Jenis Kinerja (Interactive Searchable Dropdown with Search on Top & + on Bottom) */}
                    <td
                      onClick={() =>
                        onSelectCell({
                          row: rowNum,
                          col: 'C',
                          colLabel: 'Jenis Kinerja',
                          indicatorId: ind.id,
                          field: 'category',
                          value: ind.category,
                          formula: `"${ind.category}"`,
                        })
                      }
                      onDoubleClick={() => setActiveCategoryPickerId(ind.id)}
                      className={`sheet-cell py-2 px-3 font-sans cursor-pointer group relative ${
                        isCellActive('C') ? 'outline outline-2 outline-emerald-500 bg-emerald-950/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs text-neutral-200 font-medium truncate">
                          {ind.category}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCategoryPickerId((prev) => (prev === ind.id ? null : ind.id));
                          }}
                          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 opacity-60 group-hover:opacity-100 transition-all shrink-0"
                          title="Pilih / Cari / Tambah Jenis Kinerja (+)"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Popover Pencarian & Penambahan Manual Jenis Kinerja */}
                      {activeCategoryPickerId === ind.id && (
                        <CategoryPickerPopover
                          currentCategory={ind.category}
                          categories={categories}
                          onSelect={(newCat) => {
                            onUpdateField(ind.id, 'category', newCat);
                            setActiveCategoryPickerId(null);
                          }}
                          onAddCategory={onAddCategory}
                          onClose={() => setActiveCategoryPickerId(null)}
                        />
                      )}
                    </td>

                    {/* Col D: Indikator Target Capaian (Direct Editable Text) */}
                    <td
                      onClick={() =>
                        onSelectCell({
                          row: rowNum,
                          col: 'D',
                          colLabel: 'Indikator Target Capaian',
                          indicatorId: ind.id,
                          field: 'name',
                          value: ind.name,
                          formula: `"${ind.name}"`,
                        })
                      }
                      onDoubleClick={() => handleStartEdit(ind.id, 'name', ind.name)}
                      className={`sheet-cell py-2 px-3 font-sans text-neutral-100 cursor-pointer group relative ${
                        isCellActive('D') ? 'outline outline-2 outline-emerald-500 bg-emerald-950/20' : ''
                      }`}
                    >
                      {editingCell?.id === ind.id && editingCell.field === 'name' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            value={editingCell.tempValue}
                            onChange={(e) => setEditingCell({ ...editingCell, tempValue: e.target.value })}
                            onKeyDown={handleKeyDown}
                            onBlur={handleCommitEdit}
                            className="w-full bg-neutral-900 text-white text-xs px-2 py-1 rounded border border-emerald-500 focus:outline-none"
                          />
                          <button onClick={handleCommitEdit} className="p-1 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-xs text-neutral-100 leading-snug">{ind.name}</div>
                          <Edit3 className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      )}
                    </td>

                    {/* Col E: Media Aplikasi (Direct Editable Text) */}
                    <td
                      onClick={() =>
                        onSelectCell({
                          row: rowNum,
                          col: 'E',
                          colLabel: 'Media Aplikasi',
                          indicatorId: ind.id,
                          field: 'mediaAplikasi',
                          value: ind.mediaAplikasi,
                          formula: `"${ind.mediaAplikasi}"`,
                        })
                      }
                      onDoubleClick={() => handleStartEdit(ind.id, 'mediaAplikasi', ind.mediaAplikasi)}
                      className={`sheet-cell py-2 px-3 font-sans text-neutral-200 cursor-pointer group relative ${
                        isCellActive('E') ? 'outline outline-2 outline-emerald-500 bg-emerald-950/20' : ''
                      }`}
                    >
                      {editingCell?.id === ind.id && editingCell.field === 'mediaAplikasi' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            value={editingCell.tempValue}
                            onChange={(e) => setEditingCell({ ...editingCell, tempValue: e.target.value })}
                            onKeyDown={handleKeyDown}
                            onBlur={handleCommitEdit}
                            className="w-full bg-neutral-900 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500 focus:outline-none"
                          />
                          <button onClick={handleCommitEdit} className="p-1 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-medium text-neutral-300 bg-neutral-900/90 px-2 py-1 rounded border border-neutral-800">
                            {ind.mediaAplikasi}
                          </span>
                          <Edit3 className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      )}
                    </td>

                    {/* Col F: Target Bulanan (Direct Editable Number) */}
                    <td
                      onClick={() => {
                        onSelectCell({
                          row: rowNum,
                          col: 'F',
                          colLabel: `Target ${selectedMonth}`,
                          indicatorId: ind.id,
                          field: 'target',
                          value: target,
                          formula: `${target}`,
                        });
                      }}
                      onDoubleClick={() => handleStartEdit(ind.id, 'target', target)}
                      className={`sheet-cell py-2 px-3 text-right font-mono cursor-pointer transition-colors group relative ${
                        isCellActive('F') ? 'outline outline-2 outline-emerald-500 bg-emerald-950/30' : ''
                      }`}
                    >
                      {editingCell?.id === ind.id && editingCell.field === 'target' ? (
                        <div className="flex items-center gap-1 justify-end">
                          <input
                            type="number"
                            autoFocus
                            value={editingCell.tempValue}
                            onChange={(e) => setEditingCell({ ...editingCell, tempValue: e.target.value })}
                            onKeyDown={handleKeyDown}
                            onBlur={handleCommitEdit}
                            className="w-20 bg-neutral-900 text-emerald-400 text-right px-1.5 py-0.5 rounded border border-emerald-500 focus:outline-none font-mono"
                          />
                          <button onClick={handleCommitEdit} className="p-0.5 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-neutral-200 font-semibold">{target}</span>
                          <Edit3 className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Col G: Realisasi Capaian (Direct Editable Number) */}
                    <td
                      onClick={() => {
                        onSelectCell({
                          row: rowNum,
                          col: 'G',
                          colLabel: `Realisasi ${selectedMonth}`,
                          indicatorId: ind.id,
                          field: 'actual',
                          value: actual,
                          formula: `${actual}`,
                        });
                      }}
                      onDoubleClick={() => handleStartEdit(ind.id, 'actual', actual)}
                      className={`sheet-cell py-2 px-3 text-right font-mono cursor-pointer transition-colors group relative ${
                        isCellActive('G') ? 'outline outline-2 outline-emerald-500 bg-emerald-950/30' : ''
                      }`}
                    >
                      {editingCell?.id === ind.id && editingCell.field === 'actual' ? (
                        <div className="flex items-center gap-1 justify-end">
                          <input
                            type="number"
                            autoFocus
                            value={editingCell.tempValue}
                            onChange={(e) => setEditingCell({ ...editingCell, tempValue: e.target.value })}
                            onKeyDown={handleKeyDown}
                            onBlur={handleCommitEdit}
                            className="w-20 bg-neutral-900 text-emerald-400 text-right px-1.5 py-0.5 rounded border border-emerald-500 focus:outline-none font-mono"
                          />
                          <button onClick={handleCommitEdit} className="p-0.5 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-white font-bold">{actual}</span>
                          <Edit3 className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Col H: % Capaian Otomatis (Formula Column) */}
                    <td
                      onClick={() =>
                        onSelectCell({
                          row: rowNum,
                          col: 'H',
                          colLabel: '% Capaian Otomatis (Target / Realisasi)',
                          indicatorId: ind.id,
                          field: 'percentage',
                          value: `${percentage}%`,
                          formula: `=ROUND((F${rowNum}/G${rowNum})*100, 1) & "%"`,
                        })
                      }
                      className={`sheet-cell py-2 px-3 text-right font-mono cursor-pointer ${
                        isCellActive('H') ? 'outline outline-2 outline-emerald-500 bg-emerald-950/30' : ''
                      }`}
                    >
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={status.textColor}>{percentage}%</span>
                        </div>
                        {/* Inline progress bar */}
                        <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              percentage >= 100
                                ? 'bg-emerald-400'
                                : percentage >= 90
                                ? 'bg-teal-400'
                                : percentage >= 75
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Col I: Status Kinerja */}
                    <td
                      onClick={() =>
                        onSelectCell({
                          row: rowNum,
                          col: 'I',
                          colLabel: 'Status Kinerja',
                          indicatorId: ind.id,
                          field: 'status',
                          value: status.label,
                          formula: `=IF(H${rowNum}>=100, "Tercapai", IF(H${rowNum}>=75, "Cukup", "Perlu Perhatian"))`,
                        })
                      }
                      className={`sheet-cell py-2 px-3 font-sans text-xs cursor-pointer ${
                        isCellActive('I') ? 'outline outline-2 outline-emerald-500 bg-emerald-950/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            percentage >= 100 ? 'bg-emerald-400' : percentage >= 75 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                        />
                        <span className={`font-medium ${status.textColor}`}>{status.shortLabel}</span>
                      </div>
                    </td>

                    {/* Col J: Catatan & Evaluasi (Direct Editable) */}
                    <td
                      onClick={() =>
                        onSelectCell({
                          row: rowNum,
                          col: 'J',
                          colLabel: 'Catatan & Evaluasi',
                          indicatorId: ind.id,
                          field: 'notes',
                          value: note,
                          formula: `"${note}"`,
                        })
                      }
                      onDoubleClick={() => handleStartEdit(ind.id, 'notes', note === '-' ? '' : note)}
                      className={`sheet-cell py-2 px-3 font-sans text-neutral-400 text-xs cursor-pointer group relative ${
                        isCellActive('J') ? 'outline outline-2 outline-emerald-500 bg-emerald-950/30' : ''
                      }`}
                    >
                      {editingCell?.id === ind.id && editingCell.field === 'notes' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            value={editingCell.tempValue}
                            onChange={(e) => setEditingCell({ ...editingCell, tempValue: e.target.value })}
                            onKeyDown={handleKeyDown}
                            onBlur={handleCommitEdit}
                            placeholder="Tulis catatan evaluasi..."
                            className="w-full bg-neutral-900 text-neutral-100 text-xs px-2 py-1 rounded border border-emerald-500 focus:outline-none font-sans"
                          />
                          <button onClick={handleCommitEdit} className="p-1 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate max-w-[260px]">{note}</span>
                          <Edit3 className="w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      )}
                    </td>

                    {/* Col K: Hapus Indikator (Kolom di ujung kanan) */}
                    <td className="py-2 px-2 text-center border-l border-neutral-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteIndicator(ind.id);
                        }}
                        title={`Hapus Indikator "${ind.name}"`}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors group"
                      >
                        <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}

            {/* Quick Add Row dibagian bawah kolom (+) */}
            <tr className="bg-neutral-900/40 hover:bg-neutral-900/80 transition-colors border-t border-neutral-800 group">
              <td className="py-2 px-2 text-center bg-neutral-950/80 border-r border-neutral-800">
                <button
                  onClick={onQuickAddRow}
                  title="Tambah Baris Indikator Baru (+)"
                  className="w-6 h-6 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-neutral-950 font-bold flex items-center justify-center transition-all mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </td>
              <td colSpan={columns.length} className="py-2 px-3">
                <button
                  onClick={onQuickAddRow}
                  className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah baris indikator kinerja baru (+)</span>
                </button>
              </td>
            </tr>
          </tbody>

          {/* Sticky Grand Summary Footer */}
          <tfoot className="sticky bottom-0 z-10 bg-neutral-900 border-t-2 border-neutral-700 text-neutral-200 font-semibold shadow-lg">
            <tr className="divide-x divide-neutral-800">
              <td className="py-2.5 px-2 text-center text-neutral-500 bg-neutral-950 text-xs">∑</td>
              <td colSpan={5} className="py-2.5 px-3 font-sans text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">TOTAL / RATA-RATA KONSOLIDASI</span>
                  <span className="text-[11px] text-neutral-500">({indicators.length} Indikator Kinerja)</span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-neutral-300 text-xs">
                {totalTarget.toLocaleString('id-ID')}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-white text-xs">
                {totalActual.toLocaleString('id-ID')}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-xs">
                <div className="flex flex-col items-end">
                  <span className={avgPercentage >= 100 ? 'text-emerald-400 font-bold' : 'text-teal-300 font-bold'}>
                    {avgPercentage}%
                  </span>
                  <span className="text-[10px] text-neutral-400 font-sans font-normal">Rata-rata Capaian</span>
                </div>
              </td>
              <td colSpan={3} className="py-2.5 px-3 font-sans text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">
                    Skor Produktivitas ({monthName}):{' '}
                    <strong className="font-mono text-white text-sm">{avgPercentage}%</strong> (
                    {avgPercentage >= 100 ? 'Sangat Optimal' : 'Baik'})
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Spreadsheet Quick Tip Footer */}
      <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-800 text-[11px] text-neutral-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span>
            💡 <strong>Interaktif:</strong> Gunakan ikon <strong className="text-emerald-400">⇅</strong> di setiap header kolom untuk sort <strong>A-Z / Z-A</strong> (atau terkecil-terbesar), dan ikon <strong className="text-teal-400">Filter</strong> untuk menyaring nilai tertentu. Klik ganda pada sel untuk mengedit langsung. Gunakan tombol <strong className="text-rose-400">Hapus</strong> atau tombol <strong className="text-emerald-400">+</strong> di bawah untuk menambah baris kegiatan.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> &gt;100% Melampaui
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-400" /> 90-99% Sesuai Target
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> 75-89% Cukup
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt;75% Perhatian
          </span>
        </div>
      </div>
    </div>
  );
};
