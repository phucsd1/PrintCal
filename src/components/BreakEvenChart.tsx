'use client';

import React from 'react';
import { ComparisonItem } from '@/types';
import { TrendingUp, Zap, Sparkles, HelpCircle } from 'lucide-react';

interface BreakEvenChartProps {
  currentQty: number;
  chosenTech: 'offset' | 'digital';
  comparisonTable?: ComparisonItem[];
  breakEvenQty?: number;
  reason?: string;
}

export const BreakEvenChart: React.FC<BreakEvenChartProps> = ({
  currentQty,
  chosenTech,
  comparisonTable = [],
  breakEvenQty = 300,
  reason,
}) => {
  if (!comparisonTable || comparisonTable.length === 0) return null;

  // Tìm giá trị max để scale chiều cao cột
  const maxPrice = Math.max(...comparisonTable.map((c) => Math.max(c.digitalTotal, c.offsetTotal)));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base">Phân Tích Hòa Vốn & So Sánh Công Nghệ In</h3>
            <p className="text-xs text-slate-500">In Nhanh KTS (Click) vs In Offset (Kẽm + Công Máy)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-sky-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> In Nhanh
          </span>
          <span className="flex items-center gap-1 text-indigo-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> In Offset
          </span>
        </div>
      </div>

      {/* Khuyến nghị thông minh */}
      {reason && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-lg flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold text-blue-900 block mb-0.5">Khuyến Nghị Tối Ưu Chi Phí:</span>
            {reason}
          </div>
        </div>
      )}

      {/* Biểu đồ cột so sánh theo số lượng */}
      <div className="pt-4 pb-2">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 items-end h-[160px] border-b border-slate-200 px-1 pb-1">
          {comparisonTable.map((item) => {
            const digHeight = Math.max(12, Math.round((item.digitalTotal / maxPrice) * 130));
            const offHeight = Math.max(12, Math.round((item.offsetTotal / maxPrice) * 130));
            const isSelected = item.quantity === currentQty;

            return (
              <div key={item.quantity} className="flex flex-col items-center gap-1 group relative">
                {/* Tooltip khi hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[10px] rounded py-1 px-2 pointer-events-none whitespace-nowrap shadow-lg">
                  <div>KTS: {item.digitalTotal.toLocaleString('vi-VN')}đ ({item.digitalUnit}đ/c)</div>
                  <div>Offset: {item.offsetTotal.toLocaleString('vi-VN')}đ ({item.offsetUnit}đ/c)</div>
                </div>

                <div className="flex items-end gap-1 w-full justify-center">
                  {/* Cột In Nhanh */}
                  <div
                    style={{ height: `${digHeight}px` }}
                    className={`w-3.5 sm:w-4 rounded-t transition-all ${
                      item.recommended === 'digital' ? 'bg-sky-500 shadow-sm' : 'bg-sky-200'
                    }`}
                  />
                  {/* Cột Offset */}
                  <div
                    style={{ height: `${offHeight}px` }}
                    className={`w-3.5 sm:w-4 rounded-t transition-all ${
                      item.recommended === 'offset' ? 'bg-indigo-600 shadow-sm' : 'bg-indigo-200'
                    }`}
                  />
                </div>

                <span className={`text-[11px] font-medium mt-1 ${isSelected ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                  {item.quantity >= 1000 ? `${item.quantity / 1000}k` : item.quantity}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bảng chi tiết các mốc số lượng */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-[11px] text-left">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100 font-medium">
              <th className="py-1.5 px-2">Số lượng</th>
              <th className="py-1.5 px-2 text-right">In Nhanh KTS</th>
              <th className="py-1.5 px-2 text-right">Đơn giá KTS</th>
              <th className="py-1.5 px-2 text-right">In Offset</th>
              <th className="py-1.5 px-2 text-right">Đơn giá Offset</th>
              <th className="py-1.5 px-2 text-center">Tối ưu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700">
            {comparisonTable.map((item) => {
              const isMatch = item.quantity === currentQty;
              return (
                <tr
                  key={item.quantity}
                  className={`hover:bg-slate-50 transition-colors ${isMatch ? 'bg-blue-50/70 font-semibold text-blue-900' : ''}`}
                >
                  <td className="py-1.5 px-2 font-medium">{item.quantity.toLocaleString('vi-VN')} con</td>
                  <td className="py-1.5 px-2 text-right">{item.digitalTotal.toLocaleString('vi-VN')}đ</td>
                  <td className="py-1.5 px-2 text-right text-slate-500">{item.digitalUnit.toLocaleString('vi-VN')}đ</td>
                  <td className="py-1.5 px-2 text-right">{item.offsetTotal.toLocaleString('vi-VN')}đ</td>
                  <td className="py-1.5 px-2 text-right text-slate-500">{item.offsetUnit.toLocaleString('vi-VN')}đ</td>
                  <td className="py-1.5 px-2 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        item.recommended === 'digital'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {item.recommended === 'digital' ? 'In Nhanh' : 'Offset'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Điểm hòa vốn ước lượng: <strong className="text-slate-800">~{breakEvenQty.toLocaleString('vi-VN')} sản phẩm</strong>
        </span>
        <span className="text-slate-400">&lt; {breakEvenQty}: In Nhanh | &ge; {breakEvenQty}: Offset</span>
      </div>
    </div>
  );
};
