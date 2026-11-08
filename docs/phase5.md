# Phase 5: Hệ thống Quản trị Web (Admin Web Portal) - Livemove Fleet Management

Tài liệu này chi tiết hóa việc xây dựng cổng thông tin quản trị trên nền tảng Web để thay thế/bổ sung cho phiên bản Mobile Admin, giúp doanh nghiệp quản lý vận hành chuyên nghiệp và bao quát hơn.

---

## 1. Công nghệ sử dụng (Tech Stack)
Để đảm bảo tốc độ phát triển và trải nghiệm người dùng mượt mà, chúng ta sẽ sử dụng:

- **Framework**: **Vue 3** (Composition API).
- **Build Tool**: **Vite** (SIêu nhanh).
- **State Management**: **Pinia** (Nhẹ và tối ưu hơn Vuex).
- **UI Toolkits**: **Element Plus** hoặc **Ant Design Vue** (Giao diện chuẩn Enterprise).
- **Styling**: **Tailwind CSS** (Tùy chỉnh linh hoạt).
- **Maps**: **Leaflet** hoặc **Google Maps SDK for Web** (Hiển thị live fleet).
- **Real-time**: **Socket.io-client** (Nhận tọa độ tài xế liên tục).

---

## 2. Danh sách Màn hình & Chức năng (Screen List)

### 2.1. Dashboard Tổng quát (Overview)
- **Chỉ số (KPI Cards)**: 
    - Tổng đơn hàng trong ngày.
    - Số đơn đang giao (Active).
    - Số tài xế đang online.
    - Tỷ lệ giao hàng thành công (%).
- **Biểu đồ (Charts)**:
    - Biểu đồ đường: Xu hướng đơn hàng theo giờ/ngày.
    - Biểu đồ tròn: Phân bổ trạng thái đơn hàng (Pending, In Transit, Delivered, Cancelled).

### 2.2. Giám sát Đội xe Real-time (Live Fleet Map) - **CỰC KỲ QUAN TRỌNG**
- **Bản đồ toàn màn hình**: Hiển thị tất cả tài xế đang online dưới dạng các icon xe máy di chuyển.
- **Bộ lọc nhanh**: Lọc theo trạng thái tài xế (Đang rảnh, Đang giao hàng, Offline).
- **Chi tiết thực thể**: Nhấn vào tài xế để xem:
    - Tên, SĐT, Biển số.
    - Đơn hàng đang đảm nhận.
    - Tốc độ di chuyển thực tế.

### 2.3. Quản lý Đơn hàng (Order Management)
- **Danh sách đơn**: Bảng dữ liệu (Datatable) với đầy đủ bộ lọc, tìm kiếm, phân trang.
- **Tạo đơn hàng nhanh**: Form nhập liệu thông tin khách hàng, điểm đi/đến, và gán tài xế trực tiếp.
- **Chi tiết đơn hàng (Modal/Sidebar)**:
    - Lộ trình di chuyển (vẽ lại path trên map).
    - Nhật ký trạng thái (Timestamp từng bước: Created -> Picked up -> Arrived -> Completed).
    - Xem bằng chứng giao hàng (nếu có ảnh chụp).

### 2.4. Quản lý Tài xế (Driver Management)
- **Danh sách tài xế**: Quản lý hồ sơ, thông tin phương tiện.
- **Quản lý khu vực (Geofencing - Bổ sung)**: Xem tài xế đang hoạt động ở khu vực nào (Quận 1, Thủ Đức, ...).
- **Hiệu suất (Driver Performance)**: Thống kê số đơn đã hoàn thành, đánh giá từ khách hàng.

### 2.5. Quản lý Doanh nghiệp & Cấu hình (Settings)
- **Thông tin công ty**: Tên, Logo, Địa chỉ trụ sở.
- **Cấu hình hệ thống**: Thiết lập bán kính gán đơn tự động, thời gian timeout của tọa độ.

---

## 3. Luồng hoạt động (Workflows)

### 3.1. Luồng Giám sát & Điều phối
1. **Admin** mở màn hình **Live Map**.
2. **Socket.io** kết nối và nhận tọa độ liên tục từ tất cả tài xế đang mở app.
3. Nếu có đơn hàng mới phát sinh (qua API hoặc tạo tay), Admin có thể xem tài xế nào gần nhất (dựa trên vị trí thực tế trên bản đồ) để gán đơn.

### 3.2. Luồng Xuất dữ liệu & Báo cáo (Bổ sung thêm)
1. **Admin** chọn khoảng thời gian (Từ ngày - Đến ngày).
2. Hệ thống tổng hợp dữ liệu từ PostgreSQL.
3. Xuất file **Excel/PDF** báo cáo doanh thu, hiệu suất tài xế để đối soát cuối tháng.

---

## 4. Tính năng đề xuất bổ sung (Premium Features)

- **Thông báo trình duyệt (Web Push Notifications)**: Admin nhận thông báo ngay lập tức khi có đơn hàng bị hủy hoặc tài xế gặp sự cố (đứng yên quá lâu).
- **Chế độ tối (Dark Mode)**: Phù hợp cho nhân viên vận hành trực đêm theo dõi bản đồ không bị mỏi mắt.
- **Lịch sử lộ trình (Route Replay)**: Cho phép xem lại toàn bộ quá trình di chuyển của một đơn hàng cũ dưới dạng video/animation trên bản đồ.

---

## 5. Kết quả đạt được sau Phase 5
Hệ thống thoát khỏi giới hạn của màn hình điện thoại nhỏ bé, cho phép người quản lý vận hành chuyên nghiệp (Dispatcher) xử lý hàng nghìn đơn hàng cùng lúc một cách dễ dàng.
