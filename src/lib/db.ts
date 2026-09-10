import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'printcal.db');
let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(dbPath);
    _db.exec('PRAGMA journal_mode = WAL;');
    _db.exec('PRAGMA foreign_keys = ON;');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS paper_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      gsm INTEGER NOT NULL,
      parent_width_cm REAL NOT NULL,
      parent_height_cm REAL NOT NULL,
      price_above_500 REAL NOT NULL DEFAULT 0,
      price_below_500 REAL NOT NULL DEFAULT 0,
      price_per_ram REAL NOT NULL DEFAULT 0,
      price_per_kg REAL NOT NULL DEFAULT 0,
      supplier TEXT NOT NULL DEFAULT 'Thuận Phát',
      unit TEXT NOT NULL DEFAULT 'ram',
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offset_machines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      max_width_mm REAL NOT NULL,
      max_height_mm REAL NOT NULL,
      min_width_mm REAL NOT NULL,
      min_height_mm REAL NOT NULL,
      plate_price REAL NOT NULL,
      setup_cost REAL NOT NULL,
      step_cost REAL NOT NULL,
      default_waste_sheets INTEGER NOT NULL,
      gripper_margin_mm REAL NOT NULL DEFAULT 10,
      base_impressions INTEGER NOT NULL DEFAULT 3000,
      includes_plate INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS digital_machines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      max_width_mm REAL NOT NULL,
      max_height_mm REAL NOT NULL,
      click_a4_1side REAL NOT NULL,
      click_a4_2side REAL NOT NULL,
      click_a3_1side REAL NOT NULL,
      click_a3_2side REAL NOT NULL,
      default_waste_sheets INTEGER NOT NULL DEFAULT 3,
      min_charge REAL NOT NULL DEFAULT 20000,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS finishing_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      calc_type TEXT NOT NULL,
      unit_price REAL NOT NULL,
      min_price REAL NOT NULL DEFAULT 0,
      setup_fee REAL NOT NULL DEFAULT 0,
      waste_percent REAL NOT NULL DEFAULT 0,
      waste_sheets INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      company TEXT,
      address TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quotes_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      customer_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      customer_company TEXT,
      job_name TEXT NOT NULL,
      product_type TEXT NOT NULL,
      print_tech TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      width_mm REAL NOT NULL,
      height_mm REAL NOT NULL,
      pages INTEGER NOT NULL DEFAULT 2,
      paper_name TEXT NOT NULL,
      paper_gsm INTEGER NOT NULL,
      parent_size TEXT NOT NULL,
      print_size TEXT NOT NULL,
      ups_per_sheet INTEGER NOT NULL,
      total_print_sheets INTEGER NOT NULL,
      total_parent_sheets INTEGER NOT NULL,
      paper_cost REAL NOT NULL,
      print_cost REAL NOT NULL,
      finishing_cost REAL NOT NULL,
      total_cost REAL NOT NULL,
      profit_margin_percent REAL NOT NULL,
      profit_amount REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      vat_percent REAL NOT NULL DEFAULT 0,
      vat_amount REAL NOT NULL DEFAULT 0,
      final_price REAL NOT NULL,
      unit_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'quote',
      notes TEXT,
      spec_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  try {
    db.exec('ALTER TABLE offset_machines ADD COLUMN base_impressions INTEGER NOT NULL DEFAULT 3000;');
  } catch {}
  try {
    db.exec('ALTER TABLE offset_machines ADD COLUMN includes_plate INTEGER NOT NULL DEFAULT 1;');
  } catch {}

  // Migrations for paper_types
  try {
    const cols = db.prepare('PRAGMA table_info(paper_types)').all() as { name: string }[];
    const colNames = cols.map((c) => c.name);
    if (!colNames.includes('supplier')) {
      db.exec("ALTER TABLE paper_types ADD COLUMN supplier TEXT NOT NULL DEFAULT 'Thuận Phát';");
    }
    if (!colNames.includes('price_above_500')) {
      db.exec('ALTER TABLE paper_types ADD COLUMN price_above_500 REAL NOT NULL DEFAULT 0;');
    }
    if (!colNames.includes('price_below_500')) {
      db.exec('ALTER TABLE paper_types ADD COLUMN price_below_500 REAL NOT NULL DEFAULT 0;');
    }
  } catch {}

  // Seed default data if empty
  seedDefaultData(db);
}

function seedDefaultData(db: DatabaseSync) {
  const paperCount = db.prepare('SELECT COUNT(*) as cnt FROM paper_types').get() as { cnt: number };
  if (paperCount.cnt < 120) {
    if (paperCount.cnt > 0) {
      db.exec('DELETE FROM paper_types;');
    }
    const jsonPath = path.join(process.cwd(), 'data', 'papers_t9_26.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const rawJson = fs.readFileSync(jsonPath, 'utf-8');
        const papersData = JSON.parse(rawJson);
        const insertPaper = db.prepare(`
          INSERT INTO paper_types (code, name, gsm, parent_width_cm, parent_height_cm, price_above_500, price_below_500, price_per_ram, price_per_kg, supplier, unit, description, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const p of papersData) {
          insertPaper.run(
            p.code,
            p.name,
            p.gsm,
            p.parent_width_cm,
            p.parent_height_cm,
            p.price_above_500,
            p.price_below_500,
            p.price_per_ram || p.price_above_500,
            p.price_per_kg || 0,
            p.supplier || 'Thuận Phát',
            p.unit || 'ram',
            p.description || '',
            p.is_active ?? 1
          );
        }
      } catch (err) {
        console.error('Error seeding papers from json:', err);
      }
    }
  }

  const hasTargetOffset = db.prepare("SELECT COUNT(*) as cnt FROM offset_machines WHERE name LIKE '%dưới 65x43cm%'").get() as { cnt: number };
  if (hasTargetOffset.cnt === 0) {
    db.exec('DELETE FROM offset_machines;');
    const insertOffset = db.prepare(`
      INSERT INTO offset_machines (name, max_width_mm, max_height_mm, min_width_mm, min_height_mm, plate_price, setup_cost, step_cost, default_waste_sheets, gripper_margin_mm, base_impressions, includes_plate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Máy khổ nhỏ dưới 65x43cm: 900.000đ trọn gói <= 3000 lượt (đã gồm kẽm 4 màu)
    insertOffset.run(
      'Máy Offset Khổ Nhỏ (dưới 65x43cm)',
      650,
      430,
      210,
      297,
      75000,
      900000,
      150000,
      80,
      10,
      3000,
      1
    );

    // Máy khổ 65x86cm bắt nhíp chiều 86: 1.200.000đ trọn gói <= 3000 lượt (đã gồm kẽm 4 màu)
    insertOffset.run(
      'Máy Offset Khổ 65x86cm (Bắt nhíp chiều 86)',
      860,
      650,
      430,
      650,
      100000,
      1200000,
      200000,
      100,
      10,
      3000,
      1
    );
  }

  const digitalCount = db.prepare('SELECT COUNT(*) as cnt FROM digital_machines').get() as { cnt: number };
  if (digitalCount.cnt === 0) {
    const insertDigital = db.prepare(`
      INSERT INTO digital_machines (name, max_width_mm, max_height_mm, click_a4_1side, click_a4_2side, click_a3_1side, click_a3_2side, default_waste_sheets, min_charge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDigital.run('Máy In Nhanh KTS Konica / Ricoh Pro (Khổ A3+ 33x48)', 488, 330, 1200, 2200, 2400, 4200, 3, 20000);
    insertDigital.run('Máy In Nhanh Fuji Xerox Versant 3100 (Cao Cấp)', 660, 330, 1500, 2800, 3000, 5400, 3, 30000);
  }

  const finishingCount = db.prepare('SELECT COUNT(*) as cnt FROM finishing_services').get() as { cnt: number };
  if (finishingCount.cnt === 0) {
    const insertFinishing = db.prepare(`
      INSERT INTO finishing_services (code, name, category, calc_type, unit_price, min_price, setup_fee, waste_percent, waste_sheets, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const finishings = [
      // Cán màng (per_m2)
      ['CAN_MANG_MO', 'Cán màng mờ nhiệt', 'can_mang', 'per_m2', 850, 80000, 0, 1.5, 10, 1],
      ['CAN_MANG_BONG', 'Cán màng bóng nhiệt', 'can_mang', 'per_m2', 800, 80000, 0, 1.5, 10, 1],
      ['CAN_MANG_METALIZE', 'Cán màng Metalize bạc/vàng', 'can_mang', 'per_m2', 3500, 250000, 0, 2.5, 20, 1],

      // Cắt bế định hình (die_cut)
      ['BE_THANH_PHAM', 'Làm khuôn bế & Công bế hộp/túi/thẻ', 'be', 'die_cut', 150, 150000, 220000, 2.0, 30, 1],
      ['BE_DEMI_DECAL', 'Bế demi decal tem nhãn (đứt decal)', 'be', 'die_cut', 120, 120000, 180000, 1.5, 15, 1],

      // Cấn & Gấp (per_product)
      ['CAN_GAP_1_DUONG', 'Cấn 1 đường & Gấp đôi (Flyer)', 'can_gap', 'per_product', 80, 50000, 0, 0.5, 10, 1],
      ['CAN_GAP_2_DUONG', 'Cấn 2 đường & Gấp 3 (Brochure ziczac/lồng)', 'can_gap', 'per_product', 140, 70000, 0, 1.0, 15, 1],

      // Ép kim & Dập nổi (ep_kim)
      ['EP_KIM_LOGO', 'Ép kim nhũ vàng/bạc logo (khuôn kẽm)', 'ep_kim', 'per_product', 200, 150000, 180000, 2.0, 25, 1],
      ['DAP_NOI_LOGO', 'Dập nổi/dập chìm logo (nổi khối 3D)', 'ep_kim', 'per_product', 180, 150000, 160000, 1.5, 20, 1],

      // Phủ UV (phu_uv)
      ['PHU_UV_DINH_HINH', 'Phủ UV định hình (Spot UV)', 'phu_uv', 'per_product', 350, 250000, 200000, 2.0, 30, 1],

      // Cắt xén (fixed)
      ['XEN_THANH_PHAM', 'Xén thành phẩm đóng gói', 'khac', 'fixed', 30000, 30000, 0, 0.2, 5, 1],
      ['BO_GOC_NAMECARD', 'Bo 4 góc (Namecard/Thẻ tích điểm)', 'khac', 'per_product', 50, 40000, 0, 0.5, 5, 1],

      // Đóng cuốn & Dán (dong_cuon / dan)
      ['DONG_GHIM_LONG', 'Đóng 2 ghim lồng giữa (Tạp chí, catalogue)', 'dong_cuon', 'per_product', 350, 80000, 0, 1.0, 10, 1],
      ['DAN_GAY_KEO_NHIET', 'Dán keo nhiệt gáy sách vuông vắn', 'dong_cuon', 'per_product', 2500, 200000, 0, 1.5, 15, 1],
      ['DONG_LO_XO', 'Đóng gáy lò xo kẽm trắng/đen', 'dong_cuon', 'per_product', 4000, 150000, 0, 1.0, 10, 1],
      ['DAN_HOP_TU_DONG', 'Dán dính mép hộp giấy', 'dan', 'per_product', 250, 150000, 0, 1.0, 20, 1],
      ['DAN_DAY_TUI_GIAY', 'Gấp dán túi giấy & Xỏ dây quai dù', 'dan', 'per_product', 1500, 300000, 0, 1.5, 25, 1]
    ];

    for (const f of finishings) {
      insertFinishing.run(...f);
    }
  }

  const customerCount = db.prepare('SELECT COUNT(*) as cnt FROM customers').get() as { cnt: number };
  if (customerCount.cnt === 0) {
    const insertCustomer = db.prepare(`
      INSERT INTO customers (name, phone, email, company, address, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertCustomer.run('Anh Tuấn', '0912345678', 'tuan@vinatech.com', 'Công ty TNHH VinaTech', '123 Cầu Giấy, Hà Nội', 'Khách hàng thường xuyên in catalogue và tờ rơi');
    insertCustomer.run('Chị Lan', '0987654321', 'lan@beautycosmetics.vn', 'Mỹ Phẩm Trúc Lan', '456 Lê Lợi, Q.1, TP.HCM', 'Đặt in hộp mỹ phẩm và túi giấy Ivory');
    insertCustomer.run('Anh Hùng', '0903112233', 'hung@hungphat.vn', 'Hùng Phát Food', '789 Tân Bình, TP.HCM', 'Chuyên in decal tem nhãn số lượng lớn');
  }

  const settingsCount = db.prepare('SELECT COUNT(*) as cnt FROM system_settings').get() as { cnt: number };
  if (settingsCount.cnt === 0) {
    const insertSetting = db.prepare(`INSERT INTO system_settings (key, value) VALUES (?, ?)`);
    insertSetting.run('companyName', 'XƯỞNG IN ẤN & THIẾT KẾ PRINTCAL');
    insertSetting.run('companyAddress', 'Tòa nhà PrintCal, Số 123 Đường In Ấn, TP.HCM');
    insertSetting.run('companyPhone', '0900.888.999 - 028.3888.9999');
    insertSetting.run('companyEmail', 'baogia@printcal.vn');
    insertSetting.run('bankAccount', '19038889999999 - Techcombank (CN TP.HCM) - CTK: PRINTCAL VIETNAM');
    insertSetting.run('bankName', 'Techcombank Chi nhánh TP.HCM');
    insertSetting.run('quoteFooterNote', '1. Báo giá có hiệu lực trong vòng 15 ngày.\n2. Giá trên chưa bao gồm phí vận chuyển ngoại tỉnh.\n3. Thời gian giao hàng tính từ lúc duyệt bản in mẫu và đặt cọc 50%.\n4. Đảm bảo chất lượng màu sắc chuẩn theo file thiết kế.');
    insertSetting.run('defaultProfitMargin', '25');
    insertSetting.run('defaultVatPercent', '8');
  }
}
