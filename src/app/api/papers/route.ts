import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { PaperType } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const supplier = searchParams.get('supplier');
    const q = searchParams.get('q');

    let query = 'SELECT * FROM paper_types WHERE 1=1';
    const params: unknown[] = [];

    if (supplier && supplier !== 'all') {
      query += ' AND supplier = ?';
      params.push(supplier);
    }
    if (q) {
      query += ' AND (name LIKE ? OR code LIKE ? OR description LIKE ?)';
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY is_active DESC, supplier ASC, name ASC, gsm ASC';

    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
    const papers: PaperType[] = rows.map((r) => {
      const pAbove = Number(r.price_above_500) || Number(r.price_per_ram) || 0;
      const pBelow = Number(r.price_below_500) || pAbove;
      return {
        id: r.id as number,
        code: r.code as string,
        name: r.name as string,
        gsm: r.gsm as number,
        parentWidthCm: r.parent_width_cm as number,
        parentHeightCm: r.parent_height_cm as number,
        priceAbove500: pAbove,
        priceBelow500: pBelow,
        pricePerRam: pAbove,
        pricePerKg: 0,
        supplier: (r.supplier as string) || 'Thuận Phát',
        unit: 'ram',
        description: (r.description as string) || '',
        isActive: Boolean(r.is_active),
      };
    });
    return NextResponse.json(papers);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    const pAbove = Number(body.priceAbove500 ?? body.pricePerRam) || 0;
    const pBelow = Number(body.priceBelow500) || pAbove;

    const stmt = db.prepare(`
      INSERT INTO paper_types (code, name, gsm, parent_width_cm, parent_height_cm, price_above_500, price_below_500, price_per_ram, price_per_kg, supplier, unit, description, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.code,
      body.name,
      body.gsm,
      body.parentWidthCm,
      body.parentHeightCm,
      pAbove,
      pBelow,
      pAbove,
      0,
      body.supplier || 'Thuận Phát',
      'ram',
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

    const pAbove = Number(body.priceAbove500 ?? body.pricePerRam) || 0;
    const pBelow = Number(body.priceBelow500) || pAbove;

    const stmt = db.prepare(`
      UPDATE paper_types
      SET name = ?, gsm = ?, parent_width_cm = ?, parent_height_cm = ?, price_above_500 = ?, price_below_500 = ?, price_per_ram = ?, price_per_kg = 0, supplier = ?, unit = 'ram', description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      body.name,
      body.gsm,
      body.parentWidthCm,
      body.parentHeightCm,
      pAbove,
      pBelow,
      pAbove,
      body.supplier || 'Thuận Phát',
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
