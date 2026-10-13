import { KpiIndicator, MonthKey, MONTH_NAMES, StaffName, KpiCategory } from '../types/spreadsheet';

export interface PerformanceStatus {
  label: string;
  shortLabel: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export function calculatePercentage(target: number, actual: number): number {
  if (actual <= 0) return 0;
  return Number(((target / actual) * 100).toFixed(1));
}

export function getPerformanceStatus(percentage: number): PerformanceStatus {
  if (percentage >= 105) {
    return {
      label: 'Melampaui Target (Sangat Baik)',
      shortLabel: 'Melampaui',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/30',
    };
  }
  if (percentage >= 100) {
    return {
      label: 'Target Tercapai Penuh',
      shortLabel: 'Tercapai',
      textColor: 'text-teal-400',
      bgColor: 'bg-teal-950/40',
      borderColor: 'border-teal-500/30',
    };
  }
  if (percentage >= 90) {
    return {
      label: 'Sesuai Rencana (On-Track)',
      shortLabel: 'On-Track',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-950/40',
      borderColor: 'border-blue-500/30',
    };
  }
  if (percentage >= 75) {
    return {
      label: 'Cukup (Perlu Ditingkatkan)',
      shortLabel: 'Cukup',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-500/30',
    };
  }
  return {
    label: 'Kurang (Butuh Intervensi)',
    shortLabel: 'Perhatian',
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-950/40',
    borderColor: 'border-rose-500/30',
  };
}

export function getStaffMonthlyProductivity(
  indicators: KpiIndicator[],
  staff: StaffName,
  month: MonthKey
): {
  productivityScore: number;
  totalTarget: number;
  totalActual: number;
  averagePercentage: number;
  indicatorCount: number;
} {
  const staffIndicators = indicators.filter((i) => i.staff === staff && (i.month ? i.month === month : true));
  if (staffIndicators.length === 0) {
    return { productivityScore: 0, totalTarget: 0, totalActual: 0, averagePercentage: 0, indicatorCount: 0 };
  }

  let totalTarget = 0;
  let totalActual = 0;
  let sumPercentage = 0;

  staffIndicators.forEach((ind) => {
    const target = ind.target ?? ind.monthlyTargets?.[month] ?? 0;
    const actual = ind.actual ?? ind.monthlyActuals?.[month] ?? 0;
    const pct = calculatePercentage(target, actual);

    totalTarget += target;
    totalActual += actual;
    sumPercentage += pct;
  });

  const avgPct = Number((sumPercentage / staffIndicators.length).toFixed(1));

  return {
    productivityScore: avgPct,
    totalTarget,
    totalActual,
    averagePercentage: avgPct,
    indicatorCount: staffIndicators.length,
  };
}

export function getCategoryMonthlyProgress(
  indicators: KpiIndicator[],
  category: KpiCategory,
  month: MonthKey
): {
  category: KpiCategory;
  averagePercentage: number;
  totalTarget: number;
  totalActual: number;
  indicatorCount: number;
} {
  const catIndicators = indicators.filter((i) => i.category === category && (i.month ? i.month === month : true));
  if (catIndicators.length === 0) {
    return { category, averagePercentage: 0, totalTarget: 0, totalActual: 0, indicatorCount: 0 };
  }

  let sumPct = 0;
  let totalTarget = 0;
  let totalActual = 0;

  catIndicators.forEach((ind) => {
    const target = ind.target ?? ind.monthlyTargets?.[month] ?? 0;
    const actual = ind.actual ?? ind.monthlyActuals?.[month] ?? 0;
    const pct = calculatePercentage(target, actual);
    sumPct += pct;
    totalTarget += target;
    totalActual += actual;
  });

  return {
    category,
    averagePercentage: Number((sumPct / catIndicators.length).toFixed(1)),
    totalTarget,
    totalActual,
    indicatorCount: catIndicators.length,
  };
}

// Generate TSV string for copying directly to Google Sheets / Excel
export function generateSpreadsheetTSV(
  indicators: KpiIndicator[],
  month: MonthKey
): string {
  const monthName = MONTH_NAMES.find((m) => m.key === month)?.label || month;
  const rows: string[] = [];

  // Filter khusus bulan bersangkutan
  const monthIndicators = indicators.filter((i) => (i.month ? i.month === month : true));

  // Title header
  rows.push(`LAPORAN KINERJA STAF R&D APLIKASI DAN RAPOR SISWA - BULAN ${monthName.toUpperCase()} 2026`);
  rows.push('');
  rows.push([
    'No',
    'Nama Staf',
    'Jenis Kinerja',
    'Indikator Capaian Kinerja',
    'Media Aplikasi',
    `Target (${monthName})`,
    `Realisasi (${monthName})`,
    '% Capaian (Otomatis)',
    'Status Kinerja',
    'Formula Spreadsheet',
  ].join('\t'));

  monthIndicators.forEach((ind, idx) => {
    const rowNum = idx + 4; // approximate row in sheet
    const target = ind.target ?? ind.monthlyTargets?.[month] ?? 0;
    const actual = ind.actual ?? ind.monthlyActuals?.[month] ?? 0;
    const pct = calculatePercentage(target, actual);
    const status = getPerformanceStatus(pct);

    rows.push([
      (idx + 1).toString(),
      ind.staff,
      ind.category,
      `"${ind.name}"`,
      `"${ind.mediaAplikasi}"`,
      target.toString(),
      actual.toString(),
      `${pct}%`,
      status.shortLabel,
      `=ROUND((F${rowNum}/G${rowNum})*100, 1) & "%"`,
    ].join('\t'));
  });

  return rows.join('\n');
}

// Generate CSV file and trigger browser download
export function exportToCSV(
  indicators: KpiIndicator[],
  month: MonthKey
): void {
  const tsv = generateSpreadsheetTSV(indicators, month);
  const csv = tsv
    .split('\n')
    .map((line) => {
      const cells = line.split('\t');
      return cells.map((cell) => {
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',');
    })
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Kinerja_RD_Aplikasi_Rapor_${month}_2026.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
