import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { SystemSetting } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM system_settings').all() as { key: string; value: string }[];
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }

    const settings: SystemSetting = {
      companyName: map.companyName || 'XƯỞNG IN ẤN PRINTCAL',
      companyAddress: map.companyAddress || '',
      companyPhone: map.companyPhone || '',
      companyEmail: map.companyEmail || '',
      bankAccount: map.bankAccount || '',
      bankName: map.bankName || '',
      quoteFooterNote: map.quoteFooterNote || '',
      defaultProfitMargin: Number(map.defaultProfitMargin) || 25,
      defaultVatPercent: Number(map.defaultVatPercent) || 8,
    };

    return NextResponse.json(settings);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SystemSetting>;
    const db = getDb();

    const upsert = db.prepare(`
      INSERT INTO system_settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    if (body.companyName !== undefined) upsert.run('companyName', body.companyName);
    if (body.companyAddress !== undefined) upsert.run('companyAddress', body.companyAddress);
    if (body.companyPhone !== undefined) upsert.run('companyPhone', body.companyPhone);
    if (body.companyEmail !== undefined) upsert.run('companyEmail', body.companyEmail);
    if (body.bankAccount !== undefined) upsert.run('bankAccount', body.bankAccount);
    if (body.bankName !== undefined) upsert.run('bankName', body.bankName);
    if (body.quoteFooterNote !== undefined) upsert.run('quoteFooterNote', body.quoteFooterNote);
    if (body.defaultProfitMargin !== undefined) upsert.run('defaultProfitMargin', String(body.defaultProfitMargin));
    if (body.defaultVatPercent !== undefined) upsert.run('defaultVatPercent', String(body.defaultVatPercent));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
