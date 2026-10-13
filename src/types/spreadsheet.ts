export type StaffName = string;

export type KpiCategory = 
  | 'Tanggal TKA'
  | 'Nilai TKA'
  | 'NO SNBP'
  | 'NO SNBT'
  | 'KELULUSAN SNBP'
  | 'KELULUSAN SNBT'
  | 'KELULUSAN MANDIRI'
  | 'Aplikasi'
  | 'TOBK'
  | 'Konsultasi EPB'
  | 'Kelulusan SPMB'
  | 'Kelulusan PTN Siswa'
  | string;

export const KPI_CATEGORIES: string[] = [
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
];

export type MonthKey = 
  | 'Sep'
  | 'Okt'
  | 'Nov'
  | 'Des';

export const MONTH_NAMES: { key: MonthKey; label: string; full: string }[] = [
  { key: 'Sep', label: 'September', full: 'September 2026' },
  { key: 'Okt', label: 'Oktober', full: 'Oktober 2026' },
  { key: 'Nov', label: 'November', full: 'November 2026' },
  { key: 'Des', label: 'Desember', full: 'Desember 2026' },
];

export interface KpiIndicator {
  id: string;
  month: MonthKey; // Setiap bulan memiliki isian kegiatan tersendiri (Sep, Okt, Nov, Des)
  staff: StaffName;
  category: KpiCategory;
  name: string; // Indikator Target Capaian (Nama Kegiatan)
  mediaAplikasi: string; // Kolom "Media Aplikasi"
  target: number; // Target kegiatan di bulan bersangkutan
  actual: number; // Realisasi kegiatan di bulan bersangkutan
  notes?: string; // Catatan & evaluasi kegiatan di bulan bersangkutan
  description?: string;
  date?: string; // Kolom "Tanggal"
  // Properti kompatibilitas opsional
  monthlyTargets?: Partial<Record<MonthKey, number>>;
  monthlyActuals?: Partial<Record<MonthKey, number>>;
  dates?: Partial<Record<MonthKey, string>>;
}

export interface StaffProfile {
  name: StaffName;
  role: string;
  division: string;
  leadCategories: string[];
  totalIndicators: number;
}

export type SheetTab = 
  | 'consolidated' // Sheet 1: Master Konsolidasi 4 Staf
  | 'rizki'        // Sheet 2: Staf Rizki
  | 'gia'          // Sheet 3: Staf Gia
  | 'sony'         // Sheet 4: Staf Sony
  | 'kenny'        // Sheet 5: Staf Kenny
  | 'matrix_12m'   // Sheet 6: Matriks Bulanan (Sep - Des)
  | 'executive';   // Sheet 7: Ringkasan Analitik & Visual

export interface ActiveCellInfo {
  row: number;
  col: string;
  colLabel: string;
  indicatorId: string;
  field: 'name' | 'category' | 'staff' | 'mediaAplikasi' | 'date' | 'target' | 'actual' | 'percentage' | 'status' | 'notes';
  value: string | number;
  formula: string;
}
