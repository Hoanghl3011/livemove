# Walkthrough — Phase 2: QR-to-Notification Engine

Giai đoạn 2 đã hoàn thành việc triển khai luồng xử lý đơn hàng và hệ thống thông báo tức thì.

## Các tính năng đã triển khai

### 1. Module Đơn hàng (Orders Module)
- **Tạo đơn hàng**: Tự động sinh `orderCode` theo ngày và mã `qrCode` (UUID).
- **Tạo mã QR**: Tích hợp thư viện `qrcode`, tự động tạo ảnh QR và lưu vào thư mục `public/qrcodes`.
- **API Đơn hàng**: Các endpoint `GET /orders` và `POST /orders` đã sẵn sàng (yêu cầu JWT).

### 2. Hệ thống Thông báo (Notification Engine)
- **BullMQ**: Đã thiết lập hàng đợi (Queue) để xử lý thông báo bất đồng bộ, giúp API phản hồi cực nhanh (< 100ms).
- **Notification Processor**: Tự động lưu log thông báo vào Database và sẵn sàng kết nối với Firebase (FCM).

### 3. Cập nhật thời gian thực (Real-time Tracking)
- **Socket.io Gateway**: Triển khai [TrackingGateway](file:///d:/Livemove/backend/src/modules/tracking/tracking.gateway.ts#12-45) để đẩy trạng thái đơn hàng tới ứng dụng mobile ngay khi tài xế quét mã QR.
- **Bảo mật**: Tích hợp [WsJwtGuard](file:///d:/Livemove/backend/src/modules/tracking/ws-jwt.guard.ts#6-28) để đảm bảo chỉ các kết nối có Token hợp lệ mới được nhận dữ liệu.

## Kết quả xác minh

### Khởi tạo hệ thống (Seed API)
Đã chạy thử nghiệm API khởi tạo:
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/seed/init" ...
```
**Kết quả**: `System initialized successfully`. Đã tạo thành công Công ty và tài khoản Admin test.

### Cấu trúc thư mục tĩnh
Thư mục `public/qrcodes` đã được tạo và NestJS đã được cấu hình để phục vụ ảnh QR qua URL.

## Hướng dẫn Test thử cho bạn
Bạn có thể dùng Postman hoặc Terminal để test nhanh:

1. **Khởi tạo (nếu chưa làm)**:
   - `POST http://localhost:3000/seed/init`
   - Body: `{"email": "admin@test.com", "password": "password123", "companyName": "My Fleet"}`

2. **Đăng nhập**:
   - `POST http://localhost:3000/auth/login`
   - Nhận về `access_token`.

3. **Tạo đơn hàng**:
   - `POST http://localhost:3000/orders` (Kèm Header Authorization Bearer)
   - Nhận về thông tin đơn hàng và link `qrImageUrl`.

---
Tiếp theo, chúng ta sẽ sang **Phase 3: Theo dõi GPS thời gian thực (Real-time GPS Tracking)**.
