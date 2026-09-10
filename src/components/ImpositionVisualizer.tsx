'use client';

import React from 'react';
import { ImpositionResult } from '@/types';
import { Layers, Maximize2 } from 'lucide-react';

interface ImpositionVisualizerProps {
  imposition: ImpositionResult;
  productName?: string;
  productWidthMm: number;
  productHeightMm: number;
}

export const ImpositionVisualizer: React.FC<ImpositionVisualizerProps> = ({
  imposition,
  productWidthMm,
  productHeightMm,
}) => {
  const {
    printSheet,
    parentSheet,
    upsPerPrintSheet,
    cutsPerParentSheet,
    gripperMarginMm,
    cols,
    rows,
    boxes,
    sheetEfficiencyPercent,
    isRotated,
  } = imposition;

  const svgWidth = printSheet.widthMm;
  const svgHeight = printSheet.heightMm;

  return (
    <div className="space-y-3">
      {/* Vùng vẽ đồ họa SVG hiển thị khổ in và các con */}
      <div className="relative bg-slate-900/95 rounded-xl p-4 flex items-center justify-center min-h-[220px] max-h-[260px] overflow-hidden border border-slate-800">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-h-[220px] drop-shadow-xl border border-slate-700 rounded bg-white transition-all duration-300"
          style={{ aspectRatio: `${svgWidth} / ${svgHeight}` }}
        >
          {/* Lề kẹp nhíp máy in (Gripper) */}
          <defs>
            <pattern id="gripperStripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#fbbf24" strokeWidth="3" />
              <line x1="4" y1="0" x2="4" y2="8" stroke="#f59e0b" strokeWidth="3" />
            </pattern>
          </defs>

          {/* Nền tờ in */}
          <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#ffffff" />

          {/* Dải lề nhíp đáy */}
          <rect
            x="0"
            y={svgHeight - gripperMarginMm}
            width={svgWidth}
            height={gripperMarginMm}
            fill="url(#gripperStripe)"
            opacity="0.8"
          />
          <text
            x={svgWidth / 2}
            y={svgHeight - gripperMarginMm / 2 + 3}
            textAnchor="middle"
            fill="#92400e"
            fontSize={Math.max(9, Math.min(14, svgWidth / 35))}
            fontWeight="bold"
          >
            Lề kẹp nhíp ({gripperMarginMm}mm)
          </text>

          {/* Các con sản phẩm */}
          {boxes.map((b) => (
            <g key={b.index}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                fill="#eff6ff"
                stroke="#3b82f6"
                strokeWidth="1"
                rx="1"
              />
              <text
                x={b.x + b.w / 2}
                y={b.y + b.h / 2 + 4}
                textAnchor="middle"
                fill="#1d4ed8"
                fontSize={Math.max(9, Math.min(13, b.w / 6))}
                fontWeight="bold"
              >
                #{b.index}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Thông số bình trang vắn tắt */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg py-2 px-1">
          <span className="text-[11px] text-slate-500 block">Số con / tờ in</span>
          <span className="text-sm font-bold text-blue-700">{upsPerPrintSheet} con</span>
          <span className="text-[10px] text-slate-400 block">{cols}×{rows} {isRotated ? '• Xoay' : ''}</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg py-2 px-1">
          <span className="text-[11px] text-slate-500 block">Cắt từ tờ mẹ</span>
          <span className="text-sm font-bold text-indigo-700">Chia {cutsPerParentSheet}</span>
          <span className="text-[10px] text-slate-400 block">{parentSheet.widthCm}×{parentSheet.heightCm}cm</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg py-2 px-1">
          <span className="text-[11px] text-slate-500 block">Tận dụng giấy</span>
          <span className="text-sm font-bold text-emerald-700">{sheetEfficiencyPercent}%</span>
          <span className="text-[10px] text-slate-400 block">{printSheet.widthMm}×{printSheet.heightMm}mm</span>
        </div>
      </div>
    </div>
  );
};
