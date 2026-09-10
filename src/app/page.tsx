'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar, ActiveTab } from '@/components/Navbar';
import { ImpositionVisualizer } from '@/components/ImpositionVisualizer';
import { BreakEvenChart } from '@/components/BreakEvenChart';
import { CostBreakdownCard } from '@/components/CostBreakdownCard';
import { QuotePrintModal } from '@/components/QuotePrintModal';
import { OrdersManager } from '@/components/OrdersManager';
import { PaperManager } from '@/components/PaperManager';
import { MachineManager } from '@/components/MachineManager';
import { FinishingManager } from '@/components/FinishingManager';
import { CustomerManager } from '@/components/CustomerManager';
import { SettingsManager } from '@/components/SettingsManager';
import { PaperSelectorModal } from '@/components/PaperSelectorModal';
import {
  CalculationInput,
  CalculationResult,
  DigitalMachine,
  FinishingService,
  OffsetMachine,
  PaperType,
  ProductType,
  PrintTech,
  OffsetWorkType,
  SystemSetting,
} from '@/types';
import {
  Calculator,
  Sparkles,
  Zap,
  Scissors,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LayoutGrid,
  TrendingUp,
  FileText,
  Search,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');

  // Master Data
  const [papers, setPapers] = useState<PaperType[]>([]);
  const [offsetMachines, setOffsetMachines] = useState<OffsetMachine[]>([]);
  const [digitalMachines, setDigitalMachines] = useState<DigitalMachine[]>([]);
  const [finishingServices, setFinishingServices] = useState<FinishingService[]>([]);
  const [settings, setSettings] = useState<SystemSetting | undefined>();
  const [orderCount, setOrderCount] = useState(0);

  // Form Inputs
  const [jobName, setJobName] = useState('In Tờ Rơi A4');
  const [productType, setProductType] = useState<ProductType>('to_roi');
  const [printTech, setPrintTech] = useState<PrintTech>('auto');
  const [quantity, setQuantity] = useState(1000);
  const [widthMm, setWidthMm] = useState(210);
  const [heightMm, setHeightMm] = useState(297);
  const [bleedMm, setBleedMm] = useState(2);
  const [paperTypeId, setPaperTypeId] = useState<number>(0);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [printSides, setPrintSides] = useState<'1_side' | '2_side'>('2_side');
  const [colorsFront, setColorsFront] = useState(4);
  const [colorsBack, setColorsBack] = useState(4);
  const [offsetWorkType, setOffsetWorkType] = useState<OffsetWorkType>('self_turn');
  const [selectedFinishing, setSelectedFinishing] = useState<{ serviceId: number; sides?: number }[]>([
    { serviceId: 1, sides: 2 },
  ]);
  const [profitMarginPercent, setProfitMarginPercent] = useState(25);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatPercent, setVatPercent] = useState(8);

  // Accordion tùy chọn nâng cao (ẩn mặc định cho thoáng)
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Chế độ xem ở cột kết quả (2D Imposition vs Break-even vs Breakdown)
  const [resultTab, setResultTab] = useState<'visual' | 'breakeven' | 'breakdown'>('visual');

  // Customer Info
  const [customerName, setCustomerName] = useState('Khách Hàng');
  const [customerPhone, setCustomerPhone] = useState('');

  // Result
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [currentQuoteCode, setCurrentQuoteCode] = useState(`BG-${Date.now().toString().slice(-6)}`);

  const loadMasterData = async () => {
    try {
      const [pRes, mRes, fRes, sRes, oRes] = await Promise.all([
        fetch('/api/papers').then((r) => r.json()),
        fetch('/api/machines').then((r) => r.json()),
        fetch('/api/finishing').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
      ]);

      if (Array.isArray(pRes)) {
        setPapers(pRes);
        if (pRes.length > 0 && paperTypeId === 0) {
          const defaultPaper = pRes.find((p) => p.code.includes('C150')) || pRes[0];
          setPaperTypeId(defaultPaper.id);
        }
      }

      if (mRes.offsetMachines) setOffsetMachines(mRes.offsetMachines);
      if (mRes.digitalMachines) setDigitalMachines(mRes.digitalMachines);
      if (Array.isArray(fRes)) setFinishingServices(fRes);
      if (sRes.companyName) {
        setSettings(sRes);
        if (sRes.defaultProfitMargin) setProfitMarginPercent(sRes.defaultProfitMargin);
        if (sRes.defaultVatPercent) setVatPercent(sRes.defaultVatPercent);
      }
      if (Array.isArray(oRes)) setOrderCount(oRes.length);
    } catch (err) {
      console.error('Failed to load master data:', err);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const triggerCalculation = useCallback(async () => {
    if (!paperTypeId || paperTypeId === 0) return;

    try {
      setCalculating(true);
      const payload: CalculationInput = {
        jobName,
        productType,
        printTech,
        quantity: Number(quantity) || 1,
        widthMm: Number(widthMm) || 210,
        heightMm: Number(heightMm) || 297,
        bleedMm: Number(bleedMm) || 2,
        paperTypeId,
        printSides,
        colorsFront: Number(colorsFront) || 4,
        colorsBack: printSides === '2_side' ? (Number(colorsBack) || 4) : 0,
        offsetWorkType,
        selectedFinishing,
        profitMarginPercent: Number(profitMarginPercent) || 0,
        discountAmount: Number(discountAmount) || 0,
        vatPercent: Number(vatPercent) || 0,
      };

      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setCalculating(false);
    }
  }, [
    jobName,
    productType,
    printTech,
    quantity,
    widthMm,
    heightMm,
    bleedMm,
    paperTypeId,
    printSides,
    colorsFront,
    colorsBack,
    offsetWorkType,
    selectedFinishing,
    profitMarginPercent,
    discountAmount,
    vatPercent,
  ]);

  useEffect(() => {
    if (paperTypeId > 0) {
      triggerCalculation();
    }
  }, [triggerCalculation, paperTypeId]);

  const applyPreset = (type: string) => {
    switch (type) {
      case 'a4_flyer':
        setJobName('Tờ Rơi A4');
        setProductType('to_roi');
        setWidthMm(210);
        setHeightMm(297);
        setQuantity(1000);
        setPrintSides('2_side');
        setSelectedFinishing([]);
        const c150 = papers.find((p) => p.code.includes('C150'));
        if (c150) setPaperTypeId(c150.id);
        break;

      case 'a5_flyer':
        setJobName('Tờ Rơi A5');
        setProductType('to_roi');
        setWidthMm(148);
        setHeightMm(210);
        setQuantity(2000);
        setPrintSides('2_side');
        setSelectedFinishing([]);
        const c150_a5 = papers.find((p) => p.code.includes('C150'));
        if (c150_a5) setPaperTypeId(c150_a5.id);
        break;

      case 'namecard':
        setJobName('Danh Thiếp 2 Mặt');
        setProductType('namecard');
        setWidthMm(90);
        setHeightMm(54);
        setQuantity(500);
        setPrintSides('2_side');
        const c300 = papers.find((p) => p.code.includes('C300') || p.code.includes('B300'));
        if (c300) setPaperTypeId(c300.id);
        const lamination = finishingServices.find((f) => f.category === 'can_mang');
        if (lamination) setSelectedFinishing([{ serviceId: lamination.id, sides: 2 }]);
        break;

      case 'brochure':
        setJobName('Brochure Gấp 3');
        setProductType('to_roi');
        setWidthMm(297);
        setHeightMm(210);
        setQuantity(1000);
        setPrintSides('2_side');
        const c200 = papers.find((p) => p.code.includes('C200'));
        if (c200) setPaperTypeId(c200.id);
        const crease = finishingServices.find((f) => f.code.includes('CAN_GAP_2_DUONG'));
        const mờ = finishingServices.find((f) => f.category === 'can_mang');
        const broFin = [];
        if (mờ) broFin.push({ serviceId: mờ.id, sides: 2 });
        if (crease) broFin.push({ serviceId: crease.id });
        setSelectedFinishing(broFin);
        break;

      case 'box':
        setJobName('Hộp Giấy Mỹ Phẩm');
        setProductType('hop_giay');
        setWidthMm(240);
        setHeightMm(320);
        setQuantity(1000);
        setPrintSides('1_side');
        const ivory = papers.find((p) => p.code.includes('I350') || p.code.includes('I300'));
        if (ivory) setPaperTypeId(ivory.id);
        const dieCut = finishingServices.find((f) => f.calcType === 'die_cut');
        const lam = finishingServices.find((f) => f.category === 'can_mang');
        const glue = finishingServices.find((f) => f.category === 'dan');
        const boxFinishing = [];
        if (lam) boxFinishing.push({ serviceId: lam.id, sides: 1 });
        if (dieCut) boxFinishing.push({ serviceId: dieCut.id });
        if (glue) boxFinishing.push({ serviceId: glue.id });
        setSelectedFinishing(boxFinishing);
        break;

      case 'sticker':
        setJobName('Decal Tem Nhãn');
        setProductType('decal');
        setWidthMm(50);
        setHeightMm(50);
        setQuantity(2000);
        setPrintSides('1_side');
        const decal = papers.find((p) => p.code.includes('DECAL'));
        if (decal) setPaperTypeId(decal.id);
        const demi = finishingServices.find((f) => f.code.includes('BE_DEMI'));
        if (demi) setSelectedFinishing([{ serviceId: demi.id }]);
        break;
    }
  };

  const toggleFinishing = (serviceId: number) => {
    setSelectedFinishing((prev) => {
      const exists = prev.find((f) => f.serviceId === serviceId);
      if (exists) {
        return prev.filter((f) => f.serviceId !== serviceId);
      } else {
        return [...prev, { serviceId, sides: 1 }];
      }
    });
  };

  const handleSaveOrder = async () => {
    if (!result) return;
    try {
      setIsSavingOrder(true);
      const selectedPaper = papers.find((p) => p.id === paperTypeId);
      const orderPayload = {
        customerName: customerName || 'Khách vãng lai',
        customerPhone: customerPhone || '',
        jobName,
        productType,
        printTech: result.chosenTech,
        quantity: result.quantities.productQty,
        widthMm,
        heightMm,
        pages: printSides === '2_side' ? 2 : 1,
        paperName: selectedPaper?.name || 'Giấy in',
        paperGsm: selectedPaper?.gsm || 150,
        parentSize: result.imposition.parentSheet.name,
        printSize: result.imposition.printSheet.name,
        upsPerSheet: result.imposition.upsPerPrintSheet,
        totalPrintSheets: result.quantities.totalPrintSheets,
        totalParentSheets: result.quantities.parentSheetsNeeded,
        paperCost: result.costs.paperCost,
        printCost: result.costs.totalPrintCost,
        finishingCost: result.costs.finishingCost,
        totalCost: result.costs.totalBaseCost,
        profitMarginPercent,
        profitAmount: result.costs.profitAmount,
        discountAmount,
        vatPercent,
        vatAmount: result.costs.vatAmount,
        finalPrice: result.costs.finalPrice,
        unitPrice: result.costs.unitPrice,
        status: 'quote',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentQuoteCode(data.code);
        setOrderCount((prev) => prev + 1);
        alert(`Đã lưu đơn hàng thành công! Mã đơn: ${data.code}`);
      }
    } catch (err) {
      console.error('Save order error:', err);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const selectedPaper = useMemo(() => {
    return papers.find((p) => p.id === paperTypeId) || papers[0];
  }, [papers, paperTypeId]);

  const groupedPapers = useMemo(() => {
    const groups: Record<string, PaperType[]> = {
      'Giấy Couche (C)': [],
      'Giấy Ivory (I)': [],
      'Giấy Fort / Ford (F)': [],
      'Giấy Bristol (B)': [],
      'Giấy Duplex (D)': [],
      'Giấy Decal & Khác': [],
    };

    for (const p of papers) {
      if (p.name.startsWith('Couche') || p.code.startsWith('C')) {
        groups['Giấy Couche (C)'].push(p);
      } else if (p.name.startsWith('Ivory') || p.code.startsWith('I')) {
        groups['Giấy Ivory (I)'].push(p);
      } else if (p.name.startsWith('Fort') || p.name.startsWith('Ford') || p.code.startsWith('F')) {
        groups['Giấy Fort / Ford (F)'].push(p);
      } else if (p.name.startsWith('Bristol') || p.code.startsWith('B')) {
        groups['Giấy Bristol (B)'].push(p);
      } else if (p.name.startsWith('Duplex') || p.code.startsWith('D')) {
        groups['Giấy Duplex (D)'].push(p);
      } else {
        groups['Giấy Decal & Khác'].push(p);
      }
    }
    return groups;
  }, [papers]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} orderCount={orderCount} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* PHÂN HỆ 1: MÁY TÍNH GIÁ THÔNG MINH */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            {/* Quick Presets Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-slate-400 font-semibold px-1 text-[11px] uppercase tracking-wider shrink-0">
                Mẫu nhanh:
              </span>
              {[
                { id: 'a4_flyer', label: 'Tờ Rơi A4' },
                { id: 'a5_flyer', label: 'Tờ Rơi A5' },
                { id: 'namecard', label: 'Danh Thiếp' },
                { id: 'brochure', label: 'Brochure Gấp 3' },
                { id: 'box', label: 'Hộp Mỹ Phẩm' },
                { id: 'sticker', label: 'Decal Tem Nhãn' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full font-medium text-slate-700 transition-colors whitespace-nowrap shadow-2xs"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Bố cục 2 cột cân đối: Form Cấu Hình (Trái) & Bảng Kết Quả Live (Phải) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* CỘT TRÁI: FORM CẤU HÌNH (7 CỘT) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Khối 1: Quy cách sản phẩm */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      Quy Cách Sản Phẩm
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">Bấm đổi thông số để tính lại</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Tên bài in */}
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Tên bài in</label>
                      <input
                        type="text"
                        value={jobName}
                        onChange={(e) => setJobName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VD: Tờ rơi quảng cáo..."
                      />
                    </div>

                    {/* Kích thước & Số lượng */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Rộng (mm)</label>
                        <input
                          type="number"
                          value={widthMm}
                          onChange={(e) => setWidthMm(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Dài (mm)</label>
                        <input
                          type="number"
                          value={heightMm}
                          onChange={(e) => setHeightMm(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Số lượng (chiếc)</label>
                        <input
                          type="number"
                          step="50"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full border border-blue-400 bg-blue-50/40 rounded-lg p-2 font-black text-blue-900 text-sm"
                        />
                      </div>
                    </div>

                    {/* Loại giấy */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-slate-700 font-bold">Chất liệu giấy in</label>
                        <button
                          type="button"
                          onClick={() => setIsPaperModalOpen(true)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Search className="w-3.5 h-3.5" />
                          Tra cứu & Đổi loại giấy (125+ loại)
                        </button>
                      </div>

                      {/* Selected Paper Preview Card */}
                      <div
                        onClick={() => setIsPaperModalOpen(true)}
                        className="group relative cursor-pointer border border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20 p-3 rounded-xl transition-all shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                NCC: {selectedPaper?.supplier || 'Thuận Phát'}
                              </span>
                              <span className="font-mono text-xs text-slate-500 font-semibold">
                                {selectedPaper?.code}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                              {selectedPaper?.name || 'Chưa chọn giấy'}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Định lượng: <strong className="text-blue-700">{selectedPaper?.gsm} gsm</strong> &bull; Khổ mẹ: <strong>{selectedPaper?.parentWidthCm} × {selectedPaper?.parentHeightCm} cm</strong>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[11px] font-medium text-slate-500">Đơn giá áp dụng:</div>
                            <div className="font-black text-emerald-700 text-sm">
                              {(
                                (result?.quantities?.parentSheetsNeeded || 0) >= 500
                                  ? (selectedPaper?.priceAbove500 || selectedPaper?.pricePerRam || 0)
                                  : (selectedPaper?.priceBelow500 || selectedPaper?.priceAbove500 || selectedPaper?.pricePerRam || 0)
                              ).toLocaleString('vi-VN')} đ/ram
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {(result?.quantities?.parentSheetsNeeded || 0) >= 500
                                ? 'Mức ≥ 500 tờ (nguyên ram)'
                                : 'Mức < 500 tờ (bán lẻ)'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">
                            Bấm vào đây để tìm theo NCC, loại giấy, định lượng gsm...
                          </span>
                          <span className="text-blue-600 font-semibold group-hover:underline">
                            Đổi giấy &rarr;
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Số mặt in & Công nghệ in */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1.5">Số mặt in</label>
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setPrintSides('1_side')}
                            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                              printSides === '1_side' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            In 1 Mặt
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrintSides('2_side')}
                            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                              printSides === '2_side' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            In 2 Mặt
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-medium mb-1.5">Công nghệ in</label>
                        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setPrintTech('auto')}
                            className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                              printTech === 'auto' ? 'bg-white shadow text-blue-700' : 'text-slate-600'
                            }`}
                          >
                            ⚡ Tự Động
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrintTech('offset')}
                            className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                              printTech === 'offset' ? 'bg-white shadow text-indigo-700' : 'text-slate-600'
                            }`}
                          >
                            Offset
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrintTech('digital')}
                            className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                              printTech === 'digital' ? 'bg-white shadow text-sky-700' : 'text-slate-600'
                            }`}
                          >
                            In Nhanh
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Khối 2: Gia công sau in dạng Quick Chips */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-purple-600" />
                      Gia Công Sau In
                    </h2>
                    <span className="text-xs text-slate-400">
                      {selectedFinishing.length} dịch vụ đã chọn
                    </span>
                  </div>

                  {/* Chips bấm chọn nhanh gọn */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {finishingServices.map((service) => {
                      const isSelected = selectedFinishing.some((f) => f.serviceId === service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleFinishing(service.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-purple-50 border-purple-400 text-purple-900 font-semibold shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                              isSelected ? 'bg-purple-600 text-white' : 'border border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </span>
                          <span>{service.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Khối 3: Tùy chọn nâng cao (Thu gọn để tránh rối mắt) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full p-4 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>⚙️ Tùy Chọn Nâng Cao (Lợi Nhuận, Thuế, Bleed, Khách Hàng)</span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {showAdvanced && (
                    <div className="p-4 pt-0 border-t border-slate-100 space-y-3 text-xs">
                      <div className="grid grid-cols-3 gap-3 pt-3">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Lợi nhuận (%)</label>
                          <input
                            type="number"
                            value={profitMarginPercent}
                            onChange={(e) => setProfitMarginPercent(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg p-2 text-center font-bold text-emerald-700"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Giảm giá (đ)</label>
                          <input
                            type="number"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg p-2 text-center text-rose-600"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">VAT (%)</label>
                          <input
                            type="number"
                            value={vatPercent}
                            onChange={(e) => setVatPercent(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg p-2 text-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Tràn lề Bleed (mm)</label>
                          <input
                            type="number"
                            value={bleedMm}
                            onChange={(e) => setBleedMm(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Kiểu trở kẽm Offset</label>
                          <select
                            value={offsetWorkType}
                            onChange={(e) => setOffsetWorkType(e.target.value as OffsetWorkType)}
                            className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                          >
                            <option value="self_turn">Tự Trở (1 bộ kẽm)</option>
                            <option value="sheetwise">In 2 Bài (2 bộ kẽm riêng)</option>
                            <option value="tumble">Trở Nhíp</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Tên khách hàng</label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Số điện thoại</label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CỘT PHẢI: KẾT QUẢ BÁO GIÁ & TRỰC QUAN HÓA TABBED (5 CỘT) */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
                {result && selectedPaper ? (
                  <>
                    {/* Thẻ Hero Tổng Báo Giá & Nút Lưu/In */}
                    <CostBreakdownCard
                      input={{
                        jobName,
                        productType,
                        printTech,
                        quantity,
                        widthMm,
                        heightMm,
                        bleedMm,
                        paperTypeId,
                        printSides,
                        colorsFront,
                        colorsBack,
                        offsetWorkType,
                        selectedFinishing,
                        profitMarginPercent,
                        discountAmount,
                        vatPercent,
                      }}
                      result={result}
                      paperType={selectedPaper}
                      onOpenPrintModal={() => setIsPrintModalOpen(true)}
                      onSaveOrder={handleSaveOrder}
                      isSavingOrder={isSavingOrder}
                    />

                    {/* Hộp Trực Quan Hóa dạng Tabs: Chọn xem Sơ Đồ Cắt Giấy hoặc So Sánh Hòa Vốn */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
                      {/* Segmented Control cho Tabs Trực Quan */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                        <button
                          type="button"
                          onClick={() => setResultTab('visual')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
                            resultTab === 'visual' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          Sơ Đồ Bình Bài & Cắt Giấy
                        </button>

                        <button
                          type="button"
                          onClick={() => setResultTab('breakeven')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
                            resultTab === 'breakeven' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          So Sánh Hòa Vốn
                        </button>
                      </div>

                      {/* Nội dung Tab */}
                      {resultTab === 'visual' && (
                        <ImpositionVisualizer
                          imposition={result.imposition}
                          productName={jobName}
                          productWidthMm={widthMm}
                          productHeightMm={heightMm}
                        />
                      )}

                      {resultTab === 'breakeven' && (
                        <BreakEvenChart
                          currentQty={quantity}
                          chosenTech={result.chosenTech}
                          comparisonTable={result.recommendation?.comparisonTable}
                          breakEvenQty={result.recommendation?.breakEvenQty}
                          reason={result.recommendation?.reason}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Đang tính toán chi phí...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PHÂN HỆ 2: QUẢN LÝ ĐƠN HÀNG */}
        {activeTab === 'orders' && <OrdersManager />}

        {/* PHÂN HỆ 3: QUẢN LÝ GIÁ GIẤY */}
        {activeTab === 'papers' && <PaperManager />}

        {/* PHÂN HỆ 4: QUẢN LÝ MÁY IN */}
        {activeTab === 'machines' && <MachineManager />}

        {/* PHÂN HỆ 5: QUẢN LÝ GIA CÔNG */}
        {activeTab === 'finishing' && <FinishingManager />}

        {/* PHÂN HỆ 6: QUẢN LÝ KHÁCH HÀNG */}
        {activeTab === 'customers' && <CustomerManager />}

        {/* PHÂN HỆ 7: CÀI ĐẶT HỆ THỐNG */}
        {activeTab === 'settings' && <SettingsManager />}
      </main>

      {/* Modal In Báo Giá Chuẩn A4 */}
      {result && selectedPaper && (
        <QuotePrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          input={{
            jobName,
            productType,
            printTech,
            quantity,
            widthMm,
            heightMm,
            bleedMm,
            paperTypeId,
            printSides,
            colorsFront,
            colorsBack,
            offsetWorkType,
            selectedFinishing,
            profitMarginPercent,
            discountAmount,
            vatPercent,
          }}
          result={result}
          paperType={selectedPaper}
          settings={settings}
          quoteCode={currentQuoteCode}
          customerInfo={{
            name: customerName,
            phone: customerPhone,
          }}
        />
      )}

      {/* Modal Tra Cứu & Chọn Loại Giấy */}
      <PaperSelectorModal
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
        papers={papers}
        selectedPaperId={paperTypeId}
        onSelectPaper={(paper) => {
          setPaperTypeId(paper.id);
          setIsPaperModalOpen(false);
        }}
      />
    </div>
  );
}
