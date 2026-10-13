import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, Check, X, Tag } from 'lucide-react';
import { KpiCategory } from '../types/spreadsheet';

interface CategoryPickerPopoverProps {
  currentCategory: string;
  categories: string[];
  onSelect: (category: KpiCategory) => void;
  onAddCategory?: (category: string) => void;
  onClose: () => void;
  align?: 'left' | 'right';
  className?: string;
}

export const CategoryPickerPopover: React.FC<CategoryPickerPopoverProps> = ({
  currentCategory,
  categories,
  onSelect,
  onAddCategory,
  onClose,
  align = 'left',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualInput, setManualInput] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((cat) => cat.toLowerCase().includes(query));
  }, [categories, searchTerm]);

  // Handle manual category addition with the + button
  const handleAddManualCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = manualInput.trim();
    if (!trimmed) return;

    if (onAddCategory) {
      onAddCategory(trimmed);
    }
    onSelect(trimmed);
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className={`absolute z-50 top-full mt-1.5 ${
        align === 'right' ? 'right-0' : 'left-0'
      } w-80 bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl p-3 text-left font-sans select-text ${className}`}
      style={{ minWidth: '19rem' }}
    >
      {/* 1. Header with Close Button */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pilih Jenis Kinerja</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Tutup"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Top Search Section with Search Button */}
      <div className="mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // If single item matches, select it on enter
                  if (filteredCategories.length === 1) {
                    onSelect(filteredCategories[0]);
                    onClose();
                  }
                }
              }}
              placeholder="Cari jenis kinerja..."
              className="w-full bg-neutral-950 text-neutral-100 text-xs pl-8 pr-7 py-1.5 rounded-lg border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-neutral-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-0.5"
                title="Hapus pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Tombol Pencarian di bagian atas */}
          <button
            type="button"
            onClick={() => {
              // Trigger search focus / filter confirm
              searchInputRef.current?.focus();
            }}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow-sm transition-colors shrink-0"
            title="Klik untuk mencari jenis kinerja"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cari</span>
          </button>
        </div>
      </div>

      {/* 3. Middle Section: List Pilihan Jenis Kinerja */}
      <div className="max-h-52 overflow-y-auto space-y-1 pr-1 mb-3 scrollbar-thin scrollbar-thumb-neutral-700">
        {filteredCategories.length === 0 ? (
          <div className="py-4 text-center text-xs text-neutral-400">
            <p>Jenis kinerja tidak ditemukan.</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Ketik nama di bawah lalu klik tombol <strong className="text-emerald-400">+</strong>
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const isSelected = category === currentCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  onSelect(category);
                  onClose();
                }}
                className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-600/40'
                    : 'text-neutral-200 hover:bg-neutral-800/80 hover:text-white border border-transparent'
                }`}
              >
                <span className="truncate pr-2">{category}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* 4. Bottom Section: Icon + untuk Menambah Manual Jenis Kinerja */}
      <div className="pt-2.5 border-t border-neutral-800">
        <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
          Tambah Manual Jenis Kinerja:
        </label>
        <form onSubmit={handleAddManualCategory} className="flex items-center gap-1.5">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Ketik jenis kinerja baru..."
            className="flex-1 bg-neutral-950 text-neutral-100 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder:text-neutral-500"
          />
          <button
            type="submit"
            disabled={!manualInput.trim()}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
            title="Tambah Jenis Kinerja Baru (+)"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </form>
      </div>
    </div>
  );
};
