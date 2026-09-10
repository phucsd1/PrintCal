'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PaperType } from '@/types';
import { Plus, Edit2, Trash2, Check, X, RefreshCw, Search, Building2, Filter, RotateCcw } from 'lucide-react';

export const PaperManager: React.FC = () => {
  const [papers, setPapers] = useState<PaperType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPaper, setEditingPaper] = useState<Partial<PaperType> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/papers');
      const data = await res.json();
      if (Array.isArray(data)) setPapers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  // Unique suppliers
  const suppliers = useMemo(() => {
    const list = Array.from(new Set(papers.map((p) => p.supplier || 'Thuận Phát'))).filter(Boolean);
    return list.sort();
  }, [papers]);

  // Categories helper
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

  const categories = ['Ivory', 'Couche', 'Fort', 'Duplex', 'Bristol', 'Decal', 'Kraft', 'Khác'];

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      // Supplier filter
      if (selectedSupplier !== 'all') {
        const supp = p.supplier || 'Thuận Phát';
        if (supp !== selectedSupplier) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (getCategory(p) !== selectedCategory) return false;
      }

      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchCode = p.code.toLowerCase().includes(query);
        const matchDesc = (p.description || '').toLowerCase().includes(query);
        const matchSupp = (p.supplier || '').toLowerCase().includes(query);
        const matchGsm = p.gsm.toString().includes(query);
        if (!matchName && !matchCode && !matchDesc && !matchSupp && !matchGsm) return false;
      }

      return true;
    });
  }, [papers, selectedSupplier, selectedCategory, searchTerm]);

  const handleOpenAdd = () => {
    setEditingPaper({
      supplier: 'Thuận Phát',
      code: `C_${Date.now().toString().slice(-4)}`,
      name: 'Couche ',
      gsm: 150,
      parentWidthCm: 65,
      parentHeightCm: 86,
      priceAbove500: 500000,
      priceBelow500: 530000,
      pricePerRam: 500000,
      unit: 'ram',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PaperType) => {
    setEditingPaper({
      ...p,
      supplier: p.supplier || 'Thuận Phát',
      priceAbove500: p.priceAbove500 || p.pricePerRam || 0,
      priceBelow500: p.priceBelow500 || p.pricePerRam || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaper) return;

    const isUpdate = Boolean(editingPaper.id);
    const method = isUpdate ? 'PUT' : 'POST';

    // Normalize prices: keep pricePerRam synced with priceAbove500
    const payload = {
      ...editingPaper,
      pricePerRam: editingPaper.priceAbove500 || 0,
    };

    try {
      const res = await fetch('/api/papers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingPaper(null);
        fetchPapers();
      } else {
        const data = await res.json();
        alert(data.error || 'Có lỗi xảy ra khi lưu giấy!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa loại giấy này?')) return;
    try {
      const res = await fetch(`/api/papers?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSupplier('all');
    setSelectedCategory('all');
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Kho Bảng Giá Giấy In & Nhà Cung Cấp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý báo giá theo mức &ge; 500 tờ (trên ram) và &lt; 500 tờ (dưới ram). Đã phân chia rõ từng Nhà Cung Cấp (NCC).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPapers}
            className="p-2 border border-slate-200 text-slate-600 hover:text-blue-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Thêm Loại Giấy Mới
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên giấy, mã giấy, hiệu (Ningbo, Nevia, Indo...), NCC..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Supplier Filter */}
          <div className="md:col-span-3 flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0">NCC:</span>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium text-slate-700 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả NCC ({suppliers.length})</option>
              {suppliers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3 flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0">Loại:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium text-slate-700 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả loại giấy</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Badges & Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">
              Hiển thị <strong className="text-blue-600">{filteredPapers.length}</strong> / {papers.length} loại giấy
            </span>
            {(searchTerm || selectedSupplier !== 'all' || selectedCategory !== 'all') && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-medium px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Quick Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full">
            {['all', 'Couche', 'Ivory', 'Fort', 'Duplex', 'Bristol'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 text-[11px] rounded-full font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-3 w-28">Nhà Cung Cấp</th>
                <th className="py-3 px-3">Mã Giấy</th>
                <th className="py-3 px-3">Tên Loại Giấy & Hiệu</th>
                <th className="py-3 px-3 text-center">Định Lượng</th>
                <th className="py-3 px-3 text-center">Khổ Mẹ</th>
                <th className="py-3 px-3 text-right">
                  <div>Giá &ge; 500 tờ</div>
                  <div className="text-[10px] text-slate-400 font-normal">Nguyên ram</div>
                </th>
                <th className="py-3 px-3 text-right">
                  <div>Giá &lt; 500 tờ</div>
                  <div className="text-[10px] text-slate-400 font-normal">Bán lẻ</div>
                </th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-1" />
                    Đang tải dữ liệu giấy...
                  </td>
                </tr>
              ) : filteredPapers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không tìm thấy loại giấy nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredPapers.map((p) => {
                  const priceAbove = p.priceAbove500 || p.pricePerRam || 0;
                  const priceBelow = p.priceBelow500 || priceAbove;
                  const unitPriceAbove = Math.round(priceAbove / 500);
                  const unitPriceBelow = Math.round(priceBelow / 500);

                  return (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* NCC */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {p.supplier || 'Thuận Phát'}
                        </span>
                      </td>

                      {/* Mã giấy */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {p.code}
                      </td>

                      {/* Tên loại giấy */}
                      <td className="py-2.5 px-3">
                        <strong className="block text-slate-900">{p.name}</strong>
                        {p.description && <span className="text-[11px] text-slate-400">{p.description}</span>}
                      </td>

                      {/* GSM */}
                      <td className="py-2.5 px-3 text-center font-bold text-blue-700 whitespace-nowrap">
                        {p.gsm} gsm
                      </td>

                      {/* Khổ mẹ */}
                      <td className="py-2.5 px-3 text-center font-medium text-slate-700 whitespace-nowrap">
                        {p.parentWidthCm} × {p.parentHeightCm} cm
                      </td>

                      {/* Giá >= 500 tờ (trên ram) */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="font-bold text-emerald-700 text-sm">
                          {priceAbove > 0 ? `${priceAbove.toLocaleString('vi-VN')} đ` : '-'}
                        </div>
                        {priceAbove > 0 && (
                          <div className="text-[10px] text-slate-400">
                            ~{unitPriceAbove.toLocaleString('vi-VN')} đ/tờ
                          </div>
                        )}
                      </td>

                      {/* Giá < 500 tờ (dưới ram) */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="font-bold text-blue-700 text-sm">
                          {priceBelow > 0 ? `${priceBelow.toLocaleString('vi-VN')} đ` : '-'}
                        </div>
                        {priceBelow > 0 && (
                          <div className="text-[10px] text-slate-400">
                            ~{unitPriceBelow.toLocaleString('vi-VN')} đ/tờ
                          </div>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.isActive ? 'Đang dùng' : 'Tạm khóa'}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Sửa giá giấy"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Xóa loại giấy"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Thêm/Sửa Giấy */}
      {isModalOpen && editingPaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingPaper.id ? 'Cập Nhật Bảng Giá Giấy' : 'Thêm Mới Loại Giấy'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              {/* Nhà Cung Cấp */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nhà Cung Cấp (NCC) *</label>
                <input
                  type="text"
                  required
                  value={editingPaper.supplier || ''}
                  onChange={(e) => setEditingPaper({ ...editingPaper, supplier: e.target.value })}
                  placeholder="Ví dụ: Thuận Phát, Mai Lam, Tân Phát Đạt..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Mã Giấy *</label>
                  <input
                    type="text"
                    required
                    value={editingPaper.code || ''}
                    onChange={(e) => setEditingPaper({ ...editingPaper, code: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Định Lượng (GSM) *</label>
                  <input
                    type="number"
                    required
                    value={editingPaper.gsm || 150}
                    onChange={(e) => setEditingPaper({ ...editingPaper, gsm: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Tên Giấy Đầy Đủ *</label>
                <input
                  type="text"
                  required
                  value={editingPaper.name || ''}
                  onChange={(e) => setEditingPaper({ ...editingPaper, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Khổ Mẹ Rộng (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingPaper.parentWidthCm || 65}
                    onChange={(e) => setEditingPaper({ ...editingPaper, parentWidthCm: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Khổ Mẹ Dài (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingPaper.parentHeightCm || 86}
                    onChange={(e) => setEditingPaper({ ...editingPaper, parentHeightCm: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 2 Mức giá: >= 500 tờ và < 500 tờ */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-emerald-800 font-bold mb-1">
                    Giá &ge; 500 tờ (VNĐ/ram) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingPaper.priceAbove500 || 0}
                    onChange={(e) =>
                      setEditingPaper({
                        ...editingPaper,
                        priceAbove500: Number(e.target.value),
                        pricePerRam: Number(e.target.value),
                      })
                    }
                    className="w-full border border-emerald-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 font-bold text-emerald-900 bg-white"
                  />
                  <span className="text-[10px] text-slate-400">
                    Áp dụng khi dùng &ge; 500 tờ mẹ (~{Math.round((editingPaper.priceAbove500 || 0) / 500).toLocaleString('vi-VN')} đ/tờ)
                  </span>
                </div>
                <div>
                  <label className="block text-blue-800 font-bold mb-1">
                    Giá &lt; 500 tờ (VNĐ/ram) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingPaper.priceBelow500 || 0}
                    onChange={(e) => setEditingPaper({ ...editingPaper, priceBelow500: Number(e.target.value) })}
                    className="w-full border border-blue-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 font-bold text-blue-900 bg-white"
                  />
                  <span className="text-[10px] text-slate-400">
                    Bán lẻ khi dùng &lt; 500 tờ mẹ (~{Math.round((editingPaper.priceBelow500 || 0) / 500).toLocaleString('vi-VN')} đ/tờ)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Hiệu / Ghi Chú / Ứng Dụng</label>
                <input
                  type="text"
                  value={editingPaper.description || ''}
                  onChange={(e) => setEditingPaper({ ...editingPaper, description: e.target.value })}
                  placeholder="Ví dụ: AF - Indo, Nevia, Oji..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActivePaper"
                  checked={editingPaper.isActive ?? true}
                  onChange={(e) => setEditingPaper({ ...editingPaper, isActive: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="isActivePaper" className="text-slate-700 font-medium cursor-pointer">
                  Kích hoạt sử dụng loại giấy này
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
