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
  Layers,
  Sparkles,
  Zap,
  Scissors,
  Check,
  ChevronRight,
  RefreshCw,
  Sliders,
  DollarSign,
  FileSpreadsheet,
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
  const [jobName, setJobName] = useState('In Tờ Rơi A4 Quảng Cáo');
  const [productType, setProductType] = useState<ProductType>('to_roi');
  const [printTech, setPrintTech] = useState<PrintTech>('auto');
  const [quantity, setQuantity] = useState(1000);
  const [widthMm, setWidthMm] = useState(210);
  const [heightMm, setHeightMm] = useState(297);
  const [bleedMm, setBleedMm] = useState(2);
  const [paperTypeId, setPaperTypeId] = useState<number>(0);
  const [printSides, setPrintSides] = useState<'1_side' | '2_side'>('2_side');
  const [colorsFront, setColorsFront] = useState(4);
  const [colorsBack, setColorsBack] = useState(4);
  const [offsetWorkType, setOffsetWorkType] = useState<OffsetWorkType>('self_turn');
  const [selectedFinishing, setSelectedFinishing] = useState<{ serviceId: number; sides?: number }[]>([
    { serviceId: 1, sides: 2 }, // Cán màng mờ 2 mặt mặc định
  ]);
  const [profitMarginPercent, setProfitMarginPercent] = useState(25);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatPercent, setVatPercent] = useState(8);

  // Customer Info for Order / Quote
  const [customerName, setCustomerName] = useState('Công ty Khách Hàng');
  const [customerPhone, setCustomerPhone] = useState('0912345678');

  // Calculation Result
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [currentQuoteCode, setCurrentQuoteCode] = useState(`BG-${Date.now().toString().slice(-6)}`);

  // Tải dữ liệu ban đầu
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
          // Mặc định chọn Couche 150gsm
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
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  // Tính toán chi phí mỗi khi tham số thay đổi
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

  // Áp dụng Preset mẫu ấn phẩm phổ biến
  const applyPreset = (type: string) => {
    switch (type) {
      case 'a4_flyer':
        setJobName('Tờ Rơi A4 Quảng Cáo');
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
        setJobName('Tờ Rơi A5 Sự Kiện');
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
        setJobName('Danh Thiếp / Namecard 2 Mặt');
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

      case 'cosmetic_box':
        setJobName('Hộp Mỹ Phẩm Cao Cấp');
        setProductType('hop_giay');
        setWidthMm(240);
        setHeightMm(320); // Khổ trải mở phẳng hộp
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

      case 'paper_bag':
        setJobName('Túi Giấy Kraft Shop');
        setProductType('tui_giay');
        setWidthMm(420);
        setHeightMm(310);
        setQuantity(1000);
        setPrintSides('1_side');
        const kraft = papers.find((p) => p.code.includes('K250') || p.code.includes('K170'));
        if (kraft) setPaperTypeId(kraft.id);
        const bagDie = finishingServices.find((f) => f.calcType === 'die_cut');
        const bagGlue = finishingServices.find((f) => f.code.includes('DAN_DAY_TUI'));
        const bagFinishing = [];
        if (bagDie) bagFinishing.push({ serviceId: bagDie.id });
        if (bagGlue) bagFinishing.push({ serviceId: bagGlue.id });
        setSelectedFinishing(bagFinishing);
        break;

      case 'sticker':
        setJobName('Decal Tem Nhãn Tròn Dán Ly');
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

      case 'brochure':
        setJobName('Brochure Gấp 3 Giới Thiệu');
        setProductType('to_roi');
        setWidthMm(297);
        setHeightMm(210);
        setQuantity(1500);
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
    }
  };

  // Toggle dịch vụ gia công
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

  const updateFinishingSides = (serviceId: number, sides: number) => {
    setSelectedFinishing((prev) =>
      prev.map((f) => (f.serviceId === serviceId ? { ...f, sides } : f))
    );
  };

  // Lưu đơn hàng vào CSDL
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
        notes: `Tận dụng giấy: ${result.imposition.sheetEfficiencyPercent}%. Số tờ bù hao: ${result.quantities.printWasteSheets + result.quantities.finishingWasteSheets}`,
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Navbar điều hướng */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} orderCount={orderCount} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* PHÂN HỆ 1: MÁY TÍNH GIÁ THÔNG MINH */}
        {activeTab === 'calculator' && (
          <div className="space-y-5">
            {/* Thanh Presets Mẫu Ấn Phẩm */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Mẫu Nhanh:
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => applyPreset('a4_flyer')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 font-medium text-slate-700 transition-colors whitespace-nowrap"
                >
                  📄 Tờ Rơi A4
                </button>
                <button
                  onClick={() => applyPreset('a5_flyer')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 font-medium text-slate-700 transition-colors whitespace-nowrap"
                >
                  📄 Tờ Rơi A5
                </button>
                <button
                  onClick={() => applyPreset('namecard')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 font-medium text-slate-700 transition-colors whitespace-nowrap"
                >
                  💳 Namecard
                </button>
                <button
                  onClick={() => applyPreset('brochure')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 font-medium text-slate-700 transition-colors whitespace-nowrap"
                >
                  📖 Brochure Gấp 3
                </button>
                <button
                  onClick={() => applyPreset('cosmetic_box')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 font-medium text-slate-700 transition-colors whitespace-nowrap"
                >
                  📦 Hộp Mỹ Phẩm
                </button>
                <button
                  onClick={() => applyPreset('paper_bag')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 font-medium text-slate-700 transition-colors whitespace-nowrap"
                >
                  🛍️ Túi Giấy Kraft
                </button>
                <button
                  onClick={() => applyPreset('sticker')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 font-medium text-slate-700 transition-colors whitespace-nowrap"
                >
                  🏷️ Decal Tem Nhãn
                </button>
              </div>
            </div>

            {/* Khung Tính Giá 3 Cột: Form Nhập -> Kết Quả Trực Quan 2D & Chart -> Tóm Tắt Giá Bán */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* CỘT 1: FORM THÔNG SỐ SẢN PHẨM & CẤU HÌNH (4 CỘT) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm md:text-base">Thông Số Ấn Phẩm</h2>
                      <p className="text-[11px] text-slate-500">Nhập quy cách sản phẩm để tính toán tức thì</p>
                    </div>
                  </div>

                  <button
                    onClick={triggerCalculation}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    title="Tính lại"
                  >
                    <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                </div>

                {/* Tên bài in & Phân loại */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tên Ấn Phẩm / Bài In</label>
                    <input
                      type="text"
                      value={jobName}
                      onChange={(e) => setJobName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Phân Loại Ấn Phẩm</label>
                      <select
                        value={productType}
                        onChange={(e) => setProductType(e.target.value as ProductType)}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                      >
                        <option value="to_roi">Tờ Rơi / Flyer</option>
                        <option value="namecard">Danh Thiếp / Card</option>
                        <option value="hop_giay">Hộp Giấy Bao Bì</option>
                        <option value="tui_giay">Túi Giấy Xách</option>
                        <option value="decal">Decal / Tem Nhãn</option>
                        <option value="catalogue">Catalogue / Sách</option>
                        <option value="khac">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Công Nghệ In Đề Xuất</label>
                      <select
                        value={printTech}
                        onChange={(e) => setPrintTech(e.target.value as PrintTech)}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white font-semibold text-blue-700"
                      >
                        <option value="auto">✨ Tự Động So Sánh & Chọn Rẻ Nhất</option>
                        <option value="offset">In Offset Công Nghiệp</option>
                        <option value="digital">In Nhanh Kỹ Thuật Số (Click)</option>
                      </select>
                    </div>
                  </div>

                  {/* Kích thước & Số lượng */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Rộng (mm)</label>
                        <input
                          type="number"
                          value={widthMm}
                          onChange={(e) => setWidthMm(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Dài (mm)</label>
                        <input
                          type="number"
                          value={heightMm}
                          onChange={(e) => setHeightMm(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Tràn Lề (mm)</label>
                        <input
                          type="number"
                          value={bleedMm}
                          onChange={(e) => setBleedMm(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg p-2 text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                        <span>Số Lượng Thành Phẩm:</span>
                        <strong className="text-blue-700 text-sm">{quantity.toLocaleString('vi-VN')} chiếc</strong>
                      </label>
                      <input
                        type="number"
                        step="50"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg p-2 font-black text-slate-900 text-base"
                      />
                    </div>
                  </div>

                  {/* Loại giấy in */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Chất Liệu Giấy In</label>
                    <select
                      value={paperTypeId}
                      onChange={(e) => setPaperTypeId(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium text-slate-900"
                    >
                      {papers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.parentWidthCm}x{p.parentHeightCm}cm) - {p.pricePerRam > 0 ? `${p.pricePerRam.toLocaleString('vi-VN')}đ/ram` : `${p.pricePerKg.toLocaleString('vi-VN')}đ/kg`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mặt in & Kiểu trở kẽm Offset */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Số Mặt In</label>
                      <select
                        value={printSides}
                        onChange={(e) => setPrintSides(e.target.value as '1_side' | '2_side')}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white font-medium"
                      >
                        <option value="1_side">In 1 Mặt</option>
                        <option value="2_side">In 2 Mặt</option>
                      </select>
                    </div>

                    {printSides === '2_side' ? (
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Kiểu Trở Kẽm (Offset)</label>
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
                    ) : (
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Số Màu CMYK</label>
                        <select
                          value={colorsFront}
                          onChange={(e) => setColorsFront(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                        >
                          <option value={4}>4 Màu Chuẩn (CMYK)</option>
                          <option value={1}>1 Màu (Đen/Pha)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Danh mục gia công sau in */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="block text-slate-800 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-blue-600" /> Gia Công Sau In:
                      </span>
                      <span className="text-[11px] font-normal text-slate-500">
                        ({selectedFinishing.length} khâu đã chọn)
                      </span>
                    </label>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                      {finishingServices.map((service) => {
                        const selected = selectedFinishing.find((f) => f.serviceId === service.id);
                        return (
                          <div
                            key={service.id}
                            onClick={() => toggleFinishing(service.id)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                              selected
                                ? 'bg-blue-50/80 border-blue-400 text-blue-900 font-semibold'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                                }`}
                              >
                                {selected && <Check className="w-3 h-3" />}
                              </div>
                              <span>{service.name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-[11px]">
                                {service.unitPrice.toLocaleString('vi-VN')}đ
                              </span>

                              {/* Tùy chọn 1 mặt / 2 mặt nếu là cán màng */}
                              {selected && service.category === 'can_mang' && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 bg-white border border-blue-200 rounded px-1.5 py-0.5"
                                >
                                  <button
                                    type="button"
                                    onClick={() => updateFinishingSides(service.id, 1)}
                                    className={`px-1 rounded text-[10px] ${selected.sides === 1 ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}
                                  >
                                    1 mặt
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateFinishingSides(service.id, 2)}
                                    className={`px-1 rounded text-[10px] ${selected.sides === 2 ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}
                                  >
                                    2 mặt
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lợi nhuận & Chiết khấu & Thuế */}
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Lợi Nhuận (%)</label>
                      <input
                        type="number"
                        value={profitMarginPercent}
                        onChange={(e) => setProfitMarginPercent(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg p-1.5 text-center font-bold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Giảm Giá (đ)</label>
                      <input
                        type="number"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg p-1.5 text-center text-rose-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">VAT (%)</label>
                      <input
                        type="number"
                        value={vatPercent}
                        onChange={(e) => setVatPercent(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg p-1.5 text-center"
                      />
                    </div>
                  </div>

                  {/* Thông tin khách hàng nhanh */}
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Tên Khách Hàng</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Anh/Chị..."
                        className="w-full border border-slate-300 rounded-lg p-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Số Điện Thoại</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="090..."
                        className="w-full border border-slate-300 rounded-lg p-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CỘT 2: TRỰC QUAN HÓA 2D & SO SÁNH HÒA VỐN (4 CỘT) */}
              <div className="lg:col-span-4 space-y-4">
                {result && (
                  <>
                    {/* Bản vẽ 2D Mô phỏng cắt khổ giấy */}
                    <ImpositionVisualizer
                      imposition={result.imposition}
                      productName={jobName}
                      productWidthMm={widthMm}
                      productHeightMm={heightMm}
                    />

                    {/* Biểu đồ so sánh In Nhanh vs Offset */}
                    <BreakEvenChart
                      currentQty={quantity}
                      chosenTech={result.chosenTech}
                      comparisonTable={result.recommendation?.comparisonTable}
                      breakEvenQty={result.recommendation?.breakEvenQty}
                      reason={result.recommendation?.reason}
                    />
                  </>
                )}
              </div>

              {/* CỘT 3: TỔNG HỢP CHI PHÍ & GIÁ BÁN & IN BÁO GIÁ (3 CỘT) */}
              <div className="lg:col-span-3">
                {result && selectedPaper && (
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
                )}
              </div>
            </div>
          </div>
        )}

        {/* PHÂN HỆ 2: QUẢN LÝ ĐƠN HÀNG */}
        {activeTab === 'orders' && <OrdersManager />}

        {/* PHÂN HỆ 3: QUẢN LÝ GIÁ GIẤY */}
        {activeTab === 'papers' && <PaperManager />}

        {/* PHÂN HỆ 4: QUẢN LÝ MÁY IN OFFSET & KTS */}
        {activeTab === 'machines' && <MachineManager />}

        {/* PHÂN HỆ 5: QUẢN LÝ DỊCH VỤ GIA CÔNG */}
        {activeTab === 'finishing' && <FinishingManager />}

        {/* PHÂN HỆ 6: QUẢN LÝ KHÁCH HÀNG */}
        {activeTab === 'customers' && <CustomerManager />}

        {/* PHÂN HỆ 7: CÀI ĐẶT HỆ THỐNG */}
        {activeTab === 'settings' && <SettingsManager />}
      </main>

      {/* Modal In Báo Giá Chuẩn A4 & Lệnh Sản Xuất */}
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
    </div>
  );
}
