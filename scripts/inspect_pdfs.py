import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf1_path = r"C:\Users\admin\Downloads\BẢNG GIÁ IN NHANH 14.03.2026.pdf"
pdf2_path = r"C:\Users\admin\Downloads\BẢNG GIÁ IN GIA CÔNG 26.02.2026.pdf"

print("==================================================")
print("=== PDF 1: BẢNG GIÁ IN NHANH 14.03.2026.pdf ===")
print("==================================================")
try:
    doc1 = fitz.open(pdf1_path)
    print("Number of pages in PDF 1:", len(doc1))
    for i, page in enumerate(doc1):
        print(f"\n--- PDF 1 - Page {i+1} ---")
        text = page.get_text()
        print(text[:2000])
        if len(text) > 2000:
            print(f"... [Total length: {len(text)} chars]")
except Exception as e:
    print("Error reading PDF 1:", e)

print("\n==================================================")
print("=== PDF 2: BẢNG GIÁ IN GIA CÔNG 26.02.2026.pdf ===")
print("==================================================")
try:
    doc2 = fitz.open(pdf2_path)
    print("Number of pages in PDF 2:", len(doc2))
    for i, page in enumerate(doc2):
        print(f"\n--- PDF 2 - Page {i+1} ---")
        text = page.get_text()
        print(text[:2000])
        if len(text) > 2000:
            print(f"... [Total length: {len(text)} chars]")
except Exception as e:
    print("Error reading PDF 2:", e)
