import React, { useState } from 'react';
import { KpiIndicator, KpiCategory, StaffName, MonthKey, KPI_CATEGORIES } from '../types/spreadsheet';
import { X, Plus, ChevronDown, Tag } from 'lucide-react';
import { CategoryPickerPopover } from './CategoryPickerPopover';

interface AddKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIndicator: (newInd: KpiIndicator) => void;
  selectedMonth: MonthKey;
  categories?: string[];
  onAddCategory?: (category: string) => void;
}

export const AddKpiModal: React.FC<AddKpiModalProps> = ({
  isOpen,
  onClose,
  onAddIndicator,
  selectedMonth,
  categories = KPI_CATEGORIES,
  onAddCategory,
}) => {
  const [staff, setStaff] = useState<StaffName>('Rizki');
  const [category, setCategory] = useState<KpiCategory>('Tanggal TKA');
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [name, setName] = useState('');
  const [mediaAplikasi, setMediaAplikasi] = useState('Web Rapor Digital & CBT');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState(5);
  const [actual, setActual] = useState(5);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newInd: KpiIndicator = {
      id: `kpi-${selectedMonth.toLowerCase()}-${Date.now()}`,
      month: selectedMonth,
      staff,
      category,
      name: name.trim(),
      mediaAplikasi: mediaAplikasi.trim() || 'Aplikasi R&D',
      description: description.trim(),
      target: Number(target),
      actual: Number(actual),
      notes: note.trim() || `Kegiatan khusus ${selectedMonth} 2026.`,
      monthlyTargets: { [selectedMonth]: Number(target) } as Record<MonthKey, number>,
      monthlyActuals: { [selectedMonth]: Number(actual) } as Record<MonthKey, number>,
    };

    onAddIndicator(newInd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950">
          <div>
            <h3 className="text-sm font-bold text-white">Tambah Indikator Capaian Kinerja ({selectedMonth} 2026)</h3>
            <p className="text-xs text-neutral-400">Tambahkan target kegiatan khusus periode {selectedMonth} untuk staf R&D</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Nama Staf</label>
              <input
                type="text"
                list="modal-staff-list"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                placeholder="Rizki / Gia / Sony / Kenny / Nama Baru"
                className="w-full bg-neutral-950 text-neutral-100 p-2 rounded-lg border border-neutral-800 focus:border-emerald-500 focus:outline-none"
              />
              <datalist id="modal-staff-list">
                <option value="Rizki" />
                <option value="Gia" />
                <option value="Sony" />
                <option value="Kenny" />
              </datalist>
            </div>

            <div className="relative">
              <label className="block text-neutral-400 font-medium mb-1">Jenis Kinerja</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryPickerOpen((prev) => !prev)}
                  className="w-full bg-neutral-950 text-neutral-100 p-2 rounded-lg border border-neutral-800 hover:border-neutral-700 focus:border-emerald-500 focus:outline-none flex items-center justify-between text-left text-xs font-sans"
                >
                  <span className="truncate font-medium text-emerald-400">{category}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                </button>

                {isCategoryPickerOpen && (
                  <CategoryPickerPopover
                    currentCategory={category}
                    categories={categories}
                    onSelect={(newCat) => {
                      setCategory(newCat);
                      setIsCategoryPickerOpen(false);
                    }}
                    onAddCategory={onAddCategory}
                    onClose={() => setIsCategoryPickerOpen(false)}
                    className="left-0 w-full"
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-medium mb-1">Media Aplikasi</label>
            <input
              type="text"
              value={mediaAplikasi}
              onChange={(e) => setMediaAplikasi(e.target.value)}
              placeholder="Web Rapor / Server CBT / Portal EPB"
              className="w-full bg-neutral-950 text-neutral-100 p-2 rounded-lg border border-neutral-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-neutral-400 font-medium mb-1">Nama Indikator Target</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pembuatan Modul Analisis Rapor Digital"
              className="w-full bg-neutral-950 text-neutral-100 p-2 rounded-lg border border-neutral-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-neutral-400 font-medium mb-1">Deskripsi & Ruang Lingkup</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan deliverable dan tolak ukur keberhasilan..."
              className="w-full bg-neutral-950 text-neutral-100 p-2 rounded-lg border border-neutral-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-800">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">
                Target Bulanan ({selectedMonth})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full bg-neutral-950 text-neutral-100 p-2 rounded-lg border border-neutral-800 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">
                Realisasi Aktual ({selectedMonth})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={actual}
                onChange={(e) => setActual(Number(e.target.value))}
                className="w-full bg-neutral-950 text-neutral-100 p-2 rounded-lg border border-neutral-800 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-medium mb-1">Catatan Awal</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tindakan atau keterangan progres..."
              className="w-full bg-neutral-950 text-neutral-100 p-2 rounded-lg border border-neutral-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simpan ke Spreadsheet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
