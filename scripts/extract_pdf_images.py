import fitz
import os

pdf1_path = r"C:\Users\admin\Downloads\BẢNG GIÁ IN NHANH 14.03.2026.pdf"
pdf2_path = r"C:\Users\admin\Downloads\BẢNG GIÁ IN GIA CÔNG 26.02.2026.pdf"

os.makedirs("scripts/extracted_images", exist_ok=True)

# Extract PDF 1 Page 1
doc1 = fitz.open(pdf1_path)
page1 = doc1[0]
pix1 = page1.get_pixmap(dpi=150)
pix1.save("scripts/extracted_images/in_nhanh_page1.png")
print("Saved in_nhanh_page1.png")

# Extract PDF 2 Page 2
doc2 = fitz.open(pdf2_path)
page2 = doc2[1] # 0-indexed page 2
pix2 = page2.get_pixmap(dpi=150)
pix2.save("scripts/extracted_images/in_gia_cong_page2.png")
print("Saved in_gia_cong_page2.png")

# Also let's extract page 1 and page 3 of PDF 2 just in case
doc2[0].get_pixmap(dpi=100).save("scripts/extracted_images/in_gia_cong_page1.png")
doc2[2].get_pixmap(dpi=100).save("scripts/extracted_images/in_gia_cong_page3.png")
print("Saved in_gia_cong_page1.png and page3.png")
