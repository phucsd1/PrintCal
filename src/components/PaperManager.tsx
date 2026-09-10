'use client';

import React, { useState, useEffect } from 'react';
import { PaperType } from '@/types';
import { Plus, Edit2, Trash2, Check, X, FileSpreadsheet, RefreshCw } from 'lucide-react';

export const PaperManager: React.FC = () => {
  const [papers, setPapers] = useState<PaperType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPaper, setEditingPaper] = useState<Partial<PaperType> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleOpenAdd = () => {
    setEditingPaper({
      code: `C_${Date.now().toString().slice(-4)}`,
      name: 'Couche ',
      gsm: 150,
      parentWidthCm: 65,
      parentHeightCm: 86,
      pricePerRam: 500000,
      pricePerKg: 28500,
      unit: 'ram',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PaperType) => {
    setEditingPaper({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaper) return;

    const isUpdate = Boolean(editingPaper.id);
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/papers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPaper),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingPaper(null);
        fetchPapers();
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Kho Bảng Giá Giấy In</h2>
          <p className="text-xs text-slate-500">Quản lý các loại giấy (Couche, Ivory, Ford, Bristol, Kraft) và đơn giá thị trường</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm Loại Giấy
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Mã Giấy</th>
                <th className="py-3 px-4">Tên Loại Giấy</th>
                <th className="py-3 px-4 text-center">Định Lượng</th>
                <th className="py-3 px-4 text-center">Khổ Giấy Mẹ</th>
                <th className="py-3 px-4 text-right">Giá / Ram (500 tờ)</th>
                <th className="py-3 px-4 text-right">Giá / Kg</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-1" />
                    Đang tải dữ liệu giấy...
                  </td>
                </tr>
              ) : (
                papers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{p.code}</td>
                    <td className="py-2.5 px-4">
                      <strong className="block text-slate-900">{p.name}</strong>
                      {p.description && <span className="text-[11px] text-slate-400">{p.description}</span>}
                    </td>
                    <td className="py-2.5 px-4 text-center font-semibold text-blue-700">{p.gsm} gsm</td>
                    <td className="py-2.5 px-4 text-center font-medium text-slate-700">{p.parentWidthCm} × {p.parentHeightCm} cm</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 text-sm">
                      {p.pricePerRam > 0 ? `${p.pricePerRam.toLocaleString('vi-VN')}đ` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-600">
                      {p.pricePerKg > 0 ? `${p.pricePerKg.toLocaleString('vi-VN')}đ` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {p.isActive ? 'Đang dùng' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
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
                ))
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
                {editingPaper.id ? 'Cập Nhật Loại Giấy' : 'Thêm Mới Loại Giấy'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Mã Giấy *</label>
                  <input
                    type="text"
                    required
                    value={editingPaper.code || ''}
                    onChange={(e) => setEditingPaper({ ...editingPaper, code: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Giá / Ram (500 tờ) VNĐ</label>
                  <input
                    type="number"
                    value={editingPaper.pricePerRam || 0}
                    onChange={(e) => setEditingPaper({ ...editingPaper, pricePerRam: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Giá / Kg (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPaper.pricePerKg || 0}
                    onChange={(e) => setEditingPaper({ ...editingPaper, pricePerKg: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Ghi Chú / Ứng Dụng</label>
                <input
                  type="text"
                  value={editingPaper.description || ''}
                  onChange={(e) => setEditingPaper({ ...editingPaper, description: e.target.value })}
                  placeholder="Ví dụ: Dùng in tờ rơi, ruột catalogue..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
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
