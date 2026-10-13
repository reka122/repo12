/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  KpiIndicator, 
  SheetTab, 
  MonthKey, 
  KpiCategory, 
  StaffName, 
  ActiveCellInfo,
  MONTH_NAMES,
  KPI_CATEGORIES
} from './types/spreadsheet';
import { INITIAL_KPI_INDICATORS } from './data/initialKpiData';
import { exportToCSV, generateSpreadsheetTSV } from './utils/spreadsheetMath';

import { TopNav } from './components/TopNav';
import { SpreadsheetToolbar } from './components/SpreadsheetToolbar';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { StaffReportCard } from './components/StaffReportCard';
import { YearlyMatrixGrid } from './components/YearlyMatrixGrid';
import { BottomSheetTabs } from './components/BottomSheetTabs';
import { AddKpiModal } from './components/AddKpiModal';
import { GoogleSheetsGuideModal } from './components/GoogleSheetsGuideModal';

const STORAGE_KEY = 'rd_edumetrics_kpi_indicators_v7';
const CUSTOM_CATEGORIES_STORAGE_KEY = 'rd_edumetrics_custom_categories_v2';

export default function App() {
  // 1. Core State
  const [indicators, setIndicators] = useState<KpiIndicator[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_KPI_INDICATORS;
  });

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const allCategories = useMemo(() => {
    const set = new Set([...KPI_CATEGORIES, ...customCategories]);
    return Array.from(set);
  }, [customCategories]);

  const handleAddCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    setCustomCategories((prev) => {
      if (prev.includes(trimmed) || KPI_CATEGORIES.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      try {
        localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const [currentTab, setCurrentTab] = useState<SheetTab>('consolidated');
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>('Sep');
  const [selectedCategory, setSelectedCategory] = useState<KpiCategory | 'ALL'>('ALL');
  const [selectedStaff, setSelectedStaff] = useState<StaffName | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCell, setActiveCell] = useState<ActiveCellInfo | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [copiedState, setCopiedState] = useState(false);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(indicators));
    } catch {
      // ignore
    }
  }, [indicators]);

  // Synchronize staff filter when sheet tab changes
  useEffect(() => {
    if (currentTab === 'rizki') {
      setSelectedStaff('Rizki');
    } else if (currentTab === 'gia') {
      setSelectedStaff('Gia');
    } else if (currentTab === 'sony') {
      setSelectedStaff('Sony');
    } else if (currentTab === 'kenny') {
      setSelectedStaff('Kenny');
    } else if (currentTab === 'consolidated') {
      setSelectedStaff('ALL');
    }
  }, [currentTab]);

  // Filtered indicators based on month, tab, category, staff, and search query
  // Setiap bulan memiliki isian masing-masing kegiatan
  const filteredIndicators = useMemo(() => {
    return indicators.filter((ind) => {
      // Wajib sesuai bulan yang aktif
      const itemMonth = ind.month || 'Sep';
      if (itemMonth !== selectedMonth) return false;

      // Sheet tab specific filter
      if (currentTab === 'rizki' && ind.staff !== 'Rizki') return false;
      if (currentTab === 'gia' && ind.staff !== 'Gia') return false;
      if (currentTab === 'sony' && ind.staff !== 'Sony') return false;
      if (currentTab === 'kenny' && ind.staff !== 'Kenny') return false;

      // Staff dropdown filter (if on consolidated sheet)
      if (currentTab === 'consolidated' && selectedStaff !== 'ALL' && ind.staff !== selectedStaff) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && ind.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = ind.name.toLowerCase().includes(q);
        const matchesCategory = ind.category.toLowerCase().includes(q);
        const matchesStaff = ind.staff.toLowerCase().includes(q);
        const matchesMedia = ind.mediaAplikasi.toLowerCase().includes(q);
        const matchesDesc = (ind.description || '').toLowerCase().includes(q);
        return matchesName || matchesCategory || matchesStaff || matchesMedia || matchesDesc;
      }

      return true;
    });
  }, [indicators, selectedMonth, currentTab, selectedStaff, selectedCategory, searchQuery]);

  // Staff counts for the active month
  const staffCounts = useMemo(() => {
    const monthInds = indicators.filter((i) => (i.month || 'Sep') === selectedMonth);
    return {
      rizki: monthInds.filter((i) => i.staff === 'Rizki').length,
      gia: monthInds.filter((i) => i.staff === 'Gia').length,
      sony: monthInds.filter((i) => i.staff === 'Sony').length,
      kenny: monthInds.filter((i) => i.staff === 'Kenny').length,
    };
  }, [indicators, selectedMonth]);

  // Handler: Update any field directly (Nama Staf, Jenis Kinerja, Indikator, Media Aplikasi, Tanggal, Target, Realisasi, Catatan)
  const handleUpdateField = (
    id: string,
    field: 'name' | 'category' | 'staff' | 'mediaAplikasi' | 'date' | 'target' | 'actual' | 'notes',
    value: string | number
  ) => {
    setIndicators((prev) =>
      prev.map((ind) => {
        if (ind.id === id) {
          const updated = { ...ind };
          if (field === 'target') {
            updated.target = Number(value);
            updated.monthlyTargets = {
              ...(updated.monthlyTargets || {}),
              [selectedMonth]: Number(value),
            };
          } else if (field === 'actual') {
            updated.actual = Number(value);
            updated.monthlyActuals = {
              ...(updated.monthlyActuals || {}),
              [selectedMonth]: Number(value),
            };
          } else if (field === 'date') {
            updated.date = String(value);
          } else if (field === 'notes') {
            updated.notes = String(value);
          } else if (field === 'category') {
            updated.category = value as KpiCategory;
          } else if (field === 'mediaAplikasi') {
            updated.mediaAplikasi = String(value);
          } else if (field === 'name') {
            updated.name = String(value);
          } else if (field === 'staff') {
            updated.staff = String(value);
          }
          return updated;
        }
        return ind;
      })
    );

    // Update active cell value if it's currently focused
    if (activeCell && activeCell.indicatorId === id) {
      setActiveCell((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          value,
          formula: typeof value === 'number' ? `${value}` : `"${value}"`,
        };
      });
    }
  };

  // Handler: Delete indicator
  const handleDeleteIndicator = (id: string) => {
    setIndicators((prev) => prev.filter((ind) => ind.id !== id));
    if (activeCell?.indicatorId === id) {
      setActiveCell(null);
    }
  };

  // Handler: Quick add new row at bottom (+) for the active month
  const handleQuickAddRow = () => {
    const monthName = MONTH_NAMES.find((m) => m.key === selectedMonth)?.label || selectedMonth;
    const currentMonthInds = indicators.filter((i) => (i.month || 'Sep') === selectedMonth);
    const newInd: KpiIndicator = {
      id: `kpi-${selectedMonth.toLowerCase()}-${Date.now()}`,
      month: selectedMonth,
      staff: selectedStaff !== 'ALL' ? selectedStaff : 'Rizki',
      category: selectedCategory !== 'ALL' ? selectedCategory : 'Aplikasi',
      name: `Kegiatan Baru #${currentMonthInds.length + 1} (${monthName})`,
      mediaAplikasi: 'Aplikasi / Web',
      description: `Rencana kegiatan khusus bulan ${monthName} 2026.`,
      target: 1,
      actual: 1,
      notes: `Kegiatan ${monthName} 2026.`,
      monthlyTargets: { [selectedMonth]: 1 } as Record<MonthKey, number>,
      monthlyActuals: { [selectedMonth]: 1 } as Record<MonthKey, number>,
    };
    setIndicators((prev) => [...prev, newInd]);
  };

  // Helper for StaffReportCard
  const handleUpdateTargetOrActual = (id: string, field: 'target' | 'actual', value: number) => {
    handleUpdateField(id, field, value);
  };

  // Handler: Add new indicator
  const handleAddIndicator = (newInd: KpiIndicator) => {
    setIndicators((prev) => [newInd, ...prev]);
  };

  // Handler: Reset to factory default
  const handleResetData = () => {
    if (window.confirm('Reset semua data lembar kerja kinerja ke default awal?')) {
      setIndicators(INITIAL_KPI_INDICATORS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Handler: Copy TSV to Clipboard for Google Sheets / Excel
  const handleCopyClipboard = async () => {
    try {
      const tsv = generateSpreadsheetTSV(indicators, selectedMonth);
      await navigator.clipboard.writeText(tsv);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2500);
    } catch {
      // Fallback
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    }
  };

  // Handler: Export CSV file
  const handleExportCSV = () => {
    exportToCSV(indicators, selectedMonth);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100">
      {/* 1. Top Navigation Bar */}
      <TopNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedMonth={selectedMonth}
        onExportCSV={handleExportCSV}
        onCopyClipboard={handleCopyClipboard}
        onResetData={handleResetData}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        copiedState={copiedState}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {currentTab === 'executive' ? (
          <div className="flex-1 overflow-y-auto">
            <ExecutiveSummary
              indicators={indicators}
              selectedMonth={selectedMonth}
              onSelectTab={setCurrentTab}
              onSelectMonth={setSelectedMonth}
            />
          </div>
        ) : currentTab === 'matrix_12m' ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <YearlyMatrixGrid
              indicators={indicators}
              selectedStaff={selectedStaff}
            />
          </div>
        ) : currentTab === 'rizki' || currentTab === 'gia' || currentTab === 'sony' || currentTab === 'kenny' ? (
          <div className="flex-1 overflow-y-auto">
            <StaffReportCard
              staff={
                currentTab === 'rizki'
                  ? 'Rizki'
                  : currentTab === 'gia'
                  ? 'Gia'
                  : currentTab === 'sony'
                  ? 'Sony'
                  : 'Kenny'
              }
              indicators={indicators}
              selectedMonth={selectedMonth}
              onBackToSpreadsheet={() => setCurrentTab('consolidated')}
              onUpdateTargetOrActual={handleUpdateTargetOrActual}
            />
          </div>
        ) : (
          /* Master Spreadsheet View (Consolidated) */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <SpreadsheetToolbar
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedStaff={selectedStaff}
              onStaffChange={setSelectedStaff}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeCell={activeCell}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              categories={allCategories}
            />

            <SpreadsheetGrid
              indicators={filteredIndicators}
              selectedMonth={selectedMonth}
              activeCell={activeCell}
              onSelectCell={setActiveCell}
              onUpdateField={handleUpdateField}
              onDeleteIndicator={handleDeleteIndicator}
              onQuickAddRow={handleQuickAddRow}
              categories={allCategories}
              onAddCategory={handleAddCategory}
            />
          </div>
        )}
      </main>

      {/* 3. Bottom Google Sheets Style Tab Bar */}
      <BottomSheetTabs
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onQuickAdd={() => setIsAddModalOpen(true)}
        totalIndicators={filteredIndicators.length}
        staffCounts={staffCounts}
      />

      {/* 4. Add KPI Modal */}
      <AddKpiModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddIndicator={handleAddIndicator}
        selectedMonth={selectedMonth}
        categories={allCategories}
        onAddCategory={handleAddCategory}
      />

      {/* 5. Google Sheets Migration Guide Modal */}
      <GoogleSheetsGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onCopyAllTSV={handleCopyClipboard}
        copiedState={copiedState}
      />
    </div>
  );
}
