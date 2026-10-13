import React from 'react';
import { SheetTab, StaffName } from '../types/spreadsheet';
import { FileSpreadsheet, Plus, BarChart3, Users, Calendar } from 'lucide-react';

interface BottomSheetTabsProps {
  currentTab: SheetTab;
  onTabChange: (tab: SheetTab) => void;
  onQuickAdd: () => void;
  totalIndicators: number;
  staffCounts?: {
    rizki: number;
    gia: number;
    sony: number;
    kenny: number;
  };
}

export const BottomSheetTabs: React.FC<BottomSheetTabsProps> = ({
  currentTab,
  onTabChange,
  onQuickAdd,
  totalIndicators,
  staffCounts,
}) => {
  const tabs: { key: SheetTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      key: 'consolidated',
      label: 'Konsolidasi 4 Staf',
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
      count: totalIndicators,
    },
    {
      key: 'rizki',
      label: 'Staf: Rizki',
      icon: <span className="w-2 h-2 rounded-full bg-sky-400" />,
      count: staffCounts?.rizki ?? 0,
    },
    {
      key: 'gia',
      label: 'Staf: Gia',
      icon: <span className="w-2 h-2 rounded-full bg-purple-400" />,
      count: staffCounts?.gia ?? 0,
    },
    {
      key: 'sony',
      label: 'Staf: Sony',
      icon: <span className="w-2 h-2 rounded-full bg-amber-400" />,
      count: staffCounts?.sony ?? 0,
    },
    {
      key: 'kenny',
      label: 'Staf: Kenny',
      icon: <span className="w-2 h-2 rounded-full bg-teal-400" />,
      count: staffCounts?.kenny ?? 0,
    },
    {
      key: 'matrix_12m',
      label: 'Matriks Bulanan',
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      key: 'executive',
      label: 'Ringkasan Eksekutif',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="w-full bg-neutral-900 border-t border-neutral-800 px-3 py-1.5 flex items-center justify-between text-xs select-none shrink-0 overflow-x-auto">
      <div className="flex items-center gap-1">
        {/* Quick add tab button */}
        <button
          onClick={onQuickAdd}
          title="Tambah Indikator Baru"
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors mr-1"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Sheet Tabs */}
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md font-sans text-xs transition-colors shrink-0 ${
                isActive
                  ? 'bg-neutral-950 text-emerald-400 border-t-2 border-t-emerald-500 border-x border-neutral-800 font-semibold shadow-inner'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] text-neutral-500 font-mono">({tab.count})</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="hidden lg:flex items-center gap-3 text-[11px] text-neutral-500 pr-2">
        <span>R&D Aplikasi & Rapor Siswa v2.6</span>
        <span>·</span>
        <span className="text-emerald-500 font-mono">Formula Engine: Real-Time</span>
      </div>
    </div>
  );
};
