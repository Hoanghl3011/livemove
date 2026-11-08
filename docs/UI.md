# UI & Mobile App Specification - PHASE 4

Tài liệu này chi tiết hóa cấu trúc màn hình, chức năng và quy trình xử lý của ứng dụng di động Livemove (Expo React Native) dựa trên [plan.md](file:///d:/Livemove/docs/plan.md).

---

## 1. Cấu trúc Điều hướng (Navigation Structure)

Ứng dụng sử dụng **Expo Router (File-based Routing)**. Quyền truy cập được phân tách qua các Route Groups.

```text
app/
├── (auth)/             # Nhóm xác thực (Công khai)
├── (admin)/            # Nhóm Quản trị (Role: ADMIN/STAFF)
├── (driver)/           # Nhóm Tài xế (Role: DRIVER)
└── (customer)/         # Nhóm Người nhận (Role: RECEIVER)
```

---

## 2. Chi tiết các Nhóm Màn hình (Groups)

### 2.1. Nhóm Xác thực `(auth)`
**Mục tiêu**: Định danh người dùng và điều hướng về đúng Dashboard dựa trên Role.

| Màn hình | Chức năng (Functions) | Giao tiếp & Xử lý |
|---|---|---|
| **Login** | Đăng nhập bằng Email/SĐT + Password. | Gọi `POST /auth/login`. Lưu JWT và Role vào `useAuthStore`. |
| **Register** | Đăng ký tài khoản mới (dành cho Receiver/Customer). | Gọi `POST /auth/register`. |

---

### 2.2. Nhóm Quản trị `(admin)`
**Mục tiêu**: Quản lý tạo đơn, giám sát đội xe và theo dõi tiến độ tổng thể.

| Màn hình | Chức năng (Functions) | Giao tiếp & Xử lý |
|---|---|---|
| **Dashboard** | Thống kê số lượng đơn (Active, Completed, Cancelled). | Gọi `GET /dashboard/overview`. |
| **Create Order** | Form nhập thông tin người nhận, địa chỉ, chọn tài xế. | Gọi `POST /orders`. Backend trả về QR Code URL để hiển thị. |
| **Orders List** | Danh sách đơn hàng theo trạng thái. Lọc theo ngày/tài xế. | Gọi `GET /orders`. |
| **Order Detail** | Chi tiết đơn, xem vị trí hiện tại của tài xế trên bản đồ. | Socket: Subscribe `order:[id]`. Xem live marker. |
| **Fleet Management** | Bản đồ xem vị trí tất cả tài xế đang Online. | Socket: Subscribe `company:[id]` để nhận GPS toàn đội. |

---

### 2.3. Nhóm Tài xế `(driver)`
**Mục tiêu**: Thực hiện quy trình lấy hàng (QR) và giao hàng (GPS Tracking).

| Màn hình | Chức năng (Functions) | Giao tiếp & Xử lý |
|---|---|---|
| **Home** | Danh sách đơn được gán (`ASSIGNED`). Nút "Bắt đầu lấy hàng". | Gọi `GET /orders?driverId=[me]`. |
| **QR Scanner** | Sử dụng Camera để quét mã QR trên hàng hóa. | API: `POST /orders/scan-qr`. Update status -> `PICKED_UP`. |
| **Delivery Map** | Bản đồ chỉ đường, nút "Giao thành công". | 1. Bật **Background Location** (Task Manager).<br>2. Socket: `emit('driver:location')` mỗi 5s. |
| **History** | Lịch sử các chuyến hàng đã hoàn thành. | Gọi API lọc theo status `DELIVERED`. |

---

### 2.4. Nhóm Khách hàng `(customer)`
**Mục tiêu**: Theo dõi trực quan đơn hàng đang đến và xác nhận nhận hàng.

| Màn hình | Chức năng (Functions) | Giao tiếp & Xử lý |
|---|---|---|
| **Home** | Danh sách các đơn đang được giao đến mình. | Gọi `GET /orders/my-deliveries`. |
| **Live Tracking** | Bản đồ theo dõi tài xế real-time, ETA, Progress bar. | 1. Socket: `subscribe('order:[id]')`. <br>2. Listen: `tracking:update` để di chuyển xe trên Map. |
| **Notification Center**| Nhật ký các thông báo đẩy (Picked up, Arriving, Delivered).| Tích hợp `expo-notifications`. Xử lý Deep Link vào màn Live Tracking. |

---

## 3. Quy trình Giao tiếp & Luồng dữ liệu (Inter-screen Workflow)

### 3.1. Luồng Xác nhận Lấy hàng (QR Flow)
1. **Driver** mở màn hình `Scanner`.
2. Camera thành công -> Gửi QR string về Backend.
3. **Backend** validate thành công -> Update DB -> Trả về `success`.
4. **Driver App** nhận `success` -> Tự động điều hướng sang màn hình `Delivery Map` & khởi chạy Background GPS.
5. **Customer App** nhận Push Notification (FCM) báo đơn đã được lấy.

### 3.2. Luồng Theo dõi Trực tiếp (Tracking Flow)
1. **Driver App** (Background Task) gửi tọa độ qua Socket mỗi 5s.
2. **Server** nhận tọa độ -> Tính toán lại ETA & Distance -> Gửi lại dữ liệu qua Socket Room của đơn hàng đó.
3. **Customer App** (đang mở màn Live Tracking) nhận dữ liệu -> Marker xe máy di chuyển mượt mà trên bản đồ Google Maps.
4. **Notification Bar** của Customer cập nhật Progress Bar (Ongoing Notification) liên tục ngay cả khi tắt màn hình.

### 3.3. Luồng Hoàn tất Giao hàng (Completion Flow)
1. **Tài xế** nhấn "Giao thành công" (hoặc chuyển trạng thái tại điểm đích).
2. **Server** cập nhật DB -> Gửi lệnh Socket `order:status:changed`.
3. **Customer App** nhảy popup/thông báo: "Bạn đã nhận được hàng chưa?".
4. **Customer** nhấn "Xác nhận" -> Đơn hàng kết thúc -> Server đóng Socket Room & Flush route data vào DB.

---

> [!IMPORTANT]
> Toàn bộ UI sẽ tuân thủ nguyên tắc thiết kế **Premium UX**: Sử dụng Google Fonts (Inter/Outfit), Gradient mượt mà, và Map Marker Animation để tạo cảm giác ứng dụng chuyên nghiệp cấp độ doanh nghiệp.
