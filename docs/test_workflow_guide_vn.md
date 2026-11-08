# Hướng dẫn Kiểm thử Toàn diện Hệ thống Livemove

Tài liệu này hướng dẫn bạn cách kiểm tra toàn bộ luồng vận hành của hệ thống Livemove từ lúc tạo đơn hàng cho đến khi giao hàng thành công, bao gồm cả tính năng theo dõi thời gian thực và thông báo.

## Chuẩn bị
1. **Backend**: Đảm bảo server NestJS đang chạy (`npm run start:dev`).
2. **Web Admin**: Đẳng nhập với tài khoản Admin. (Mặc định: `admin@livemove.com` / `admin123`).
3. **App Driver**: Đăng nhập với tài khoản `driver@livemove.com` / `driver123`.
4. **App Customer**: Đăng nhập với tài khoản `customer@livemove.com` / `customer123`.

---

## Bước 1: Admin Khởi tạo Đơn hàng (Web)
1. Truy cập trang **Quản lý Đơn hàng**.
2. Nhấn **Tạo đơn hàng mới**.
3. **Quan trọng**: Nhập địa chỉ và **phải chọn từ danh sách gợi ý** để hệ thống lấy tọa độ GPS chính xác.
4. Chọn tài xế: **Trần Văn Tài** (tương ứng với account `driver@livemove.com`).
5. Nhấn **Khởi tạo & Gán đơn**.
6. **Kiểm tra**: Đơn hàng mới xuất hiện trong danh sách. Di chuột vào icon xe tải (cột QR Code) để thấy mã QR.

---

## Bước 2: Tài xế Nhận hàng (Mobile - Driver)
1. Trên App Tài xế, vuốt xuống để làm mới danh sách đơn hàng.
2. Đơn hàng vừa tạo sẽ xuất hiện. Nhấn vào biểu tượng **QR Code** màu xanh trên thẻ đơn hàng.
3. Sử dụng Camera để quét mã QR hiển thị trên màn hình Web Admin (hoặc app khách hàng).
4. **Kiểm tra**: 
   - Nếu quét thành công, app sẽ tự động chuyển sang màn hình **Bản đồ giao hàng**.
   - Trên Web Admin, trạng thái đơn sẽ đổi thành **Đã lấy hàng** (PICKED_UP).

---

## Bước 3: Theo dõi Thời gian thực (Mobile - Customer)
1. Trên App Khách hàng, đơn hàng sẽ chuyển sang trạng thái **Đang vận chuyển**.
2. Nhấn vào thẻ đơn hàng để vào màn hình **Theo dõi (Tracking)**.
3. **Kiểm tra**: 
   - Bạn sẽ thấy bản đồ với vị trí tài xế (icon xanh) và điểm giao (icon đỏ).
   - Thanh tiến trình bên dưới hiển thị % hoàn thành và thời gian ETA dự kiến.

### Cách Test Tính năng Di chuyển (Giả lập GPS):
Nếu bạn dùng máy ảo (Android Emulator):
1. Mở **Extended Controls** (dấu 3 chấm trên thanh công cụ máy ảo).
2. Chọn tab **Location**.
3. Tìm một địa điểm và nhấn **Set Location** liên tục để giả lập tài xế đang di chuyển.
4. **Kết quả**: 
   - Trên App Khách hàng, icon tài xế sẽ di chuyển mượt mà trên bản đồ.
   - Một **Thông báo cố định (Ongoing Notification)** sẽ xuất hiện trên thanh trạng thái điện thoại khách hàng, cập nhật % và thời gian liên tục.

---

## Bước 4: Hoàn tất Giao hàng
1. Trên App Tài xế, nhấn nút **Giao thành công**.
2. Xác nhận trong hộp thoại hiện lên.
3. **Kiểm tra**:
   - App Tài xế quay về màn hình chính.
   - App Khách hàng nhận được thông báo "Giao hàng thành công".
   - Trên Web Admin, trạng thái đơn hàng đổi thành **Đã giao** (DELIVERED).

---

## Lưu ý về Kỹ thuật
- **Socket.io**: Nếu không thấy icon tài xế di chuyển, hãy kiểm tra console log của Mobile để đảm bảo socket đã kết nối thành công tới `http://10.0.2.2:3000`.
- **Background Task**: Tính năng cập nhật vị trí vẫn hoạt động ngay cả khi tài xế tắt màn hình điện thoại (Background Tracking).

> [!TIP]
> Để quan sát luồng tốt nhất, bạn nên mở đồng thời 3 cửa sổ: Web Admin, App Tài xế và App Khách hàng.
