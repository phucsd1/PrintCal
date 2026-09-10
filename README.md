---
title: PrintCal
emoji: 🖨️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 3000
pinned: false
license: mit
short_description: Smart Offset & Digital Print Pricing Calculator
---

# 🖨️ PrintCal - Công Cụ Tính Giá In Offset & In Nhanh Thông Minh

**PrintCal** là hệ thống phần mềm chuyên nghiệp phục vụ tính toán chi phí in ấn (Offset & In Nhanh Kỹ Thuật Số), tích hợp thuật toán bình trang cắt giấy 2D, phân tích điểm hòa vốn, cùng cơ sở dữ liệu SQLite quản lý đơn hàng, kho giá giấy, bảng giá in và gia công sau in.

---

## 🌟 Tính Năng Cốt Lõi

### 1. ⚡ Máy Tính Giá In Thông Minh (Smart Calculator)
- **Mẫu ấn phẩm 1-click (Presets)**: Tờ rơi A4, A5, Namecard, Brochure gấp 3, Hộp mỹ phẩm, Túi giấy Kraft, Decal tem nhãn...
- **Thuật toán bình trang & Cắt giấy 2D (`imposition.ts`)**: Tự động tính số con (ups) tối ưu trên tờ in máy, tự động tìm cách chia từ các khổ giấy mẹ (65x86, 79x109, 60x84...).
- **Bản vẽ 2D trực quan bằng SVG**: Hiển thị rõ vùng kẹp nhíp (10mm), đường xén thành phẩm, đánh số thứ tự từng con `#1, #2...`, và tỷ lệ tận dụng diện tích giấy.
- **Bù hao thông minh**: Tự động cộng bù hao canh màu kẽm Offset (80–120 tờ), bù hao in nhanh (3–5 tờ), và bù hao lũy tiến theo từng khâu gia công.
- **Quy đổi định lượng**: Tự động tính số tờ in, số tờ giấy mẹ, quy đổi ra **Số Ram (500 tờ)** hoặc **Số Kg** theo định lượng GSM.

### 2. 📊 Phân Tích Hòa Vốn & So Sánh Công Nghệ In (Break-even Engine)
- Tự động so sánh chi phí giữa **In Nhanh KTS (Click)** và **In Offset (Kẽm + Công Máy)** theo các mốc số lượng thực tế.
- Biểu đồ trực quan chỉ rõ điểm hòa vốn (Break-even crossover) và đưa ra lời khuyên công nghệ in nào tiết kiệm chi phí nhất theo đơn hàng.

### 3. 💾 Cơ Sở Dữ Liệu SQLite Native Quản Lý Đơn Hàng & Giá Cả
- Lưu trữ bền vững tại file `data/printcal.db` (dễ dàng sao lưu, không cần cài đặt SQL Server phức tạp).
- **Kho Giá Giấy**: Đã nạp sẵn bảng giá chuẩn ngành in Việt Nam (Couche C100-C300, Ivory, Bristol, Ford, Kraft, Decal...).
- **Bảng Giá Máy In**: Quản lý giá xuất kẽm CTP, phí mở máy in, giá lũy tiến /1.000 lượt ép, đơn giá click in nhanh A4/A3.
- **Bảng Giá Gia Công Sau In**: 17+ công đoạn (cán màng bóng/mờ/metalize, cấn, bế demi/đứt, ép kim, dập nổi 3D, phủ UV, đóng ghim, dán gáy sách, dán hộp...).
- **Quản Lý Đơn Hàng & Báo Giá**: Tự động sinh mã đơn `PC-YYYYMM-XXX`, theo dõi tiến độ sản xuất 6 bước (Báo giá ➔ Duyệt ➔ In máy ➔ Gia công ➔ Hoàn thành ➔ Giao hàng).

### 4. 📄 Xuất Bản & In Ấn Chuẩn A4
- **Phiếu Báo Giá Khách Hàng**: Đầy đủ thông tin nhà in, quy cách ấn phẩm, bảng giá, thuế VAT, số tài khoản thanh toán và điều khoản giao nhận.
- **Lệnh Sản Xuất Xưởng In**: Phiếu kỹ thuật dành riêng cho xưởng in ghi rõ khổ cắt giấy mẹ, số ram, số kẽm CTP, số lượt ép và danh mục gia công kèm chữ ký bàn giao thợ máy.
- **Nút Copy Báo Giá Zalo**: Tự động định dạng văn bản báo giá ngắn gọn, chuyên nghiệp để gửi trực tiếp cho khách qua Zalo/Messenger.

---

## 🚀 Khởi Chạy Ứng Dụng

### 1. Cài đặt và chạy cục bộ (Local Development)
Yêu cầu Node.js 22 trở lên:
```bash
git clone https://github.com/phucsd1/PrintCal.git
cd PrintCal
npm install
npm run dev
```
Truy cập: `http://localhost:3000`

### 2. Chạy với Docker
```bash
docker build -t printcal .
docker run -p 3000:3000 printcal
```

---

## 🛠️ Công Nghệ Sử Dụng
- **Frontend / Backend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Database**: Native `node:sqlite` (SQLite 3 không cần cài đặt ngoài)
- **Deployment**: Docker, Hugging Face Spaces, GitHub
