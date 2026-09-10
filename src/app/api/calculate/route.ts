import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculatePrintCost } from '@/lib/engine/costCalculator';
import { CalculationInput, DigitalMachine, FinishingService, OffsetMachine, PaperType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const input = (await req.json()) as CalculationInput;
    const db = getDb();

    // Lấy thông tin giấy
    let paperRow: Record<string, unknown> | undefined;
    if (input.paperTypeId) {
      paperRow = db.prepare('SELECT * FROM paper_types WHERE id = ?').get(input.paperTypeId) as Record<string, unknown> | undefined;
    } else if ((input as unknown as Record<string, unknown>).paperCode) {
      paperRow = db.prepare('SELECT * FROM paper_types WHERE code = ?').get((input as unknown as Record<string, unknown>).paperCode as string) as Record<string, unknown> | undefined;
    } else {
      paperRow = db.prepare('SELECT * FROM paper_types WHERE is_active = 1 LIMIT 1').get() as Record<string, unknown> | undefined;
    }

    if (!paperRow) {
      return NextResponse.json({ error: 'Không tìm thấy loại giấy yêu cầu' }, { status: 400 });
    }

    const paperType: PaperType = {
      id: paperRow.id as number,
      code: paperRow.code as string,
      name: paperRow.name as string,
      gsm: paperRow.gsm as number,
      parentWidthCm: paperRow.parent_width_cm as number,
      parentHeightCm: paperRow.parent_height_cm as number,
      pricePerRam: paperRow.price_per_ram as number,
      pricePerKg: paperRow.price_per_kg as number,
      unit: paperRow.unit as 'ram' | 'kg',
      description: paperRow.description as string,
      isActive: Boolean(paperRow.is_active),
    };

    // Lấy thông số máy in offset
    let offsetMachine: OffsetMachine | undefined;
    if (input.offsetMachineId) {
      const row = db.prepare('SELECT * FROM offset_machines WHERE id = ?').get(input.offsetMachineId) as Record<string, unknown> | undefined;
      if (row) {
        offsetMachine = mapOffsetMachine(row);
      }
    }
    if (!offsetMachine) {
      const row = db.prepare('SELECT * FROM offset_machines ORDER BY id ASC LIMIT 1').get() as Record<string, unknown> | undefined;
      if (row) offsetMachine = mapOffsetMachine(row);
    }

    // Lấy thông số máy in nhanh
    let digitalMachine: DigitalMachine | undefined;
    if (input.digitalMachineId) {
      const row = db.prepare('SELECT * FROM digital_machines WHERE id = ?').get(input.digitalMachineId) as Record<string, unknown> | undefined;
      if (row) {
        digitalMachine = mapDigitalMachine(row);
      }
    }
    if (!digitalMachine) {
      const row = db.prepare('SELECT * FROM digital_machines ORDER BY id ASC LIMIT 1').get() as Record<string, unknown> | undefined;
      if (row) digitalMachine = mapDigitalMachine(row);
    }

    // Lấy danh mục dịch vụ gia công
    const finishingRows = db.prepare('SELECT * FROM finishing_services WHERE is_active = 1').all() as Record<string, unknown>[];
    const allFinishingServices: FinishingService[] = finishingRows.map((r) => ({
      id: r.id as number,
      code: r.code as string,
      name: r.name as string,
      category: r.category as FinishingService['category'],
      calcType: r.calc_type as FinishingService['calcType'],
      unitPrice: r.unit_price as number,
      minPrice: r.min_price as number,
      setupFee: r.setup_fee as number,
      wastePercent: r.waste_percent as number,
      wasteSheets: r.waste_sheets as number,
      isActive: Boolean(r.is_active),
    }));

    // Chuẩn hóa danh sách gia công đã chọn
    const rawFinishing = Array.isArray(input.selectedFinishing) ? input.selectedFinishing : [];
    const sanitizedFinishing = rawFinishing
      .map((sel) => {
        let sid = sel.serviceId;
        if (!sid && (sel as unknown as { code?: string }).code) {
          const match = allFinishingServices.find((s) => s.code === (sel as unknown as { code?: string }).code);
          if (match) sid = match.id;
        }
        return {
          serviceId: sid,
          sides: (Number((sel as unknown as { side?: number | string }).side) || sel.sides || 1) as 1 | 2,
          customQuantity: sel.customQuantity,
          foilAreaCm2: sel.foilAreaCm2,
          customNote: sel.customNote,
        };
      })
      .filter((s) => s.serviceId && s.serviceId > 0);

    const rawBody = input as unknown as Record<string, unknown>;
    const sanitizedInput: CalculationInput = {
      jobName: (rawBody.jobName as string) || 'Tính giá in',
      productType: (rawBody.productType as CalculationInput['productType']) || 'to_roi',
      printTech: (rawBody.printTech as CalculationInput['printTech']) || 'auto',
      quantity: Number(rawBody.quantity) || 1000,
      widthMm: Number(rawBody.widthMm ?? rawBody.productWidth) || 148,
      heightMm: Number(rawBody.heightMm ?? rawBody.productHeight) || 210,
      pages: Number(rawBody.pages) || 2,
      bleedMm: typeof rawBody.bleedMm === 'number' ? rawBody.bleedMm : 2,
      paperTypeId: paperType.id,
      printSides: (rawBody.printSides as CalculationInput['printSides']) || '2_side',
      colorsFront: Number(rawBody.colorsFront) || 4,
      colorsBack: rawBody.printSides === '1_side' ? 0 : (Number(rawBody.colorsBack) || 4),
      offsetWorkType: (rawBody.offsetWorkType as CalculationInput['offsetWorkType']) || 'self_turn',
      offsetMachineId: rawBody.offsetMachineId ? Number(rawBody.offsetMachineId) : undefined,
      digitalMachineId: rawBody.digitalMachineId ? Number(rawBody.digitalMachineId) : undefined,
      selectedFinishing: sanitizedFinishing,
      profitMarginPercent: Number(rawBody.profitMarginPercent) || 0,
      discountAmount: Number(rawBody.discountAmount) || 0,
      vatPercent: Number(rawBody.vatPercent) || 0,
    };

    const result = calculatePrintCost({
      input: sanitizedInput,
      paperType,
      offsetMachine,
      digitalMachine,
      allFinishingServices,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Calculate error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Lỗi tính toán chi phí' }, { status: 500 });
  }
}

function mapOffsetMachine(r: Record<string, unknown>): OffsetMachine {
  return {
    id: r.id as number,
    name: r.name as string,
    maxWidthMm: r.max_width_mm as number,
    maxHeightMm: r.max_height_mm as number,
    minWidthMm: r.min_width_mm as number,
    minHeightMm: r.min_height_mm as number,
    platePrice: r.plate_price as number,
    setupCost: r.setup_cost as number,
    stepCost: r.step_cost as number,
    defaultWasteSheets: r.default_waste_sheets as number,
    gripperMarginMm: (r.gripper_margin_mm as number) || 10,
  };
}

function mapDigitalMachine(r: Record<string, unknown>): DigitalMachine {
  return {
    id: r.id as number,
    name: r.name as string,
    maxWidthMm: r.max_width_mm as number,
    maxHeightMm: r.max_height_mm as number,
    clickA41Side: r.click_a4_1side as number,
    clickA42Side: r.click_a4_2side as number,
    clickA31Side: r.click_a3_1side as number,
    clickA32Side: r.click_a3_2side as number,
    defaultWasteSheets: (r.default_waste_sheets as number) || 3,
    minCharge: (r.min_charge as number) || 20000,
  };
}
