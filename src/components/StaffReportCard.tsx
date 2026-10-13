import React from 'react';
import { KpiIndicator, MonthKey, MONTH_NAMES, StaffName } from '../types/spreadsheet';
import { STAFF_PROFILES } from '../data/initialKpiData';
import { calculatePercentage, getPerformanceStatus, getStaffMonthlyProductivity } from '../utils/spreadsheetMath';
import { ArrowLeft, BarChart2 } from 'lucide-react';

interface StaffReportCardProps {
  staff: StaffName;
  indicators: KpiIndicator[];
  selectedMonth: MonthKey;
  onBackToSpreadsheet: () => void;
  onUpdateTargetOrActual: (id: string, field: 'target' | 'actual', value: number) => void;
}

export const StaffReportCard: React.FC<StaffReportCardProps> = ({
  staff,
  indicators,
  selectedMonth,
  onBackToSpreadsheet,
}) => {
  const profile = STAFF_PROFILES.find((p) => p.name === staff) || STAFF_PROFILES[0];
  const staffIndicators = indicators.filter((i) => i.staff === staff && (i.month ? i.month === selectedMonth : true));
  const monthName = MONTH_NAMES.find((m) => m.key === selectedMonth)?.label || selectedMonth;

  // Skor Produktivitas diambil dari rata-rata % capaian (otomatis)
  const prod = getStaffMonthlyProductivity(indicators, staff, selectedMonth);
  const status = getPerformanceStatus(prod.productivityScore);

  return (
    <div className="w-full p-4 lg:p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToSpreadsheet}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Master Lembar Kerja Konsolidasi</span>
        </button>

        <span className="text-xs text-emerald-400 font-mono">
          Periode Asesmen: {monthName} 2026
        </span>
      </div>

      {/* Staff Hero Profile Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl border ${
                staff === 'Rizki'
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  : staff === 'Gia'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  : staff === 'Sony'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
              }`}
            >
              {staff.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{profile.name}</h2>
                <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">{profile.division}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
                <span className="text-neutral-500">Fokus Penilaian:</span>
                {profile.leadCategories.map((cat) => (
                  <span
                    key={cat}
                    className="text-neutral-300 font-medium bg-neutral-950 px-2 py-0.5 rounded text-[11px] border border-neutral-800"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800 shrink-0">
            <div>
              <div className="text-xs text-neutral-400 font-medium">Skor Produktivitas</div>
              <div className={`text-3xl font-bold font-mono ${status.textColor}`}>
                {prod.productivityScore}%
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Rata-rata % Capaian</div>
            </div>
            <div className="h-10 w-[1px] bg-neutral-800" />
            <div>
              <div className="text-xs text-neutral-400 font-medium">Evaluasi Kinerja</div>
              <div className={`text-xs font-semibold mt-1 ${status.textColor}`}>
                {status.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Indicators Table & Action Plans */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Rincian {staffIndicators.length} Indikator Kinerja Staf {staff}
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono">
            Rata-rata Capaian: {prod.productivityScore}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-3 w-36">Jenis Kinerja</th>
                <th className="py-3 px-3 min-w-[280px]">Indikator Capaian Kinerja</th>
                <th className="py-3 px-3 min-w-[200px]">Media Aplikasi</th>
                <th className="py-3 px-3 w-24 text-right">Target</th>
                <th className="py-3 px-3 w-28 text-right">Realisasi</th>
                <th className="py-3 px-3 w-36 text-right">% Capaian (Otomatis)</th>
                <th className="py-3 px-3 w-32 text-center">Status</th>
                <th className="py-3 px-3 min-w-[200px]">Catatan / Progres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-200">
              {staffIndicators.map((ind, index) => {
                const target = ind.target ?? ind.monthlyTargets?.[selectedMonth] ?? 0;
                const actual = ind.actual ?? ind.monthlyActuals?.[selectedMonth] ?? 0;
                const percentage = calculatePercentage(target, actual);
                const stat = getPerformanceStatus(percentage);
                const note = (typeof ind.notes === 'string' ? ind.notes : (ind.notes as any)?.[selectedMonth]) || '-';

                return (
                  <tr key={ind.id} className="hover:bg-neutral-850/60 transition-colors">
                    <td className="py-3 px-3 text-center text-neutral-500 font-mono">{index + 1}</td>
                    <td className="py-3 px-3 font-medium text-neutral-300">{ind.category}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white text-xs">{ind.name}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-neutral-300">
                        {ind.mediaAplikasi}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-neutral-300 font-medium">
                      {target}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-white font-bold">
                      {actual}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={`font-bold ${stat.textColor}`}>{percentage}%</span>
                      <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden mt-1">
                        <div
                          className={`h-full ${
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
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${stat.bgColor} ${stat.textColor} border ${stat.borderColor}`}
                      >
                        {stat.shortLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-400 text-xs">{note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
