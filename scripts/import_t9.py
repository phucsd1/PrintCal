import openpyxl
import sqlite3
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('C:/Users/admin/Downloads/BG Thu\u1eadn  Ph\u00e1t T9.26.xlsx', data_only=True)
ws = wb['Trang 2']

type_map = {
    'I': 'Ivory',
    'C': 'Couche',
    'F': 'Fort',
    'D': 'Duplex',
    'B': 'Bristol',
}

papers = []
for r in range(6, 131):
    vals = [ws.cell(r, c).value for c in range(1, 11)]
    code_raw = str(vals[1]).strip()
    prefix = code_raw[0].upper()
    gsm = int(vals[2])
    w = int(vals[3])
    h = int(vals[4])
    brand = str(vals[5]).strip() if vals[5] else ''
    p_above_500 = float(vals[7]) if vals[7] else 0.0
    p_below_500 = float(vals[9]) if vals[9] else 0.0

    type_name = type_map.get(prefix, 'Giấy ' + prefix)
    full_name = f'{type_name} {gsm}gsm ({w}x{h}cm)'
    if brand:
        full_name += f' - {brand}'

    clean_brand = brand.replace(' ', '').replace('-', '_')
    code = f'{code_raw}_{w}x{h}_{clean_brand}' if clean_brand else f'{code_raw}_{w}x{h}'
    desc = f'Hiệu {brand} (BG Thuận Phát T9/2026)'

    papers.append({
        'code': code,
        'name': full_name,
        'gsm': gsm,
        'parent_width_cm': w,
        'parent_height_cm': h,
        'price_above_500': p_above_500,
        'price_below_500': p_below_500,
        'price_per_ram': p_above_500,
        'price_per_kg': 0,
        'supplier': 'Thuận Phát',
        'unit': 'ram',
        'description': desc,
        'is_active': 1
    })

print(f'Parsed {len(papers)} papers.')

db_path = os.path.join(os.getcwd(), 'data', 'printcal.db')
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Check and add columns
c.execute('PRAGMA table_info(paper_types)')
cols = [col[1] for col in c.fetchall()]

if 'supplier' not in cols:
    c.execute("ALTER TABLE paper_types ADD COLUMN supplier TEXT NOT NULL DEFAULT 'Thuận Phát'")
if 'price_above_500' not in cols:
    c.execute("ALTER TABLE paper_types ADD COLUMN price_above_500 REAL NOT NULL DEFAULT 0")
if 'price_below_500' not in cols:
    c.execute("ALTER TABLE paper_types ADD COLUMN price_below_500 REAL NOT NULL DEFAULT 0")

# Clear old papers and insert 125 new papers
c.execute('DELETE FROM paper_types')

for p in papers:
    c.execute("""
        INSERT INTO paper_types (code, name, gsm, parent_width_cm, parent_height_cm, price_above_500, price_below_500, price_per_ram, price_per_kg, supplier, unit, description, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        p['code'], p['name'], p['gsm'], p['parent_width_cm'], p['parent_height_cm'],
        p['price_above_500'], p['price_below_500'], p['price_per_ram'], p['price_per_kg'],
        p['supplier'], p['unit'], p['description'], p['is_active']
    ))

conn.commit()
print('Successfully inserted 125 papers into data/printcal.db!')

# Verification
c.execute('SELECT count(*), supplier FROM paper_types GROUP BY supplier')
print('DB Verification:', c.fetchall())

# Save to a json file for easy import in db.ts
json_path = os.path.join(os.getcwd(), 'data', 'papers_t9_26.json')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(papers, f, ensure_ascii=False, indent=2)
print('Saved data/papers_t9_26.json!')
