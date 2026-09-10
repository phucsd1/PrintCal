'use client';

import React, { useState } from 'react';
import { CalculationInput, CalculationResult, PaperType, SystemSetting } from '@/types';
import { Printer, X, FileText, Wrench, Download, Check } from 'lucide-react';

interface QuotePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: CalculationInput;
  result: CalculationResult;
  paperType: PaperType;
  settings?: SystemSetting;
  quoteCode?: string;
  customerInfo?: {
    name: string;
    phone: string;
    company?: string;
    email?: string;
    address?: string;
  };
}

export const QuotePrintModal: React.FC<QuotePrintModalProps> = ({
  isOpen,
  onClose,
  input,
  result,
  paperType,
  settings,
  quoteCode = 'BG-202609-001',
  customerInfo = {
    name: 'Quý Khách Hàng',
    phone: '',
    company: '',
  },
}) => {
  const [activeDoc, setActiveDoc] = useState<'quote' | 'job_ticket'>('quote');

  if (!isOpen) return null;

  const defaultSettings: SystemSetting = settings || {
    companyName: 'XƯỞNG IN ẤN & THIẾT KẾ PRINTCAL',
    companyAddress: 'Tòa nhà PrintCal, Số 123 Đường In Ấn, TP.HCM',
    companyPhone: '0900.888.999 - 028.3888.9999',
    companyEmail: 'baogia@printcal.vn',
    bankAccount: '19038889999999 - Techcombank (CN TP.HCM) - CTK: PRINTCAL VIETNAM',
    bankName: 'Techcombank Chi nhánh TP.HCM',
    quoteFooterNote: '1. Báo giá có hiệu lực trong vòng 15 ngày.\n2. Giá trên chưa bao gồm phí vận chuyển ngoại tỉnh.\n3. Thời gian giao hàng tính từ lúc duyệt bản in mẫu và đặt cọc 50%.\n4. Đảm bảo chất lượng màu sắc chuẩn theo file thiết kế.',
    defaultProfitMargin: 25,
    defaultVatPercent: 8,
  };

  const todayStr = new Date().toLocaleDateString('vi-VN');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container Modal */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header điều khiển (Không in) */}
        <div className="bg-slate-800 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDoc('quote')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeDoc === 'quote' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              Phiếu Báo Giá Khách Hàng
            </button>
            <button
              onClick={() => setActiveDoc('job_ticket')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeDoc === 'job_ticket' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Lệnh Sản Xuất Xưởng In
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              In / Lưu PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nội dung tài liệu A4 để xem & in */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center print:p-0 print:bg-white">
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white p-8 md:p-10 shadow-lg print:shadow-none print:p-4 text-slate-900 text-sm font-sans flex flex-col justify-between">
            {activeDoc === 'quote' ? (
              // ================= PHIẾU BÁO GIÁ KHÁCH HÀNG =================
              <div className="flex flex-col h-full justify-between space-y-6">
                <div>
                  {/* Tiêu đề nhà in */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                    <div>
                      <h1 className="text-xl font-black tracking-wider text-slate-900 uppercase">
                        {defaultSettings.companyName}
                      </h1>
                      <p className="text-xs text-slate-600 mt-1">{defaultSettings.companyAddress}</p>
                      <p className="text-xs text-slate-600">
                        Hotline: <strong className="text-slate-800">{defaultSettings.companyPhone}</strong> | Email: {defaultSettings.companyEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">BÁO GIÁ DỊCH VỤ</span>
                      <span className="text-base font-extrabold text-slate-800">{quoteCode}</span>
                      <p className="text-xs text-slate-500 mt-0.5">Ngày: {todayStr}</p>
                    </div>
                  </div>

                  {/* Thông tin khách hàng */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg my-4 text-xs border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">Khách hàng / Công ty:</span>
                      <strong className="text-slate-800 text-sm">{customerInfo.name || 'Khách Hàng'}</strong>
                      {customerInfo.company && <p className="text-slate-600">{customerInfo.company}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">Số điện thoại / Email:</span>
                      <strong className="text-slate-800">{customerInfo.phone || 'Chưa cung cấp'}</strong>
                      {customerInfo.email && <p className="text-slate-600">{customerInfo.email}</p>}
                    </div>
                  </div>

                  {/* Bảng chi tiết quy cách in ấn */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">1. Quy Cách Sản Phẩm</h3>
                    <table className="w-full text-xs border border-slate-300">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold bg-slate-100 w-1/4">Tên ấn phẩm:</td>
                          <td className="p-2 font-bold text-slate-800 text-sm">{input.jobName}</td>
                          <td className="p-2 font-semibold bg-slate-100 w-1/4">Số lượng:</td>
                          <td className="p-2 font-bold text-blue-700 text-sm">{input.quantity.toLocaleString('vi-VN')} {input.productType === 'hop_giay' ? 'hộp' : input.productType === 'tui_giay' ? 'túi' : 'cái/cuốn'}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold bg-slate-100">Kích thước:</td>
                          <td className="p-2">{input.widthMm} × {input.heightMm} mm</td>
                          <td className="p-2 font-semibold bg-slate-100">Chất liệu giấy:</td>
                          <td className="p-2">{paperType.name}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-semibold bg-slate-100">Công nghệ in:</td>
                          <td className="p-2">
                            {result.chosenTech === 'offset' ? 'In Offset Công Nghiệp (Chuẩn màu cao)' : 'In Nhanh Kỹ Thuật Số (Chất lượng cao)'}
                          </td>
                          <td className="p-2 font-semibold bg-slate-100">Số màu in:</td>
                          <td className="p-2">
                            {input.printSides === '2_side' ? `In 2 mặt (${input.colorsFront || 4} màu / ${input.colorsBack || 4} màu)` : `In 1 mặt (${input.colorsFront || 4} màu)`}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold bg-slate-100 align-top">Gia công sau in:</td>
                          <td colSpan={3} className="p-2">
                            {result.costs.finishingDetails.length > 0 ? (
                              <ul className="list-disc list-inside space-y-0.5">
                                {result.costs.finishingDetails.map((f, i) => (
                                  <li key={i}>{f.name}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-slate-400">Xén thành phẩm chuẩn</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Bảng báo giá chi tiết */}
                  <div className="mt-5 space-y-3">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">2. Bảng Giá Chi Tiết</h3>
                    <table className="w-full text-xs border border-slate-300">
                      <thead>
                        <tr className="bg-slate-900 text-white font-semibold">
                          <th className="p-2 text-center w-12">STT</th>
                          <th className="p-2 text-left">Nội Dung Ấn Phẩm</th>
                          <th className="p-2 text-center">ĐVT</th>
                          <th className="p-2 text-center">Số Lượng</th>
                          <th className="p-2 text-right">Đơn Giá</th>
                          <th className="p-2 text-right">Thành Tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 text-center">01</td>
                          <td className="p-2">
                            <strong className="block">{input.jobName}</strong>
                            <span className="text-[11px] text-slate-500">
                              {input.widthMm}x{input.heightMm}mm, Giấy {paperType.name}, In {input.printSides === '2_side' ? '2 mặt' : '1 mặt'}
                            </span>
                          </td>
                          <td className="p-2 text-center">Chiếc</td>
                          <td className="p-2 text-center font-semibold">{input.quantity.toLocaleString('vi-VN')}</td>
                          <td className="p-2 text-right font-semibold">{result.costs.unitPrice.toLocaleString('vi-VN')}đ</td>
                          <td className="p-2 text-right font-bold">{result.costs.finalPrice.toLocaleString('vi-VN')}đ</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        {result.costs.discountAmount > 0 && (
                          <tr className="border-b border-slate-200 text-slate-600">
                            <td colSpan={5} className="p-2 text-right">Chiết khấu ưu đãi:</td>
                            <td className="p-2 text-right font-semibold text-rose-600">-{result.costs.discountAmount.toLocaleString('vi-VN')}đ</td>
                          </tr>
                        )}
                        {result.costs.vatAmount > 0 && (
                          <tr className="border-b border-slate-200 text-slate-600">
                            <td colSpan={5} className="p-2 text-right">Thuế VAT ({input.vatPercent}%):</td>
                            <td className="p-2 text-right font-semibold">+{result.costs.vatAmount.toLocaleString('vi-VN')}đ</td>
                          </tr>
                        )}
                        <tr className="bg-blue-50 font-bold text-slate-900 text-sm">
                          <td colSpan={5} className="p-2.5 text-right text-blue-900 uppercase">TỔNG CỘNG THANH TOÁN:</td>
                          <td className="p-2.5 text-right text-blue-700 text-base">{result.costs.finalPrice.toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Thông tin chuyển khoản & Điều khoản */}
                  <div className="grid grid-cols-2 gap-4 mt-5 text-[11px] border-t border-slate-200 pt-3">
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase mb-1">Thông Tin Thanh Toán:</h4>
                      <p className="text-slate-700">Ngân hàng: <strong>{defaultSettings.bankName}</strong></p>
                      <p className="text-slate-700">Tài khoản: <strong>{defaultSettings.bankAccount}</strong></p>
                      <p className="text-slate-500 mt-1 italic">Nội dung CK: Tên KH + SĐT + {quoteCode}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase mb-1">Điều Khoản Giao Nhận:</h4>
                      <p className="text-slate-600 whitespace-pre-line">{defaultSettings.quoteFooterNote}</p>
                    </div>
                  </div>
                </div>

                {/* Chữ ký xác nhận */}
                <div className="grid grid-cols-2 gap-4 pt-6 text-xs text-center">
                  <div>
                    <span className="font-bold text-slate-800 uppercase block">ĐẠI DIỆN KHÁCH HÀNG</span>
                    <span className="text-[11px] text-slate-400 italic block mt-0.5">(Ký và ghi rõ họ tên)</span>
                    <div className="h-16" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 uppercase block">ĐẠI DIỆN XƯỞNG IN</span>
                    <span className="text-[11px] text-slate-400 italic block mt-0.5">(Ký, đóng dấu xác nhận)</span>
                    <div className="h-16" />
                  </div>
                </div>
              </div>
            ) : (
              // ================= LỆNH SẢN XUẤT XƯỞNG IN =================
              <div className="flex flex-col h-full justify-between space-y-6">
                <div>
                  <div className="flex justify-between items-start border-b-2 border-amber-500 pb-3">
                    <div>
                      <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-black rounded uppercase">NỘI BỘ XƯỞNG</span>
                      <h1 className="text-xl font-black tracking-wide text-slate-900 uppercase mt-1">
                        LỆNH SẢN XUẤT IN ẤN
                      </h1>
                      <p className="text-xs text-slate-600">Đơn hàng: <strong className="text-slate-900">{input.jobName}</strong></p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">MÃ LỆNH</span>
                      <span className="text-lg font-black text-slate-900">{quoteCode}</span>
                      <p className="text-xs text-slate-500">Ngày tạo: {todayStr}</p>
                    </div>
                  </div>

                  {/* Thông số kỹ thuật xưởng in */}
                  <div className="grid grid-cols-3 gap-3 my-4 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="text-slate-500 block">Số lượng thành phẩm:</span>
                      <strong className="text-base text-blue-700 font-bold">{input.quantity.toLocaleString('vi-VN')} con</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="text-slate-500 block">Khổ thành phẩm (sau xén):</span>
                      <strong className="text-base text-slate-800 font-bold">{input.widthMm} × {input.heightMm} mm</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="text-slate-500 block">Công nghệ in:</span>
                      <strong className="text-base text-purple-700 font-bold uppercase">{result.chosenTech}</strong>
                    </div>
                  </div>

                  {/* KHÂU 1: CẮT XẢ GIẤY MẸ */}
                  <div className="border border-slate-300 rounded p-3 mb-3 text-xs bg-amber-50/40">
                    <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5 text-amber-900 mb-2">
                      <Check className="w-4 h-4 text-amber-600" />
                      Khâu 1: Chuẩn Bị & Cắt Xả Giấy
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-500 block">Loại giấy:</span>
                        <strong>{paperType.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Khổ giấy mẹ:</span>
                        <strong>{result.imposition.parentSheet.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Cách chia khổ in:</span>
                        <strong className="text-blue-700">Chia {result.imposition.cutsPerParentSheet} ({result.imposition.printSheet.widthMm}x{result.imposition.printSheet.heightMm}mm)</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tổng giấy mẹ cần:</span>
                        <strong className="text-rose-700 font-bold">{result.quantities.parentSheetsNeeded} tờ ({result.quantities.ramsNeeded} Ram / ~{result.quantities.kgNeeded} Kg)</strong>
                      </div>
                    </div>
                  </div>

                  {/* KHÂU 2: MÁY IN OFFSET / KTS */}
                  <div className="border border-slate-300 rounded p-3 mb-3 text-xs bg-blue-50/40">
                    <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5 text-blue-900 mb-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      Khâu 2: In Ấn Máy {result.chosenTech.toUpperCase()}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-500 block">Số con / tờ in:</span>
                        <strong className="text-blue-700 font-bold">{result.imposition.upsPerPrintSheet} con/tờ</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Kiểu in & Màu:</span>
                        <strong>{input.printSides === '2_side' ? 'In 2 mặt (CMYK)' : 'In 1 mặt'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tờ in thực tế (Net):</span>
                        <strong>{result.quantities.netPrintSheets} tờ</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Bù hao in + gia công:</span>
                        <strong className="text-amber-700 font-bold">+{result.quantities.printWasteSheets + result.quantities.finishingWasteSheets} tờ</strong>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between font-bold text-blue-900">
                      <span>TỔNG TỜ IN BÀN GIAO THỢ MÁY:</span>
                      <span className="text-sm text-rose-700">{result.quantities.totalPrintSheets} TỜ IN KHỔ {result.imposition.printSheet.widthMm}×{result.imposition.printSheet.heightMm}MM</span>
                    </div>
                  </div>

                  {/* KHÂU 3: GIA CÔNG SAU IN */}
                  <div className="border border-slate-300 rounded p-3 text-xs">
                    <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5 text-purple-900 mb-2">
                      <Check className="w-4 h-4 text-purple-600" />
                      Khâu 3: Danh Mục Gia Công Hoàn Thiện
                    </h3>
                    {result.costs.finishingDetails.length > 0 ? (
                      <table className="w-full text-left border border-slate-200">
                        <thead className="bg-slate-100 text-slate-700">
                          <tr>
                            <th className="p-1.5">Công đoạn</th>
                            <th className="p-1.5">Loại</th>
                            <th className="p-1.5">Quy cách kỹ thuật</th>
                            <th className="p-1.5 text-center">Ký nhận thợ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {result.costs.finishingDetails.map((f, idx) => (
                            <tr key={idx}>
                              <td className="p-1.5 font-bold text-slate-800">{f.name}</td>
                              <td className="p-1.5 uppercase text-[10px] text-slate-500">{f.category}</td>
                              <td className="p-1.5 text-slate-600">{f.formula}</td>
                              <td className="p-1.5 text-center text-slate-300">__________</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-slate-500 italic">Chỉ xén đóng gói thành phẩm.</p>
                    )}
                  </div>
                </div>

                {/* Chữ ký các bộ phận sản xuất */}
                <div className="grid grid-cols-4 gap-2 pt-6 text-[11px] text-center border-t border-slate-200">
                  <div>
                    <span className="font-bold block">Ra Kẽm / File</span>
                    <div className="h-12" />
                  </div>
                  <div>
                    <span className="font-bold block">Thợ Cắt Giấy</span>
                    <div className="h-12" />
                  </div>
                  <div>
                    <span className="font-bold block">Thợ Máy In</span>
                    <div className="h-12" />
                  </div>
                  <div>
                    <span className="font-bold block">Thợ Gia Công QC</span>
                    <div className="h-12" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
