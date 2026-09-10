'use client';

import React, { useState, useMemo } from 'react';
import { PaperType } from '@/types';
import {
  Search,
  X,
  Building2,
  Check,
  Filter,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface PaperSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  papers: PaperType[];
  selectedPaperId: number;
  onSelectPaper: (paper: PaperType) => void;
}

export const PaperSelectorModal: React.FC<PaperSelectorModalProps> = ({
  isOpen,
  onClose,
  papers,
  selectedPaperId,
  onSelectPaper,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedGsm, setSelectedGsm] = useState<string>('all');

  // Danh sách nhà cung cấp duy nhất
  const suppliers = useMemo(() => {
    const list = Array.from(new Set(papers.map((p) => p.supplier || 'Thuận Phát'))).filter(Boolean);
    return list.sort();
  }, [papers]);

  // Phân loại danh mục giấy
  const getCategory = (p: PaperType): string => {
    const name = p.name.toLowerCase();
    const code = p.code.toLowerCase();
    if (name.includes('ivory') || code.startsWith('i')) return 'Ivory';
    if (name.includes('couche') || code.startsWith('c')) return 'Couche';
    if (name.includes('fort') || name.includes('ford') || code.startsWith('f')) return 'Fort';
    if (name.includes('duplex') || code.startsWith('d')) return 'Duplex';
    if (name.includes('bristol') || code.startsWith('b')) return 'Bristol';
    if (name.includes('decal')) return 'Decal';
    if (name.includes('kraft')) return 'Kraft';
    return 'Khác';
  };

  const categories = ['Ivory', 'Couche', 'Fort', 'Duplex', 'Bristol', 'Decal', 'Kraft'];

  // Danh sách các khổ giấy duy nhất
  const sizes = useMemo(() => {
    const s = Array.from(new Set(papers.map((p) => `${p.parentWidthCm}x${p.parentHeightCm}`)));
    return s.sort();
  }, [papers]);

  // Danh sách các mức định lượng gsm duy nhất
  const gsmList = useMemo(() => {
    const g = Array.from(new Set(papers.map((p) => p.gsm))).filter(Boolean);
    return g.sort((a, b) => a - b);
  }, [papers]);

  // Lọc danh sách giấy theo các tiêu chí
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      // 1. Lọc theo NCC
      if (selectedSupplier !== 'all') {
        const supp = p.supplier || 'Thuận Phát';
        if (supp !== selectedSupplier) return false;
      }

      // 2. Lọc theo danh mục loại giấy
      if (selectedCategory !== 'all') {
        const cat = getCategory(p);
        if (cat !== selectedCategory) return false;
      }

      // 3. Lọc theo khổ giấy mẹ
      if (selectedSize !== 'all') {
        const sizeStr = `${p.parentWidthCm}x${p.parentHeightCm}`;
        if (sizeStr !== selectedSize) return false;
      }

      // 4. Lọc theo định lượng gsm
      if (selectedGsm !== 'all') {
        if (p.gsm !== Number(selectedGsm)) return false;
      }

      // 5. Tìm kiếm từ khóa tự do (mã, tên, hiệu, ncc)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(term);
        const matchCode = p.code.toLowerCase().includes(term);
        const matchDesc = (p.description || '').toLowerCase().includes(term);
        const matchSupp = (p.supplier || '').toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchDesc && !matchSupp) return false;
      }

      return true;
    });
  }, [papers, searchTerm, selectedSupplier, selectedCategory, selectedSize, selectedGsm]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSupplier('all');
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedGsm('all');
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Ivory':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Couche':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Fort':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Duplex':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Bristol':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Decal':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Kraft':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Chọn & Lọc Bảng Giá Giấy In
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-normal">
                  {papers.length} loại
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Tìm kiếm thông minh theo Nhà Cung Cấp, Loại Giấy, Khổ & Định Lượng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh công cụ tìm kiếm & Bộ lọc (Search & Filters Panel) */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-3 shrink-0">
          {/* Hàng 1: Ô tìm kiếm từ khóa */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập mã giấy, tên giấy, thương hiệu (Indo, Nevia, Oji...), nhà cung cấp..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Hàng 2: Các bộ lọc dạng Dropdown / Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Lọc theo NCC */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                Nhà Cung Cấp (NCC)
              </label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">🏢 Tất Cả Nhà Cung Cấp ({suppliers.length})</option>
                {suppliers.map((supp) => (
                  <option key={supp} value={supp}>
                    {supp}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo Loại Giấy */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                Loại Giấy
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất Cả Loại Giấy</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    Giấy {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo Khổ Giấy */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400" />
                Khổ Giấy Mẹ
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất Cả Khổ Giấy</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    Khổ {s.replace('x', ' × ')} cm
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo Định Lượng GSM */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                Định Lượng (gsm)
              </label>
              <select
                value={selectedGsm}
                onChange={(e) => setSelectedGsm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất Cả Định Lượng</option>
                {gsmList.map((g) => (
                  <option key={g} value={g}>
                    {g} gsm
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dải thông tin trạng thái lọc */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
            <span className="text-slate-500 font-medium">
              Tìm thấy <strong className="text-blue-700 font-bold">{filteredPapers.length}</strong> / {papers.length} loại giấy
              {selectedSupplier !== 'all' && <span> • NCC: <strong className="text-slate-800">{selectedSupplier}</strong></span>}
              {selectedCategory !== 'all' && <span> • Loại: <strong className="text-slate-800">{selectedCategory}</strong></span>}
            </span>

            {(searchTerm || selectedSupplier !== 'all' || selectedCategory !== 'all' || selectedSize !== 'all' || selectedGsm !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Danh sách thẻ giấy (Scrollable Cards Grid) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100">
          {filteredPapers.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Layers className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                Không tìm thấy loại giấy nào phù hợp với bộ lọc.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Khôi phục tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPapers.map((paper) => {
                const isSelected = paper.id === selectedPaperId;
                const cat = getCategory(paper);
                const priceAbove = paper.priceAbove500 || paper.pricePerRam || 0;
                const priceBelow = paper.priceBelow500 || priceAbove;
                const unitAbove = Math.round(priceAbove / 500);
                const unitBelow = Math.round(priceBelow / 500);

                return (
                  <div
                    key={paper.id}
                    onClick={() => {
                      onSelectPaper(paper);
                      onClose();
                    }}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Hàng trên: Badges */}
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Badge Loại giấy */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(cat)}`}
                          >
                            {cat}
                          </span>

                          {/* Badge NCC */}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                            <Building2 className="w-2.5 h-2.5 text-slate-400" />
                            {paper.supplier || 'Thuận Phát'}
                          </span>

                          {/* Badge Khổ giấy */}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-slate-600 border border-slate-200">
                            {paper.parentWidthCm} × {paper.parentHeightCm} cm
                          </span>
                        </div>

                        {isSelected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold shrink-0">
                            <Check className="w-3 h-3" /> Đang chọn
                          </span>
                        )}
                      </div>

                      {/* Tên giấy & Mã */}
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {paper.name}
                      </h4>
                      {paper.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {paper.description}
                        </p>
                      )}
                    </div>

                    {/* Bảng giá: Giá trên 500 tờ (trên ram) và Giá dưới 500 tờ (dưới ram) */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white/80 border border-slate-200/80 rounded-lg p-1.5">
                        <span className="text-[10px] text-slate-500 block font-medium">
                          Giá ≥ 500 tờ (Trên ram)
                        </span>
                        <strong className="text-xs font-black text-blue-700 block">
                          {priceAbove.toLocaleString('vi-VN')}đ
                        </strong>
                        <span className="text-[9px] text-slate-400 block">
                          ~{unitAbove.toLocaleString('vi-VN')}đ / tờ
                        </span>
                      </div>

                      <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-1.5">
                        <span className="text-[10px] text-amber-800 block font-medium">
                          Giá &lt; 500 tờ (Dưới ram)
                        </span>
                        <strong className="text-xs font-black text-amber-900 block">
                          {priceBelow.toLocaleString('vi-VN')}đ
                        </strong>
                        <span className="text-[9px] text-amber-700/80 block">
                          ~{unitBelow.toLocaleString('vi-VN')}đ / tờ
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 font-medium">
            Mẹo: Click vào bất kỳ loại giấy nào để chọn ngay vào bài tính giá
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
