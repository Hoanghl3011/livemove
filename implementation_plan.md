# Phase 3 — Real-time GPS Tracking

Tạo hệ thống theo dõi vị trí tài xế theo thời gian thực (Real-time GPS Tracking) sử dụng Redis để lưu trữ vị trí tạm thời và Socket.io để đẩy dữ liệu tới khách hàng. Sau khi đơn hàng hoàn thành, hành trình sẽ được lưu vào PostgreSQL.

## Proposed Changes

### [Component] Tracking Module

#### [NEW] [tracking.service.ts](file:///d:/Livemove/backend/src/modules/tracking/tracking.service.ts)
- Implement `calculateDeliveryProgress`: Tính toán phần trăm hoàn thành, khoảng cách còn lại và ETA dựa trên công thức Haversine.
- Implement logic lưu hành trình vào Redis Sorted Set (`route:<orderId>`).

#### [MODIFY] [tracking.gateway.ts](file:///d:/Livemove/backend/src/modules/tracking/tracking.gateway.ts)
- Thêm event `driver:location`: Nhận GPS từ driver, cập nhật Redis, và broadcast `tracking:update` tới room `order:<orderId>`.
- Thêm event `tracking:subscribe` / `tracking:unsubscribe`: Cho phép khách hàng đăng ký nhận cập nhật vị trí của một đơn hàng cụ thể (sau khi validate quyền truy cập).
- Sử dụng `@UseInterceptors(ThrottlerInterceptor)` để giới hạn tần suất gửi vị trí (ví dụ: tối đa 1 lần/3 giây).

#### [MODIFY] [tracking.module.ts](file:///d:/Livemove/backend/src/modules/tracking/tracking.module.ts)
- Khai báo `TrackingService`.
- Import `BullModule` để đăng ký queue `tracking` cho việc flush route.

### [Component] Orders Module

#### [MODIFY] [orders.service.ts](file:///d:/Livemove/backend/src/modules/orders/orders.service.ts)
- Cập nhật hàm [updateStatus](file:///d:/Livemove/backend/src/modules/orders/orders.service.ts#42-51): Khi status chuyển sang `DELIVERED`, gửi một job vào queue `tracking` để thực hiện lưu route snapshot từ Redis vào Database.

### [Component] Jobs / Workers

#### [NEW] [tracking.processor.ts](file:///d:/Livemove/backend/src/modules/tracking/tracking.processor.ts)
- Xử lý job `flush-route`:
    - Lấy toàn bộ tọa độ từ Redis `route:<orderId>`.
    - Tính tổng quãng đường và thời gian.
    - Lưu vào bảng `route_snapshots`.
    - Xóa key `route:<orderId>` và `driver:locations` trong Redis.

## Verification Plan

### Automated Tests
- Tạo script giả lập driver gửi tọa độ qua Socket.io:
  ```powershell
  # Cần cài đặt socket.io-client để chạy script test
  node scripts/test-tracking.js --orderId <ID> --token <JWT>
  ```
- Kiểm tra dữ liệu trong Redis bằng `redis-cli`:
  ```bash
  GEOPOS driver:locations <driverId>
  ZRANGE route:<orderId> 0 -1
  ```

### Manual Verification
1. **Driver Flow**: Sử dụng Postman để kết nối Socket.io với Token của Driver, gửi event `driver:location`.
2. **Customer Flow**: Kết nối Socket.io với Token của User, gửi `tracking:subscribe` cho orderId tương ứng. Kiểm tra xem có nhận được `tracking:update` không.
3. **Persistence**: Cập nhật trạng thái đơn hàng thành `DELIVERED` qua API `PATCH /orders/:id`. Kiểm tra log của worker và bảng `route_snapshots` trong DB.
