'use client';

import React from 'react';
import { ComparisonItem } from '@/types';
import { Zap, CheckCircle2, TrendingDown } from 'lucide-react';

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

  const maxPrice = Math.max(...comparisonTable.map((c) => Math.max(c.digitalTotal, c.offsetTotal)));

  return (
    <div className="space-y-3">
      {/* Khuyến nghị ngắn gọn */}
      {reason && (
        <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2">
          <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">
            {reason}
          </div>
        </div>
      )}

      {/* Biểu đồ cột tinh giản */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 pb-1.5 border-b border-slate-200/60">
          <span className="font-semibold text-slate-700">So sánh chi phí theo số lượng</span>
          <div className="flex items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-sky-600">
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> In Nhanh KTS
            </span>
            <span className="flex items-center gap-1 text-indigo-600">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" /> In Offset
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 items-end h-[120px] pt-2 pb-1">
          {comparisonTable.map((item) => {
            const digHeight = Math.max(8, Math.round((item.digitalTotal / maxPrice) * 95));
            const offHeight = Math.max(8, Math.round((item.offsetTotal / maxPrice) * 95));
            const isCurrent = item.quantity === currentQty;

            return (
              <div key={item.quantity} className="flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 z-20 bg-slate-900 text-white text-[10px] rounded py-0.5 px-1.5 pointer-events-none whitespace-nowrap shadow">
                  KTS: {item.digitalTotal.toLocaleString('vi-VN')}đ | Offset: {item.offsetTotal.toLocaleString('vi-VN')}đ
                </div>

                <div className="flex items-end gap-1 w-full justify-center">
                  <div
                    style={{ height: `${digHeight}px` }}
                    className={`w-3 sm:w-3.5 rounded-t transition-all ${
                      item.recommended === 'digital' ? 'bg-sky-500' : 'bg-sky-200'
                    }`}
                  />
                  <div
                    style={{ height: `${offHeight}px` }}
                    className={`w-3 sm:w-3.5 rounded-t transition-all ${
                      item.recommended === 'offset' ? 'bg-indigo-600' : 'bg-indigo-200'
                    }`}
                  />
                </div>

                <span className={`text-[10px] ${isCurrent ? 'font-black text-blue-700' : 'text-slate-400 font-medium'}`}>
                  {item.quantity >= 1000 ? `${item.quantity / 1000}k` : item.quantity}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Điểm chuyển giao hòa vốn:</span>
          <strong className="text-slate-800 font-semibold">~{breakEvenQty.toLocaleString('vi-VN')} chiếc</strong>
        </div>
      </div>
    </div>
  );
};
