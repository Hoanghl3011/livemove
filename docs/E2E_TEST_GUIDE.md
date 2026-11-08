# 🧪 HƯỚNG DẪN TEST E2E ĐẦY ĐỦ - Livemove Demo

> **Mục tiêu**: Test toàn bộ luồng từ Admin tạo đơn → Driver quét QR → Customer live-tracking
> **Thời gian**: ~30 phút
> **Thiết bị cần**: 3 thiết bị/emulator (Admin, Driver, Customer) hoặc 1 máy + 3 browser tabs

---

## PHẦN 1: CHUẨN BỊ MÔI TRƯỜNG

### 1.1 Khởi động Backend

```bash
# Terminal 1: Backend
cd backend

# Khởi động Docker (PostgreSQL + Redis)
docker-compose up -d

# Chờ 10 giây để DB sẵn sàng
sleep 10

# Cài dependencies
npm install

# Chạy migrations
npm run migration:run

# Seed dữ liệu test (tạo company, users, drivers)
npm run seed

# Khởi động server
npm run start:dev
```

**Kết quả mong đợi**:
```
[Nest] 12345  - 04/01/2026, 10:30:45 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 04/01/2026, 10:30:47 AM     LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 12345  - 04/01/2026, 10:30:48 AM     LOG [InstanceLoader] RedisModule dependencies initialized
[Nest] 12345  - 04/01/2026, 10:30:49 AM     LOG [NestApplication] Nest application successfully started
Server running on http://localhost:3000
```

### 1.2 Khởi động Mobile App (3 instances)

```bash
# Terminal 2: Mobile App - Admin
cd mobile
npx expo start --dev-client

# Scan QR code → Chọn "Admin" role khi login

---

# Terminal 3: Mobile App - Driver
cd mobile
npx expo start --dev-client --port 8081

# Scan QR code → Chọn "Driver" role khi login

---

# Terminal 4: Mobile App - Customer
cd mobile
npx expo start --dev-client --port 8082

# Scan QR code → Chọn "Customer" role khi login
```

**Hoặc dùng Web Browser** (nếu không có 3 thiết bị):
- Admin: `http://localhost:3000/admin` (Tab 1)
- Driver: `http://localhost:3000/driver` (Tab 2)
- Customer: `http://localhost:3000/customer` (Tab 3)

---

## PHẦN 2: TEST FLOW - ADMIN TẠO ĐƠN

### 2.1 Admin Login

**Màn hình**: Login screen
**Dữ liệu test**:
```
Email: admin@livemove.com
Password: Admin@123456
```

**Bước**:
1. Nhập email
2. Nhập password
3. Nhấn "Đăng nhập"

**Kết quả mong đợi**:
✅ Redirect tới Dashboard  
✅ Hiển thị "Xin chào, Admin"  
✅ Thấy 4 tab: Dashboard, Tạo đơn, Danh sách đơn, Quản lý tài xế

---

### 2.2 Admin Xem Dashboard

**Màn hình**: Dashboard
**Dữ liệu hiển thị**:
```
📊 Tổng đơn hôm nay: 0
🚗 Tài xế online: 1
✅ Đơn hoàn thành: 0
⏱️ Thời gian giao trung bình: --
```

**Kiểm tra**:
- [ ] Hiển thị đúng số liệu
- [ ] Có biểu đồ (nếu có dữ liệu)

---

### 2.3 Admin Tạo Đơn Hàng

**Màn hình**: Tạo đơn
**Bước**:

1. **Nhập thông tin lấy hàng**:
   - Địa chỉ: "123 Nguyễn Huệ, Q.1, TP.HCM"
   - Tọa độ: 10.7769, 106.6966 (Tòa nhà Bitexco)

2. **Nhập thông tin giao hàng**:
   - Địa chỉ: "456 Lê Lợi, Q.1, TP.HCM"
   - Tọa độ: 10.7751, 106.7015 (Nhà thờ Đức Bà)
   - Tên người nhận: "Nguyễn Văn B"
   - SĐT người nhận: "0987654321"

3. **Chọn tài xế**:
   - Chọn "Nguyễn Văn A" (driver test)

4. **Mô tả hàng hóa**:
   - "Gói hàng 2kg, dễ vỡ"

5. **Nhấn "Tạo đơn"**

**Kết quả mong đợi**:
```
✅ Thông báo: "Đơn hàng ORD-20260401-001 tạo thành công"
✅ Hiển thị QR code
✅ Nút "In QR" hoạt động
✅ Nút "Giao cho tài xế" hiển thị
✅ Status: PENDING
```

**Lưu lại**:
- Order ID: `ORD-20260401-001`
- QR Code: (screenshot hoặc lưu)

---

### 2.4 Admin Giao Đơn cho Tài xế

**Màn hình**: Chi tiết đơn hàng
**Bước**:
1. Nhấn nút "Giao cho tài xế"
2. Chọn tài xế "Nguyễn Văn A"
3. Nhấn "Xác nhận"

**Kết quả mong đợi**:
```
✅ Status thay đổi: PENDING → ASSIGNED
✅ Thời gian giao: hiển thị
✅ Tài xế nhận được notification (nếu có FCM)
✅ Socket event: order:assigned được emit
```

---

## PHẦN 3: TEST FLOW - DRIVER QUÉT QR

### 3.1 Driver Login

**Màn hình**: Login screen
**Dữ liệu test**:
```
SĐT: 0912345678
Password: Driver@123456
```

**Bước**:
1. Nhập SĐT
2. Nhập password
3. Nhấn "Đăng nhập"

**Kết quả mong đợi**:
✅ Redirect tới Home  
✅ Hiển thị "Xin chào, Nguyễn Văn A"  
✅ Thấy danh sách đơn được giao

---

### 3.2 Driver Xem Danh sách Đơn

**Màn hình**: Home / Danh sách đơn
**Dữ liệu hiển thị**:
```
📦 ORD-20260401-001
📍 Từ: 123 Nguyễn Huệ, Q.1
📍 Đến: 456 Lê Lợi, Q.1
⏱️ ETA: 25 phút
🔴 Status: ASSIGNED
```

**Kiểm tra**:
- [ ] Hiển thị đơn vừa tạo
- [ ] Thông tin địa chỉ đúng
- [ ] Status = ASSIGNED

---

### 3.3 Driver Quét QR

**Màn hình**: Scanner
**Bước**:
1. Nhấn nút "Quét QR lấy hàng"
2. Camera mở
3. Quét QR code (từ Admin hoặc dùng QR test)

**QR Code Test** (nếu không có ảnh):
```
Tạo QR từ: https://qrcode.tec-it.com/
Nội dung: {"orderId":"ORD-20260401-001","qrCode":"uuid-xxx","companyId":"company-id"}
```

**Kết quả mong đợi**:
```
✅ QR được decode thành công
✅ Hiệu ứng ✅ thành công
✅ Thông báo: "Lấy hàng thành công!"
✅ Redirect tới màn hình delivery
✅ Status: PICKED_UP
✅ picked_up_at: hiển thị thời gian hiện tại
```

**Server logs**:
```
[TrackingGateway] QR scan received: ORD-20260401-001
[OrdersService] Order status updated: PENDING → PICKED_UP
[NotificationsQueue] Job SEND_PICKUP_NOTIFICATION dispatched
[SocketGateway] Event order:status:changed emitted
```

---

### 3.4 Driver Bắt đầu Giao hàng

**Màn hình**: Delivery / Navigation
**Bước**:
1. Nhấn "Bắt đầu giao hàng"
2. Cho phép truy cập vị trí
3. Chọn "Cho phép luôn" (Always)

**Kết quả mong đợi**:
```
✅ Bản đồ hiển thị
✅ Marker tài xế ở vị trí hiện tại
✅ Marker đích ở 456 Lê Lợi
✅ Polyline nối 2 điểm
✅ Status: IN_TRANSIT
✅ Background location tracking bắt đầu
✅ Foreground service notification hiển thị
```

**Kiểm tra GPS**:
- Nếu dùng emulator: Dùng Android Studio / Xcode để mock GPS
- Nếu dùng thiết bị thật: Đi bộ hoặc dùng GPS spoofer

---

## PHẦN 4: TEST FLOW - CUSTOMER LIVE TRACKING

### 4.1 Customer Login

**Màn hình**: Login screen
**Dữ liệu test**:
```
Email: customer@livemove.com
Password: Customer@123456
```

**Bước**:
1. Nhập email
2. Nhập password
3. Nhấn "Đăng nhập"

**Kết quả mong đợi**:
✅ Redirect tới Home  
✅ Hiển thị "Xin chào, Khách hàng"  
✅ Thấy danh sách đơn đang giao

---

### 4.2 Customer Xem Danh sách Đơn

**Màn hình**: Home / Danh sách đơn
**Dữ liệu hiển thị**:
```
📦 ORD-20260401-001
📍 Giao tới: 456 Lê Lợi, Q.1
🚗 Tài xế: Nguyễn Văn A (59A-12345)
⏱️ ETA: 22 phút
📊 Tiến độ: 15%
🔴 Status: IN_TRANSIT
```

**Kiểm tra**:
- [ ] Hiển thị đơn đang giao
- [ ] Thông tin tài xế đúng
- [ ] ETA hiển thị
- [ ] Progress bar hiển thị

---

### 4.3 Customer Nhấn vào Đơn để Live Tracking

**Màn hình**: Tracking / Live Map
**Bước**:
1. Nhấn vào đơn "ORD-20260401-001"
2. Chờ bản đồ load

**Kết quả mong đợi**:
```
✅ Bản đồ Google Maps hiển thị
✅ Marker tài xế (🚗) ở vị trí hiện tại
✅ Marker đích (📍) ở 456 Lê Lợi
✅ Polyline nối 2 điểm (xám = đã đi, xanh = còn lại)
✅ Info card phía dưới:
   - Tên tài xế: Nguyễn Văn A
   - Biển số: 59A-12345
   - Progress: 15% (progress bar)
   - ETA: 22 phút
   - Khoảng cách: 3.2 km
✅ Nút gọi tài xế
✅ Nút nhắn tin tài xế
```

---

### 4.4 Customer Nhận Notification (Real-time Update)

**Khi Driver di chuyển**:

**Notification 1** (Khi quét QR):
```
📦 Đơn hàng đang được lấy!
Tài xế Nguyễn Văn A (59A-12345) đã lấy hàng. ETA: 25 phút
[Nhấn để xem chi tiết]
```

**Notification 2** (Khi bắt đầu giao):
```
🚗 Tài xế đang đến
Còn 22 phút, 3.2 km
[Nhấn để xem bản đồ]
```

**Notification 3** (Khi gần đích < 500m):
```
🚗 Tài xế sắp đến
Còn 2 phút, 0.3 km
[Nhấn để xem bản đồ]
```

**Kiểm tra**:
- [ ] Notification hiển thị đúng lúc
- [ ] Nội dung cập nhật real-time
- [ ] Nhấn notification → Mở tracking screen

---

### 4.5 Customer Xem Marker Di chuyển Real-time

**Khi Driver di chuyển**:

**Bước**:
1. Mở tracking screen
2. Xem marker tài xế di chuyển trên bản đồ
3. Xem progress bar cập nhật
4. Xem ETA giảm dần

**Kết quả mong đợi**:
```
✅ Marker di chuyển mượt (không giật)
✅ Progress bar tăng dần: 15% → 30% → 50% → 75% → 95%
✅ ETA giảm dần: 22 → 20 → 15 → 10 → 5 phút
✅ Khoảng cách giảm: 3.2 → 2.5 → 1.8 → 0.5 km
✅ Polyline cập nhật (đoạn xám tăng, xoạn xanh giảm)
✅ Camera tự follow marker
✅ Khi gần đích: zoom vào marker
```

**Latency kiểm tra**:
- Từ Driver emit GPS → Customer nhận update: < 1 giây
- Marker animation: mượt (không giật)

---

## PHẦN 5: TEST FLOW - HOÀN THÀNH ĐƠN

### 5.1 Driver Xác nhận Giao hàng

**Màn hình**: Delivery / Confirmation
**Bước**:
1. Driver đến địa chỉ giao
2. Nhấn "Xác nhận giao hàng"
3. Chụp ảnh hoặc nhập OTP (nếu có)
4. Nhấn "Hoàn thành"

**Kết quả mong đợi**:
```
✅ Status: IN_TRANSIT → DELIVERED
✅ delivered_at: hiển thị thời gian hiện tại
✅ Thông báo: "Giao hàng thành công!"
✅ Background location tracking dừng
✅ Route được flush vào PostgreSQL
```

---

### 5.2 Customer Nhận Notification Hoàn thành

**Notification**:
```
✅ Đơn hàng đã giao thành công!
Tài xế Nguyễn Văn A đã giao hàng lúc 10:45
[Nhấn để xem chi tiết]
```

**Kết quả mong đợi**:
```
✅ Notification hiển thị
✅ Status: DELIVERED
✅ Thời gian giao: hiển thị
✅ Tổng thời gian: hiển thị
✅ Tổng quãng đường: hiển thị
```

---

### 5.3 Customer Xem Lịch sử Hành trình

**Màn hình**: Tracking / History
**Bước**:
1. Nhấn "Xem lịch sử hành trình"
2. Xem polyline toàn bộ hành trình

**Kết quả mong đợi**:
```
✅ Polyline hiển thị toàn bộ hành trình
✅ Tổng quãng đường: 3.5 km
✅ Tổng thời gian: 25 phút
✅ Tốc độ trung bình: 8.4 km/h
✅ Có thể phóng to/thu nhỏ bản đồ
```

---

## PHẦN 6: KIỂM TRA BACKEND LOGS

### 6.1 Kiểm tra Database

```bash
# Kết nối PostgreSQL
psql -U postgres -d livemove

# Kiểm tra bảng orders
SELECT id, order_code, status, assigned_at, picked_up_at, delivered_at 
FROM orders 
WHERE order_code = 'ORD-20260401-001';

# Kết quả mong đợi:
# id | order_code | status | assigned_at | picked_up_at | delivered_at
# ---|------------|--------|-------------|--------------|-------------
# xxx | ORD-20260401-001 | DELIVERED | 10:30:00 | 10:32:00 | 10:45:00

# Kiểm tra route_snapshots
SELECT id, order_id, total_distance_km, total_duration_sec 
FROM route_snapshots 
WHERE order_id = 'xxx';

# Kết quả mong đợi:
# id | order_id | total_distance_km | total_duration_sec
# ---|----------|-------------------|-------------------
# yyy | xxx | 3.5 | 1500
```

### 6.2 Kiểm tra Redis

```bash
# Kết nối Redis
redis-cli

# Kiểm tra vị trí tài xế
GEOPOS driver:locations driver-id-xxx

# Kết quả mong đợi:
# 1) 1) "106.70150000000000"
#    2) "10.77510000000000"

# Kiểm tra route buffer (nếu còn)
ZRANGE route:order-id-xxx 0 -1 WITHSCORES

# Kiểm tra driver status
HGETALL driver:status:driver-id-xxx
```

### 6.3 Kiểm tra Logs

```bash
# Terminal backend
# Tìm logs liên quan đến order

[TrackingGateway] Driver location received: driver-id-xxx
[TrackingGateway] Order progress: 15%
[TrackingGateway] Broadcasting to room: order:ORD-20260401-001
[NotificationsQueue] Job SEND_PICKUP_NOTIFICATION dispatched
[NotificationsQueue] Job SEND_PICKUP_NOTIFICATION completed
[OrdersService] Order status updated: PICKED_UP → IN_TRANSIT
[OrdersService] Order status updated: IN_TRANSIT → DELIVERED
[TrackingService] Route flushed to database: 3.5 km, 1500 sec
```

---

## PHẦN 7: CHECKLIST KIỂM TRA

### ✅ Admin Flow
- [ ] Login thành công
- [ ] Xem dashboard
- [ ] Tạo đơn hàng
- [ ] QR code generate đúng
- [ ] Giao đơn cho tài xế
- [ ] Nhận socket event: order:assigned
- [ ] Status: PENDING → ASSIGNED

### ✅ Driver Flow
- [ ] Login thành công
- [ ] Xem danh sách đơn được giao
- [ ] Quét QR thành công
- [ ] Status: ASSIGNED → PICKED_UP
- [ ] Bắt đầu giao hàng
- [ ] Background location tracking hoạt động
- [ ] Xác nhận giao hàng
- [ ] Status: IN_TRANSIT → DELIVERED

### ✅ Customer Flow
- [ ] Login thành công
- [ ] Xem danh sách đơn đang giao
- [ ] Nhấn vào đơn → Mở tracking
- [ ] Bản đồ hiển thị đúng
- [ ] Marker tài xế di chuyển mượt
- [ ] Progress bar cập nhật
- [ ] ETA cập nhật
- [ ] Nhận notification real-time
- [ ] Xem lịch sử hành trình

### ✅ Backend
- [ ] Database: orders table cập nhật đúng
- [ ] Database: route_snapshots lưu đúng
- [ ] Redis: driver:locations cập nhật
- [ ] Redis: route buffer lưu khi di chuyển
- [ ] Socket: events emit đúng lúc
- [ ] BullMQ: notification jobs dispatch
- [ ] Latency: < 1 giây từ driver → customer

### ✅ Performance
- [ ] Pin tài xế: giảm ~60% (adaptive tracking)
- [ ] GPS updates: ~200-300/giờ (không 720)
- [ ] Redis writes: ~150-200/giờ (không 720)
- [ ] Socket broadcasts: ~240/giờ (không 720)
- [ ] Directions API: ~12-24 calls/giờ (không 720)

---

## PHẦN 8: TROUBLESHOOTING

### ❌ Backend không khởi động
```bash
# Kiểm tra Docker
docker ps

# Nếu PostgreSQL/Redis không chạy
docker-compose up -d

# Kiểm tra logs
docker-compose logs postgres
docker-compose logs redis
```

### ❌ Mobile app không kết nối backend
```bash
# Kiểm tra IP backend
ipconfig getifaddr en0  # macOS
hostname -I  # Linux
ipconfig  # Windows

# Cập nhật .env trong mobile
REACT_APP_API_URL=http://YOUR_IP:3000
REACT_APP_SOCKET_URL=http://YOUR_IP:3000
```

### ❌ QR scan không hoạt động
```bash
# Kiểm tra camera permission
# iOS: Settings → Livemove → Camera → Allow
# Android: Settings → Apps → Livemove → Permissions → Camera

# Test QR code
# Dùng https://qrcode.tec-it.com/ để tạo QR test
```

### ❌ Notification không hiển thị
```bash
# Kiểm tra FCM token
# Backend logs: "FCM token received: xxx"

# Kiểm tra Firebase config
# Đảm bảo firebase-admin.json đúng

# Test manual
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"fcmToken":"xxx","title":"Test","body":"Test message"}'
```

### ❌ Marker không di chuyển
```bash
# Kiểm tra GPS mock (emulator)
# Android Studio: Extended controls → Location → Manual

# Kiểm tra socket connection
# Browser DevTools → Network → WS → socket.io

# Kiểm tra server logs
# Tìm "driver:location received"
```

---

## PHẦN 9: METRICS KIỂM TRA

Sau khi test xong, kiểm tra các metrics:

```bash
# 1. Latency (từ Driver emit → Customer nhận)
# Mong đợi: < 1 giây

# 2. GPS updates/giờ
# Mong đợi: 200-300 (không 720)

# 3. Redis memory
# Mong đợi: < 100MB

# 4. Database size
# Mong đợi: < 50MB

# 5. Socket connections
# Mong đợi: 3 (admin + driver + customer)

# 6. CPU usage
# Mong đợi: < 30%

# 7. Memory usage
# Mong đợi: < 500MB
```

---

## PHẦN 10: NEXT STEPS

Nếu test PASS ✅:
- [ ] Commit code
- [ ] Tạo PR
- [ ] Deploy lên staging
- [ ] Test load (Phase 6)

Nếu test FAIL ❌:
- [ ] Ghi lại lỗi
- [ ] Kiểm tra logs
- [ ] Fix bug
- [ ] Re-test

---

**Chúc bạn test thành công! 🚀**
