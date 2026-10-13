import React from 'react';
import { KpiIndicator, MonthKey, MONTH_NAMES, KpiCategory, SheetTab } from '../types/spreadsheet';
import { calculatePercentage, getPerformanceStatus, getStaffMonthlyProductivity, getCategoryMonthlyProgress } from '../utils/spreadsheetMath';
import { Layers, Target, CheckCircle2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

interface ExecutiveSummaryProps {
  indicators: KpiIndicator[];
  selectedMonth: MonthKey;
  onSelectTab: (tab: SheetTab) => void;
  onSelectMonth: (month: MonthKey) => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  indicators,
  selectedMonth,
  onSelectTab,
}) => {
  const monthName = MONTH_NAMES.find((m) => m.key === selectedMonth)?.label || selectedMonth;

  // Staf scores diambil dari rata-rata % capaian (otomatis)
  const rizkiProd = getStaffMonthlyProductivity(indicators, 'Rizki', selectedMonth);
  const giaProd = getStaffMonthlyProductivity(indicators, 'Gia', selectedMonth);
  const sonyProd = getStaffMonthlyProductivity(indicators, 'Sony', selectedMonth);
  const kennyProd = getStaffMonthlyProductivity(indicators, 'Kenny', selectedMonth);

  const teamAverageProductivity = Number(
    ((rizkiProd.productivityScore + giaProd.productivityScore + sonyProd.productivityScore + kennyProd.productivityScore) / 4).toFixed(1)
  );

  // Filter indikator khusus bulan bersangkutan
  const monthIndicators = indicators.filter((i) => (i.month ? i.month === selectedMonth : true));

  // Status counters
  let totalExceeded = 0;
  let totalAchieved = 0;
  let totalWarning = 0;

  monthIndicators.forEach((ind) => {
    const t = ind.target ?? ind.monthlyTargets?.[selectedMonth] ?? 0;
    const a = ind.actual ?? ind.monthlyActuals?.[selectedMonth] ?? 0;
    const pct = calculatePercentage(t, a);
    if (pct >= 100) totalExceeded++;
    else if (pct >= 90) totalAchieved++;
    else totalWarning++;
  });

  // Daftar kategori capaian (termasuk jenis kinerja baru dan kustom)
  const activeCategoriesInMonth = Array.from(
    new Set(monthIndicators.map((i) => i.category).filter(Boolean))
  );
  const categories: KpiCategory[] = Array.from(
    new Set([
      ...activeCategoriesInMonth,
      'Tanggal TKA',
      'Nilai TKA',
      'NO SNBP',
      'NO SNBT',
      'KELULUSAN SNBP',
      'KELULUSAN SNBT',
      'KELULUSAN MANDIRI',
      'Aplikasi',
      'TOBK',
      'Konsultasi EPB',
      'Kelulusan SPMB',
      'Kelulusan PTN Siswa',
    ])
  );

  return (
    <div className="w-full p-4 lg:p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Banner & Overview */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DASHBOARD MONITORING EKSEKUTIF REAL-TIME</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Kinerja R&D Aplikasi dan Rapor Siswa — {monthName} 2026
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Konsolidasi capaian kinerja tim R&D mencakup infrastruktur aplikasi rapor, TOBK, evaluasi perkembangan belajar, dan penempatan kampus impian siswa.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800 shrink-0">
            <div>
              <div className="text-[11px] text-neutral-400 font-medium">Skor Produktivitas Tim</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{teamAverageProductivity}%</div>
              <div className="text-[10px] text-neutral-500">Rerata % Capaian Staf</div>
            </div>
            <div className="h-9 w-[1px] bg-neutral-800" />
            <div>
              <div className="text-[11px] text-neutral-400 font-medium">Status Periode</div>
              <div className="text-xs font-semibold text-teal-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Target Terlampaui</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-neutral-800">
          <div className="bg-neutral-950/70 p-3.5 rounded-lg border border-neutral-800">
            <div className="text-xs text-neutral-400">Total Indikator ({selectedMonth})</div>
            <div className="text-xl font-bold font-mono text-white mt-1">{monthIndicators.length}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Isian khusus {monthName}</div>
          </div>

          <div className="bg-neutral-950/70 p-3.5 rounded-lg border border-neutral-800">
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Target Tercapai / Lebih</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">{totalExceeded}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">≥ 100% capaian bulanan</div>
          </div>

          <div className="bg-neutral-950/70 p-3.5 rounded-lg border border-neutral-800">
            <div className="text-xs text-blue-400 flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>Sesuai Rencana (On-Track)</span>
            </div>
            <div className="text-xl font-bold font-mono text-blue-300 mt-1">{totalAchieved}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">90% - 99.9% progres</div>
          </div>

          <div className="bg-neutral-950/70 p-3.5 rounded-lg border border-neutral-800">
            <div className="text-xs text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Perlu Monitoring</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">{totalWarning}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">&lt; 90% capaian</div>
          </div>
        </div>
      </div>

      {/* Staff Scorecards (Rizki, Gia, Sony) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Skor Produktivitas Staf R&D ({monthName})</span>
          </h3>
          <span className="text-xs text-neutral-400">Diambil dari rata-rata % capaian otomatis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rizki */}
          <div
            onClick={() => onSelectTab('rizki')}
            className="group bg-neutral-900 hover:bg-neutral-850 p-4 rounded-xl border border-neutral-800 hover:border-sky-500/50 transition-all cursor-pointer shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-sky-400 font-semibold">STAF 01</span>
                <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  Rizki
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">Lead R&D Software & Sistem Rapor</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-500">Skor Produktivitas</div>
                <div className="text-xl font-bold font-mono text-sky-400">{rizkiProd.productivityScore}%</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Rerata % Capaian:</span>
                <span className="font-mono text-neutral-200 font-semibold">{rizkiProd.averagePercentage}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Fokus Kunci:</span>
                <span className="text-neutral-300 font-medium">Aplikasi · TOBK · PTN</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden mt-1">
                <div
                  className="bg-sky-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(rizkiProd.productivityScore, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-sky-400/90 font-medium group-hover:translate-x-0.5 transition-transform">
              <span>Buka Sheet Rizki</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Gia */}
          <div
            onClick={() => onSelectTab('gia')}
            className="group bg-neutral-900 hover:bg-neutral-850 p-4 rounded-xl border border-neutral-800 hover:border-purple-500/50 transition-all cursor-pointer shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-purple-400 font-semibold">STAF 02</span>
                <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  Gia
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">Lead Asesmen TOBK & Konsultasi EPB</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-500">Skor Produktivitas</div>
                <div className="text-xl font-bold font-mono text-purple-400">{giaProd.productivityScore}%</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Rerata % Capaian:</span>
                <span className="font-mono text-neutral-200 font-semibold">{giaProd.averagePercentage}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Fokus Kunci:</span>
                <span className="text-neutral-300 font-medium">TOBK · EPB · SPMB</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden mt-1">
                <div
                  className="bg-purple-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(giaProd.productivityScore, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-purple-400/90 font-medium group-hover:translate-x-0.5 transition-transform">
              <span>Buka Sheet Gia</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Sony */}
          <div
            onClick={() => onSelectTab('sony')}
            className="group bg-neutral-900 hover:bg-neutral-850 p-4 rounded-xl border border-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-amber-400 font-semibold">STAF 03</span>
                <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  Sony
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">Lead Sukses SPMB & Kelulusan PTN</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-500">Skor Produktivitas</div>
                <div className="text-xl font-bold font-mono text-amber-400">{sonyProd.productivityScore}%</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Rerata % Capaian:</span>
                <span className="font-mono text-neutral-200 font-semibold">{sonyProd.averagePercentage}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Fokus Kunci:</span>
                <span className="text-neutral-300 font-medium">SPMB · PTN · EPB</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden mt-1">
                <div
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(sonyProd.productivityScore, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-amber-400/90 font-medium group-hover:translate-x-0.5 transition-transform">
              <span>Buka Sheet Sony</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Kenny */}
          <div
            onClick={() => onSelectTab('kenny')}
            className="group bg-neutral-900 hover:bg-neutral-850 p-4 rounded-xl border border-neutral-800 hover:border-teal-500/50 transition-all cursor-pointer shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-teal-400 font-semibold">STAF 04</span>
                <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                  Kenny
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">Lead Riset Inovasi & Modul Belajar</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-500">Skor Produktivitas</div>
                <div className="text-xl font-bold font-mono text-teal-400">{kennyProd.productivityScore}%</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Rerata % Capaian:</span>
                <span className="font-mono text-neutral-200 font-semibold">{kennyProd.averagePercentage}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Fokus Kunci:</span>
                <span className="text-neutral-300 font-medium">Aplikasi · Inovasi · Modul</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden mt-1">
                <div
                  className="bg-teal-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(kennyProd.productivityScore, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-teal-400/90 font-medium group-hover:translate-x-0.5 transition-transform">
              <span>Buka Sheet Kenny</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Breakdown across the Core Assessment Areas */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Capaian Berdasarkan Jenis Kinerja ({monthName})</span>
        </h3>

        <div className="space-y-4">
          {categories.map((cat) => {
            const prog = getCategoryMonthlyProgress(indicators, cat, selectedMonth);
            const status = getPerformanceStatus(prog.averagePercentage);

            return (
              <div key={cat} className="bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{cat}</span>
                    <span className="text-xs text-neutral-500">
                      ({prog.indicatorCount} indikator)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">
                      Target: <strong className="text-neutral-200 font-mono">{prog.totalTarget}</strong> · Realisasi: <strong className="text-white font-mono">{prog.totalActual}</strong>
                    </span>
                    <span className={`text-sm font-mono font-bold ${status.textColor}`}>
                      {prog.averagePercentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      prog.averagePercentage >= 100
                        ? 'bg-emerald-500'
                        : prog.averagePercentage >= 90
                        ? 'bg-teal-500'
                        : prog.averagePercentage >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(prog.averagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
