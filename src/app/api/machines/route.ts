import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DigitalMachine, OffsetMachine } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const offsetRows = db.prepare('SELECT * FROM offset_machines ORDER BY id ASC').all() as Record<string, unknown>[];
    const digitalRows = db.prepare('SELECT * FROM digital_machines ORDER BY id ASC').all() as Record<string, unknown>[];

    const offsetMachines: OffsetMachine[] = offsetRows.map((r) => ({
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
    }));

    const digitalMachines: DigitalMachine[] = digitalRows.map((r) => ({
      id: r.id as number,
      name: r.name as string,
      maxWidthMm: r.max_width_mm as number,
      maxHeightMm: r.max_height_mm as number,
      clickA41Side: r.click_a4_1side as number,
      clickA42Side: r.click_a4_2side as number,
      clickA31Side: r.click_a3_1side as number,
      clickA32Side: r.click_a3_2side as number,
      defaultWasteSheets: r.default_waste_sheets as number,
      minCharge: r.min_charge as number,
    }));

    return NextResponse.json({ offsetMachines, digitalMachines });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    if (body.type === 'offset') {
      const stmt = db.prepare(`
        UPDATE offset_machines
        SET name = ?, max_width_mm = ?, max_height_mm = ?, plate_price = ?, setup_cost = ?, step_cost = ?, default_waste_sheets = ?, gripper_margin_mm = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        body.name,
        body.maxWidthMm,
        body.maxHeightMm,
        body.platePrice,
        body.setupCost,
        body.stepCost,
        body.defaultWasteSheets,
        body.gripperMarginMm || 10,
        body.id
      );
    } else if (body.type === 'digital') {
      const stmt = db.prepare(`
        UPDATE digital_machines
        SET name = ?, max_width_mm = ?, max_height_mm = ?, click_a4_1side = ?, click_a4_2side = ?, click_a3_1side = ?, click_a3_2side = ?, default_waste_sheets = ?, min_charge = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        body.name,
        body.maxWidthMm,
        body.maxHeightMm,
        body.clickA41Side,
        body.clickA42Side,
        body.clickA31Side,
        body.clickA32Side,
        body.defaultWasteSheets,
        body.minCharge,
        body.id
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
