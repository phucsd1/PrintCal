import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { PaperType } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM paper_types ORDER BY is_active DESC, name ASC, gsm ASC').all() as Record<string, unknown>[];
    const papers: PaperType[] = rows.map((r) => ({
      id: r.id as number,
      code: r.code as string,
      name: r.name as string,
      gsm: r.gsm as number,
      parentWidthCm: r.parent_width_cm as number,
      parentHeightCm: r.parent_height_cm as number,
      pricePerRam: r.price_per_ram as number,
      pricePerKg: r.price_per_kg as number,
      unit: r.unit as 'ram' | 'kg',
      description: (r.description as string) || '',
      isActive: Boolean(r.is_active),
    }));
    return NextResponse.json(papers);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    const stmt = db.prepare(`
      INSERT INTO paper_types (code, name, gsm, parent_width_cm, parent_height_cm, price_per_ram, price_per_kg, unit, description, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.code,
      body.name,
      body.gsm,
      body.parentWidthCm,
      body.parentHeightCm,
      body.pricePerRam,
      body.pricePerKg || 0,
      body.unit || 'ram',
      body.description || '',
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
      UPDATE paper_types
      SET name = ?, gsm = ?, parent_width_cm = ?, parent_height_cm = ?, price_per_ram = ?, price_per_kg = ?, unit = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      body.name,
      body.gsm,
      body.parentWidthCm,
      body.parentHeightCm,
      body.pricePerRam,
      body.pricePerKg || 0,
      body.unit || 'ram',
      body.description || '',
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
    if (!id) return NextResponse.json({ error: 'Thiếu ID giấy' }, { status: 400 });

    const db = getDb();
    db.prepare('DELETE FROM paper_types WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
