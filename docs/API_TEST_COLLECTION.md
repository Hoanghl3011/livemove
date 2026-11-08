# 🔌 API TEST COLLECTION - Livemove

> Dùng Postman hoặc Insomnia để test các API endpoints

---

## 1️⃣ AUTH ENDPOINTS

### 1.1 Admin Login

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@livemove.com",
  "password": "Admin@123456"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@livemove.com",
    "full_name": "Admin Livemove",
    "role": "ADMIN"
  }
}
```

### 1.2 Driver Login

```http
POST http://localhost:3000/auth/driver/login
Content-Type: application/json

{
  "phone": "0912345678",
  "password": "Driver@123456"
}
```

### 1.3 Refresh Token

```http
POST http://localhost:3000/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2️⃣ ORDERS ENDPOINTS

### 2.1 Tạo Đơn Hàng

```http
POST http://localhost:3000/orders
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "pickup_address": "123 Nguyễn Huệ, Q.1, TP.HCM",
  "pickup_lat": 10.7769,
  "pickup_lng": 106.6966,
  "delivery_address": "456 Lê Lợi, Q.1, TP.HCM",
  "delivery_lat": 10.7751,
  "delivery_lng": 106.7015,
  "receiver_name": "Nguyễn Văn B",
  "receiver_phone": "0987654321",
  "package_description": "Gói hàng 2kg, dễ vỡ",
  "driver_id": "driver-uuid",
  "notes": "Giao vào giờ hành chính"
}
```

**Response**:
```json
{
  "id": "order-uuid",
  "order_code": "ORD-20260401-001",
  "status": "PENDING",
  "qr_code": "uuid-qr",
  "qr_image_url": "http://localhost:3000/qrcodes/uuid.png",
  "created_at": "2026-04-01T10:30:00Z"
}
```

### 2.2 Danh sách Đơn Hàng

```http
GET http://localhost:3000/orders?status=ASSIGNED&page=1&limit=10
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "data": [
    {
      "id": "order-uuid",
      "order_code": "ORD-20260401-001",
      "status": "ASSIGNED",
      "driver": {
        "id": "driver-uuid",
        "full_name": "Nguyễn Văn A",
        "license_plate": "59A-12345"
      },
      "receiver_name": "Nguyễn Văn B",
      "delivery_address": "456 Lê Lợi, Q.1, TP.HCM",
      "eta_minutes": 25,
      "assigned_at": "2026-04-01T10:31:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### 2.3 Chi tiết Đơn Hàng

```http
GET http://localhost:3000/orders/order-uuid
Authorization: Bearer {access_token}
```

### 2.4 Giao Đơn cho Tài xế

```http
PATCH http://localhost:3000/orders/order-uuid/assign
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "driver_id": "driver-uuid"
}
```

**Response**:
```json
{
  "id": "order-uuid",
  "order_code": "ORD-20260401-001",
  "status": "ASSIGNED",
  "driver_id": "driver-uuid",
  "assigned_at": "2026-04-01T10:31:00Z"
}
```

### 2.5 Quét QR

```http
POST http://localhost:3000/orders/scan-qr
Authorization: Bearer {driver_token}
Content-Type: application/json

{
  "qrCode": "uuid-qr"
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "order-uuid",
    "order_code": "ORD-20260401-001",
    "status": "PICKED_UP",
    "picked_up_at": "2026-04-01T10:32:00Z"
  }
}
```

---

## 3️⃣ TRACKING ENDPOINTS

### 3.1 Lấy Vị trí Tài xế Hiện tại

```http
GET http://localhost:3000/tracking/driver/driver-uuid/location
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "driver_id": "driver-uuid",
  "lat": 10.7760,
  "lng": 106.6980,
  "heading": 45,
  "speed": 12.5,
  "timestamp": 1743638400000
}
```

### 3.2 Lấy Vị trí Tài xế gần Đây

```http
GET http://localhost:3000/tracking/drivers/nearby?lat=10.7769&lng=106.6966&radius=5
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "drivers": [
    {
      "driver_id": "driver-uuid",
      "full_name": "Nguyễn Văn A",
      "lat": 10.7760,
      "lng": 106.6980,
      "distance_km": 0.15,
      "is_online": true
    }
  ]
}
```

### 3.3 Lấy Lịch sử Hành trình

```http
GET http://localhost:3000/tracking/orders/order-uuid/route
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "order_id": "order-uuid",
  "driver_id": "driver-uuid",
  "coordinates": [
    {"lat": 10.7769, "lng": 106.6966, "timestamp": 1743638400000},
    {"lat": 10.7765, "lng": 106.6970, "timestamp": 1743638405000},
    {"lat": 10.7751, "lng": 106.7015, "timestamp": 1743638425000}
  ],
  "total_distance_km": 3.5,
  "total_duration_sec": 1500,
  "started_at": "2026-04-01T10:32:00Z",
  "ended_at": "2026-04-01T10:57:00Z"
}
```

---

## 4️⃣ DRIVERS ENDPOINTS

### 4.1 Danh sách Tài xế

```http
GET http://localhost:3000/drivers?is_online=true&page=1&limit=10
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "data": [
    {
      "id": "driver-uuid",
      "full_name": "Nguyễn Văn A",
      "phone": "0912345678",
      "license_plate": "59A-12345",
      "vehicle_type": "motorcycle",
      "is_online": true,
      "last_lat": 10.7760,
      "last_lng": 106.6980,
      "last_location_at": "2026-04-01T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### 4.2 Chi tiết Tài xế

```http
GET http://localhost:3000/drivers/driver-uuid
Authorization: Bearer {access_token}
```

### 4.3 Cập nhật Tài xế

```http
PATCH http://localhost:3000/drivers/driver-uuid
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A",
  "license_plate": "59A-12345",
  "vehicle_type": "car"
}
```

---

## 5️⃣ NOTIFICATIONS ENDPOINTS

### 5.1 Danh sách Thông báo

```http
GET http://localhost:3000/notifications?page=1&limit=10
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "data": [
    {
      "id": "notification-uuid",
      "order_id": "order-uuid",
      "recipient_id": "user-uuid",
      "title": "📦 Đơn hàng đang được lấy!",
      "body": "Tài xế Nguyễn Văn A (59A-12345) đã lấy hàng. ETA: 25 phút",
      "status": "SENT",
      "sent_at": "2026-04-01T10:32:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### 5.2 Test Gửi Notification

```http
POST http://localhost:3000/notifications/test
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "fcm_token": "fcm-token-xxx",
  "title": "Test Notification",
  "body": "This is a test message"
}
```

---

## 6️⃣ DASHBOARD ENDPOINTS

### 6.1 Tổng quan Dashboard

```http
GET http://localhost:3000/dashboard/overview
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "total_orders": 150,
  "active_deliveries": 23,
  "completed_today": 45,
  "drivers_online": 18,
  "avg_delivery_time": 35,
  "success_rate": 98.5
}
```

### 6.2 Biểu đồ Đơn Hàng

```http
GET http://localhost:3000/dashboard/orders/chart?period=week
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "period": "week",
  "data": [
    {"date": "2026-03-26", "count": 120},
    {"date": "2026-03-27", "count": 135},
    {"date": "2026-03-28", "count": 145},
    {"date": "2026-03-29", "count": 150},
    {"date": "2026-03-30", "count": 160},
    {"date": "2026-03-31", "count": 155},
    {"date": "2026-04-01", "count": 150}
  ]
}
```

### 6.3 Vị trí Tài xế

```http
GET http://localhost:3000/dashboard/drivers/locations
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "drivers": [
    {
      "driver_id": "driver-uuid",
      "full_name": "Nguyễn Văn A",
      "lat": 10.7760,
      "lng": 106.6980,
      "is_online": true,
      "current_order": "ORD-20260401-001"
    }
  ]
}
```

---

## 🔌 WEBSOCKET EVENTS

### Subscribe Tracking

```javascript
// Client
socket.emit('tracking:subscribe', { orderId: 'order-uuid' });

// Server response
socket.on('tracking:update', (data) => {
  console.log({
    lat: 10.7760,
    lng: 106.6980,
    heading: 45,
    speed: 12.5,
    timestamp: 1743638400000,
    isMoving: true,
    progressPercent: 45,
    distanceRemaining: 1.8,
    etaMinutes: 12,
    driverName: 'Nguyễn Văn A',
    licensePlate: '59A-12345',
    orderStatus: 'IN_TRANSIT'
  });
});
```

### Driver Location Update

```javascript
// Driver emit
socket.emit('driver:location', {
  lat: 10.7760,
  lng: 106.6980,
  heading: 45,
  speed: 12.5,
  timestamp: 1743638400000,
  isMoving: true,
  distanceToDestination: 1.8,
  orderId: 'order-uuid'
});

// Server broadcast to customers
socket.to(`order:order-uuid`).emit('tracking:update', {...});
```

### Order Status Changed

```javascript
// Server emit
socket.to(`company:company-uuid`).emit('order:status:changed', {
  orderId: 'order-uuid',
  status: 'PICKED_UP',
  driverName: 'Nguyễn Văn A',
  eta: 25,
  timestamp: 1743638400000
});
```

---

## 📊 POSTMAN COLLECTION IMPORT

Tạo file `livemove.postman_collection.json`:

```json
{
  "info": {
    "name": "Livemove API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Admin Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@livemove.com\",\"password\":\"Admin@123456\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Orders",
      "item": [
        {
          "name": "Create Order",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/orders",
            "header": [
              {"key": "Authorization", "value": "Bearer {{access_token}}"}
            ]
          }
        }
      ]
    }
  ]
}
```

Import vào Postman: `File → Import → Paste JSON`

---

## 🧪 TEST SCENARIOS

### Scenario 1: Tạo và Giao Đơn

```bash
1. POST /auth/login (Admin)
   → Lưu access_token

2. POST /orders (Admin)
   → Lưu order_id, qr_code

3. PATCH /orders/{id}/assign (Admin)
   → Verify status = ASSIGNED

4. POST /auth/driver/login (Driver)
   → Lưu driver_token

5. POST /orders/scan-qr (Driver)
   → Verify status = PICKED_UP
```

### Scenario 2: Live Tracking

```bash
1. WS connect (Customer)
   → socket.emit('tracking:subscribe', {orderId})

2. WS emit (Driver)
   → socket.emit('driver:location', {...})

3. WS receive (Customer)
   → socket.on('tracking:update', {...})
   → Verify lat, lng, progress, eta
```

### Scenario 3: Hoàn thành Đơn

```bash
1. PATCH /orders/{id}/complete (Driver)
   → Verify status = DELIVERED

2. GET /tracking/orders/{id}/route (Customer)
   → Verify total_distance_km, total_duration_sec

3. GET /dashboard/overview (Admin)
   → Verify completed_today++
```

---

**Chúc bạn test API thành công! 🚀**
