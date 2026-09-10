new_content = """import {
  CalculationInput,
  CalculationResult,
  ComparisonItem,
  DigitalMachine,
  DigitalMode,
  DigitalPrintGiaCong,
  DigitalPrintKemGiay,
  FinishingCostDetail,
  FinishingService,
  OffsetMachine,
  PaperType,
} from '@/types';
import { calculateImposition } from './imposition';

export const DEFAULT_DIGITAL_GIA_CONG: DigitalPrintGiaCong[] = [
  { id: 1, machineName: 'KONICA C12000 / C12010S 5 MÀU', sheetSize: 'A4', widthMm: 210, heightMm: 297, paperLt249: 600, paper250To349: 800, paper350To450: 1000, decalPaperPlastic: 1200, decalClear: 1500, syntheticPaper: 1000, pvcPlastic: 1500 },
  { id: 2, machineName: 'KONICA C12000 / C12010S 5 MÀU', sheetSize: '330x355', widthMm: 330, heightMm: 355, paperLt249: 800, paper250To349: 1000, paper350To450: 1800, decalPaperPlastic: 1500, decalClear: 1700, syntheticPaper: 1800, pvcPlastic: 2000 },
  { id: 3, machineName: 'KONICA C12000 / C12010S 5 MÀU', sheetSize: 'A3', widthMm: 297, heightMm: 420, paperLt249: 1200, paper250To349: 1600, paper350To450: 2100, decalPaperPlastic: 2100, decalClear: 2300, syntheticPaper: 2100, pvcPlastic: 2500 },
  { id: 4, machineName: 'KONICA C12000 / C12010S 5 MÀU', sheetSize: '330x483', widthMm: 330, heightMm: 483, paperLt249: 2000, paper250To349: 2500, paper350To450: 2700, decalPaperPlastic: 2500, decalClear: 2800, syntheticPaper: 2700, pvcPlastic: 3000 },
  { id: 5, machineName: 'KONICA C12000 / C12010S 5 MÀU', sheetSize: '330x1200', widthMm: 330, heightMm: 1200, paperLt249: 4000, paper250To349: 7000, paper350To450: 10000, decalPaperPlastic: 6000, decalClear: 7500, syntheticPaper: 15000, pvcPlastic: 0 },
];

export const DEFAULT_DIGITAL_KEM_GIAY: DigitalPrintKemGiay[] = [
  { id: 1, paperCode: 'C100', paperName: 'Couche 100gsm', gsm: 100, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 1600, price2Side: 2800 },
  { id: 2, paperCode: 'C120', paperName: 'Couche 120gsm', gsm: 120, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 1700, price2Side: 2900 },
  { id: 3, paperCode: 'C150', paperName: 'Couche 150gsm', gsm: 150, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 1800, price2Side: 3000 },
  { id: 4, paperCode: 'C200', paperName: 'Couche 200gsm', gsm: 200, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 1900, price2Side: 3100 },
  { id: 5, paperCode: 'C250', paperName: 'Couche 250gsm', gsm: 250, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 2100, price2Side: 3300 },
  { id: 6, paperCode: 'C300', paperName: 'Couche 300gsm', gsm: 300, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 2700, price2Side: 4300 },
  { id: 7, paperCode: 'I250', paperName: 'Ivory 250gsm', gsm: 250, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 2100, price2Side: 3300 },
  { id: 8, paperCode: 'I300', paperName: 'Ivory 300gsm', gsm: 300, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 2600, price2Side: 4200 },
  { id: 9, paperCode: 'I350', paperName: 'Ivory 350gsm', gsm: 350, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 3300, price2Side: 5300 },
  { id: 10, paperCode: 'F100', paperName: 'Fort 100gsm', gsm: 100, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 1600, price2Side: 2800 },
  { id: 11, paperCode: 'F120', paperName: 'Fort 120gsm', gsm: 120, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 1700, price2Side: 2900 },
  { id: 12, paperCode: 'F180', paperName: 'Fort 180gsm', gsm: 180, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 1900, price2Side: 3100 },
  { id: 13, paperCode: 'F230', paperName: 'Fort 230gsm', gsm: 230, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 2100, price2Side: 3300 },
  { id: 14, paperCode: 'F250', paperName: 'Fort 250gsm', gsm: 250, sheetSize: '325x430', widthMm: 325, heightMm: 430, price1Side: 2300, price2Side: 3500 },
  { id: 15, paperCode: 'F180_355', paperName: 'Fort 180gsm (325x355)', gsm: 180, sheetSize: '325x355', widthMm: 325, heightMm: 355, price1Side: 1400, price2Side: 2200 },
  { id: 16, paperCode: 'F230_355', paperName: 'Fort 230gsm (325x355)', gsm: 230, sheetSize: '325x355', widthMm: 325, heightMm: 355, price1Side: 1500, price2Side: 2300 },
];

interface CostCalculatorOptions {
  input: CalculationInput;
  paperType: PaperType;
  offsetMachine?: OffsetMachine;
  allOffsetMachines?: OffsetMachine[];
  digitalMachine?: DigitalMachine;
  digitalPricingGiaCong?: DigitalPrintGiaCong[];
  digitalPricingKemGiay?: DigitalPrintKemGiay[];
  allFinishingServices: FinishingService[];
}

export function matchOffsetMachine(
  printSheet: { widthMm: number; heightMm: number },
  allMachines?: OffsetMachine[],
  selectedMachineId?: number
): OffsetMachine {
  if (selectedMachineId && allMachines) {
    const found = allMachines.find((m) => m.id === selectedMachineId);
    if (found) return found;
  }

  const dimMin = Math.min(printSheet.widthMm, printSheet.heightMm);
  const dimMax = Math.max(printSheet.widthMm, printSheet.heightMm);

  if (allMachines && allMachines.length > 0) {
    // Khổ nhỏ dưới 65x43cm (nếu vừa trong 650 x 430 mm)
    if (dimMin <= 435 && dimMax <= 655) {
      const small = allMachines.find(
        (m) =>
          m.name.toLowerCase().includes('nhỏ') ||
          (m.maxWidthMm <= 655 && m.maxHeightMm <= 435) ||
          (m.maxWidthMm <= 435 && m.maxHeightMm <= 655)
      );
      if (small) return small;
    }
    // Khổ 65x86cm bắt nhíp chiều 86
    const large = allMachines.find(
      (m) => m.name.includes('65x86') || m.maxWidthMm >= 800 || m.maxHeightMm >= 800
    );
    if (large) return large;
  }

  // Fallback mặc định chuẩn theo yêu cầu xưởng in
  if (dimMin <= 435 && dimMax <= 655) {
    return {
      id: 1,
      name: 'Máy Offset Khổ Nhỏ (dưới 65x43cm)',
      maxWidthMm: 650,
      maxHeightMm: 430,
      minWidthMm: 210,
      minHeightMm: 297,
      platePrice: 75000,
      setupCost: 900000,
      stepCost: 150000,
      defaultWasteSheets: 80,
      gripperMarginMm: 10,
      baseImpressions: 3000,
      includesPlate: true,
    };
  } else {
    return {
      id: 2,
      name: 'Máy Offset Khổ 65x86cm (Bắt nhíp chiều 86)',
      maxWidthMm: 860,
      maxHeightMm: 650,
      minWidthMm: 430,
      minHeightMm: 650,
      platePrice: 100000,
      setupCost: 1200000,
      stepCost: 200000,
      defaultWasteSheets: 100,
      gripperMarginMm: 10,
      baseImpressions: 3000,
      includesPlate: true,
    };
  }
}

export function calculatePrintCost({
  input,
  paperType,
  offsetMachine,
  allOffsetMachines,
  digitalMachine,
  digitalPricingGiaCong = DEFAULT_DIGITAL_GIA_CONG,
  digitalPricingKemGiay = DEFAULT_DIGITAL_KEM_GIAY,
  allFinishingServices,
}: CostCalculatorOptions): CalculationResult {
  const digitalMode: DigitalMode = input.digitalMode || 'with_paper';

  // 1. Xác định công nghệ in mục tiêu
  let chosenTech: 'offset' | 'digital' = 'offset';
  if (input.printTech === 'digital') {
    chosenTech = 'digital';
  } else if (input.printTech === 'offset') {
    chosenTech = 'offset';
  } else {
    // Tự động: số lượng < 300 con thường in nhanh rẻ hơn, >= 300 in offset rẻ hơn
    chosenTech = input.quantity < 300 ? 'digital' : 'offset';
  }

  // 2. Tính bình trang & số con
  const preferredSheet = chosenTech === 'offset' && offsetMachine
    ? { widthMm: offsetMachine.maxWidthMm, heightMm: offsetMachine.maxHeightMm, name: offsetMachine.name }
    : undefined;

  const imposition = calculateImposition({
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    bleedMm: input.bleedMm ?? 2,
    paperType,
    printTech: chosenTech,
    digitalMode,
    preferredMachineSheet: preferredSheet,
    gripperMarginMm: offsetMachine?.gripperMarginMm ?? 10,
  });

  const ups = Math.max(1, imposition.upsPerPrintSheet);
  const netPrintSheets = Math.ceil(input.quantity / ups);

  // 3. Tính bù hao gia công
  let finishingWasteSheets = 0;
  let totalFinishingWastePercent = 0;
  const activeFinishingDetails: FinishingCostDetail[] = [];

  for (const sel of (input.selectedFinishing || [])) {
    const service = allFinishingServices.find((s) => s.id === sel.serviceId);
    if (!service) continue;

    totalFinishingWastePercent += service.wastePercent;
    finishingWasteSheets += service.wasteSheets;

    // Tính chi phí từng mục gia công
    let subtotal = 0;
    let formula = '';

    if (service.calcType === 'per_m2') {
      const areaM2 = ((input.widthMm + (input.bleedMm || 2) * 2) / 1000) *
                     ((input.heightMm + (input.bleedMm || 2) * 2) / 1000) *
                     input.quantity * (sel.sides || 1);
      const rawCost = areaM2 * service.unitPrice;
      subtotal = Math.max(service.minPrice, Math.round(rawCost)) + service.setupFee;
      formula = `${areaM2.toFixed(2)} m² × ${service.unitPrice.toLocaleString('vi-VN')}đ (tối thiểu ${service.minPrice.toLocaleString('vi-VN')}đ)`;
    } else if (service.calcType === 'die_cut') {
      const runCost = input.quantity * service.unitPrice;
      subtotal = Math.max(service.minPrice, runCost) + service.setupFee;
      formula = `Khuôn bế ${service.setupFee.toLocaleString('vi-VN')}đ + Công bế (${input.quantity} con × ${service.unitPrice}đ)`;
    } else if (service.calcType === 'per_product') {
      const rawCost = input.quantity * service.unitPrice;
      subtotal = Math.max(service.minPrice, rawCost) + service.setupFee;
      formula = `${input.quantity} con × ${service.unitPrice.toLocaleString('vi-VN')}đ`;
    } else if (service.calcType === 'per_sheet') {
      const rawCost = netPrintSheets * service.unitPrice;
      subtotal = Math.max(service.minPrice, rawCost) + service.setupFee;
      formula = `${netPrintSheets} tờ in × ${service.unitPrice.toLocaleString('vi-VN')}đ`;
    } else {
      // Fixed
      subtotal = service.unitPrice + service.setupFee;
      formula = `Trọn gói ${service.unitPrice.toLocaleString('vi-VN')}đ`;
    }

    activeFinishingDetails.push({
      serviceId: service.id,
      name: service.name,
      category: service.category,
      calcType: service.calcType,
      quantity: input.quantity,
      unitPrice: service.unitPrice,
      setupFee: service.setupFee,
      subtotal,
      wasteSheets: service.wasteSheets,
      formula,
    });
  }

  // Bù hao gia công theo %
  finishingWasteSheets += Math.ceil((netPrintSheets * totalFinishingWastePercent) / 100);

  // 4. Bù hao in ấn & Tổng số tờ in
  let printWasteSheets = 0;
  if (chosenTech === 'offset') {
    printWasteSheets = offsetMachine?.defaultWasteSheets ?? 100;
  } else {
    printWasteSheets = digitalMachine?.defaultWasteSheets ?? 4;
  }

  const totalPrintSheets = netPrintSheets + printWasteSheets + finishingWasteSheets;
  const cuts = Math.max(1, imposition.cutsPerParentSheet);
  const parentSheetsNeeded = Math.ceil(totalPrintSheets / cuts);
  const ramsNeeded = Math.round((parentSheetsNeeded / 500) * 100) / 100;

  // Tính kg giấy = Số tờ lớn * Dài (m) * Rộng (m) * (gsm / 1000)
  const parentAreaM2 = (paperType.parentWidthCm / 100) * (paperType.parentHeightCm / 100);
  const kgNeeded = Math.round(((parentSheetsNeeded * parentAreaM2 * paperType.gsm) / 1000) * 10) / 10;

  // 5. Tiền giấy: Bỏ giá /kg, chỉ áp dụng giá trên 500 tờ (trên ram) và giá dưới 500 tờ (dưới ram)
  const priceAbove500 = paperType.priceAbove500 || paperType.pricePerRam;
  const priceBelow500 = paperType.priceBelow500 || priceAbove500;

  // Nếu số tờ mẹ >= 500 (trên 1 ram) áp dụng giá sỉ nguyên ram, nếu < 500 tờ áp dụng giá lẻ dưới ram
  const isWholesale = parentSheetsNeeded >= 500;
  const effectiveRamPrice = isWholesale ? priceAbove500 : priceBelow500;
  let paperCost = Math.round(parentSheetsNeeded * (effectiveRamPrice / 500));

  // 6. Tiền in ấn
  let plateCost = 0;
  let platesCount = 0;
  let printRunCost = 0;
  let shortRunFee = 0;
  let digitalDetails: CalculationResult['costs']['digitalDetails'] | undefined;

  if (chosenTech === 'offset') {
    const machine = offsetMachine || matchOffsetMachine(imposition.printSheet, allOffsetMachines, input.offsetMachineId);

    const is2Sides = input.printSides === '2_side';
    const workType = input.offsetWorkType || 'self_turn';
    const baseImpressions = machine.baseImpressions || 3000;
    const includesPlate = machine.includesPlate ?? true;

    if (!is2Sides) {
      // In 1 mặt: 1 ca máy, 1 bộ kẽm (chuẩn 4 màu)
      const colors = input.colorsFront || 4;
      platesCount = colors;

      if (includesPlate) {
        // Gói mở máy đã bao gồm kẽm 4 màu, chỉ tính thêm tiền kẽm nếu khách in màu thứ 5+
        const extraColors = Math.max(0, colors - 4);
        plateCost = extraColors * machine.platePrice;
      } else {
        plateCost = platesCount * machine.platePrice;
      }

      const impressions = totalPrintSheets;
      if (impressions <= baseImpressions) {
        printRunCost = machine.setupCost;
      } else {
        const extraThousands = Math.ceil((impressions - baseImpressions) / 1000);
        printRunCost = machine.setupCost + extraThousands * machine.stepCost;
      }
    } else {
      // In 2 mặt
      if (workType === 'sheetwise') {
        // In 2 bài riêng: 2 ca in độc lập, 2 bộ kẽm
        const colors = (input.colorsFront || 4) + (input.colorsBack || 4);
        platesCount = colors;

        if (includesPlate) {
          // Gói mở máy đã bao gồm 1 bộ kẽm 4 màu cơ bản, bài thứ 2 hoặc màu thứ 5+ tính riêng kẽm
          const extraColors = Math.max(0, colors - 4);
          plateCost = extraColors * machine.platePrice;
        } else {
          plateCost = platesCount * machine.platePrice;
        }

        // 2 ca in độc lập
        const impressionsPerSide = totalPrintSheets;
        const costSide1 = impressionsPerSide <= baseImpressions
          ? machine.setupCost
          : machine.setupCost + Math.ceil((impressionsPerSide - baseImpressions) / 1000) * machine.stepCost;
        const costSide2 = impressionsPerSide <= baseImpressions
          ? machine.setupCost
          : machine.setupCost + Math.ceil((impressionsPerSide - baseImpressions) / 1000) * machine.stepCost;
        printRunCost = costSide1 + costSide2;
      } else {
        // Tự trở (Work & Turn) hoặc Trở nhíp (Tumble): Dùng chung 1 bộ kẽm ghép cả 2 mặt (1 ca máy)
        const colors = Math.max(input.colorsFront || 4, input.colorsBack || 4);
        platesCount = colors;

        if (includesPlate) {
          const extraColors = Math.max(0, colors - 4);
          plateCost = extraColors * machine.platePrice;
        } else {
          plateCost = platesCount * machine.platePrice;
        }

        // Chạy 2 lượt in (lượt ép x 2)
        const totalImpressions = totalPrintSheets * 2;
        if (totalImpressions <= baseImpressions) {
          printRunCost = machine.setupCost;
        } else {
          const extraThousands = Math.ceil((totalImpressions - baseImpressions) / 1000);
          printRunCost = machine.setupCost + extraThousands * machine.stepCost;
        }
      }
    }
  } else {
    // In nhanh kỹ thuật số (Digital)
    const is2Sides = input.printSides === '2_side';
    let ratePerSheet = 0;
    let machineName = '';
    let sheetSizeName = imposition.printSheet.name;
    let whiteInkCost = 0;

    // Phụ phí số lượng ít:
    // < 50 tờ: +30.000đ
    // < 100 tờ: +20.000đ
    // >= 100 tờ: 0đ
    if (totalPrintSheets < 50) {
      shortRunFee = 30000;
    } else if (totalPrintSheets < 100) {
      shortRunFee = 20000;
    } else {
      shortRunFee = 0;
    }

    if (digitalMode === 'with_paper') {
      // 1. In nhanh kèm giấy (INTC) - Đã gồm tiền giấy trọn gói
      machineName = 'In Nhanh Kèm Giấy (INTC)';
      const kemGiayList = digitalPricingKemGiay && digitalPricingKemGiay.length > 0
        ? digitalPricingKemGiay
        : DEFAULT_DIGITAL_KEM_GIAY;

      // Tìm dòng giá phù hợp theo mã giấy
      let matchedPricing = kemGiayList.find((kg) =>
        paperType.code.toUpperCase().includes(kg.paperCode.toUpperCase())
      );

      // Nếu không khớp chính xác mã, so khớp theo tiền tố chất liệu (C, I, F) + GSM gần nhất
      if (!matchedPricing) {
        const pName = paperType.name.toLowerCase();
        let prefix = 'C';
        if (pName.includes('ivory') || paperType.code.toUpperCase().startsWith('I')) prefix = 'I';
        else if (pName.includes('fort') || pName.includes('ford') || paperType.code.toUpperCase().startsWith('F')) prefix = 'F';

        const sameType = kemGiayList.filter((kg) => kg.paperCode.startsWith(prefix));
        if (sameType.length > 0) {
          matchedPricing = sameType.reduce((prev, curr) =>
            Math.abs(curr.gsm - paperType.gsm) < Math.abs(prev.gsm - paperType.gsm) ? curr : prev
          );
        } else {
          matchedPricing = kemGiayList[0];
        }
      }

      if (matchedPricing) {
        ratePerSheet = is2Sides ? matchedPricing.price2Side : matchedPricing.price1Side;
        sheetSizeName = `${matchedPricing.sheetSize} mm (${matchedPricing.paperName})`;
      } else {
        ratePerSheet = is2Sides ? 3000 : 1800;
      }

      printRunCost = Math.round(totalPrintSheets * ratePerSheet) + shortRunFee;

      // Đã kèm giấy nên tiền giấy = 0
      paperCost = 0;
      plateCost = 0;
      platesCount = 0;

      digitalDetails = {
        mode: 'with_paper',
        machineName,
        sheetSizeName,
        ratePerSheet,
        shortRunFee,
        note: `Bảng giá In Nhanh Kèm Giấy INTC (Đã gồm công in + giấy ${matchedPricing?.paperName || ''}). Phí SL ít: +${shortRunFee.toLocaleString('vi-VN')}đ`,
      };
    } else {
      // 2. In nhanh gia công (Konica C12000 / C12010S 5 màu - Trang 2 PDF)
      machineName = 'Konica C12000 / C12010S 5 Màu';
      const giaCongList = digitalPricingGiaCong && digitalPricingGiaCong.length > 0
        ? digitalPricingGiaCong
        : DEFAULT_DIGITAL_GIA_CONG;

      // Nhận diện khổ in máy
      const pW = imposition.printSheet.widthMm;
      const pH = imposition.printSheet.heightMm;
      const maxDim = Math.max(pW, pH);
      const minDim = Math.min(pW, pH);

      let sheetRow: DigitalPrintGiaCong | undefined;
      if (maxDim > 500) {
        sheetRow = giaCongList.find((g) => g.sheetSize === '330x1200');
      } else if (maxDim > 430 || minDim > 300) {
        sheetRow = giaCongList.find((g) => g.sheetSize === '330x483');
      } else if (maxDim > 360 || minDim > 250) {
        sheetRow = giaCongList.find((g) => g.sheetSize === 'A3');
      } else if (maxDim > 300) {
        sheetRow = giaCongList.find((g) => g.sheetSize === '330x355');
      } else {
        sheetRow = giaCongList.find((g) => g.sheetSize === 'A4');
      }

      if (!sheetRow) {
        sheetRow = giaCongList.find((g) => g.sheetSize === '330x483') || giaCongList[0];
      }

      // Nhận diện nhóm chất liệu
      const pName = paperType.name.toLowerCase();
      let click1Side = 0;

      if (sheetRow) {
        if (pName.includes('pvc')) {
          click1Side = sheetRow.pvcPlastic || sheetRow.paper350To450;
        } else if (pName.includes('nhựa') || pName.includes('synthetic')) {
          click1Side = sheetRow.syntheticPaper;
        } else if (pName.includes('trong') && pName.includes('decal')) {
          click1Side = sheetRow.decalClear;
        } else if (pName.includes('decal')) {
          click1Side = sheetRow.decalPaperPlastic;
        } else {
          // Giấy thường theo định lượng GSM
          if (paperType.gsm < 250) {
            click1Side = sheetRow.paperLt249;
          } else if (paperType.gsm <= 349) {
            click1Side = sheetRow.paper250To349;
          } else {
            click1Side = sheetRow.paper350To450;
          }
        }
        sheetSizeName = `${sheetRow.sheetSize} (${sheetRow.widthMm}x${sheetRow.heightMm}mm)`;
      } else {
        click1Side = is2Sides ? 2000 : 1000;
      }

      // Giá in 2 mặt = x2 giá 1 mặt
      ratePerSheet = is2Sides ? (click1Side * 2) : click1Side;

      // In mực trắng nếu có tùy chọn
      if (input.whiteInk) {
        whiteInkCost = totalPrintSheets * (is2Sides ? 4000 : 2000);
      }

      printRunCost = Math.round(totalPrintSheets * ratePerSheet) + whiteInkCost + shortRunFee;

      // Nếu khách tự cấp giấy -> tiền giấy = 0
      if (input.customerSuppliedPaper) {
        paperCost = 0;
      }

      plateCost = 0;
      platesCount = 0;

      digitalDetails = {
        mode: 'without_paper',
        machineName,
        sheetSizeName,
        ratePerSheet,
        shortRunFee,
        whiteInkCost,
        note: `In Gia Công Konica C12000 (Khổ ${sheetSizeName}, Đơn giá ${ratePerSheet.toLocaleString('vi-VN')}đ/tờ). Phí SL ít: +${shortRunFee.toLocaleString('vi-VN')}đ${input.customerSuppliedPaper ? ' • Khách cấp giấy' : ''}`,
      };
    }
  }

  const totalPrintCost = plateCost + printRunCost;
  const totalFinishingCost = activeFinishingDetails.reduce((sum, item) => sum + item.subtotal, 0);

  // 7. Tổng chi phí cơ sở & Giá bán
  const totalBaseCost = paperCost + totalPrintCost + totalFinishingCost;
  const profitMarginPercent = input.profitMarginPercent ?? 25;
  const profitAmount = Math.round((totalBaseCost * profitMarginPercent) / 100);
  const discountAmount = input.discountAmount ?? 0;
  const preTaxTotal = Math.max(0, totalBaseCost + profitAmount - discountAmount);
  const vatPercent = input.vatPercent ?? 0;
  const vatAmount = Math.round((preTaxTotal * vatPercent) / 100);
  const finalPrice = preTaxTotal + vatAmount;
  const unitPrice = input.quantity > 0 ? Math.round(finalPrice / input.quantity) : 0;

  // 8. Thuật toán So sánh In Nhanh vs In Offset & Tìm điểm hòa vốn
  const comparisonTable: ComparisonItem[] = [];
  const testQuantities = [50, 100, 200, 300, 500, 1000, 2000, 5000];

  for (const qty of testQuantities) {
    // Tính thử chi phí digital
    const digResult = runQuickEstimate({
      ...input,
      quantity: qty,
      printTech: 'digital',
    }, paperType, offsetMachine, digitalMachine, allFinishingServices, digitalPricingGiaCong, digitalPricingKemGiay);

    // Tính thử chi phí offset
    const offResult = runQuickEstimate({
      ...input,
      quantity: qty,
      printTech: 'offset',
    }, paperType, offsetMachine, digitalMachine, allFinishingServices, digitalPricingGiaCong, digitalPricingKemGiay);

    comparisonTable.push({
      quantity: qty,
      digitalTotal: digResult.finalPrice,
      digitalUnit: digResult.unitPrice,
      offsetTotal: offResult.finalPrice,
      offsetUnit: offResult.unitPrice,
      recommended: digResult.finalPrice <= offResult.finalPrice ? 'digital' : 'offset',
    });
  }

  // Điểm hòa vốn (Break-even): Tìm mốc số lượng mà offset bắt đầu rẻ hơn digital
  let breakEvenQty = 300;
  for (let i = 0; i < comparisonTable.length - 1; i++) {
    if (comparisonTable[i].recommended === 'digital' && comparisonTable[i + 1].recommended === 'offset') {
      breakEvenQty = Math.round((comparisonTable[i].quantity + comparisonTable[i + 1].quantity) / 2);
      break;
    }
  }

  // Tính lại cho số lượng hiện tại nếu người dùng chọn 'auto'
  const curDigital = runQuickEstimate({ ...input, printTech: 'digital' }, paperType, offsetMachine, digitalMachine, allFinishingServices, digitalPricingGiaCong, digitalPricingKemGiay);
  const curOffset = runQuickEstimate({ ...input, printTech: 'offset' }, paperType, offsetMachine, digitalMachine, allFinishingServices, digitalPricingGiaCong, digitalPricingKemGiay);

  let recommendationText = '';
  const diff = Math.abs(curDigital.finalPrice - curOffset.finalPrice);

  if (curDigital.finalPrice < curOffset.finalPrice) {
    recommendationText = `Với số lượng ${input.quantity.toLocaleString('vi-VN')} sản phẩm, In Nhanh KTS tiết kiệm hơn In Offset ${diff.toLocaleString('vi-VN')}đ (${Math.round((diff / curOffset.finalPrice) * 100)}%), không tốn phí mở máy và kẽm CTP, lấy nhanh trong ngày.`;
  } else {
    recommendationText = `Với số lượng ${input.quantity.toLocaleString('vi-VN')} sản phẩm, In Offset tối ưu chi phí hơn In Nhanh ${diff.toLocaleString('vi-VN')}đ (${Math.round((diff / curDigital.finalPrice) * 100)}%), giá đơn vị giảm sâu theo số lượng lớn.`;
  }

  return {
    imposition,
    quantities: {
      productQty: input.quantity,
      netPrintSheets,
      printWasteSheets,
      finishingWasteSheets,
      totalPrintSheets,
      parentSheetsNeeded,
      ramsNeeded,
      kgNeeded,
    },
    costs: {
      paperCost,
      plateCost,
      platesCount,
      printRunCost,
      totalPrintCost,
      finishingCost: totalFinishingCost,
      finishingDetails: activeFinishingDetails,
      totalBaseCost,
      profitAmount,
      preTaxTotal,
      discountAmount,
      vatAmount,
      finalPrice,
      unitPrice,
      shortRunFee,
      digitalDetails,
    },
    chosenTech,
    recommendation: {
      bestTech: curDigital.finalPrice <= curOffset.finalPrice ? 'digital' : 'offset',
      reason: recommendationText,
      digitalTotal: curDigital.finalPrice,
      offsetTotal: curOffset.finalPrice,
      difference: diff,
      breakEvenQty,
      comparisonTable,
    },
  };
}

// Hàm tính nhanh phục vụ bảng so sánh (tránh đệ quy)
function runQuickEstimate(
  input: CalculationInput,
  paperType: PaperType,
  offsetMachine?: OffsetMachine,
  digitalMachine?: DigitalMachine,
  allFinishingServices: FinishingService[] = [],
  digitalPricingGiaCong: DigitalPrintGiaCong[] = DEFAULT_DIGITAL_GIA_CONG,
  digitalPricingKemGiay: DigitalPrintKemGiay[] = DEFAULT_DIGITAL_KEM_GIAY
): { finalPrice: number; unitPrice: number } {
  const isDigital = input.printTech === 'digital';
  const digitalMode: DigitalMode = input.digitalMode || 'with_paper';
  const preferredSheet = !isDigital && offsetMachine
    ? { widthMm: offsetMachine.maxWidthMm, heightMm: offsetMachine.maxHeightMm, name: offsetMachine.name }
    : undefined;

  const imposition = calculateImposition({
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    bleedMm: input.bleedMm ?? 2,
    paperType,
    printTech: input.printTech,
    digitalMode,
    preferredMachineSheet: preferredSheet,
  });

  const ups = Math.max(1, imposition.upsPerPrintSheet);
  const netSheets = Math.ceil(input.quantity / ups);
  const printWaste = isDigital ? 4 : (offsetMachine?.defaultWasteSheets ?? 100);
  const totalSheets = netSheets + printWaste + 10;

  const cuts = Math.max(1, imposition.cutsPerParentSheet);
  const parentSheets = Math.ceil(totalSheets / cuts);
  const pAbove = paperType.priceAbove500 || paperType.pricePerRam;
  const pBelow = paperType.priceBelow500 || pAbove;
  const effectiveRamPrice = parentSheets >= 500 ? pAbove : pBelow;
  let paperCost = Math.round(parentSheets * (effectiveRamPrice / 500));

  let printCost = 0;
  if (isDigital) {
    const is2Sides = input.printSides === '2_side';
    let shortFee = 0;
    if (totalSheets < 50) shortFee = 30000;
    else if (totalSheets < 100) shortFee = 20000;

    if (digitalMode === 'with_paper') {
      const matched = digitalPricingKemGiay.find((kg) =>
        paperType.code.toUpperCase().includes(kg.paperCode.toUpperCase())
      ) || digitalPricingKemGiay[0];
      const rate = is2Sides ? matched.price2Side : matched.price1Side;
      printCost = Math.round(totalSheets * rate) + shortFee;
      paperCost = 0;
    } else {
      const isA3 = imposition.printSheet.widthMm > 220 || imposition.printSheet.heightMm > 310;
      const rate = isA3 ? (is2Sides ? 4000 : 2000) : (is2Sides ? 1600 : 800);
      printCost = Math.round(totalSheets * rate) + shortFee;
      if (input.customerSuppliedPaper) paperCost = 0;
    }
  } else {
    const machine = offsetMachine || matchOffsetMachine(imposition.printSheet);
    const baseImpressions = machine.baseImpressions || 3000;
    const includesPlate = machine.includesPlate ?? true;
    const platePrice = includesPlate ? 0 : 4 * machine.platePrice;
    const impressions = input.printSides === '2_side' ? totalSheets * 2 : totalSheets;
    const runPrice = impressions <= baseImpressions
      ? machine.setupCost
      : machine.setupCost + Math.ceil((impressions - baseImpressions) / 1000) * machine.stepCost;
    printCost = platePrice + runPrice;
  }

  // Ước tính gia công cơ bản
  let finishingCost = 0;
  for (const sel of (input.selectedFinishing || [])) {
    const service = allFinishingServices.find((s) => s.id === sel.serviceId);
    if (service) {
      if (service.calcType === 'per_m2') {
        const area = ((input.widthMm + 4) / 1000) * ((input.heightMm + 4) / 1000) * input.quantity * (sel.sides || 1);
        finishingCost += Math.max(service.minPrice, Math.round(area * service.unitPrice)) + service.setupFee;
      } else {
        finishingCost += Math.max(service.minPrice, input.quantity * service.unitPrice) + service.setupFee;
      }
    }
  }

  const baseCost = paperCost + printCost + finishingCost;
  const margin = input.profitMarginPercent ?? 25;
  const finalPrice = Math.round(baseCost * (1 + margin / 100));
  const unitPrice = input.quantity > 0 ? Math.round(finalPrice / input.quantity) : 0;

  return { finalPrice, unitPrice };
}
"""

with open("src/lib/engine/costCalculator.ts", "w", encoding="utf-8") as f:
    f.write(new_content)
print("Updated costCalculator.ts successfully!")
