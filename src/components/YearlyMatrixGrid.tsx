import React, { useState } from 'react';
import { KpiIndicator, MonthKey, MONTH_NAMES, StaffName } from '../types/spreadsheet';
import { calculatePercentage, getPerformanceStatus } from '../utils/spreadsheetMath';
import { Calendar, Filter, Users, TrendingUp } from 'lucide-react';

interface YearlyMatrixGridProps {
  indicators: KpiIndicator[];
  selectedStaff: StaffName | 'ALL';
}

export const YearlyMatrixGrid: React.FC<YearlyMatrixGridProps> = ({
  indicators,
  selectedStaff,
}) => {
  const [filterMonth, setFilterMonth] = useState<MonthKey | 'ALL'>('ALL');

  const filtered = indicators.filter((ind) => {
    if (selectedStaff !== 'ALL' && ind.staff !== selectedStaff) return false;
    if (filterMonth !== 'ALL' && ind.month !== filterMonth) return false;
    return true;
  });

  const staffList: StaffName[] = ['Rizki', 'Gia', 'Sony', 'Kenny'];
  const months: MonthKey[] = ['Sep', 'Okt', 'Nov', 'Des'];

  // Summary per staff per month
  const staffSummaries = staffList.map((st) => {
    const monthStats = months.map((m) => {
      const monthInds = indicators.filter((i) => i.staff === st && (i.month ? i.month === m : true));
      const count = monthInds.length;
      if (count === 0) {
        return { month: m, count: 0, target: 0, actual: 0, percentage: 0, hasData: false };
      }
      const t = monthInds.reduce((acc, curr) => acc + (curr.target ?? curr.monthlyTargets?.[m] ?? 0), 0);
      const a = monthInds.reduce((acc, curr) => acc + (curr.actual ?? curr.monthlyActuals?.[m] ?? 0), 0);
      const pct = Number(
        (monthInds.reduce((acc, curr) => {
          const ct = curr.target ?? curr.monthlyTargets?.[m] ?? 0;
          const ca = curr.actual ?? curr.monthlyActuals?.[m] ?? 0;
          return acc + calculatePercentage(ct, ca);
        }, 0) / count).toFixed(1)
      );
      return { month: m, count, target: t, actual: a, percentage: pct, hasData: true };
    });

    const activeMonths = monthStats.filter((ms) => ms.hasData);
    const overallAvg = activeMonths.length > 0
      ? Number((activeMonths.reduce((acc, curr) => acc + curr.percentage, 0) / activeMonths.length).toFixed(1))
      : 0;

    return {
      staff: st,
      monthStats,
      overallAvg,
    };
  });

  return (
    <div className="w-full bg-neutral-950 flex-1 overflow-auto flex flex-col">
      {/* Top Filter and Info Bar */}
      <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">Matriks Kegiatan & Kinerja Bulanan (Sep - Des 2026)</span>
          <span className="text-neutral-500">· {filtered.length} Isian Kegiatan Terdaftar</span>
        </div>

        {/* Filter Month */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <span className="text-neutral-400 px-1 text-[11px]">Filter Periode:</span>
          <button
            onClick={() => setFilterMonth('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterMonth === 'ALL'
                ? 'bg-emerald-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Semua Bulan
          </button>
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setFilterMonth(m)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterMonth === m
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* 1. Summary Performance Matrix Card by Staff */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Rekapitulasi Capaian Kinerja per Staf (September - Desember 2026)
              </h3>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">Rumus: Target / Realisasi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-semibold">
                  <th className="py-2.5 px-3 text-left w-36 font-sans">Nama Staf</th>
                  {months.map((m) => (
                    <th key={m} className="py-2.5 px-3 text-center w-36 font-sans">
                      {m} 2026
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right w-36 font-sans text-emerald-400">Rerata Periode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-200">
                {staffSummaries.map((ss) => (
                  <tr key={ss.staff} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold">
                      <span
                        className={
                          ss.staff === 'Rizki'
                            ? 'text-sky-400'
                            : ss.staff === 'Gia'
                            ? 'text-purple-400'
                            : ss.staff === 'Sony'
                            ? 'text-amber-400'
                            : 'text-teal-400'
                        }
                      >
                        {ss.staff}
                      </span>
                    </td>
                    {ss.monthStats.map((ms) => {
                      if (!ms.hasData) {
                        return (
                          <td key={ms.month} className="py-3 px-3 text-center text-neutral-600">
                            -
                          </td>
                        );
                      }
                      const status = getPerformanceStatus(ms.percentage);
                      return (
                        <td key={ms.month} className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`font-bold ${status.textColor}`}>
                              {ms.percentage}%
                            </span>
                            <span className="text-[10px] text-neutral-500 font-sans">
                              {ms.count} kegiatan (T:{ms.target} / R:{ms.actual})
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-right font-bold text-emerald-400 text-sm">
                      {ss.overallAvg > 0 ? `${ss.overallAvg}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Detailed Activities Listing */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Daftar Isian Kegiatan Masing-Masing Bulan ({filtered.length} Entri)
            </h3>
            <span className="text-xs text-neutral-400">
              {filterMonth === 'ALL' ? 'Menampilkan Semua Bulan' : `Khusus Bulan ${filterMonth}`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-semibold">
                  <th className="py-2 px-2 text-center w-10">No</th>
                  <th className="py-2 px-2.5 text-center w-20 font-sans">Bulan</th>
                  <th className="py-2 px-3 text-left w-28 font-sans">Staf</th>
                  <th className="py-2 px-3 text-left w-36 font-sans">Jenis Kinerja</th>
                  <th className="py-2 px-3 text-left min-w-[300px] font-sans">Indikator Kegiatan</th>
                  <th className="py-2 px-3 text-left min-w-[200px] font-sans">Media Aplikasi</th>
                  <th className="py-2 px-3 text-right w-24">Target</th>
                  <th className="py-2 px-3 text-right w-24">Realisasi</th>
                  <th className="py-2 px-3 text-right w-32 font-sans">% Capaian</th>
                  <th className="py-2 px-3 text-left w-32 font-sans">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-neutral-500 font-sans">
                      Belum ada kegiatan yang terdaftar untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ind, idx) => {
                    const m = ind.month || 'Sep';
                    const target = ind.target ?? ind.monthlyTargets?.[m] ?? 0;
                    const actual = ind.actual ?? ind.monthlyActuals?.[m] ?? 0;
                    const pct = calculatePercentage(target, actual);
                    const status = getPerformanceStatus(pct);

                    return (
                      <tr key={ind.id} className="hover:bg-neutral-850/50 transition-colors">
                        <td className="py-2.5 px-2 text-center text-neutral-500">{idx + 1}</td>
                        <td className="py-2.5 px-2.5 text-center font-sans">
                          <span className="px-2 py-0.5 rounded bg-neutral-800 font-semibold text-emerald-400 text-[11px]">
                            {m} 2026
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans font-semibold">
                          <span
                            className={
                              ind.staff === 'Rizki'
                                ? 'text-sky-400'
                                : ind.staff === 'Gia'
                                ? 'text-purple-400'
                                : ind.staff === 'Sony'
                                ? 'text-amber-400'
                                : 'text-teal-400'
                            }
                          >
                            {ind.staff}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-neutral-300">{ind.category}</td>
                        <td className="py-2.5 px-3 font-sans text-white font-medium">{ind.name}</td>
                        <td className="py-2.5 px-3 font-sans text-neutral-400">{ind.mediaAplikasi}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-neutral-300">{target}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-white font-bold">{actual}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          <span className={status.textColor}>{pct}%</span>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                pct >= 100 ? 'bg-emerald-400' : pct >= 75 ? 'bg-amber-400' : 'bg-rose-500'
                              }`}
                            />
                            <span className={`text-xs ${status.textColor}`}>{status.shortLabel}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
