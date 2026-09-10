import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FinishingService } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM finishing_services ORDER BY category ASC, id ASC').all() as Record<string, unknown>[];
    const services: FinishingService[] = rows.map((r) => ({
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
    return NextResponse.json(services);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    const stmt = db.prepare(`
      INSERT INTO finishing_services (code, name, category, calc_type, unit_price, min_price, setup_fee, waste_percent, waste_sheets, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.code,
      body.name,
      body.category,
      body.calcType,
      body.unitPrice,
      body.minPrice || 0,
      body.setupFee || 0,
      body.wastePercent || 0,
      body.wasteSheets || 0,
      body.isActive !== false ? 1 : 0
    );

    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    const stmt = db.prepare(`
      UPDATE finishing_services
      SET name = ?, category = ?, calc_type = ?, unit_price = ?, min_price = ?, setup_fee = ?, waste_percent = ?, waste_sheets = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      body.name,
      body.category,
      body.calcType,
      body.unitPrice,
      body.minPrice || 0,
      body.setupFee || 0,
      body.wastePercent || 0,
      body.wasteSheets || 0,
      body.isActive ? 1 : 0,
      body.id
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu ID dịch vụ' }, { status: 400 });

    const db = getDb();
    db.prepare('DELETE FROM finishing_services WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
