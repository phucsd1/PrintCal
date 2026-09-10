import sqlite3
import json
import os

db_path = "data/printcal.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Create digital_pricing_giacong
cur.execute("""
CREATE TABLE IF NOT EXISTS digital_pricing_giacong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_name TEXT NOT NULL,
    sheet_size TEXT NOT NULL UNIQUE,
    width_mm REAL NOT NULL,
    height_mm REAL NOT NULL,
    paper_lt_249 REAL NOT NULL,
    paper_250_349 REAL NOT NULL,
    paper_350_450 REAL NOT NULL,
    decal_paper_plastic REAL NOT NULL,
    decal_clear REAL NOT NULL,
    synthetic_paper REAL NOT NULL,
    pvc_plastic REAL NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
""")

# 2. Create digital_pricing_kem_giay
cur.execute("""
CREATE TABLE IF NOT EXISTS digital_pricing_kem_giay (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_code TEXT NOT NULL UNIQUE,
    paper_name TEXT NOT NULL,
    gsm INTEGER NOT NULL,
    sheet_size TEXT NOT NULL,
    width_mm REAL NOT NULL,
    height_mm REAL NOT NULL,
    price_1side REAL NOT NULL,
    price_2side REAL NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
""")

# 3. Data for In Gia Cong (Konica C12000 / C12010S 5 Mau - Trang 2 PDF)
giacong_data = [
    # machine_name, sheet_size, w, h, lt249, 250-349, 350-450, decal, decal_trong, giay_nhua, pvc
    ("KONICA C12000 / C12010S 5 MÀU", "A4", 210, 297, 600, 800, 1000, 1200, 1500, 1000, 1500),
    ("KONICA C12000 / C12010S 5 MÀU", "330x355", 330, 355, 800, 1000, 1800, 1500, 1700, 1800, 2000),
    ("KONICA C12000 / C12010S 5 MÀU", "A3", 297, 420, 1200, 1600, 2100, 2100, 2300, 2100, 2500),
    ("KONICA C12000 / C12010S 5 MÀU", "330x483", 330, 483, 2000, 2500, 2700, 2500, 2800, 2700, 3000),
    ("KONICA C12000 / C12010S 5 MÀU", "330x1200", 330, 1200, 4000, 7000, 10000, 6000, 7500, 15000, 0),
]

cur.execute("DELETE FROM digital_pricing_giacong;")
cur.executemany("""
INSERT INTO digital_pricing_giacong (machine_name, sheet_size, width_mm, height_mm, paper_lt_249, paper_250_349, paper_350_450, decal_paper_plastic, decal_clear, synthetic_paper, pvc_plastic)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
""", giacong_data)

# 4. Data for In Nhanh Kem Giay (INTC - PDF In Nhanh 14.03.2026)
kem_giay_data = [
    # code, name, gsm, sheet_size, w, h, p1, p2
    ("C100", "Couche 100gsm", 100, "325x430", 325, 430, 1600, 2800),
    ("C120", "Couche 120gsm", 120, "325x430", 325, 430, 1700, 2900),
    ("C150", "Couche 150gsm", 150, "325x430", 325, 430, 1800, 3000),
    ("C200", "Couche 200gsm", 200, "325x430", 325, 430, 1900, 3100),
    ("C250", "Couche 250gsm", 250, "325x430", 325, 430, 2100, 3300),
    ("C300", "Couche 300gsm", 300, "325x430", 325, 430, 2700, 4300),
    ("I250", "Ivory 250gsm", 250, "325x430", 325, 430, 2100, 3300),
    ("I300", "Ivory 300gsm", 300, "325x430", 325, 430, 2600, 4200),
    ("I350", "Ivory 350gsm", 350, "325x430", 325, 430, 3300, 5300),
    ("F100", "Fort 100gsm", 100, "325x430", 325, 430, 1600, 2800),
    ("F120", "Fort 120gsm", 120, "325x430", 325, 430, 1700, 2900),
    ("F180", "Fort 180gsm", 180, "325x430", 325, 430, 1900, 3100),
    ("F230", "Fort 230gsm", 230, "325x430", 325, 430, 2100, 3300),
    ("F250", "Fort 250gsm", 250, "325x430", 325, 430, 2300, 3500),
    ("F180_355", "Fort 180gsm (325x355)", 180, "325x355", 325, 355, 1400, 2200),
    ("F230_355", "Fort 230gsm (325x355)", 230, "325x355", 325, 355, 1500, 2300),
]

cur.execute("DELETE FROM digital_pricing_kem_giay;")
cur.executemany("""
INSERT INTO digital_pricing_kem_giay (paper_code, paper_name, gsm, sheet_size, width_mm, height_mm, price_1side, price_2side)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
""", kem_giay_data)

conn.commit()
print("Saved tables to SQLite successfully!")

# Export to JSON
with open("data/digital_pricing_giacong.json", "w", encoding="utf-8") as f:
    json.dump([
        {
            "machine_name": r[0], "sheet_size": r[1], "width_mm": r[2], "height_mm": r[3],
            "paper_lt_249": r[4], "paper_250_349": r[5], "paper_350_450": r[6],
            "decal_paper_plastic": r[7], "decal_clear": r[8], "synthetic_paper": r[9], "pvc_plastic": r[10]
        }
        for r in giacong_data
    ], f, ensure_ascii=False, indent=2)

with open("data/digital_pricing_kem_giay.json", "w", encoding="utf-8") as f:
    json.dump([
        {
            "paper_code": r[0], "paper_name": r[1], "gsm": r[2], "sheet_size": r[3],
            "width_mm": r[4], "height_mm": r[5], "price_1side": r[6], "price_2side": r[7]
        }
        for r in kem_giay_data
    ], f, ensure_ascii=False, indent=2)

print("Exported JSON files successfully!")
