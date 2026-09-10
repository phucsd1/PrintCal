'use client';

import React, { useState, useEffect } from 'react';
import { DigitalMachine, OffsetMachine } from '@/types';
import { Cpu, Printer, Edit2, Check, RefreshCw } from 'lucide-react';

export const MachineManager: React.FC = () => {
  const [offsetMachines, setOffsetMachines] = useState<OffsetMachine[]>([]);
  const [digitalMachines, setDigitalMachines] = useState<DigitalMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOffset, setEditingOffset] = useState<OffsetMachine | null>(null);
  const [editingDigital, setEditingDigital] = useState<DigitalMachine | null>(null);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/machines');
      const data = await res.json();
      if (data.offsetMachines) setOffsetMachines(data.offsetMachines);
      if (data.digitalMachines) setDigitalMachines(data.digitalMachines);
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

  const handleSaveDigital = async (m: DigitalMachine) => {
    try {
      const res = await fetch('/api/machines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'digital', ...m }),
      });
      if (res.ok) {
        setEditingDigital(null);
        fetchMachines();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* MÁY IN OFFSET */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Cấu Hình Máy In Offset & Đơn Giá Kẽm, Công In</h3>
              <p className="text-xs text-slate-500">Thiết lập khổ máy, giá khuôn kẽm CTP, phí mở máy và lũy tiến</p>
            </div>
          </div>
          <button onClick={fetchMachines} className="p-2 text-slate-500 hover:text-indigo-600 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <span className="font-medium text-slate-800">{current.maxWidthMm} × {current.maxHeightMm} mm</span>
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
                    <span className="text-slate-500">Mở máy (&le;1000 lượt):</span>
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-28 p-1 border rounded text-right"
                        value={current.setupCost}
                        onChange={(e) => setEditingOffset({ ...current, setupCost: Number(e.target.value) })}
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{current.setupCost.toLocaleString('vi-VN')}đ</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mỗi 1000 lượt tiếp:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-28 p-1 border rounded text-right"
                        value={current.stepCost}
                        onChange={(e) => setEditingOffset({ ...current, stepCost: Number(e.target.value) })}
                      />
                    ) : (
                      <span className="font-medium text-slate-700">{current.stepCost.toLocaleString('vi-VN')}đ</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Bù hao canh màu:</span>
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

      {/* MÁY IN NHANH KTS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Bảng Giá Máy In Nhanh Kỹ Thuật Số (Digital Click)</h3>
              <p className="text-xs text-slate-500">Đơn giá in theo click A4, A3 1 mặt và 2 mặt</p>
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {digitalMachines.map((m) => {
            const isEditing = editingDigital?.id === m.id;
            const current = isEditing ? editingDigital : m;

            return (
              <div key={m.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <strong className="text-xs font-bold text-slate-900">{current.name}</strong>
                  <button
                    onClick={() => setEditingDigital(isEditing ? null : { ...m })}
                    className="p-1 text-slate-400 hover:text-sky-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Click A4 1 mặt</span>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full p-1 border rounded text-right mt-1"
                          value={current.clickA41Side}
                          onChange={(e) => setEditingDigital({ ...current, clickA41Side: Number(e.target.value) })}
                        />
                      ) : (
                        <strong className="text-slate-800 text-sm">{current.clickA41Side.toLocaleString('vi-VN')}đ</strong>
                      )}
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Click A4 2 mặt</span>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full p-1 border rounded text-right mt-1"
                          value={current.clickA42Side}
                          onChange={(e) => setEditingDigital({ ...current, clickA42Side: Number(e.target.value) })}
                        />
                      ) : (
                        <strong className="text-slate-800 text-sm">{current.clickA42Side.toLocaleString('vi-VN')}đ</strong>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Click A3/A3+ 1 mặt</span>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full p-1 border rounded text-right mt-1"
                          value={current.clickA31Side}
                          onChange={(e) => setEditingDigital({ ...current, clickA31Side: Number(e.target.value) })}
                        />
                      ) : (
                        <strong className="text-sky-700 text-sm">{current.clickA31Side.toLocaleString('vi-VN')}đ</strong>
                      )}
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Click A3/A3+ 2 mặt</span>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full p-1 border rounded text-right mt-1"
                          value={current.clickA32Side}
                          onChange={(e) => setEditingDigital({ ...current, clickA32Side: Number(e.target.value) })}
                        />
                      ) : (
                        <strong className="text-sky-700 text-sm">{current.clickA32Side.toLocaleString('vi-VN')}đ</strong>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Phí tối thiểu / bài:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-28 p-1 border rounded text-right"
                        value={current.minCharge}
                        onChange={(e) => setEditingDigital({ ...current, minCharge: Number(e.target.value) })}
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{current.minCharge.toLocaleString('vi-VN')}đ</span>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-2 border-t border-slate-200 flex justify-end gap-1.5">
                    <button
                      onClick={() => setEditingDigital(null)}
                      className="px-2 py-1 border rounded text-[11px] text-slate-600 hover:bg-slate-100"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => handleSaveDigital(current)}
                      className="px-2.5 py-1 bg-sky-600 text-white rounded text-[11px] font-semibold hover:bg-sky-700"
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
    </div>
  );
};
