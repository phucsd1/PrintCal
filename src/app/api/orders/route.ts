import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { OrderStatus, ProductType, QuoteOrder } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM quotes_orders WHERE 1=1';
    const params: unknown[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (code LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR job_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY id DESC';

    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
    const orders: QuoteOrder[] = rows.map((r) => mapOrder(r));

    return NextResponse.json(orders);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    // Sinh mã đơn hàng tự động: PC-YYYYMM-XXX
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const countRow = db.prepare('SELECT COUNT(*) as count FROM quotes_orders WHERE code LIKE ?').get(`PC-${yearMonth}-%`) as { count: number };
    const nextNum = String(countRow.count + 1).padStart(3, '0');
    const code = body.code || `PC-${yearMonth}-${nextNum}`;

    // Tự động thêm hoặc cập nhật khách hàng
    let customerId = body.customerId;
    if (!customerId && body.customerPhone) {
      const existingCust = db.prepare('SELECT id FROM customers WHERE phone = ?').get(body.customerPhone) as { id: number } | undefined;
      if (existingCust) {
        customerId = existingCust.id;
      } else if (body.customerName) {
        const custResult = db.prepare(`
          INSERT INTO customers (name, phone, email, company)
          VALUES (?, ?, ?, ?)
        `).run(body.customerName, body.customerPhone, body.customerEmail || '', body.customerCompany || '');
        customerId = Number(custResult.lastInsertRowid);
      }
    }

    const stmt = db.prepare(`
      INSERT INTO quotes_orders (
        code, customer_id, customer_name, customer_phone, customer_email, customer_company,
        job_name, product_type, print_tech, quantity, width_mm, height_mm, pages,
        paper_name, paper_gsm, parent_size, print_size, ups_per_sheet,
        total_print_sheets, total_parent_sheets, paper_cost, print_cost, finishing_cost,
        total_cost, profit_margin_percent, profit_amount, discount_amount,
        vat_percent, vat_amount, final_price, unit_price, status, notes, spec_json
      )
      VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const result = stmt.run(
      code,
      customerId || null,
      body.customerName || 'Khách vãng lai',
      body.customerPhone || '',
      body.customerEmail || '',
      body.customerCompany || '',
      body.jobName || 'In ấn phẩm',
      body.productType || 'to_roi',
      body.printTech || 'offset',
      body.quantity,
      body.widthMm,
      body.heightMm,
      body.pages || 2,
      body.paperName,
      body.paperGsm,
      body.parentSize || '',
      body.printSize || '',
      body.upsPerSheet || 1,
      body.totalPrintSheets || 0,
      body.totalParentSheets || 0,
      body.paperCost || 0,
      body.printCost || 0,
      body.finishingCost || 0,
      body.totalCost || 0,
      body.profitMarginPercent || 25,
      body.profitAmount || 0,
      body.discountAmount || 0,
      body.vatPercent || 0,
      body.vatAmount || 0,
      body.finalPrice || 0,
      body.unitPrice || 0,
      body.status || 'quote',
      body.notes || '',
      body.specJson ? JSON.stringify(body.specJson) : null
    );

    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid), code });
  } catch (err: unknown) {
    console.error('Order save error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    if (body.action === 'status') {
      db.prepare(`
        UPDATE quotes_orders
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(body.status, body.id);
    } else {
      db.prepare(`
        UPDATE quotes_orders
        SET customer_name = ?, customer_phone = ?, customer_email = ?, customer_company = ?,
            job_name = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        body.customerName,
        body.customerPhone,
        body.customerEmail || '',
        body.customerCompany || '',
        body.jobName,
        body.status,
        body.notes || '',
        body.id
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu ID đơn hàng' }, { status: 400 });

    const db = getDb();
    db.prepare('DELETE FROM quotes_orders WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

function mapOrder(r: Record<string, unknown>): QuoteOrder {
  return {
    id: r.id as number,
    code: r.code as string,
    customerId: r.customer_id as number | undefined,
    customerName: r.customer_name as string,
    customerPhone: r.customer_phone as string,
    customerEmail: (r.customer_email as string) || '',
    customerCompany: (r.customer_company as string) || '',
    jobName: r.job_name as string,
    productType: r.product_type as ProductType,
    printTech: r.print_tech as 'offset' | 'digital',
    quantity: r.quantity as number,
    widthMm: r.width_mm as number,
    heightMm: r.height_mm as number,
    pages: r.pages as number,
    paperName: r.paper_name as string,
    paperGsm: r.paper_gsm as number,
    parentSize: r.parent_size as string,
    printSize: r.print_size as string,
    upsPerSheet: r.ups_per_sheet as number,
    totalPrintSheets: r.total_print_sheets as number,
    totalParentSheets: r.total_parent_sheets as number,
    paperCost: r.paper_cost as number,
    printCost: r.print_cost as number,
    finishingCost: r.finishing_cost as number,
    totalCost: r.total_cost as number,
    profitMarginPercent: r.profit_margin_percent as number,
    profitAmount: r.profit_amount as number,
    discountAmount: r.discount_amount as number,
    vatPercent: r.vat_percent as number,
    vatAmount: r.vat_amount as number,
    finalPrice: r.final_price as number,
    unitPrice: r.unit_price as number,
    status: r.status as OrderStatus,
    notes: (r.notes as string) || '',
    specJson: (r.spec_json as string) || '',
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}
