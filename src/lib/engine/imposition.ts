import { BoxCoordinate, DigitalMode, ImpositionResult, PaperCutBlock, PaperCutLine, PaperCutScheme, PaperType, PrintTech } from '@/types';

interface ImpositionOptions {
  widthMm: number;
  heightMm: number;
  bleedMm?: number;
  paperType: PaperType;
  printTech: PrintTech;
  digitalMode?: DigitalMode;
  preferredMachineSheet?: { widthMm: number; heightMm: number; name: string };
  gripperMarginMm?: number;
}

interface EvaluationCandidate {
  name: string;
  sheetWidthMm: number;
  sheetHeightMm: number;
  cutsFromParent: number;
  cutScheme: PaperCutScheme;
  gripperMarginMm: number;
}

export function calculateImposition({
  widthMm,
  heightMm,
  bleedMm = 2,
  paperType,
  printTech,
  digitalMode = 'with_paper',
  preferredMachineSheet,
  gripperMarginMm = 10,
}: ImpositionOptions): ImpositionResult {
  const parentW = paperType.parentWidthCm * 10;
  const parentH = paperType.parentHeightCm * 10;

  // 1. Sinh danh sách các phương án cắt xả giấy mẹ
  const candidates: EvaluationCandidate[] = [];

  if (preferredMachineSheet) {
    // Máy in cụ thể được chỉ định
    const cuts = calculateCutsFromParent(parentW, parentH, preferredMachineSheet.widthMm, preferredMachineSheet.heightMm);
    const cutScheme = determineCutScheme(parentW, parentH, preferredMachineSheet.widthMm, preferredMachineSheet.heightMm, cuts);
    candidates.push({
      name: preferredMachineSheet.name,
      sheetWidthMm: preferredMachineSheet.widthMm,
      sheetHeightMm: preferredMachineSheet.heightMm,
      cutsFromParent: cuts,
      cutScheme,
      gripperMarginMm,
    });
  } else if (printTech === 'digital') {
    // In nhanh KTS: Theo chuẩn Bảng Giá In Nhanh Kèm Giấy & In Gia Công Konica C12000
    let digitalCandidates: { name: string; w: number; h: number; cuts: number }[] = [];

    if (digitalMode === 'with_paper') {
      // BẢNG GIÁ IN NHANH KÈM GIẤY: Khổ 325 x 430 mm (chính) & 325 x 355 mm (Fort)
      digitalCandidates = [
        { name: 'Khổ in kèm giấy (325 x 430 mm)', w: 430, h: 325, cuts: 4 },
        { name: 'Khổ in kèm giấy đứng (325 x 430 mm)', w: 325, h: 430, cuts: 4 },
        { name: 'Khổ in kèm giấy (325 x 355 mm)', w: 355, h: 325, cuts: 4 },
      ];
    } else {
      // BẢNG GIÁ IN GIA CÔNG KONICA C12000 / C12010S: 5 khổ in máy
      digitalCandidates = [
        { name: 'Khổ Konica A3+ (330 x 483 mm)', w: 483, h: 330, cuts: 4 },
        { name: 'Khổ Konica A3 chuẩn (297 x 420 mm)', w: 420, h: 297, cuts: 4 },
        { name: 'Khổ Konica 330 x 355 mm', w: 355, h: 330, cuts: 4 },
        { name: 'Khổ Konica A4 chuẩn (210 x 297 mm)', w: 297, h: 210, cuts: 8 },
        { name: 'Khổ Konica Banner (330 x 1200 mm)', w: 1200, h: 330, cuts: 1 },
      ];
    }

    for (const dc of digitalCandidates) {
      const cuts = calculateCutsFromParent(parentW, parentH, dc.w, dc.h);
      const cutScheme = determineCutScheme(parentW, parentH, dc.w, dc.h, cuts);
      candidates.push({
        name: dc.name,
        sheetWidthMm: dc.w,
        sheetHeightMm: dc.h,
        cutsFromParent: cuts,
        cutScheme,
        gripperMarginMm: 4,
      });
    }
  } else {
    // In Offset: Các phương án chia khổ giấy mẹ chuẩn công nghiệp
    // Phương án 0: Nguyên khổ (Chia 1) - ví dụ 65x86 (860 x 650 mm)
    if (Math.max(parentW, parentH) <= 920) {
      const w1 = Math.max(parentW, parentH);
      const h1 = Math.min(parentW, parentH);
      candidates.push({
        name: `Khổ nguyên ${Math.round(parentW/10)}x${Math.round(parentH/10)}cm (Bắt nhíp ${w1/10}cm)`,
        sheetWidthMm: w1,
        sheetHeightMm: h1,
        cutsFromParent: 1,
        cutScheme: buildFullCutScheme(parentW, parentH),
        gripperMarginMm,
      });
    }

    // Phương án 1: Chia 2 (Cắt đôi)
    // Cắt đôi chiều dài (thường tạo ra khổ 430 x 650 mm từ 65x86)
    const longSide = Math.max(parentW, parentH);
    const shortSide = Math.min(parentW, parentH);
    const cut2_h = Math.floor(longSide / 2);
    const cut2_w = shortSide;
    candidates.push({
      name: `Khổ chia 2 (${cut2_w} x ${cut2_h} mm)`,
      sheetWidthMm: Math.max(cut2_w, cut2_h),
      sheetHeightMm: Math.min(cut2_w, cut2_h),
      cutsFromParent: 2,
      cutScheme: buildCut2Scheme(parentW, parentH),
      gripperMarginMm,
    });

    // Phương án 2: Chia 4 (Cắt chữ thập)
    const cut4_w = Math.floor(parentW / 2);
    const cut4_h = Math.floor(parentH / 2);
    candidates.push({
      name: `Khổ chia 4 (${cut4_w} x ${cut4_h} mm)`,
      sheetWidthMm: Math.max(cut4_w, cut4_h),
      sheetHeightMm: Math.min(cut4_w, cut4_h),
      cutsFromParent: 4,
      cutScheme: buildCut4Scheme(parentW, parentH),
      gripperMarginMm,
    });

    // Phương án 3: Chia 8 (Cắt 8 - cho ấn phẩm nhỏ như namecard, tag...)
    const cut8_1 = Math.floor(shortSide / 2);
    const cut8_2 = Math.floor(longSide / 4);
    candidates.push({
      name: `Khổ chia 8 (${cut8_1} x ${cut8_2} mm)`,
      sheetWidthMm: Math.max(cut8_1, cut8_2),
      sheetHeightMm: Math.min(cut8_1, cut8_2),
      cutsFromParent: 8,
      cutScheme: buildCut8Scheme(parentW, parentH),
      gripperMarginMm,
    });
  }

  // 2. Đánh giá tất cả phương án để tìm phương án cho ra tổng số con trên tờ mẹ cao nhất
  let bestCandidateResult: {
    candidate: EvaluationCandidate;
    ups: number;
    cols: number;
    rows: number;
    isRotated: boolean;
    boxes: BoxCoordinate[];
    efficiency: number;
    usableW: number;
    usableH: number;
  } | null = null;

  for (const cand of candidates) {
    const layout = evaluateImpositionLayout({
      sheetW: cand.sheetWidthMm,
      sheetH: cand.sheetHeightMm,
      itemW: widthMm,
      itemH: heightMm,
      bleedMm,
      gripperMarginMm: cand.gripperMarginMm,
    });

    const totalUps = layout.ups * cand.cutsFromParent;

    if (!bestCandidateResult) {
      bestCandidateResult = { candidate: cand, ...layout };
    } else {
      const currentBestTotal = bestCandidateResult.ups * bestCandidateResult.candidate.cutsFromParent;
      if (totalUps > currentBestTotal) {
        bestCandidateResult = { candidate: cand, ...layout };
      } else if (totalUps === currentBestTotal) {
        // Nếu tổng số con bằng nhau, ưu tiên phương án tờ in nhỏ hơn (chia 4 hoặc chia 2) để tiết kiệm chi phí in máy
        if (cand.cutsFromParent > bestCandidateResult.candidate.cutsFromParent) {
          bestCandidateResult = { candidate: cand, ...layout };
        }
      }
    }
  }

  // Fallback nếu không có con nào vừa
  if (!bestCandidateResult || bestCandidateResult.ups === 0) {
    const fallbackCand = candidates[0];
    bestCandidateResult = {
      candidate: fallbackCand,
      ups: 1,
      cols: 1,
      rows: 1,
      isRotated: false,
      boxes: [
        {
          index: 1,
          x: 10,
          y: 10,
          w: widthMm + bleedMm * 2,
          h: heightMm + bleedMm * 2,
          trimW: widthMm,
          trimH: heightMm,
          bleedMm,
          isRotated: false,
        },
      ],
      efficiency: 10,
      usableW: fallbackCand.sheetWidthMm,
      usableH: fallbackCand.sheetHeightMm,
    };
  }

  const { candidate, ups, cols, rows, isRotated, boxes, efficiency, usableW, usableH } = bestCandidateResult;

  return {
    parentSheet: {
      widthCm: paperType.parentWidthCm,
      heightCm: paperType.parentHeightCm,
      name: `${paperType.name} (${paperType.parentWidthCm}x${paperType.parentHeightCm}cm)`,
    },
    printSheet: {
      widthMm: candidate.sheetWidthMm,
      heightMm: candidate.sheetHeightMm,
      name: candidate.name,
    },
    upsPerPrintSheet: ups,
    cutsPerParentSheet: candidate.cutsFromParent,
    totalUpsPerParentSheet: ups * candidate.cutsFromParent,
    gripperMarginMm: candidate.gripperMarginMm,
    usableWidthMm: usableW,
    usableHeightMm: usableH,
    cols,
    rows,
    isRotated,
    boxes,
    sheetEfficiencyPercent: Math.round(efficiency * 10) / 10,
    cutScheme: candidate.cutScheme,
  };
}

// -----------------------------------------------------------------------------------------
// THUẬT TOÁN XẾP BÌNH BÀI CHUẨN XÉNG CÔNG NGHIỆP TRÊN TỜ IN MÁY
// -----------------------------------------------------------------------------------------
interface LayoutEvalParams {
  sheetW: number;
  sheetH: number;
  itemW: number;
  itemH: number;
  bleedMm: number;
  gripperMarginMm: number;
}

interface LayoutResult {
  ups: number;
  cols: number;
  rows: number;
  isRotated: boolean;
  boxes: BoxCoordinate[];
  efficiency: number;
  usableW: number;
  usableH: number;
}

function evaluateImpositionLayout({
  sheetW,
  sheetH,
  itemW,
  itemH,
  bleedMm,
  gripperMarginMm,
}: LayoutEvalParams): LayoutResult {
  // Quy ước máy in:
  // Cạnh dài là cạnh bắt nhíp: width = max(sheetW, sheetH), height = min(sheetW, sheetH)
  const W = Math.max(sheetW, sheetH);
  const H = Math.min(sheetW, sheetH);

  // Lề kẹp nhíp ở cạnh đáy (gripperMarginMm = 10mm)
  // Lề đuôi (đối diện nhíp): 4mm
  // Lề 2 bên biên: 4mm mỗi bên (tổng 8mm)
  const marginSide = 4;
  const marginTail = 4;
  const usableW = W - marginSide * 2;
  const usableH = H - (gripperMarginMm + marginTail);

  if (usableW < itemW && usableW < itemH) {
    return { ups: 0, cols: 0, rows: 0, isRotated: false, boxes: [], efficiency: 0, usableW, usableH };
  }

  // --- Cách 1: Xếp Thẳng (Không xoay) ---
  // Chiều ngang chứa C1 cột thành phẩm, có tràn lề 2mm ở 2 mép ngoài cùng
  // Công thức: C1 * itemW + 2 * bleedMm <= usableW
  const cols1 = Math.max(0, Math.floor((usableW - 2 * bleedMm) / itemW));
  const rows1 = Math.max(0, Math.floor((usableH - 2 * bleedMm) / itemH));
  const ups1 = cols1 * rows1;

  // --- Cách 2: Xếp Xoay 90 độ ---
  // Chiều ngang xếp theo itemH, chiều dọc xếp theo itemW
  const cols2 = Math.max(0, Math.floor((usableW - 2 * bleedMm) / itemH));
  const rows2 = Math.max(0, Math.floor((usableH - 2 * bleedMm) / itemW));
  const ups2 = cols2 * rows2;

  // Chọn phương án tốt nhất giữa Xếp Thẳng (ups1) và Xếp Xoay 90° (ups2)
  let bestUps = ups1;
  let bestCols = cols1;
  let bestRows = rows1;
  let isRotated = false;

  if (ups2 > bestUps) {
    bestUps = ups2;
    bestCols = cols2;
    bestRows = rows2;
    isRotated = true;
  }

  // Tạo danh sách tọa độ các hộp sản phẩm
  const boxes: BoxCoordinate[] = [];
  const boxW = isRotated ? itemH : itemW;
  const boxH = isRotated ? itemW : itemH;

  // Canh giữa cụm con trong vùng in hữu dụng
  const blockW = bestCols * boxW + 2 * bleedMm;
  const blockH = bestRows * boxH + 2 * bleedMm;
  const startX = marginSide + Math.max(0, Math.floor((usableW - blockW) / 2)) + bleedMm;
  const startY = marginTail + Math.max(0, Math.floor((usableH - blockH) / 2)) + bleedMm;

  let idx = 1;
  for (let r = 0; r < bestRows; r++) {
    for (let c = 0; c < bestCols; c++) {
      boxes.push({
        index: idx++,
        x: Math.round((startX + c * boxW) * 10) / 10,
        y: Math.round((startY + r * boxH) * 10) / 10,
        w: boxW,
        h: boxH,
        trimW: itemW,
        trimH: itemH,
        bleedMm,
        isRotated,
      });
    }
  }

  const totalItemArea = itemW * itemH * bestUps;
  const sheetArea = W * H;
  const efficiency = sheetArea > 0 ? (totalItemArea / sheetArea) * 100 : 0;

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

// -----------------------------------------------------------------------------------------
// SINH SƠ ĐỒ CẮT GIẤY MẸ TRỰC QUAN (PAPER CUTTING SCHEME)
// -----------------------------------------------------------------------------------------

export function determineCutScheme(
  parentW: number,
  parentH: number,
  printW: number,
  printH: number,
  cuts: number
): PaperCutScheme {
  const pw = Math.max(parentW, parentH);
  const ph = Math.min(parentW, parentH);

  if (cuts <= 1) return buildFullCutScheme(pw, ph);
  if (cuts === 2) return buildCut2Scheme(pw, ph);
  if (cuts === 4) return buildCut4Scheme(pw, ph);
  if (cuts === 8) return buildCut8Scheme(pw, ph);
  return buildSimpleCutScheme(pw, ph, printW, printH, cuts);
}

function buildFullCutScheme(parentW: number, parentH: number): PaperCutScheme {
  const pw = Math.max(parentW, parentH);
  const ph = Math.min(parentW, parentH);

  return {
    parentWidthMm: pw,
    parentHeightMm: ph,
    cutType: 'chia_1',
    cutDescription: `In nguyên khổ ${pw} x ${ph} mm (không cần xén trước khi in)`,
    cutsCount: 1,
    cutSheetWidthMm: pw,
    cutSheetHeightMm: ph,
    wasteAreaPercent: 0,
    cutLines: [],
    blocks: [
      {
        index: 1,
        x: 0,
        y: 0,
        w: pw,
        h: ph,
        name: `Tờ in #1 (${pw} x ${ph} mm)`,
      },
    ],
  };
}

function buildCut2Scheme(parentW: number, parentH: number): PaperCutScheme {
  const pw = Math.max(parentW, parentH); // ví dụ 860mm
  const ph = Math.min(parentW, parentH); // ví dụ 650mm
  const cutW = Math.floor(pw / 2); // 430mm

  return {
    parentWidthMm: pw,
    parentHeightMm: ph,
    cutType: 'chia_2',
    cutDescription: `Xén đôi chiều ${pw}mm thành 2 tờ ${ph} x ${cutW} mm (Chia 2)`,
    cutsCount: 2,
    cutSheetWidthMm: ph,
    cutSheetHeightMm: cutW,
    wasteAreaPercent: 0,
    cutLines: [
      {
        x1: cutW,
        y1: 0,
        x2: cutW,
        y2: ph,
        type: 'vertical',
        label: `Xén dọc: ${cutW}mm`,
      },
    ],
    blocks: [
      {
        index: 1,
        x: 0,
        y: 0,
        w: cutW,
        h: ph,
        name: `Tờ in #1 (${ph} x ${cutW} mm)`,
      },
      {
        index: 2,
        x: cutW,
        y: 0,
        w: pw - cutW,
        h: ph,
        name: `Tờ in #2 (${ph} x ${cutW} mm)`,
      },
    ],
  };
}

function buildCut4Scheme(parentW: number, parentH: number): PaperCutScheme {
  const pw = Math.max(parentW, parentH); // ví dụ 860 hoặc 1090
  const ph = Math.min(parentW, parentH); // ví dụ 650 hoặc 790
  const halfW = Math.floor(pw / 2); // 430
  const halfH = Math.floor(ph / 2); // 325

  return {
    parentWidthMm: pw,
    parentHeightMm: ph,
    cutType: 'chia_4',
    cutDescription: `Xén chữ thập (Chia 4) thành 4 tờ ${halfW} x ${halfH} mm`,
    cutsCount: 4,
    cutSheetWidthMm: halfW,
    cutSheetHeightMm: halfH,
    wasteAreaPercent: 0,
    cutLines: [
      {
        x1: halfW,
        y1: 0,
        x2: halfW,
        y2: ph,
        type: 'vertical',
        label: `Xén dọc: ${halfW}mm`,
      },
      {
        x1: 0,
        y1: halfH,
        x2: pw,
        y2: halfH,
        type: 'horizontal',
        label: `Xén ngang: ${halfH}mm`,
      },
    ],
    blocks: [
      { index: 1, x: 0, y: 0, w: halfW, h: halfH, name: `Tờ in #1 (${halfW} x ${halfH} mm)` },
      { index: 2, x: halfW, y: 0, w: pw - halfW, h: halfH, name: `Tờ in #2 (${halfW} x ${halfH} mm)` },
      { index: 3, x: 0, y: halfH, w: halfW, h: ph - halfH, name: `Tờ in #3 (${halfW} x ${halfH} mm)` },
      { index: 4, x: halfW, y: halfH, w: pw - halfW, h: ph - halfH, name: `Tờ in #4 (${halfW} x ${halfH} mm)` },
    ],
  };
}

function buildCut8Scheme(parentW: number, parentH: number): PaperCutScheme {
  const pw = Math.max(parentW, parentH); // ví dụ 860
  const ph = Math.min(parentW, parentH); // ví dụ 650
  const colW = Math.floor(pw / 4); // 215
  const rowH = Math.floor(ph / 2); // 325

  const blocks: PaperCutBlock[] = [];
  const cutLines: PaperCutLine[] = [
    { x1: colW, y1: 0, x2: colW, y2: ph, type: 'vertical', label: `Xén: ${colW}mm` },
    { x1: colW * 2, y1: 0, x2: colW * 2, y2: ph, type: 'vertical', label: `Xén: ${colW * 2}mm` },
    { x1: colW * 3, y1: 0, x2: colW * 3, y2: ph, type: 'vertical', label: `Xén: ${colW * 3}mm` },
    { x1: 0, y1: rowH, x2: pw, y2: rowH, type: 'horizontal', label: `Xén ngang: ${rowH}mm` },
  ];

  let idx = 1;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const curW = c === 3 ? pw - colW * 3 : colW;
      const curH = r === 1 ? ph - rowH : rowH;
      blocks.push({
        index: idx++,
        x: c * colW,
        y: r * rowH,
        w: curW,
        h: curH,
        name: `Tờ in #${idx - 1} (${rowH} x ${colW} mm)`,
      });
    }
  }

  return {
    parentWidthMm: pw,
    parentHeightMm: ph,
    cutType: 'chia_8',
    cutDescription: `Xén chia 8 thành 8 tờ ${rowH} x ${colW} mm`,
    cutsCount: 8,
    cutSheetWidthMm: rowH,
    cutSheetHeightMm: colW,
    wasteAreaPercent: 0,
    cutLines,
    blocks,
  };
}

function buildSimpleCutScheme(
  parentW: number,
  parentH: number,
  printW: number,
  printH: number,
  cuts: number
): PaperCutScheme {
  const pw = Math.max(parentW, parentH);
  const ph = Math.min(parentW, parentH);

  // So sánh 2 chiều xếp trên tờ mẹ
  const c1 = Math.floor(pw / printW);
  const r1 = Math.floor(ph / printH);
  const tot1 = c1 * r1;

  const c2 = Math.floor(pw / printH);
  const r2 = Math.floor(ph / printW);
  const tot2 = c2 * r2;

  const useRotated = tot2 > tot1;
  const pieceW = useRotated ? printH : printW;
  const pieceH = useRotated ? printW : printH;
  const cols = useRotated ? c2 : c1;
  const rows = useRotated ? r2 : r1;

  const actualCols = Math.max(1, cols);
  const actualRows = Math.max(1, rows);

  const blocks: PaperCutBlock[] = [];
  const cutLines: PaperCutLine[] = [];

  let idx = 1;
  for (let r = 0; r < actualRows; r++) {
    for (let c = 0; c < actualCols; c++) {
      if (idx <= cuts) {
        blocks.push({
          index: idx++,
          x: c * pieceW,
          y: r * pieceH,
          w: pieceW,
          h: pieceH,
          name: `Tờ in #${idx - 1} (${pieceW} x ${pieceH} mm)`,
        });
      }
    }
  }

  // Tạo cut lines
  for (let c = 1; c < actualCols; c++) {
    cutLines.push({
      x1: c * pieceW,
      y1: 0,
      x2: c * pieceW,
      y2: Math.min(ph, actualRows * pieceH),
      type: 'vertical',
      label: `Xén: ${c * pieceW}mm`,
    });
  }
  for (let r = 1; r < actualRows; r++) {
    cutLines.push({
      x1: 0,
      y1: r * pieceH,
      x2: Math.min(pw, actualCols * pieceW),
      y2: r * pieceH,
      type: 'horizontal',
      label: `Xén: ${r * pieceH}mm`,
    });
  }

  const usedArea = cuts * pieceW * pieceH;
  const totalArea = pw * ph;
  const wastePercent = totalArea > 0 ? Math.max(0, Math.round(((totalArea - usedArea) / totalArea) * 100)) : 0;

  return {
    parentWidthMm: pw,
    parentHeightMm: ph,
    cutType: cuts === 2 ? 'chia_2' : cuts === 4 ? 'chia_4' : cuts === 8 ? 'chia_8' : 'custom',
    cutDescription: `Cắt ${cuts} tờ in (${pieceW} x ${pieceH} mm) từ tờ giấy mẹ ${pw} x ${ph} mm`,
    cutsCount: cuts,
    cutSheetWidthMm: pieceW,
    cutSheetHeightMm: pieceH,
    wasteAreaPercent: wastePercent,
    cutLines,
    blocks,
  };
}

function calculateCutsFromParent(parentW: number, parentH: number, printW: number, printH: number): number {
  const cuts1 = Math.floor(parentW / printW) * Math.floor(parentH / printH);
  const cuts2 = Math.floor(parentW / printH) * Math.floor(parentH / printW);
  return Math.max(cuts1, cuts2, 1);
}
