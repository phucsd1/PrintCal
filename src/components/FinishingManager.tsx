'use client';

import React, { useState, useEffect } from 'react';
import { FinishingService } from '@/types';
import { Scissors, Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';

export const FinishingManager: React.FC = () => {
  const [services, setServices] = useState<FinishingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Partial<FinishingService> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finishing');
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingService({
      code: `FIN_${Date.now().toString().slice(-4)}`,
      name: 'Dịch vụ gia công ',
      category: 'can_mang',
      calcType: 'per_product',
      unitPrice: 150,
      minPrice: 50000,
      setupFee: 0,
      wastePercent: 1.0,
      wasteSheets: 10,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: FinishingService) => {
    setEditingService({ ...s });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const isUpdate = Boolean(editingService.id);
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/finishing', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingService(null);
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ gia công này?')) return;
    try {
      const res = await fetch(`/api/finishing?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Bảng Giá Gia Công Sau In (Post-Press)</h2>
          <p className="text-xs text-slate-500">Cán màng, cấn, bế demi/đứt, ép kim, dập nổi, UV định hình, đóng ghim, dán hộp...</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm Công Đoạn
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Tên Công Đoạn</th>
                <th className="py-3 px-4 text-center">Phân Loại</th>
                <th className="py-3 px-4 text-center">Cách Tính</th>
                <th className="py-3 px-4 text-right">Đơn Giá</th>
                <th className="py-3 px-4 text-right">Mở Máy Min</th>
                <th className="py-3 px-4 text-right">Tiền Khuôn</th>
                <th className="py-3 px-4 text-center">Bù Hao</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-1" />
                    Đang tải dữ liệu gia công...
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500">
                      {s.calcType === 'per_m2' ? 'Theo m²' :
                       s.calcType === 'die_cut' ? 'Khuôn + Công bế' :
                       s.calcType === 'per_sheet' ? 'Theo tờ in' :
                       s.calcType === 'fixed' ? 'Cố định' : 'Theo cái'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-blue-700">
                      {s.unitPrice.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-600">
                      {s.minPrice > 0 ? `${s.minPrice.toLocaleString('vi-VN')}đ` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-amber-700">
                      {s.setupFee > 0 ? `${s.setupFee.toLocaleString('vi-VN')}đ` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500">
                      +{s.wastePercent}% ({s.wasteSheets} tờ)
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
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

      {/* Modal Thêm/Sửa */}
      {isModalOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingService.id ? 'Cập Nhật Công Đoạn Gia Công' : 'Thêm Mới Công Đoạn'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Tên Công Đoạn Gia Công *</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Phân Loại *</label>
                  <select
                    value={editingService.category || 'can_mang'}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value as FinishingService['category'] })}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="can_mang">Cán màng</option>
                    <option value="can_gap">Cấn & Gấp</option>
                    <option value="be">Cắt bế khuôn</option>
                    <option value="ep_kim">Ép kim / Dập nổi</option>
                    <option value="phu_uv">Phủ UV</option>
                    <option value="dong_cuon">Đóng cuốn / Gáy</option>
                    <option value="dan">Dán thành phẩm</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Phương Thức Tính *</label>
                  <select
                    value={editingService.calcType || 'per_product'}
                    onChange={(e) => setEditingService({ ...editingService, calcType: e.target.value as FinishingService['calcType'] })}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="per_product">Theo cái (con)</option>
                    <option value="per_m2">Theo diện tích (m²)</option>
                    <option value="die_cut">Khuôn + Lượt bế</option>
                    <option value="per_sheet">Theo tờ in</option>
                    <option value="fixed">Cố định</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Đơn Giá (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={editingService.unitPrice || 0}
                    onChange={(e) => setEditingService({ ...editingService, unitPrice: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Mở Máy Min</label>
                  <input
                    type="number"
                    value={editingService.minPrice || 0}
                    onChange={(e) => setEditingService({ ...editingService, minPrice: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Tiền Khuôn</label>
                  <input
                    type="number"
                    value={editingService.setupFee || 0}
                    onChange={(e) => setEditingService({ ...editingService, setupFee: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Bù Hao (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingService.wastePercent || 0}
                    onChange={(e) => setEditingService({ ...editingService, wastePercent: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Bù Hao Cố Định (tờ)</label>
                  <input
                    type="number"
                    value={editingService.wasteSheets || 0}
                    onChange={(e) => setEditingService({ ...editingService, wasteSheets: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
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
                  Lưu Dịch Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
