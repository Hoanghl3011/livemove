# ⚡ QUICK START - Livemove Demo (5 phút)

## 🚀 Bước 1: Khởi động Backend

```bash
cd backend

# Khởi động Docker
docker-compose up -d

# Chờ 10 giây
sleep 10

# Cài dependencies
npm install

# Chạy migrations
npm run migration:run

# Seed test data
npm run seed

# Khởi động server
npm run start:dev
```

**Kết quả**: Server chạy trên `http://localhost:3000`

---

## 📱 Bước 2: Khởi động Mobile App

### Option A: Dùng 3 thiết bị/emulator

```bash
# Terminal 2: Admin
cd mobile
npx expo start --dev-client

# Terminal 3: Driver
cd mobile
npx expo start --dev-client --port 8081

# Terminal 4: Customer
cd mobile
npx expo start --dev-client --port 8082
```

### Option B: Dùng Web Browser (nhanh hơn)

```bash
# Terminal 2: Web
cd mobile
npm run web
```

Mở 3 tabs:
- Tab 1: `http://localhost:3000/admin` (Admin)
- Tab 2: `http://localhost:3000/driver` (Driver)
- Tab 3: `http://localhost:3000/customer` (Customer)

---

## 🧪 Bước 3: Test Flow (10 phút)

### Tab 1: Admin
```
1. Login: admin@livemove.com / Admin@123456
2. Nhấn "Tạo đơn"
3. Nhập:
   - Lấy hàng: 123 Nguyễn Huệ, Q.1, TP.HCM
   - Giao hàng: 456 Lê Lợi, Q.1, TP.HCM
   - Người nhận: Nguyễn Văn B
   - SĐT: 0987654321
4. Chọn tài xế: Nguyễn Văn A
5. Nhấn "Tạo đơn"
6. Nhấn "Giao cho tài xế"
```

### Tab 2: Driver
```
1. Login: 0912345678 / Driver@123456
2. Xem danh sách đơn
3. Nhấn "Quét QR"
4. Quét QR từ Admin (hoặc dùng QR test)
5. Nhấn "Bắt đầu giao hàng"
6. Cho phép truy cập vị trí
7. Xem bản đồ
```

### Tab 3: Customer
```
1. Login: customer@livemove.com / Customer@123456
2. Xem danh sách đơn
3. Nhấn vào đơn để xem tracking
4. Xem marker tài xế di chuyển
5. Xem progress bar cập nhật
```

---

## 📊 Bước 4: Kiểm tra Kết quả

### ✅ Checklist
- [ ] Admin tạo đơn thành công
- [ ] Driver quét QR thành công
- [ ] Customer thấy tracking real-time
- [ ] Marker di chuyển mượt
- [ ] Progress bar cập nhật
- [ ] ETA giảm dần
- [ ] Notification hiển thị

### 🔍 Kiểm tra Database

```bash
# Kết nối PostgreSQL
psql -U postgres -d livemove

# Xem orders
SELECT order_code, status, assigned_at, picked_up_at 
FROM orders 
ORDER BY created_at DESC LIMIT 1;

# Xem route_snapshots
SELECT total_distance_km, total_duration_sec 
FROM route_snapshots 
ORDER BY created_at DESC LIMIT 1;
```

### 🔴 Kiểm tra Redis

```bash
# Kết nối Redis
redis-cli

# Xem driver locations
GEOPOS driver:locations driver-id

# Xem route buffer
ZRANGE route:order-id 0 -1 WITHSCORES
```

---

## 🎯 Test Credentials

| Role | Email/Phone | Password |
|---|---|---|
| Admin | admin@livemove.com | Admin@123456 |
| Staff | staff@livemove.com | Staff@123456 |
| Customer | customer@livemove.com | Customer@123456 |
| Driver 1 | 0912345678 | Driver@123456 |
| Driver 2 | 0987654321 | Driver@123456 |

---

## 📍 Test Locations

| Địa điểm | Địa chỉ | Tọa độ |
|---|---|---|
| Lấy hàng | 123 Nguyễn Huệ, Q.1 | 10.7769, 106.6966 |
| Giao hàng | 456 Lê Lợi, Q.1 | 10.7751, 106.7015 |
| Khoảng cách | ~3.5 km | ~25 phút |

---

## 🐛 Troubleshooting

### Backend không khởi động
```bash
docker-compose down
docker-compose up -d
npm run migration:run
npm run seed
npm run start:dev
```

### Mobile không kết nối backend
```bash
# Cập nhật .env
REACT_APP_API_URL=http://YOUR_IP:3000
REACT_APP_SOCKET_URL=http://YOUR_IP:3000

# Restart app
npx expo start --dev-client --clear
```

### QR scan không hoạt động
- Kiểm tra camera permission
- Dùng QR test từ: https://qrcode.tec-it.com/
- Nội dung QR: `{"orderId":"ORD-xxx","qrCode":"uuid-xxx"}`

### Marker không di chuyển
- Kiểm tra GPS mock (Android Studio Extended controls)
- Kiểm tra socket connection (DevTools → Network → WS)
- Kiểm tra server logs: `driver:location received`

---

## 📈 Performance Metrics

Sau khi test, kiểm tra:

```bash
# 1. Latency (< 1 giây)
# Từ Driver emit → Customer nhận

# 2. GPS updates/giờ (200-300, không 720)
# Adaptive tracking hoạt động

# 3. Redis memory (< 100MB)
# Deduplication hoạt động

# 4. Database size (< 50MB)
# Route snapshots lưu đúng

# 5. Socket connections (3)
# Admin + Driver + Customer
```

---

## 🎉 Kết quả Mong đợi

```
✅ Admin tạo đơn: ORD-20260401-001
✅ Driver quét QR: Status PICKED_UP
✅ Customer xem tracking: Marker di chuyển
✅ Progress: 0% → 100%
✅ ETA: 25 phút → 0 phút
✅ Status: DELIVERED
✅ Route lưu: 3.5 km, 25 phút
```

---

**Chúc bạn test thành công! 🚀**

Nếu có vấn đề, xem chi tiết tại: `docs/E2E_TEST_GUIDE.md`
