'use client';

import React from 'react';
import { ImpositionResult } from '@/types';
import { LayoutGrid, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ImpositionVisualizerProps {
  imposition: ImpositionResult;
  productName?: string;
  productWidthMm: number;
  productHeightMm: number;
}

export const ImpositionVisualizer: React.FC<ImpositionVisualizerProps> = ({
  imposition,
  productName = 'Sản phẩm',
  productWidthMm,
  productHeightMm,
}) => {
  const {
    printSheet,
    parentSheet,
    upsPerPrintSheet,
    cutsPerParentSheet,
    totalUpsPerParentSheet,
    gripperMarginMm,
    cols,
    rows,
    boxes,
    sheetEfficiencyPercent,
    isRotated,
  } = imposition;

  // ViewBox của SVG dựa trên kích thước thật của tờ in (mm)
  const svgWidth = printSheet.widthMm;
  const svgHeight = printSheet.heightMm;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base">Mô Phỏng Bình Trang & Cắt Giấy 2D</h3>
            <p className="text-xs text-slate-500">
              Tờ in: <span className="font-medium text-slate-700">{printSheet.name}</span> ({printSheet.widthMm} × {printSheet.heightMm} mm)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Tận dụng {sheetEfficiencyPercent}%
        </div>
      </div>

      {/* Vùng vẽ đồ họa SVG hiển thị khổ in và các con */}
      <div className="relative flex-1 bg-slate-900 rounded-lg p-4 flex items-center justify-center overflow-hidden min-h-[260px]">
        {/* Lưới nền xưởng in */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-h-[280px] drop-shadow-2xl border border-slate-600 rounded bg-amber-50/90 transition-all duration-300"
            style={{ aspectRatio: `${svgWidth} / ${svgHeight}` }}
          >
            {/* Vùng lề kẹp nhíp máy in (Gripper) - màu sọc cảnh báo */}
            <defs>
              <pattern id="gripperStripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="4" />
                <line x1="4" y1="0" x2="4" y2="8" stroke="#fbbf24" strokeWidth="4" />
              </pattern>
            </defs>

            {/* Khung tờ in */}
            <rect
              x="0"
              y="0"
              width={svgWidth}
              height={svgHeight}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* Dải lề nhíp ở đáy tờ in */}
            <rect
              x="0"
              y={svgHeight - gripperMarginMm}
              width={svgWidth}
              height={gripperMarginMm}
              fill="url(#gripperStripe)"
              opacity="0.75"
            />
            <text
              x={svgWidth / 2}
              y={svgHeight - gripperMarginMm / 2 + 3}
              textAnchor="middle"
              fill="#b45309"
              fontSize={Math.max(10, Math.min(16, svgWidth / 30))}
              fontWeight="bold"
            >
              Lề kẹp nhíp ({gripperMarginMm}mm)
            </text>

            {/* Các con sản phẩm được xếp trên tờ in */}
            {boxes.map((b) => (
              <g key={b.index}>
                {/* Khối con */}
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  fill="#dbeafe"
                  stroke="#2563eb"
                  strokeWidth="1"
                  rx="1"
                  className="transition-colors hover:fill-blue-200"
                />
                {/* Đường xén thành phẩm bên trong (Bleed 2mm) */}
                <rect
                  x={b.x + 2}
                  y={b.y + 2}
                  width={Math.max(1, b.w - 4)}
                  height={Math.max(1, b.h - 4)}
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
                {/* Số thứ tự con */}
                <text
                  x={b.x + b.w / 2}
                  y={b.y + b.h / 2 + 4}
                  textAnchor="middle"
                  fill="#1e40af"
                  fontSize={Math.max(9, Math.min(14, b.w / 6))}
                  fontWeight="bold"
                >
                  #{b.index}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Thông số bình trang chi tiết */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
          <span className="text-slate-500 block">Số con / tờ in</span>
          <span className="text-base font-bold text-blue-600">{upsPerPrintSheet} con</span>
          <span className="text-[10px] text-slate-400 block">({cols} cột × {rows} hàng {isRotated ? '• Xoay' : ''})</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
          <span className="text-slate-500 block">Tờ in / Giấy mẹ</span>
          <span className="text-base font-bold text-indigo-600">Chia {cutsPerParentSheet}</span>
          <span className="text-[10px] text-slate-400 block">Từ {parentSheet.name}</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
          <span className="text-slate-500 block">Tổng con / Tờ mẹ</span>
          <span className="text-base font-bold text-purple-600">{totalUpsPerParentSheet} con</span>
          <span className="text-[10px] text-slate-400 block">{upsPerPrintSheet} × {cutsPerParentSheet} tờ</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
          <span className="text-slate-500 block">Khổ thành phẩm</span>
          <span className="text-base font-bold text-slate-700">{productWidthMm} × {productHeightMm}</span>
          <span className="text-[10px] text-slate-400 block">mm (Tràn lề +2mm)</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/60 rounded p-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <span>
          Đã chừa lề nhíp {gripperMarginMm}mm và đường dao xén thành phẩm. Bản vẽ mô phỏng chính xác hướng xếp giấy nhằm giảm thiểu phế liệu.
        </span>
      </div>
    </div>
  );
};
