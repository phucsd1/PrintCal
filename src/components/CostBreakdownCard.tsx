'use client';

import React, { useState } from 'react';
import { CalculationInput, CalculationResult, PaperType } from '@/types';
import {
  FileText,
  Copy,
  Printer,
  Save,
  Check,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
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

  // Sao chép báo giá nhanh gửi Zalo / Tin nhắn
  const handleCopyZalo = () => {
    const text = `📢 BÁO GIÁ IN ẤN - ${input.jobName}
----------------------------------------
- Kích thước: ${input.widthMm} x ${input.heightMm} mm
- Số lượng: ${input.quantity.toLocaleString('vi-VN')} chiếc
- Chất liệu: ${paperType.name}
- Công nghệ in: ${chosenTech === 'offset' ? 'In Offset' : 'In Nhanh Kỹ Thuật Số'} (${input.printSides === '2_side' ? '2 mặt' : '1 mặt'})
${costs.finishingDetails.length > 0 ? `- Gia công: ${costs.finishingDetails.map((f) => f.name).join(', ')}\n` : ''}- Tổng thanh toán: ${costs.finalPrice.toLocaleString('vi-VN')} VNĐ
- Đơn giá: ${costs.unitPrice.toLocaleString('vi-VN')} VNĐ / chiếc
----------------------------------------
Hotline / Zalo: Liên hệ xưởng in PrintCal`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header giá bán nổi bật */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-5">
        <div className="flex items-center justify-between text-xs text-blue-300 mb-1">
          <span className="uppercase font-semibold tracking-wider">Tổng Giá Bán Đề Xuất</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold">
            {chosenTech === 'offset' ? 'Công Nghệ In Offset' : 'Công Nghệ In Nhanh'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {costs.finalPrice.toLocaleString('vi-VN')}
          </span>
          <span className="text-base font-bold text-blue-300">VNĐ</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300 mt-2 pt-2 border-t border-white/10">
          <span>
            Đơn giá: <strong className="text-white text-sm">{costs.unitPrice.toLocaleString('vi-VN')}đ</strong> / chiếc
          </span>
          <span>
            Số lượng: <strong className="text-white">{quantities.productQty.toLocaleString('vi-VN')}</strong>
          </span>
        </div>
      </div>

      {/* Chi tiết chi phí từng khâu */}
      <div className="p-4 space-y-3 flex-1 text-xs">
        {/* 1. Tiền giấy */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Tiền Giấy In:
            </span>
            <strong className="text-slate-900 text-sm">{costs.paperCost.toLocaleString('vi-VN')}đ</strong>
          </div>
          <p className="text-[11px] text-slate-500">
            Cần {quantities.parentSheetsNeeded} tờ mẹ ({quantities.ramsNeeded} Ram / ~{quantities.kgNeeded} Kg) • {imposition.parentSheet.name}
          </p>
        </div>

        {/* 2. Tiền in ấn */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Tiền In Máy ({chosenTech === 'offset' ? 'Offset' : 'KTS'}):
            </span>
            <strong className="text-slate-900 text-sm">{costs.totalPrintCost.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="text-[11px] text-slate-500 space-y-0.5">
            {chosenTech === 'offset' ? (
              <>
                <p>Khuôn kẽm CTP: {costs.platesCount} lá × {costs.plateCost.toLocaleString('vi-VN')}đ</p>
                <p>Công in ({quantities.totalPrintSheets} tờ lớn + bù hao): {costs.printRunCost.toLocaleString('vi-VN')}đ</p>
              </>
            ) : (
              <p>Phí in click ({quantities.totalPrintSheets} lượt A3/A4): {costs.printRunCost.toLocaleString('vi-VN')}đ</p>
            )}
          </div>
        </div>

        {/* 3. Tiền gia công */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Gia Công Sau In ({costs.finishingDetails.length} khâu):</span>
            <strong className="text-slate-900 text-sm">{costs.finishingCost.toLocaleString('vi-VN')}đ</strong>
          </div>
          {costs.finishingDetails.length > 0 ? (
            <div className="space-y-1 pt-1 border-t border-slate-200/60">
              {costs.finishingDetails.map((f, i) => (
                <div key={i} className="flex justify-between text-[11px] text-slate-600">
                  <span className="truncate pr-2">• {f.name}:</span>
                  <span className="font-medium shrink-0">{f.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">Không chọn gia công phức tạp</p>
          )}
        </div>

        {/* Chi phí vốn, Lợi nhuận, Thuế */}
        <div className="pt-2 border-t border-slate-200 space-y-1.5 text-slate-600">
          <div className="flex justify-between">
            <span>Chi phí vốn gốc:</span>
            <span className="font-semibold text-slate-800">{costs.totalBaseCost.toLocaleString('vi-VN')}đ</span>
          </div>

          <div className="flex justify-between text-emerald-700">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Lợi nhuận gộp ({input.profitMarginPercent}%):
            </span>
            <span className="font-semibold">+{costs.profitAmount.toLocaleString('vi-VN')}đ</span>
          </div>

          {costs.discountAmount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Chiết khấu giảm giá:</span>
              <span className="font-semibold">-{costs.discountAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}

          {costs.vatAmount > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Thuế VAT ({input.vatPercent}%):</span>
              <span className="font-semibold">+{costs.vatAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
        </div>
      </div>

      {/* Nhóm nút hành động */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
        <button
          onClick={onSaveOrder}
          disabled={isSavingOrder}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-semibold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSavingOrder ? 'Đang lưu đơn hàng...' : 'Lưu Vào Quản Lý Đơn Hàng'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenPrintModal}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            In Báo Giá / Lệnh SX
          </button>

          <button
            onClick={handleCopyZalo}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã copy Zalo!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                Copy Gửi Khách
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
