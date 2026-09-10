'use client';

import React, { useState } from 'react';
import { CalculationInput, CalculationResult, PaperType } from '@/types';
import {
  Copy,
  Printer,
  Save,
  Check,
  Layers,
  Sparkles,
  Scissors,
  TrendingUp,
} from 'lucide-react';

interface CostBreakdownCardProps {
  input: CalculationInput;
  result: CalculationResult;
  paperType: PaperType;
  onOpenPrintModal: () => void;
  onSaveOrder: () => void;
  isSavingOrder?: boolean;
}

export const CostBreakdownCard: React.FC<CostBreakdownCardProps> = ({
  input,
  result,
  paperType,
  onOpenPrintModal,
  onSaveOrder,
  isSavingOrder = false,
}) => {
  const [copied, setCopied] = useState(false);
  const { costs, quantities, chosenTech, imposition } = result;

  const handleCopyZalo = () => {
    const text = `📢 BÁO GIÁ IN ẤN - ${input.jobName}
• Kích thước: ${input.widthMm} x ${input.heightMm} mm
• Số lượng: ${input.quantity.toLocaleString('vi-VN')} chiếc
• Chất liệu: ${paperType.name}
• Công nghệ: ${chosenTech === 'offset' ? 'In Offset' : 'In Nhanh KTS'} (${input.printSides === '2_side' ? '2 mặt' : '1 mặt'})
${costs.finishingDetails.length > 0 ? `• Gia công: ${costs.finishingDetails.map((f) => f.name).join(', ')}\n` : ''}👉 TỔNG TIỀN: ${costs.finalPrice.toLocaleString('vi-VN')} VNĐ (${costs.unitPrice.toLocaleString('vi-VN')}đ/c)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tính tỷ lệ % thành phần chi phí để vẽ thanh tiến trình
  const totalBase = Math.max(1, costs.totalBaseCost);
  const paperPct = Math.round((costs.paperCost / totalBase) * 100);
  const printPct = Math.round((costs.totalPrintCost / totalBase) * 100);
  const finishPct = Math.max(0, 100 - paperPct - printPct);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400 font-medium uppercase tracking-wider text-[11px]">Tổng Báo Giá</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold text-[11px] border border-blue-400/30">
            {chosenTech === 'offset' ? 'Máy In Offset' : 'In Nhanh KTS'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {costs.finalPrice.toLocaleString('vi-VN')}
          </span>
          <span className="text-sm font-bold text-slate-400">VNĐ</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300 mt-3 pt-2.5 border-t border-white/10">
          <span>
            Đơn giá: <strong className="text-white text-sm font-bold">{costs.unitPrice.toLocaleString('vi-VN')}đ</strong> / chiếc
          </span>
          <span>
            SL: <strong className="text-white font-bold">{quantities.productQty.toLocaleString('vi-VN')}</strong>
          </span>
        </div>
      </div>

      {/* Thanh cơ cấu chi phí (Breakdown progress bar) */}
      <div className="p-4 space-y-3 text-xs">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
            <span>Cơ cấu chi phí sản xuất:</span>
            <span>{costs.totalBaseCost.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
            <div style={{ width: `${paperPct}%` }} className="bg-blue-500" title={`Giấy: ${paperPct}%`} />
            <div style={{ width: `${printPct}%` }} className="bg-indigo-600" title={`In ấn: ${printPct}%`} />
            <div style={{ width: `${finishPct}%` }} className="bg-purple-500" title={`Gia công: ${finishPct}%`} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Giấy ({paperPct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> In ấn ({printPct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Gia công ({finishPct}%)
            </span>
          </div>
        </div>

        {/* Danh sách chi tiết vắn tắt */}
        <div className="divide-y divide-slate-100 text-slate-700 pt-1">
          <div className="py-2 flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              {chosenTech === 'digital' && costs.digitalDetails?.mode === 'with_paper'
                ? `Phôi giấy INTC (${quantities.totalPrintSheets} tờ):`
                : `Tiền giấy (${quantities.parentSheetsNeeded} tờ mẹ):`}
            </span>
            <span className="font-semibold text-slate-900">
              {costs.paperCost === 0 && costs.digitalDetails?.mode === 'with_paper' ? (
                <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                  Đã gồm trong giá in
                </span>
              ) : costs.paperCost === 0 && input.customerSuppliedPaper ? (
                <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                  Khách tự cấp giấy
                </span>
              ) : (
                `${costs.paperCost.toLocaleString('vi-VN')}đ`
              )}
            </span>
          </div>

          <div className="py-2 flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              {chosenTech === 'offset'
                ? `Tiền in ${costs.plateCost === 0 ? '(Gói trọn gồm kẽm)' : `(${costs.platesCount} kẽm + công)`}:`
                : `Tiền in (${quantities.totalPrintSheets} tờ, Không bù hao):`}
            </span>
            <span className="font-semibold text-slate-900">{costs.totalPrintCost.toLocaleString('vi-VN')}đ</span>
          </div>

          {chosenTech === 'digital' && costs.digitalDetails && (
            <div className="py-2 px-3 bg-sky-50/80 border border-sky-100 rounded-xl text-[11px] text-sky-900 space-y-1 my-1">
              <div className="flex justify-between font-bold">
                <span>
                  {costs.digitalDetails.mode === 'with_paper'
                    ? '📦 In kèm giấy (INTC 14.03)'
                    : '⚙️ In gia công (Konica C12000)'}
                </span>
                <span className="text-sky-700">Khổ: {costs.digitalDetails.sheetSizeName || imposition.printSheet.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Đơn giá: {costs.digitalDetails.ratePerSheet.toLocaleString('vi-VN')}đ / tờ in ({quantities.totalPrintSheets} tờ)</span>
                {costs.shortRunFee && costs.shortRunFee > 0 ? (
                  <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    Phụ phí SL ít: +{costs.shortRunFee.toLocaleString('vi-VN')}đ
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold">Miễn phụ phí</span>
                )}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold pt-0.5 flex items-center gap-1">
                <span>✓</span> In đúng {quantities.totalPrintSheets} tờ thực tế (Không bù hao)
              </div>
            </div>
          )}

          <div className="py-2 flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Scissors className="w-3.5 h-3.5 text-purple-600" />
              Gia công ({costs.finishingDetails.length} khâu):
            </span>
            <span className="font-semibold text-slate-900">{costs.finishingCost.toLocaleString('vi-VN')}đ</span>
          </div>

          <div className="py-2 flex justify-between items-center text-emerald-700">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Lợi nhuận gộp ({input.profitMarginPercent}%):
            </span>
            <span className="font-semibold">+{costs.profitAmount.toLocaleString('vi-VN')}đ</span>
          </div>

          {costs.vatAmount > 0 && (
            <div className="py-2 flex justify-between items-center text-slate-600">
              <span>Thuế VAT ({input.vatPercent}%):</span>
              <span className="font-semibold">+{costs.vatAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
        </div>
      </div>

      {/* Hành động */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
        <button
          onClick={onSaveOrder}
          disabled={isSavingOrder}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSavingOrder ? 'Đang lưu...' : 'Lưu Đơn Hàng Mới'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenPrintModal}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            In Báo Giá
          </button>

          <button
            onClick={handleCopyZalo}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Đã Copy!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                Copy Zalo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
