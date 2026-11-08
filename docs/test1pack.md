# Hướng dẫn Kiểm thử Quy trình 1 Đơn hàng (1-Pack Test)

Bản hướng dẫn này giúp bạn kiểm tra toàn bộ luồng hoạt động của hệ thống Livemove từ lúc khởi tạo đến khi hoàn thành, áp dụng cho cả 3 đối tượng: **Admin**, **Khách hàng**, và **Tài xế**.

---

## 🛠️ Chuẩn bị (Setup)
Trước tiên, hãy đảm bảo hệ thống đang chạy:
1. Mở Terminal tại `d:\Livemove\web-admin` và chạy `npm run dev`.
2. Truy cập: `http://localhost:5173` (đăng nhập bằng tài khoản Admin).

---

## 🏃 Quy trình Kiểm thử 6 Bước

### Bước 1: Khởi tạo "Nhân vật" (Admin)
- Truy cập mục **Quản lý tài xế**.
- Nhấn **Thêm tài xế mới**.
- Nhập tên: `Tài xế A`, SĐT: `0901112223`, Biển số: `59A-12345`.
- Đảm bảo tài xế này đang ở trạng thái **Online** (Trực tuyến).

### Bước 2: Tạo đơn hàng (Khách hàng/Admin)
- Truy cập mục **Quản lý đơn hàng**.
- Nhấn **Khởi tạo đơn vận chuyển**.
- Nhập thông tin:
  - Khách hàng: `Chị Mai`.
  - SĐT: `0988887776`.
  - Địa chỉ lấy: `Sân bay Tân Sơn Nhất`.
  - Địa chỉ giao: `Quận 1, TP.HCM`.
- Tại mục "Chọn tài xế", hãy chọn **Tài xế A** (vừa tạo ở Bước 1).
- Nhấn **Khởi tạo & Gán đơn**.

### Bước 3: Theo dõi thời gian thực (Admin/Khách hàng)
- Truy cập mục **Bản đồ trực tuyến**.
- Bạn sẽ thấy icon **Tài xế A** xuất hiện trên bản đồ.
- Trong cơ chế hiện tại (Phase 5), hệ thống đang mô phỏng việc tài xế di chuyển từ điểm lấy hàng đến điểm giao hàng.
- Bạn có thể thấy tọa độ tài xế thay đổi liên tục trên bản đồ và trong cột thông báo bên phải.

### Bước 4: Kiểm tra Dashboard (Admin)
- Quay lại trang **Tổng quan (Dashboard)**.
- Kiểm tra xem thẻ **Tổng đơn hàng** có tăng lên 1 không.
- Kiểm tra xem danh sách **Đơn hàng gần đây** có hiển thị đơn của `Chị Mai` không.
- Thẻ **Tài xế Online** phải hiển thị số `1`.

### Bước 5: Cập nhật trạng thái (Tài xế - Giả lập)
- Hiện tại trang Web Admin cho phép bạn giả lập hành động này:
- Click vào đơn hàng của `Chị Mai` trong danh sách đơn hàng.
- Trạng thái sẽ chuyển từ **Chờ gán** -> **Đang chuyển**.
- Sau một thời gian di chuyển mô phỏng, hãy chuyển trạng thái sang **Hoàn thành**.

### Bước 6: Tổng kết & Doanh thu (Admin)
- Quay lại Dashboard.
- Thẻ **Đã hoàn thành** sẽ tăng thêm 1.
- Biểu đồ **Đơn hàng hoàn thành** sẽ xuất hiện 1 điểm dữ liệu mới.
- Luồng hoạt động kết thúc thành công.

---

## 🔍 Tiêu chí Hoàn thành (Checklist)
- [ ] Tài xế xuất hiện trên bản đồ ngay sau khi Online.
- [ ] Đơn hàng tạo xong hiển thị đúng thông tin khách hàng và tài xế đã chọn.
- [ ] Bản đồ cập nhật vị trí mỗi 3-5 giây (Smooth movement).
- [ ] Dashboard cập nhật số liệu ngay lập tức (Real-time reactivity).
- [ ] Có thông báo "Thành công" khi thao tác.

---
> [!TIP]
> Bạn có thể mở 2 tab trình duyệt cùng lúc: một tab xem **Bản đồ** và một tab **Tạo đơn hàng** để thấy tài xế được kích hoạt di chuyển ngay khi đơn hàng được tạo!
