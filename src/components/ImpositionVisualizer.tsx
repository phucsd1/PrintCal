'use client';

import React, { useState } from 'react';
import { ImpositionResult } from '@/types';
import { Layers, Scissors, Printer, CheckCircle2, RotateCw } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'imposition' | 'paperCut'>('imposition');

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
    cutScheme,
  } = imposition;

  // Kích thước SVG tờ in máy
  const printW = printSheet.widthMm;
  const printH = printSheet.heightMm;

  // Kích thước SVG tờ giấy mẹ
  const parentW = cutScheme?.parentWidthMm || parentSheet.widthCm * 10;
  const parentH = cutScheme?.parentHeightMm || parentSheet.heightCm * 10;

  // Bảng màu cho các tờ in khi xén từ tờ mẹ
  const blockColors = [
    { bg: '#eff6ff', stroke: '#3b82f6', text: '#1d4ed8' }, // blue
    { bg: '#f0fdf4', stroke: '#22c55e', text: '#15803d' }, // green
    { bg: '#fefce8', stroke: '#eab308', text: '#a16207' }, // yellow
    { bg: '#faf5ff', stroke: '#a855f7', text: '#7e22ce' }, // purple
    { bg: '#fff7ed', stroke: '#f97316', text: '#c2410c' }, // orange
    { bg: '#f0fdfa', stroke: '#14b8a6', text: '#0f766e' }, // teal
    { bg: '#fff1f2', stroke: '#f43f5e', text: '#be123c' }, // rose
    { bg: '#eef2ff', stroke: '#6366f1', text: '#4338ca' }, // indigo
  ];

  return (
    <div className="space-y-3">
      {/* Sub-tab chuyển đổi giữa Sơ đồ bình bài và Sơ đồ cắt giấy mẹ */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('imposition')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'imposition'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Sơ Đồ Bình Bài (Tờ In Máy)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paperCut')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'paperCut'
                ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            Sơ Đồ Cắt Giấy Mẹ ({cutsPerParentSheet > 1 ? `Chia ${cutsPerParentSheet}` : 'Nguyên Khổ'})
          </button>
        </div>

        <span className="text-[11px] font-medium text-slate-500 hidden sm:inline-block">
          {activeTab === 'imposition'
            ? `Khổ in: ${printW}×${printH}mm`
            : `Khổ mẹ: ${parentW}×${parentH}mm`}
        </span>
      </div>

      {/* VÙNG 1: SƠ ĐỒ BÌNH BÀI TRÊN TỜ IN MÁY */}
      {activeTab === 'imposition' && (
        <div className="space-y-2">
          <div className="relative bg-slate-900/95 rounded-xl p-3 flex flex-col items-center justify-center min-h-[220px] max-h-[270px] overflow-hidden border border-slate-800 shadow-inner">
            <svg
              viewBox={`0 0 ${printW} ${printH}`}
              className="w-full max-h-[230px] drop-shadow-xl border border-slate-700 rounded bg-white transition-all duration-300 select-none"
              style={{ aspectRatio: `${printW} / ${printH}` }}
            >
              <defs>
                {/* Hoa văn sọc vàng cho lề kẹp nhíp */}
                <pattern
                  id="gripperStripe"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line x1="0" y1="0" x2="0" y2="10" stroke="#fde047" strokeWidth="3" />
                  <line x1="5" y1="0" x2="5" y2="10" stroke="#eab308" strokeWidth="3" />
                </pattern>
              </defs>

              {/* Tờ in nền trắng */}
              <rect x="0" y="0" width={printW} height={printH} fill="#ffffff" />

              {/* Đường biên vùng in hữu dụng (vùng an toàn) */}
              <rect
                x="4"
                y="4"
                width={printW - 8}
                height={printH - (gripperMarginMm + 4)}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                strokeDasharray="4 3"
              />

              {/* Dải lề kẹp nhíp (Gripper margin) ở cạnh đáy */}
              <rect
                x="0"
                y={printH - gripperMarginMm}
                width={printW}
                height={gripperMarginMm}
                fill="url(#gripperStripe)"
                opacity="0.9"
              />
              <line
                x1="0"
                y1={printH - gripperMarginMm}
                x2={printW}
                y2={printH - gripperMarginMm}
                stroke="#ca8a04"
                strokeWidth="1"
              />
              <text
                x={printW / 2}
                y={printH - gripperMarginMm / 2 + 3}
                textAnchor="middle"
                fill="#854d0e"
                fontSize={Math.max(9, Math.min(13, printW / 38))}
                fontWeight="bold"
              >
                ▼ Lề kẹp nhíp: {gripperMarginMm}mm ({printW >= 800 ? 'Bắt nhíp chiều 86cm' : `Bắt nhíp chiều ${Math.round(printW / 10)}cm`})
              </text>

              {/* Danh sách các con sản phẩm (Ups) */}
              {boxes.map((b) => {
                const isVerySmall = b.w < 50 || b.h < 35;
                const fontSize = Math.max(9, Math.min(13, b.w / 5));

                return (
                  <g key={b.index}>
                    {/* Ô sản phẩm */}
                    <rect
                      x={b.x}
                      y={b.y}
                      width={b.w}
                      height={b.h}
                      fill="#eff6ff"
                      stroke="#2563eb"
                      strokeWidth="0.9"
                    />

                    {/* Dấu xén (Crop marks) nhỏ ở góc nếu kích thước vừa */}
                    {!isVerySmall && (
                      <>
                        <line x1={b.x} y1={b.y + 4} x2={b.x} y2={b.y} stroke="#93c5fd" strokeWidth="0.8" />
                        <line x1={b.x} y1={b.y} x2={b.x + 4} y2={b.y} stroke="#93c5fd" strokeWidth="0.8" />
                        <line x1={b.x + b.w - 4} y1={b.y} x2={b.x + b.w} y2={b.y} stroke="#93c5fd" strokeWidth="0.8" />
                        <line x1={b.x + b.w} y1={b.y} x2={b.x + b.w} y2={b.y + 4} stroke="#93c5fd" strokeWidth="0.8" />
                      </>
                    )}

                    {/* Số thứ tự con */}
                    <text
                      x={b.x + b.w / 2}
                      y={isVerySmall ? b.y + b.h / 2 + 3 : b.y + b.h / 2 - 2}
                      textAnchor="middle"
                      fill="#1d4ed8"
                      fontSize={fontSize}
                      fontWeight="bold"
                    >
                      #{b.index}
                    </text>

                    {/* Kích thước con (nếu con đủ lớn) */}
                    {!isVerySmall && (
                      <text
                        x={b.x + b.w / 2}
                        y={b.y + b.h / 2 + fontSize * 0.9}
                        textAnchor="middle"
                        fill="#60a5fa"
                        fontSize={Math.max(7, fontSize * 0.75)}
                      >
                        {Math.round(b.w)}×{Math.round(b.h)}mm
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-2xs inline-block" />
              Sản phẩm thành phẩm ({productWidthMm}×{productHeightMm}mm)
              {isRotated && (
                <span className="text-amber-600 font-semibold inline-flex items-center gap-0.5 ml-1">
                  <RotateCw className="w-3 h-3" /> Xoay 90°
                </span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-2xs inline-block" />
              Lề kẹp nhíp ({gripperMarginMm}mm)
            </span>
          </div>
        </div>
      )}

      {/* VÙNG 2: SƠ ĐỒ CẮT XẢ GIẤY MẸ */}
      {activeTab === 'paperCut' && (
        <div className="space-y-2">
          <div className="relative bg-slate-900/95 rounded-xl p-3 flex flex-col items-center justify-center min-h-[220px] max-h-[270px] overflow-hidden border border-slate-800 shadow-inner">
            <svg
              viewBox={`0 0 ${parentW} ${parentH}`}
              className="w-full max-h-[230px] drop-shadow-xl border border-slate-700 rounded bg-white transition-all duration-300 select-none"
              style={{ aspectRatio: `${parentW} / ${parentH}` }}
            >
              {/* Tờ giấy mẹ nền ngoài */}
              <rect x="0" y="0" width={parentW} height={parentH} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />

              {/* Các block tờ in con sau khi xén */}
              {(cutScheme?.blocks || []).map((block, idx) => {
                const color = blockColors[idx % blockColors.length];
                const fontSize = Math.max(12, Math.min(22, block.w / 18));

                return (
                  <g key={block.index}>
                    <rect
                      x={block.x}
                      y={block.y}
                      width={block.w}
                      height={block.h}
                      fill={color.bg}
                      stroke={color.stroke}
                      strokeWidth="1.2"
                    />

                    {/* Tiêu đề tờ in con */}
                    <text
                      x={block.x + block.w / 2}
                      y={block.y + block.h / 2 - fontSize * 0.4}
                      textAnchor="middle"
                      fill={color.text}
                      fontSize={fontSize}
                      fontWeight="bold"
                    >
                      {block.name.split('(')[0].trim() || `Tờ in #${block.index}`}
                    </text>

                    {/* Kích thước khổ xén */}
                    <text
                      x={block.x + block.w / 2}
                      y={block.y + block.h / 2 + fontSize * 0.8}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize={Math.max(10, fontSize * 0.75)}
                      fontWeight="medium"
                    >
                      {Math.round(block.w)} × {Math.round(block.h)} mm ({upsPerPrintSheet} con)
                    </text>
                  </g>
                );
              })}

              {/* Các đường xén giấy (Cắt dao xén) màu đỏ nét đứt */}
              {(cutScheme?.cutLines || []).map((line, idx) => {
                const midX = (line.x1 + line.x2) / 2;
                const midY = (line.y1 + line.y2) / 2;

                return (
                  <g key={idx}>
                    <line
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />

                    {/* Biểu tượng cây kéo & nhãn đường xén */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-45"
                        y="-10"
                        width="90"
                        height="20"
                        rx="4"
                        fill="#fee2e2"
                        stroke="#ef4444"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#991b1b"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        ✂ {line.label || 'Đường xén'}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2 flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center gap-1.5 font-medium">
              <Scissors className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {cutScheme?.cutDescription || `Cắt xả từ tờ mẹ ${parentSheet.widthCm}×${parentSheet.heightCm}cm`}
            </span>
            <span className="font-semibold text-amber-800 shrink-0">
              1 tờ mẹ = {cutsPerParentSheet} tờ in ({totalUpsPerParentSheet} con)
            </span>
          </div>
        </div>
      )}

      {/* THÔNG SỐ BÌNH TRANG VẮN TẮT */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg py-2 px-1">
          <span className="text-[11px] text-slate-500 block">Số con / tờ in</span>
          <span className="text-sm font-bold text-blue-700">{upsPerPrintSheet} con</span>
          <span className="text-[10px] text-slate-400 block">{cols}×{rows} {isRotated ? '• Xoay' : ''}</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg py-2 px-1">
          <span className="text-[11px] text-slate-500 block">Cắt xả tờ mẹ</span>
          <span className="text-sm font-bold text-indigo-700">Chia {cutsPerParentSheet}</span>
          <span className="text-[10px] text-slate-400 block">{parentSheet.widthCm}×{parentSheet.heightCm}cm</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg py-2 px-1">
          <span className="text-[11px] text-slate-500 block">Tổng con / tờ mẹ</span>
          <span className="text-sm font-bold text-violet-700">{totalUpsPerParentSheet} con</span>
          <span className="text-[10px] text-slate-400 block">{upsPerPrintSheet} × {cutsPerParentSheet}</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg py-2 px-1 col-span-3 sm:col-span-1">
          <span className="text-[11px] text-slate-500 block">Tận dụng giấy</span>
          <span className="text-sm font-bold text-emerald-700">{sheetEfficiencyPercent}%</span>
          <span className="text-[10px] text-slate-400 block">Khổ {printW}×{printH}mm</span>
        </div>
      </div>
    </div>
  );
};
