# 📋 TÓM TẮT HƯỚNG DẪN TEST - Livemove

## 📚 Các File Hướng dẫn

| File | Mục đích | Thời gian |
|---|---|---|
| **QUICK_START.md** | Setup nhanh + test cơ bản | 5 phút |
| **E2E_TEST_GUIDE.md** | Test chi tiết từng flow | 30 phút |
| **API_TEST_COLLECTION.md** | Test API endpoints | 15 phút |

---

## ⚡ QUICK START (5 phút)

### Bước 1: Backend
```bash
cd backend
docker-compose up -d
npm install
npm run migration:run
npm run seed
npm run start:dev
```

### Bước 2: Mobile
```bash
cd mobile
npm run web
# Hoặc: npx expo start --dev-client
```

### Bước 3: Test
- Tab 1: Admin login → Tạo đơn
- Tab 2: Driver login → Quét QR
- Tab 3: Customer login → Xem tracking

---

## 🧪 E2E TEST (30 phút)

### Flow 1: Admin Tạo Đơn
```
Login → Dashboard → Tạo đơn → Giao tài xế
✅ Status: PENDING → ASSIGNED
✅ QR code generate
✅ Notification gửi
```

### Flow 2: Driver Quét QR
```
Login → Danh sách đơn → Quét QR → Bắt đầu giao
✅ Status: ASSIGNED → PICKED_UP → IN_TRANSIT
✅ Background location tracking
✅ Foreground service notification
```

### Flow 3: Customer Live Tracking
```
Login → Danh sách đơn → Xem tracking → Xem lịch sử
✅ Bản đồ hiển thị
✅ Marker di chuyển mượt
✅ Progress bar cập nhật
✅ ETA giảm dần
✅ Notification real-time
```

### Flow 4: Hoàn thành Đơn
```
Driver xác nhận giao → Customer nhận notification
✅ Status: IN_TRANSIT → DELIVERED
✅ Route lưu vào database
✅ Lịch sử hành trình hiển thị
```

---

## 🔌 API TEST (15 phút)

### Endpoints chính
```
POST   /auth/login                    → Login
POST   /orders                        → Tạo đơn
PATCH  /orders/{id}/assign            → Giao tài xế
POST   /orders/scan-qr                → Quét QR
GET    /tracking/orders/{id}/route    → Lịch sử
GET    /dashboard/overview            → Dashboard
```

### WebSocket Events
```
driver:location                        → Driver gửi GPS
tracking:update                        → Customer nhận update
order:status:changed                   → Status thay đổi
```

---

## 🎯 TEST CREDENTIALS

```
Admin:    admin@livemove.com / Admin@123456
Staff:    staff@livemove.com / Staff@123456
Customer: customer@livemove.com / Customer@123456
Driver 1: 0912345678 / Driver@123456
Driver 2: 0987654321 / Driver@123456
```

---

## 📍 TEST LOCATIONS

```
Lấy hàng:  123 Nguyễn Huệ, Q.1 (10.7769, 106.6966)
Giao hàng: 456 Lê Lợi, Q.1 (10.7751, 106.7015)
Khoảng cách: ~3.5 km, ~25 phút
```

---

## ✅ CHECKLIST

### Admin Flow
- [ ] Login thành công
- [ ] Xem dashboard
- [ ] Tạo đơn hàng
- [ ] QR code generate
- [ ] Giao đơn cho tài xế
- [ ] Status: PENDING → ASSIGNED

### Driver Flow
- [ ] Login thành công
- [ ] Xem danh sách đơn
- [ ] Quét QR thành công
- [ ] Status: ASSIGNED → PICKED_UP
- [ ] Bắt đầu giao hàng
- [ ] Background location tracking
- [ ] Xác nhận giao hàng
- [ ] Status: IN_TRANSIT → DELIVERED

### Customer Flow
- [ ] Login thành công
- [ ] Xem danh sách đơn
- [ ] Mở tracking screen
- [ ] Bản đồ hiển thị
- [ ] Marker di chuyển mượt
- [ ] Progress bar cập nhật
- [ ] ETA giảm dần
- [ ] Nhận notification
- [ ] Xem lịch sử hành trình

### Backend
- [ ] Database: orders cập nhật
- [ ] Database: route_snapshots lưu
- [ ] Redis: driver:locations cập nhật
- [ ] Redis: route buffer lưu
- [ ] Socket: events emit đúng
- [ ] BullMQ: jobs dispatch
- [ ] Latency: < 1 giây

### Performance
- [ ] Pin: giảm ~60%
- [ ] GPS updates: 200-300/giờ
- [ ] Redis writes: 150-200/giờ
- [ ] Socket broadcasts: 240/giờ
- [ ] API calls: 12-24/giờ

---

## 🔍 KIỂM TRA KẾT QUẢ

### Database
```bash
psql -U postgres -d livemove

SELECT order_code, status, assigned_at, picked_up_at, delivered_at 
FROM orders 
ORDER BY created_at DESC LIMIT 1;

SELECT total_distance_km, total_duration_sec 
FROM route_snapshots 
ORDER BY created_at DESC LIMIT 1;
```

### Redis
```bash
redis-cli

GEOPOS driver:locations driver-id
ZRANGE route:order-id 0 -1 WITHSCORES
HGETALL driver:status:driver-id
```

### Logs
```bash
# Backend logs
[TrackingGateway] Driver location received
[TrackingGateway] Order progress: 45%
[OrdersService] Order status updated: PICKED_UP
[NotificationsQueue] Job completed
```

---

## 🐛 TROUBLESHOOTING

### Backend không khởi động
```bash
docker-compose down
docker-compose up -d
npm run migration:run
npm run seed
npm run start:dev
```

### Mobile không kết nối
```bash
# Cập nhật .env
REACT_APP_API_URL=http://YOUR_IP:3000
REACT_APP_SOCKET_URL=http://YOUR_IP:3000

# Restart
npx expo start --dev-client --clear
```

### QR scan không hoạt động
- Kiểm tra camera permission
- Dùng QR test: https://qrcode.tec-it.com/
- Nội dung: `{"orderId":"ORD-xxx","qrCode":"uuid"}`

### Marker không di chuyển
- Kiểm tra GPS mock (Android Studio)
- Kiểm tra socket connection (DevTools)
- Kiểm tra server logs

---

## 📊 METRICS

| Chỉ số | Mong đợi | Thực tế |
|---|---|---|
| Latency | < 1s | ? |
| GPS updates/giờ | 200-300 | ? |
| Redis memory | < 100MB | ? |
| Database size | < 50MB | ? |
| Socket connections | 3 | ? |
| CPU usage | < 30% | ? |
| Memory usage | < 500MB | ? |

---

## 🎉 KẾT QUẢ MONG ĐỢI

```
✅ Admin tạo đơn: ORD-20260401-001
✅ Driver quét QR: Status PICKED_UP
✅ Customer xem tracking: Marker di chuyển
✅ Progress: 0% → 100%
✅ ETA: 25 phút → 0 phút
✅ Status: DELIVERED
✅ Route lưu: 3.5 km, 25 phút
✅ Latency: < 1 giây
✅ Pin: giảm ~60%
✅ API calls: giảm ~97%
```

---

## 📖 HƯỚNG DẪN CHI TIẾT

Xem chi tiết tại:
- **QUICK_START.md** - Setup nhanh
- **E2E_TEST_GUIDE.md** - Test chi tiết
- **API_TEST_COLLECTION.md** - Test API

---

**Chúc bạn test thành công! 🚀**
