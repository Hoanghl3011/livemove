# 🚀 Hướng dẫn Test Backend Livemove

Tài liệu này hướng dẫn chi tiết các bước để kiểm tra toàn bộ tính năng đã triển khai từ Phase 1 đến Phase 3 (Auth, Orders, QR Scan, Real-time Tracking, Route Persistence).

---

## 🛠 Chuẩn bị
1. **Docker**: Chạy `docker-compose up -d` tại thư mục `backend` để khởi động PostgreSQL và Redis.
2. **Server**: Chạy `npm run start:dev` trong thư mục `backend`.
3. **Postman/Insomnia**: Dùng để gọi API.

---

## 🏁 Bước 1: Khởi tạo hệ thống (Seed)
Để có dữ liệu mẫu (Công ty, Admin, Staff, Tài xế):
- **Method**: `POST`
- **URL**: `http://localhost:3000/seed/init`
- **Body (JSON)**:
  ```json
  {
    "email": "admin@test.com",
    "password": "password123",
    "companyName": "Livemove Fleet"
  }
  ```
- **Kỳ vọng**: Trả về `System initialized successfully`.

---

## 🔐 Bước 2: Đăng nhập & Lấy Token
Bạn cần Token để thực hiện các yêu cầu tiếp theo.
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/login`
- **Body (JSON)**: `{"email": "admin@test.com", "password": "password123"}`
- **Kỳ vọng**: Lưu lại `access_token` từ phản hồi.

---

## 📦 Bước 3: Tạo Đơn hàng mới
- **Method**: `POST`
- **URL**: `http://localhost:3000/orders`
- **Headers**: `Authorization: Bearer <TOKEN_ADMIN>`
- **Body (JSON)**:
  ```json
  {
    "pickupAddress": "123 Le Loi, D1, HCMC",
    "pickupLat": 10.7769,
    "pickupLng": 106.7009,
    "deliveryAddress": "456 Nam Ky Khoi Nghia, D3, HCMC",
    "deliveryLat": 10.7850,
    "deliveryLng": 106.6880,
    "receiverName": "Nguyen Van B",
    "receiverPhone": "0901234567"
  }
  ```
- **Kỳ vọng**: Trả về thông tin đơn hàng, `qrCode` (UUID) và `qrImageUrl`. Copy `qrCode` để dùng ở bước sau.

---

## 🔍 Bước 4: Tài xế quét mã QR (Nhận hàng)
Sau khi Admin tạo đơn, tài xế sẽ quét mã dán trên thùng hàng.
- **Method**: `POST`
- **URL**: `http://localhost:3000/orders/scan-qr`
- **Headers**: `Authorization: Bearer <TOKEN_ADMIN_HOAC_DRIVER>`
- **Body (JSON)**: `{"qrCode": "<QR_CODE_BUOC_3>"}`
- **Kỳ vọng**: Trạng thái đơn chuyển sang `PICKED_UP`. (Hệ thống sau đó sẽ tự động chuyển sang `IN_TRANSIT` để bắt đầu theo dõi GPS).

---

## 📍 Bước 5: Theo dõi GPS Real-time (Socket.io)
Sử dụng script giả lập tôi đã chuẩn bị để thấy tọa độ chạy thời gian thực.

1. Mở Terminal tại `d:\Livemove`.
2. Chạy lệnh (thay Token và OrderID):
   ```bash
   node scripts/test-tracking.js <TOKEN> <ORDER_ID>
   ```
3. **Kiểm tra**:
   - Bạn sẽ thấy log tọa độ được gửi mỗi 3 giây.
   - Script tự động lắng nghe và in ra `Received tracking update`.
   - Chú ý các giá trị `progressPercent` (tăng dần) và `etaMinutes` (giảm dần) được server tính toán trả về.

---

## ✅ Bước 6: Hoàn thành đơn & Lưu hành trình
Khi tài xế giao hàng thành công:
- **Method**: `PATCH`
- **URL**: `http://localhost:3000/orders/<ORDER_ID>`
- **Body (JSON)**: `{"status": "DELIVERED"}`
- **Kỳ vọng**: 
  - API trả về status `DELIVERED`.
  - Một Worker chạy ngầm sẽ gom dữ liệu GPS từ Redis lưu vào PostgreSQL.

---

## 📊 Bước 7: Kiểm tra kết quả cuối cùng
Để xác nhận hành trình đã được lưu vào Database:
1. Kết nối vào PostgreSQL (Dùng DBeaver/PGAdmin).
2. Xem bảng `route_snapshots`.
3. Kiểm tra cột `coordinates` (JSON) chứa danh sách các điểm đã đi qua ở Bước 5.
4. Kiểm tra `totalDistanceKm` (Tổng quãng đường thực tế).

---

## 💡 Ghi chú nâng cao
- **Redis Tracking**: Bạn có thể dùng `redis-cli` và lệnh `GEOPOS driver:locations <DRIVER_ID>` để xem vị trí tài xế đang lưu trong bộ nhớ tạm.
- **Socket Rooms**: Khách hàng chỉ nhận được vị trí khi `emit('tracking:subscribe', { orderId })`. Script test đã thực hiện sẵn bước này.
