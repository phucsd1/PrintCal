'use client';

import React, { useState, useEffect } from 'react';
import { DigitalMachine, DigitalPrintGiaCong, DigitalPrintKemGiay, OffsetMachine } from '@/types';
import { Cpu, Printer, Edit2, Check, RefreshCw, Layers, FileText, Info, Save, X } from 'lucide-react';

export const MachineManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'giacong' | 'kem_giay' | 'offset'>('giacong');
  const [offsetMachines, setOffsetMachines] = useState<OffsetMachine[]>([]);
  const [digitalMachines, setDigitalMachines] = useState<DigitalMachine[]>([]);
  const [digitalPricingGiaCong, setDigitalPricingGiaCong] = useState<DigitalPrintGiaCong[]>([]);
  const [digitalPricingKemGiay, setDigitalPricingKemGiay] = useState<DigitalPrintKemGiay[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingOffset, setEditingOffset] = useState<OffsetMachine | null>(null);
  const [editingGiaCong, setEditingGiaCong] = useState<DigitalPrintGiaCong | null>(null);
  const [editingKemGiay, setEditingKemGiay] = useState<DigitalPrintKemGiay | null>(null);

  // Filter for INTC paper
  const [paperFilter, setPaperFilter] = useState<'all' | 'C' | 'I' | 'F'>('all');

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/machines');
      const data = await res.json();
      if (data.offsetMachines) setOffsetMachines(data.offsetMachines);
      if (data.digitalMachines) setDigitalMachines(data.digitalMachines);
      if (data.digitalPricingGiaCong) setDigitalPricingGiaCong(data.digitalPricingGiaCong);
      if (data.digitalPricingKemGiay) setDigitalPricingKemGiay(data.digitalPricingKemGiay);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSaveOffset = async (m: OffsetMachine) => {
    try {
      const res = await fetch('/api/machines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'offset', ...m }),
      });
      if (res.ok) {
        setEditingOffset(null);
        fetchMachines();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGiaCong = async (item: DigitalPrintGiaCong) => {
    try {
      const res = await fetch('/api/machines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'digital_giacong', ...item }),
      });
      if (res.ok) {
        setEditingGiaCong(null);
        fetchMachines();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveKemGiay = async (item: DigitalPrintKemGiay) => {
    try {
      const res = await fetch('/api/machines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'digital_kem_giay', ...item }),
      });
      if (res.ok) {
        setEditingKemGiay(null);
        fetchMachines();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredKemGiay = digitalPricingKemGiay.filter((item) => {
    if (paperFilter === 'all') return true;
    if (paperFilter === 'C') return item.paperCode.startsWith('C');
    if (paperFilter === 'I') return item.paperCode.startsWith('I');
    if (paperFilter === 'F') return item.paperCode.startsWith('F');
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            Quản Lý Bảng Giá In Ấn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cập nhật biểu giá In nhanh gia công (Konica C12000), In nhanh kèm giấy (INTC) và Máy in Offset
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('giacong')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'giacong'
                  ? 'bg-white shadow text-sky-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚙️ Konica C12000 (Gia Công)
            </button>
            <button
              onClick={() => setActiveTab('kem_giay')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'kem_giay'
                  ? 'bg-white shadow text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 INTC (Kèm Giấy)
            </button>
            <button
              onClick={() => setActiveTab('offset')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'offset'
                  ? 'bg-white shadow text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏭 Máy In Offset
            </button>
          </div>

          <button
            onClick={fetchMachines}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TAB 1: BẢNG GIÁ IN GIA CÔNG KONICA C12000 (TRANG 2 PDF 26.02.2026) */}
      {activeTab === 'giacong' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-blue-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 bg-sky-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">
                  Trang 2 PDF 26.02.2026
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  MÁY IN KONICA MINOLTA C12000 / C12010S 5 MÀU
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Đơn giá in gia công (chưa gồm giấy) theo 5 kích thước tiêu chuẩn & 7 nhóm chất liệu.
                </p>
              </div>
            </div>

            {/* Quy tắc phụ phí & lưu ý */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 border border-sky-200 rounded-xl p-2.5 flex items-start gap-2">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sky-900 block font-semibold">Phụ phí số lượng ít:</strong>
                  <span className="text-slate-600 text-[11px]">
                    &lt; 50 tờ: <strong>+30.000đ</strong> | &lt; 100 tờ: <strong>+20.000đ</strong> | &ge; 100 tờ: <strong>Miễn phí</strong>
                  </span>
                </div>
              </div>

              <div className="bg-white/80 border border-sky-200 rounded-xl p-2.5 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-900 block font-semibold">Quy ước tính mặt in:</strong>
                  <span className="text-slate-600 text-[11px]">
                    Đơn giá hiển thị dưới đây là đơn giá <strong>in 1 mặt</strong>. In 2 mặt được tính <strong>nhân đôi (&times;2)</strong>.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 pt-0 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3 text-center w-36">Khổ in</th>
                  <th className="p-3 text-right">Giấy &lt;249gsm</th>
                  <th className="p-3 text-right">Giấy 250-349gsm</th>
                  <th className="p-3 text-right">Giấy 350-450gsm</th>
                  <th className="p-3 text-right">Decal (Giấy-nhựa)</th>
                  <th className="p-3 text-right">Decal trong</th>
                  <th className="p-3 text-right">Giấy nhựa &lt;280gsm</th>
                  <th className="p-3 text-right">Nhựa PVC</th>
                  <th className="p-3 text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {digitalPricingGiaCong.map((row) => {
                  const isEditing = editingGiaCong?.id === row.id;
                  const cur = isEditing ? editingGiaCong : row;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-800">
                        <span className="text-sm block">{row.sheetSize}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {row.widthMm} &times; {row.heightMm} mm
                        </span>
                      </td>

                      {/* Giấy <249gsm */}
                      <td className="p-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-20 p-1 border rounded text-right font-bold text-blue-700 text-xs"
                            value={cur.paperLt249}
                            onChange={(e) => setEditingGiaCong({ ...cur, paperLt249: Number(e.target.value) })}
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{row.paperLt249.toLocaleString('vi-VN')}đ</span>
                        )}
                      </td>

                      {/* Giấy 250-349gsm */}
                      <td className="p-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-20 p-1 border rounded text-right font-bold text-blue-700 text-xs"
                            value={cur.paper250To349}
                            onChange={(e) => setEditingGiaCong({ ...cur, paper250To349: Number(e.target.value) })}
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{row.paper250To349.toLocaleString('vi-VN')}đ</span>
                        )}
                      </td>

                      {/* Giấy 350-450gsm */}
                      <td className="p-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-20 p-1 border rounded text-right font-bold text-blue-700 text-xs"
                            value={cur.paper350To450}
                            onChange={(e) => setEditingGiaCong({ ...cur, paper350To450: Number(e.target.value) })}
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{row.paper350To450.toLocaleString('vi-VN')}đ</span>
                        )}
                      </td>

                      {/* Decal giấy nhựa */}
                      <td className="p-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-20 p-1 border rounded text-right font-bold text-blue-700 text-xs"
                            value={cur.decalPaperPlastic}
                            onChange={(e) => setEditingGiaCong({ ...cur, decalPaperPlastic: Number(e.target.value) })}
                          />
                        ) : (
                          <span className="font-medium text-slate-700">{row.decalPaperPlastic.toLocaleString('vi-VN')}đ</span>
                        )}
                      </td>

                      {/* Decal trong */}
                      <td className="p-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-20 p-1 border rounded text-right font-bold text-blue-700 text-xs"
                            value={cur.decalClear}
                            onChange={(e) => setEditingGiaCong({ ...cur, decalClear: Number(e.target.value) })}
                          />
                        ) : (
                          <span className="font-medium text-slate-700">{row.decalClear.toLocaleString('vi-VN')}đ</span>
                        )}
                      </td>

                      {/* Giấy nhựa <280 */}
                      <td className="p-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-20 p-1 border rounded text-right font-bold text-blue-700 text-xs"
                            value={cur.syntheticPaper}
                            onChange={(e) => setEditingGiaCong({ ...cur, syntheticPaper: Number(e.target.value) })}
                          />
                        ) : (
                          <span className="font-medium text-slate-700">{row.syntheticPaper.toLocaleString('vi-VN')}đ</span>
                        )}
                      </td>

                      {/* Nhựa PVC */}
                      <td className="p-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-20 p-1 border rounded text-right font-bold text-blue-700 text-xs"
                            value={cur.pvcPlastic}
                            onChange={(e) => setEditingGiaCong({ ...cur, pvcPlastic: Number(e.target.value) })}
                          />
                        ) : (
                          <span className="font-medium text-slate-700">
                            {row.pvcPlastic > 0 ? `${row.pvcPlastic.toLocaleString('vi-VN')}đ` : '—'}
                          </span>
                        )}
                      </td>

                      {/* Nút hành động */}
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSaveGiaCong(cur)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-xs"
                              title="Lưu thay đổi"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingGiaCong(null)}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingGiaCong({ ...row })}
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded hover:bg-sky-50 transition-colors"
                            title="Chỉnh sửa đơn giá hàng này"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BẢNG GIÁ IN NHANH KÈM GIẤY INTC (PDF 14.03.2026) */}
      {activeTab === 'kem_giay' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">
                  Bảng Giá INTC 14.03.2026
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  BẢNG GIÁ IN NHANH KÈM GIẤY (TRỌN GÓI)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Đơn giá trọn gói đã bao gồm tiền giấy và công in. Khổ in 325 &times; 430 mm và 325 &times; 355 mm.
                </p>
              </div>

              {/* Bộ lọc loại giấy */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-200 text-xs font-semibold">
                <button
                  onClick={() => setPaperFilter('all')}
                  className={`px-2.5 py-1 rounded-lg ${paperFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                >
                  Tất cả ({digitalPricingKemGiay.length})
                </button>
                <button
                  onClick={() => setPaperFilter('C')}
                  className={`px-2.5 py-1 rounded-lg ${paperFilter === 'C' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                >
                  Couche (6)
                </button>
                <button
                  onClick={() => setPaperFilter('I')}
                  className={`px-2.5 py-1 rounded-lg ${paperFilter === 'I' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                >
                  Ivory (3)
                </button>
                <button
                  onClick={() => setPaperFilter('F')}
                  className={`px-2.5 py-1 rounded-lg ${paperFilter === 'F' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                >
                  Fort (7)
                </button>
              </div>
            </div>

            {/* Phụ phí */}
            <div className="mt-3 bg-white/80 border border-indigo-200 rounded-xl p-2.5 flex items-start gap-2 text-xs">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-900 block font-semibold">Quy định phụ phí số lượng ít:</strong>
                <span className="text-slate-600 text-[11px]">
                  Số lượng &lt; 50 tờ: <strong>+30.000đ</strong> | &lt; 100 tờ: <strong>+20.000đ</strong> | &ge; 100 tờ: <strong>Miễn phí phụ phí</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 pt-0 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3 text-center w-20">Mã</th>
                  <th className="p-3 text-left">Chất liệu & Định lượng</th>
                  <th className="p-3 text-center w-32">Khổ in</th>
                  <th className="p-3 text-right w-36">In 1 mặt (+ Giấy)</th>
                  <th className="p-3 text-right w-36">In 2 mặt (+ Giấy)</th>
                  <th className="p-3 text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKemGiay.map((row) => {
                  const isEditing = editingKemGiay?.id === row.id;
                  const cur = isEditing ? editingKemGiay : row;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-center font-bold text-indigo-700">
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded font-mono">
                          {row.paperCode}
                        </span>
                      </td>

                      <td className="p-3">
                        <strong className="text-slate-900 block text-xs">{row.paperName}</strong>
                        <span className="text-[11px] text-slate-500 font-medium">Định lượng: {row.gsm} gsm</span>
                      </td>

                      <td className="p-3 text-center font-semibold text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                          {row.sheetSize} mm
                        </span>
                      </td>

                      {/* Đơn giá 1 mặt */}
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-24 p-1.5 border rounded text-right font-bold text-indigo-700 text-xs"
                            value={cur.price1Side}
                            onChange={(e) => setEditingKemGiay({ ...cur, price1Side: Number(e.target.value) })}
                          />
                        ) : (
                          <span className="font-bold text-slate-900 text-sm">
                            {row.price1Side.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </td>

                      {/* Đơn giá 2 mặt */}
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-24 p-1.5 border rounded text-right font-bold text-purple-700 text-xs"
                            value={cur.price2Side}
                            onChange={(e) => setEditingKemGiay({ ...cur, price2Side: Number(e.target.value) })}
                          />
                        ) : (
                          <span className="font-bold text-purple-700 text-sm">
                            {row.price2Side.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </td>

                      {/* Nút thao tác */}
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSaveKemGiay(cur)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-xs"
                              title="Lưu thay đổi"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingKemGiay(null)}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingKemGiay({ ...row })}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                            title="Sửa giá"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MÁY IN OFFSET */}
      {activeTab === 'offset' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50/40">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              Cấu Hình Máy In Offset & Gói In Trọn Gói Gồm Kẽm
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Khổ 65 &times; 86 cm (bắt nhíp chiều 86): 1.200.000đ | Khổ nhỏ dưới 65 &times; 43 cm: 900.000đ (Dưới 3.000 lượt in đã bao gồm 4 kẽm)
            </p>
          </div>

          <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offsetMachines.map((m) => {
              const isEditing = editingOffset?.id === m.id;
              const current = isEditing ? editingOffset : m;

              return (
                <div key={m.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <strong className="text-xs font-bold text-slate-900">{current.name}</strong>
                    <button
                      onClick={() => setEditingOffset(isEditing ? null : { ...m })}
                      className="p-1 text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Khổ in max:</span>
                      {isEditing ? (
                        <div className="flex gap-1 w-32">
                          <input
                            type="number"
                            className="w-1/2 p-1 border rounded text-right"
                            value={current.maxWidthMm}
                            onChange={(e) => setEditingOffset({ ...current, maxWidthMm: Number(e.target.value) })}
                          />
                          <input
                            type="number"
                            className="w-1/2 p-1 border rounded text-right"
                            value={current.maxHeightMm}
                            onChange={(e) => setEditingOffset({ ...current, maxHeightMm: Number(e.target.value) })}
                          />
                        </div>
                      ) : (
                        <span className="font-medium text-slate-800">{current.maxWidthMm} &times; {current.maxHeightMm} mm</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Giá kẽm CTP / lá:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-28 p-1 border rounded text-right"
                          value={current.platePrice}
                          onChange={(e) => setEditingOffset({ ...current, platePrice: Number(e.target.value) })}
                        />
                      ) : (
                        <span className="font-bold text-indigo-700">{current.platePrice.toLocaleString('vi-VN')}đ</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Mở máy (&le;{current.baseImpressions || 3000} lượt):</span>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-28 p-1 border rounded text-right"
                          value={current.setupCost}
                          onChange={(e) => setEditingOffset({ ...current, setupCost: Number(e.target.value) })}
                        />
                      ) : (
                        <div className="text-right">
                          <span className="font-bold text-slate-800">{current.setupCost.toLocaleString('vi-VN')}đ</span>
                          {current.includesPlate && (
                            <span className="text-[10px] font-semibold text-emerald-600 block">Đã gồm kẽm</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Lũy tiến / 1.000 lượt:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-28 p-1 border rounded text-right"
                          value={current.stepCost}
                          onChange={(e) => setEditingOffset({ ...current, stepCost: Number(e.target.value) })}
                        />
                      ) : (
                        <span className="font-medium text-slate-800">{current.stepCost.toLocaleString('vi-VN')}đ</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Bù hao kẹp nhíp:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-28 p-1 border rounded text-right"
                          value={current.gripperMarginMm || 10}
                          onChange={(e) => setEditingOffset({ ...current, gripperMarginMm: Number(e.target.value) })}
                        />
                      ) : (
                        <span className="font-medium text-slate-800">{current.gripperMarginMm || 10} mm</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Bù hao giấy in:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-28 p-1 border rounded text-right"
                          value={current.defaultWasteSheets}
                          onChange={(e) => setEditingOffset({ ...current, defaultWasteSheets: Number(e.target.value) })}
                        />
                      ) : (
                        <span className="font-medium text-amber-700">{current.defaultWasteSheets} tờ</span>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-2 border-t border-slate-200 flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingOffset(null)}
                        className="px-2 py-1 border rounded text-[11px] text-slate-600 hover:bg-slate-100"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleSaveOffset(current)}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold hover:bg-indigo-700"
                      >
                        Lưu
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
