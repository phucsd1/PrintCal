import {
  CalculationInput,
  CalculationResult,
  ComparisonItem,
  DigitalMachine,
  FinishingCostDetail,
  FinishingService,
  OffsetMachine,
  PaperType,
} from '@/types';
import { calculateImposition } from './imposition';

interface CostCalculatorOptions {
  input: CalculationInput;
  paperType: PaperType;
  offsetMachine?: OffsetMachine;
  allOffsetMachines?: OffsetMachine[];
  digitalMachine?: DigitalMachine;
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

    return allMachines[0];
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
  allFinishingServices,
}: CostCalculatorOptions): CalculationResult {
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
    const sides = sel.sides || 1;

    if (service.calcType === 'per_m2') {
      // Tính theo m2 sản phẩm hoặc m2 tờ in
      const areaM2 = ((input.widthMm + (input.bleedMm || 2) * 2) / 1000) *
                     ((input.heightMm + (input.bleedMm || 2) * 2) / 1000) *
                     input.quantity * sides;
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

  // 5. Tiền giấy
  let paperCost = 0;
  if (paperType.unit === 'kg' && paperType.pricePerKg > 0) {
    paperCost = Math.round(kgNeeded * paperType.pricePerKg);
  } else {
    // Tính theo ram quy đổi tờ
    paperCost = Math.round(parentSheetsNeeded * (paperType.pricePerRam / 500));
  }

  // 6. Tiền in ấn
  let plateCost = 0;
  let platesCount = 0;
  let printRunCost = 0;

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
        const colorsF = input.colorsFront || 4;
        const colorsB = input.colorsBack || 4;
        platesCount = colorsF + colorsB;

        if (includesPlate) {
          const extraColorsF = Math.max(0, colorsF - 4);
          const extraColorsB = Math.max(0, colorsB - 4);
          plateCost = (extraColorsF + extraColorsB) * machine.platePrice;
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
    // In nhanh kỹ thuật số
    const machine = digitalMachine || {
      clickA41Side: 1200,
      clickA42Side: 2200,
      clickA31Side: 2400,
      clickA32Side: 4200,
      minCharge: 20000,
    };

    const is2Sides = input.printSides === '2_side';
    // Đánh giá khổ in của Digital: Nếu khổ in > A4 thì tính click A3, ngược lại click A4
    const isA3 = imposition.printSheet.widthMm > 220 || imposition.printSheet.heightMm > 310;

    let clickRate = 0;
    if (isA3) {
      clickRate = is2Sides ? machine.clickA32Side : machine.clickA31Side;
    } else {
      clickRate = is2Sides ? machine.clickA42Side : machine.clickA41Side;
    }

    // Giảm giá theo bậc thang số lượng in nhanh
    let volumeDiscountFactor = 1.0;
    if (totalPrintSheets > 500) {
      volumeDiscountFactor = 0.75; // Giảm 25% cho đơn > 500 tờ A3
    } else if (totalPrintSheets > 200) {
      volumeDiscountFactor = 0.85; // Giảm 15%
    } else if (totalPrintSheets > 50) {
      volumeDiscountFactor = 0.92; // Giảm 8%
    }

    const calculatedClick = Math.round(totalPrintSheets * clickRate * volumeDiscountFactor);
    printRunCost = Math.max(machine.minCharge, calculatedClick);
    plateCost = 0;
    platesCount = 0;
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
    }, paperType, offsetMachine, digitalMachine, allFinishingServices);

    // Tính thử chi phí offset
    const offResult = runQuickEstimate({
      ...input,
      quantity: qty,
      printTech: 'offset',
    }, paperType, offsetMachine, digitalMachine, allFinishingServices);

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
  const curDigital = runQuickEstimate({ ...input, printTech: 'digital' }, paperType, offsetMachine, digitalMachine, allFinishingServices);
  const curOffset = runQuickEstimate({ ...input, printTech: 'offset' }, paperType, offsetMachine, digitalMachine, allFinishingServices);

  let recommendationText = '';
  const diff = Math.abs(curDigital.finalPrice - curOffset.finalPrice);

  if (curDigital.finalPrice < curOffset.finalPrice) {
    recommendationText = `Với số lượng ${input.quantity} sản phẩm, In Nhanh (Kỹ thuật số) rẻ hơn In Offset ${diff.toLocaleString('vi-VN')}đ (${Math.round((diff / curOffset.finalPrice) * 100)}%), không tốn tiền xuất kẽm CTP, lấy ngay trong ngày.`;
  } else {
    recommendationText = `Với số lượng ${input.quantity} sản phẩm, In Offset rẻ hơn In Nhanh ${diff.toLocaleString('vi-VN')}đ (${Math.round((diff / curDigital.finalPrice) * 100)}%), tối ưu chi phí tối đa cho số lượng công nghiệp lớn.`;
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
  allFinishingServices: FinishingService[] = []
): { finalPrice: number; unitPrice: number } {
  const isDigital = input.printTech === 'digital';
  const preferredSheet = !isDigital && offsetMachine
    ? { widthMm: offsetMachine.maxWidthMm, heightMm: offsetMachine.maxHeightMm, name: offsetMachine.name }
    : undefined;

  const imposition = calculateImposition({
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    bleedMm: input.bleedMm ?? 2,
    paperType,
    printTech: input.printTech,
    preferredMachineSheet: preferredSheet,
  });

  const ups = Math.max(1, imposition.upsPerPrintSheet);
  const netSheets = Math.ceil(input.quantity / ups);
  const printWaste = isDigital ? 4 : (offsetMachine?.defaultWasteSheets ?? 100);
  const totalSheets = netSheets + printWaste + 20;

  const cuts = Math.max(1, imposition.cutsPerParentSheet);
  const parentSheets = Math.ceil(totalSheets / cuts);
  const paperCost = Math.round(parentSheets * (paperType.pricePerRam / 500));

  let printCost = 0;
  if (isDigital) {
    const isA3 = imposition.printSheet.widthMm > 220 || imposition.printSheet.heightMm > 310;
    const rate = isA3
      ? (input.printSides === '2_side' ? 4200 : 2400)
      : (input.printSides === '2_side' ? 2200 : 1200);
    printCost = Math.max(20000, totalSheets * rate);
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
