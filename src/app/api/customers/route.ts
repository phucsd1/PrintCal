import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Customer } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM customers ORDER BY id DESC').all() as Record<string, unknown>[];
    const customers: Customer[] = rows.map((r) => ({
      id: r.id as number,
      name: r.name as string,
      phone: r.phone as string,
      email: (r.email as string) || '',
      company: (r.company as string) || '',
      address: (r.address as string) || '',
      notes: (r.notes as string) || '',
      createdAt: r.created_at as string,
    }));
    return NextResponse.json(customers);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    const stmt = db.prepare(`
      INSERT INTO customers (name, phone, email, company, address, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.name,
      body.phone,
      body.email || '',
      body.company || '',
      body.address || '',
      body.notes || ''
    );

    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
