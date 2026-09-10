import { BoxCoordinate, ImpositionResult, PaperType, PrintTech } from '@/types';

interface ImpositionOptions {
  widthMm: number;
  heightMm: number;
  bleedMm?: number;
  paperType: PaperType;
  printTech: PrintTech;
  preferredMachineSheet?: { widthMm: number; heightMm: number; name: string };
  gripperMarginMm?: number;
}

export function calculateImposition({
  widthMm,
  heightMm,
  bleedMm = 2,
  paperType,
  printTech,
  preferredMachineSheet,
  gripperMarginMm = 10,
}: ImpositionOptions): ImpositionResult {
  // Kích thước có chừa xén lề (Bleed)
  const itemW = widthMm + bleedMm * 2;
  const itemH = heightMm + bleedMm * 2;

  const parentW_mm = paperType.parentWidthCm * 10;
  const parentH_mm = paperType.parentHeightCm * 10;

  // Xác định các khổ in có thể cắt từ tờ giấy mẹ
  let candidatePrintSheets: {
    name: string;
    widthMm: number;
    heightMm: number;
    cutsFromParent: number;
  }[] = [];

  if (preferredMachineSheet) {
    // Máy in cụ thể được chọn
    const cuts = calculateCutsFromParent(parentW_mm, parentH_mm, preferredMachineSheet.widthMm, preferredMachineSheet.heightMm);
    candidatePrintSheets.push({
      name: preferredMachineSheet.name,
      widthMm: preferredMachineSheet.widthMm,
      heightMm: preferredMachineSheet.heightMm,
      cutsFromParent: cuts,
    });
  } else if (printTech === 'digital') {
    // In nhanh kỹ thuật số thường in khổ A3+ (330x488mm) hoặc A3 (320x440mm)
    candidatePrintSheets = [
      { name: 'Khổ A3+ (330 x 488 mm)', widthMm: 330, heightMm: 488, cutsFromParent: 4 },
      { name: 'Khổ A3 chuẩn (297 x 420 mm)', widthMm: 297, heightMm: 420, cutsFromParent: 4 },
      { name: 'Khổ A4 chuẩn (210 x 297 mm)', widthMm: 210, heightMm: 297, cutsFromParent: 8 },
    ];
  } else {
    // In Offset: tính các phương án chia khổ giấy mẹ (chia 2, chia 4, chia 6, chia 8)
    // Trường hợp 1: Chia 4 (vd 65x86 -> 4 tờ 325 x 430 mm; 79x109 -> 4 tờ 395 x 545 mm)
    const cut4_w = Math.floor(parentW_mm / 2);
    const cut4_h = Math.floor(parentH_mm / 2);
    candidatePrintSheets.push({
      name: `Khổ chia 4 (${cut4_w} x ${cut4_h} mm)`,
      widthMm: cut4_w,
      heightMm: cut4_h,
      cutsFromParent: 4,
    });

    // Trường hợp 2: Chia 2 (vd 79x109 -> 2 tờ 545 x 790 mm)
    const cut2_w = Math.floor(parentW_mm / 2);
    const cut2_h = parentH_mm;
    candidatePrintSheets.push({
      name: `Khổ chia 2 (${cut2_w} x ${cut2_h} mm)`,
      widthMm: cut2_w,
      heightMm: cut2_h,
      cutsFromParent: 2,
    });

    // Trường hợp 3: Chia 8 (cho sp nhỏ namecard, thẻ tag)
    const cut8_w = Math.floor(parentW_mm / 2);
    const cut8_h = Math.floor(parentH_mm / 4);
    candidatePrintSheets.push({
      name: `Khổ chia 8 (${cut8_w} x ${cut8_h} mm)`,
      widthMm: cut8_w,
      heightMm: cut8_h,
      cutsFromParent: 8,
    });
  }

  // Đánh giá phương án nào cho tổng số con / tờ giấy mẹ cao nhất
  let bestResult: {
    printSheet: { widthMm: number; heightMm: number; name: string };
    cutsFromParent: number;
    ups: number;
    cols: number;
    rows: number;
    isRotated: boolean;
    boxes: BoxCoordinate[];
    efficiency: number;
    usableW: number;
    usableH: number;
  } | null = null;

  for (const candidate of candidatePrintSheets) {
    const evalResult = evaluateSheetImposition(
      candidate.widthMm,
      candidate.heightMm,
      itemW,
      itemH,
      gripperMarginMm
    );

    const totalUpsPerParent = evalResult.ups * candidate.cutsFromParent;

    if (!bestResult || totalUpsPerParent > (bestResult.ups * bestResult.cutsFromParent)) {
      bestResult = {
        printSheet: candidate,
        cutsFromParent: candidate.cutsFromParent,
        ups: evalResult.ups,
        cols: evalResult.cols,
        rows: evalResult.rows,
        isRotated: evalResult.isRotated,
        boxes: evalResult.boxes,
        efficiency: evalResult.efficiency,
        usableW: evalResult.usableW,
        usableH: evalResult.usableH,
      };
    }
  }

  // Fallback an toàn nếu chưa tìm được
  if (!bestResult || bestResult.ups === 0) {
    const fallbackSheet = candidatePrintSheets[0];
    bestResult = {
      printSheet: fallbackSheet,
      cutsFromParent: fallbackSheet.cutsFromParent,
      ups: 1,
      cols: 1,
      rows: 1,
      isRotated: false,
      boxes: [{ x: 10, y: gripperMarginMm + 5, w: itemW, h: itemH, index: 1 }],
      efficiency: 10,
      usableW: fallbackSheet.widthMm,
      usableH: fallbackSheet.heightMm,
    };
  }

  return {
    parentSheet: {
      widthCm: paperType.parentWidthCm,
      heightCm: paperType.parentHeightCm,
      name: `${paperType.name} (${paperType.parentWidthCm}x${paperType.parentHeightCm}cm)`,
    },
    printSheet: {
      widthMm: bestResult.printSheet.widthMm,
      heightMm: bestResult.printSheet.heightMm,
      name: bestResult.printSheet.name,
    },
    upsPerPrintSheet: bestResult.ups,
    cutsPerParentSheet: bestResult.cutsFromParent,
    totalUpsPerParentSheet: bestResult.ups * bestResult.cutsFromParent,
    gripperMarginMm,
    usableWidthMm: bestResult.usableW,
    usableHeightMm: bestResult.usableH,
    cols: bestResult.cols,
    rows: bestResult.rows,
    isRotated: bestResult.isRotated,
    boxes: bestResult.boxes,
    sheetEfficiencyPercent: Math.round(bestResult.efficiency * 10) / 10,
  };
}

// Tính số con tối đa trên 1 khổ in máy kèm tọa độ hiển thị trực quan
function evaluateSheetImposition(
  sheetW: number,
  sheetH: number,
  itemW: number,
  itemH: number,
  gripperMarginMm: number
) {
  // Lề máy in: 1 cạnh chừa nhíp (gripper) = 10mm, các cạnh còn lại chừa mép xén = 5mm
  const usableW = sheetW - 10; // lề trái 5mm, lề phải 5mm
  const usableH = sheetH - (gripperMarginMm + 5); // lề nhíp dưới 10mm, lề trên 5mm

  if (usableW < itemW && usableW < itemH) {
    return { ups: 0, cols: 0, rows: 0, isRotated: false, boxes: [], efficiency: 0, usableW, usableH };
  }

  // Cách 1: Xếp thẳng (Không xoay)
  const cols1 = Math.floor(usableW / itemW);
  const rows1 = Math.floor(usableH / itemH);
  const ups1 = cols1 * rows1;

  // Cách 2: Xếp xoay 90 độ
  const cols2 = Math.floor(usableW / itemH);
  const rows2 = Math.floor(usableH / itemW);
  const ups2 = cols2 * rows2;

  const isRotated = ups2 > ups1;
  const bestCols = isRotated ? cols2 : cols1;
  const bestRows = isRotated ? rows2 : rows1;
  const bestUps = isRotated ? ups2 : ups1;
  const boxW = isRotated ? itemH : itemW;
  const boxH = isRotated ? itemW : itemH;

  // Tính toán tọa độ chính xác của từng con (để vẽ lên SVG / Canvas)
  const boxes: BoxCoordinate[] = [];
  const startX = 5; // lề mép trái
  const startY = 5; // lề mép trên (chừa nhíp ở dưới đáy)

  let idx = 1;
  for (let r = 0; r < bestRows; r++) {
    for (let c = 0; c < bestCols; c++) {
      boxes.push({
        index: idx++,
        x: Math.round((startX + c * boxW) * 10) / 10,
        y: Math.round((startY + r * boxH) * 10) / 10,
        w: boxW,
        h: boxH,
      });
    }
  }

  const itemArea = itemW * itemH * bestUps;
  const sheetArea = sheetW * sheetH;
  const efficiency = sheetArea > 0 ? (itemArea / sheetArea) * 100 : 0;

  return {
    ups: bestUps,
    cols: bestCols,
    rows: bestRows,
    isRotated,
    boxes,
    efficiency,
    usableW,
    usableH,
  };
}

// Tính số tờ in có thể cắt ra từ tờ giấy mẹ
function calculateCutsFromParent(parentW: number, parentH: number, printW: number, printH: number): number {
  // Thử 2 hướng cắt: thẳng và xoay
  const cuts1 = Math.floor(parentW / printW) * Math.floor(parentH / printH);
  const cuts2 = Math.floor(parentW / printH) * Math.floor(parentH / printW);
  return Math.max(cuts1, cuts2, 1);
}
