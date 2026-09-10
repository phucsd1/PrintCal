import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

for path, name in [
    (r"C:\Users\admin\Downloads\BẢNG GIÁ IN NHANH 14.03.2026.pdf", "PDF 1"),
    (r"C:\Users\admin\Downloads\BẢNG GIÁ IN GIA CÔNG 26.02.2026.pdf", "PDF 2")
]:
    print(f"\n*** Checking {name}: {path} ***")
    doc = fitz.open(path)
    for p_idx, page in enumerate(doc):
        imgs = page.get_images()
        text = page.get_text()
        drawings = page.get_drawings()
        print(f"Page {p_idx+1}: text_len={len(text)}, images_count={len(imgs)}, drawings_count={len(drawings)}")
        for img_idx, img in enumerate(imgs):
            xref = img[0]
            base_img = doc.extract_image(xref)
            print(f"  Image {img_idx+1}: xref={xref}, ext={base_img['ext']}, width={base_img['width']}, height={base_img['height']}")
