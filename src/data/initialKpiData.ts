import { KpiIndicator, StaffProfile } from '../types/spreadsheet';

export const STAFF_PROFILES: StaffProfile[] = [
  {
    name: 'Rizki',
    role: 'Lead R&D Software & Sistem Rapor',
    division: 'R&D Aplikasi & Infrastruktur Belajar',
    leadCategories: ['Aplikasi', 'TOBK', 'Kelulusan PTN Siswa'],
    totalIndicators: 1,
  },
  {
    name: 'Gia',
    role: 'Lead Evaluasi Belajar & Asesmen TOBK',
    division: 'R&D Asesmen & Konsultasi Akademik',
    leadCategories: ['TOBK', 'Konsultasi EPB', 'Kelulusan SPMB'],
    totalIndicators: 0,
  },
  {
    name: 'Sony',
    role: 'Lead Sukses Kelulusan PTN & SPMB Kedinasan',
    division: 'R&D Kelulusan & Penempatan Kampus',
    leadCategories: ['Kelulusan SPMB', 'Kelulusan PTN Siswa', 'Konsultasi EPB'],
    totalIndicators: 0,
  },
  {
    name: 'Kenny',
    role: 'Lead Riset Inovasi & Pengembangan Modul Belajar',
    division: 'R&D Inovasi Kurikulum & Modul Digital',
    leadCategories: ['Aplikasi', 'Konsultasi EPB', 'TOBK'],
    totalIndicators: 0,
  },
];

// Sisakan HANYA 1 contoh indikator no 1 di bulan September sesuai instruksi
// Setiap bulan memiliki isian kegiatan tersendiri (mengisi September tidak mengisi bulan lain)
export const INITIAL_KPI_INDICATORS: KpiIndicator[] = [
  {
    id: 'kpi-sep-01',
    month: 'Sep',
    staff: 'Rizki',
    category: 'Aplikasi',
    name: 'Pengembangan & Pembaruan Fitur Rapor Siswa Kurikulum Merdeka',
    mediaAplikasi: 'Web Rapor Digital & Cetak PDF',
    description: 'Rilis modul input nilai guru, kalkulasi otomatis capaian kompetensi, dan cetak rapor digital format PDF.',
    target: 3,
    actual: 3,
    notes: 'Pembaruan modul deskripsi rapor Kurikulum Merdeka v3.2 berjalan optimal.',
    monthlyTargets: { Sep: 3, Okt: 0, Nov: 0, Des: 0 },
    monthlyActuals: { Sep: 3, Okt: 0, Nov: 0, Des: 0 },
  },
];
