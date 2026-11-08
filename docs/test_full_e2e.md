# 🧪 Kịch Bản Kiểm Thử Toàn Diện (End-to-End E2E Test Plan) — Livemove B2B

Tài liệu này cung cấp kịch bản kiểm thử (test script) **chi tiết từng bước** để xác minh luồng vòng đời của một Đơn hàng, tuân thủ tuyệt đối quy trình phối hợp 3 bên: `Admin`, `Driver`, và `Customer` như đã chốt trong `workflow.md` và `plan.md`.

---

## 🎯 Điều Kiện Cần Phải Có (Prerequisites)

1. **Môi trường Server**: 
   - Backend NestJS đang chạy (`port 3000`).
   - Database đã được Seed chuẩn.
2. **Tài khoản dùng để Test**:
   - **Admin**: `admin@livemove.com` / `Admin@123456`
   - **Tài xế**: SĐT `0912345678` (Nguyễn Văn A) / `Driver@123456`
   - **Khách hàng**: `customer@livemove.com` / `Customer@123456`

---

## 🚀 KỊCH BẢN TEST CHÍNH THỨC: Vòng Đời Đơn Hàng

### 📍 Giai Đoạn 1: Khởi tạo và Điều phối (Web Admin)
*Mục đích: Xác thực khả năng tạo đơn và phân công nhiệm vụ của Admin.*

- **Bước 1.1: Đăng nhập Admin**
  - **Vào đâu?**: `http://localhost:5173/login`.
  - **Làm gì?**: Nhập `admin@livemove.com` / `Admin@123456`.
  - **Dự kiến**: Vào Dashboard thành công.
- **Bước 1.2: Tạo Đơn hàng mới (Chờ gán)**
  - **Vào đâu?**: Menu **"Quản lý đơn hàng"** -> Nút **"Tạo đơn hàng mới"**.
  - **Làm gì?**: Điền thông tin khách hàng, chọn địa chỉ từ gợi ý (để lấy tọa độ). Mục "Chọn tài xế" để trống -> Bấm **"Khởi tạo PENDING"**.
  - **Dự kiến**: Đơn hàng xuất hiện trong danh sách với trạng thái **"Chờ gán (PENDING)"**.
  - **Xem QR Code**: Nhấn vào **icon Mắt (Xem)** ở cuối dòng đơn hàng. Một hộp thoại hiện ra mã QR Code to, rõ ràng.
- **Bước 1.3: Điều phối tài xế (Phân công)**
  - **Vào đâu?**: Tại dòng đơn hàng vừa tạo, bấm vào **dấu 3 chấm (Thao tác)** -> Chọn **"Gán tài xế"**.
  - **Làm gì?**: Hộp thoại "Điều phối tài xế" hiện ra. Chọn "Nguyễn Văn A (0912345678)" -> Bấm **"Xác nhận điều phối"**.
  - **Dự kiến**: Trạng thái đơn hàng lập tức chuyển sang **"Đã gán (ASSIGNED)"**.

### 📍 Giai Đoạn 2: Xác nhận Lấy Hàng (App Mobile Tài Xế)
*Mục đích: Xác nhận việc dùng Camera quét mã QR để nhận hàng.*

- **Bước 2.1: Đăng nhập App Driver**
  - **Làm gì?**: Nhập SĐT `0912345678` / `Driver@123456`.
  - **Dự kiến**: Thấy đơn hàng hiện ở trạng thái **"CHỜ LẤY HÀNG"**.
- **Bước 2.2: Quét Mã QR Xác Nhận**
  - **Vào đâu?**: Bấm nút **"Quét QR Nhận Hàng"** trên App Driver.
  - **Làm gì?**: Hướng Camera điện thoại vào mã QR đang hiển thị trong Dialog "Chi tiết vận đơn" trên màn hình Admin (Bước 1.2).
  - **Dự kiến**: App báo "Xác nhận thành công". Trạng thái đơn nhảy sang **"Đã lấy hàng (PICKED_UP)"**.
  - **(System)**: Khách hàng nhận được thông báo: *"Tài xế đã lấy hàng"*.

### 📍 Giai Đoạn 3: Live-Tracking (Customer + Driver)
*Mục đích: Test tính năng theo dõi thời gian thực.*

- **Bước 3.1: Bắt đầu di chuyển (Driver)**
  - **Làm gì?**: Tài xế bấm **"Bắt đầu giao hàng"**. Trạng thái đổi thành **"Đang chuyển (IN_TRANSIT)"**.
- **Bước 3.2: Theo dõi lộ trình (Customer)**
  - **Làm gì?**: Khách hàng mở link tracking.
  - **Dự kiến**: Thấy Marker **xe máy đỏ (scooter)** di chuyển mượt mà trên bản đồ theo vị trí mô phỏng. Icon có hiệu ứng nhún (bounce) và vòng sóng Radar cực chất.

### 📍 Giai Đoạn 4: Hoàn thành (Finalization)

- **Bước 4.1: Xác nhận Giao xong (Driver)**
  - **Làm gì?**: Khi tới đích, tài xế vuốt Slider **"Xác nhận hoàn thành"**.
  - **Dự kiến**: Đơn hàng chuyển trạng thái cuối cùng là **"Đã giao (DELIVERED)"**.
- **Bước 4.2: Kiểm tra phía Admin**
  - **Kiểm tra**: Quay lại Web Admin, tab "Hoàn thành". Đơn hàng đã được đánh dấu màu xanh thành công.

---

## ✅ TIÊU CHÍ ĐẠT (Pass Criterias)

1. Trạng thái hiển thị trên Web Admin khớp 100% với App Driver theo thời gian thực.
2. Mã QR hiển thị trong Dialog Chi tiết có thể quét được bởi App Driver.
3. Chức năng "Gán tài xế" từ Dashboard Admin hoạt động bình thường (Cập nhật đúng `driverId`).
4. Không còn lỗi 401 (nhờ cơ chế Refresh Token đã cài đặt).

---

## 💎 KỊCH BẢN SALES DEMO: TRẢI NGHIỆM KHÁCH HÀNG (VIP)

*Mục đích: Demo sự chuyên nghiệp, tức thì và giao diện "Wow" của hệ thống.*

- **Bước 1: Chuẩn bị**
  - Mở App Mobile: Đăng nhập tài khoản Khách hàng `customer@livemove.com`.
  - Mở Web Admin: Sẵn sàng tạo đơn mới.
- **Bước 2: CMS Gửi Đơn**
  - Admin tạo đơn, gán tài xế `Nguyễn Văn A`.
  - Admin bấm **"Xác nhận lấy hàng"** (Giả lập Driver quét QR).
  - Admin bấm **"Bắt đầu giao hàng"** (Trạng thái -> IN_TRANSIT).
- **Bước 3: Hiệu ứng Mobile**
  - **Thông báo**: Điện thoại của bạn sẽ rung/kêu và hiện: *"📦 Livemove: Đơn hàng đang đến!"*.
  - **Vuốt mở**: Chạm vào thông báo đó. 
- **Bước 4: Theo dõi Live**
  - App tự động mở màn hình Tracking.
  - **Wow Factor 1**: Thấy xe máy đỏ Scooter đang chạy nhún nhảy trên bản đồ hướng về nhà mình.
  - **Wow Factor 2**: Kéo thử widget ETA ở dưới để không che tầm nhìn.
  - **Wow Factor 3**: ETA cập nhật từng phút, Progress % chạy liên tục.

*Lưu ý: Để test mượt nhất, hãy dùng đơn hàng có ID `27fb2035-369f-45fe-bda1-7de164e7df10` để kích hoạt mode "Fast Track (1 phút)".*
