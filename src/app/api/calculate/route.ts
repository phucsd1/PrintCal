import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculatePrintCost } from '@/lib/engine/costCalculator';
import { CalculationInput, DigitalMachine, FinishingService, OffsetMachine, PaperType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const input = (await req.json()) as CalculationInput;
    const db = getDb();

    // Lấy thông tin giấy
    const paperRow = db.prepare('SELECT * FROM paper_types WHERE id = ?').get(input.paperTypeId) as Record<string, unknown> | undefined;
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

    const result = calculatePrintCost({
      input,
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
