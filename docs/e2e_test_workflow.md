# Hướng dẫn Kịch bản Kiểm thử End-to-End (E2E Test Workflow)

Kịch bản này mô phỏng chi tiết luồng vận hành của một đơn hàng trên hệ thống Livemove từ lúc một nhân viên điều phối (Admin) tạo đơn, cho đến khi Tài xế (Driver) lấy hàng, Khách hàng (Customer) theo dõi trực tiếp lộ trình, và cuối cùng là đơn hàng được giao thành công. Kịch bản có thể dùng để kiểm thử thủ công (QA) hoặc chạy K6/Postman Automation.

---

## 🛑 Chuẩn bị (Pre-requisites)
1. **Dữ liệu**: Chạy seed data (`npm run db:seed`) để có sẵn ít nhất một `Company`, một tài khoản `Admin`, một `Driver`, một tài khoản `Customer`.
2. **Backend**: Chạy `npm run start:dev` cho định tuyến NestJS (Server).
3. **Môi trường**: Tuỳ vào số lượng thiết bị bạn có.

### 💡 TRƯỜNG HỢP: Chỉ có 1 iPhone & 1 Máy tính Windows
Vì bạn chỉ có 1 thiết bị thực tế để test năng lực Mobile, hãy chọn 1 trong 2 phương pháp sau tuỳ thuộc bạn muốn test tính năng nào kỹ nhất:

**Phương pháp 1: iPhone làm Tài Xế (Khuyên dùng để test Camera và GPS Background)**
*   **iPhone**: Cài Expo Dev Client và mở luồng App **Driver**. Dùng để quét thật mã QR từ màn hình máy tính và cầm máy đi lại để test GPS.
*   **Máy Tính (Windows)**: Mở Chrome (1 tab chạy Admin Dashboard lúc đầu tạo đơn), và cài một **Android Emulator** (Android Studio / genymotion / LDPlayer) để chạy App **Customer**.
*   *Lưu ý*: Notification của Customer sẽ nhảy trên Android Emulator của máy tính thay vì máy thật.

**Phương pháp 2: iPhone làm Khách Hàng (Khuyên dùng để test UI mượt mà, Notification Lock-screen của iOS)**
*   **iPhone**: Cài app và Login dưới quyền **Customer**. Để trực diện xem Ongoing Notification có mượt không.
*   **Máy tính (Windows)**:
    1. Chạy Admin tạo đơn.
    2. Dùng phần mềm như **Postman**, **Insomnia** (hoặc 1 file script Node.js/Python nhỏ) để giả lập Tài xế. Bạn truyền API `/orders/scan-qr` và tự mock `driver:location` qua giao thức Socket.io. Qua đó giả lập toạ độ giả đang nhích dần từ A đến B.

👉 *Trong kịch bản chi tiết dưới đây, chúng ta sẽ viết hướng theo Phương pháp 1 (Sử dụng 1 iPhone cho Driver và 1 App/Emulator cho Customer).*

---

## Bước 1: Admin tạo đơn và phân công tài xế
**Vai trò**: Admin/Nhân viên điều phối

### Hành động (Actions):
1. **Đăng nhập Admin**: Truy cập Admin Dashboard (Web). Nhập email/password tài khoản Admin để lấy được Auth Token (`JWT`).
2. **Mở trang "Tạo Đơn Hàng"**: Điền đầy đủ thông tin:
    * Người nhận: (Email khách hàng test, số điện thoại, v.v.)
    * Vị trí Lấy hàng (Ví dụ: `10.7766, 106.7018` - VP Công ty)
    * Vị trí Giao hàng (Ví dụ: `10.7820, 106.7032` - Nhà khách)
    * Chọn tài xế (Ví dụ: Driver `Nguyen Van A` từ danh sách đang *Online*).
3. **Submit Đơn**: Chọn `Tạo & Giao việc`.

### Kiểm chứng (Verifications):
* [ ] Kiểm tra API `POST /orders` trả về HTTP `201 Created`.
* [ ] Trạng thái đơn hàng phải là `ASSIGNED`.
* [ ] Hệ thống hiển thị Modal chứa URL hình ảnh mã QR (dùng để mô phỏng dán lên gói hàng). Sao chép (hoặc chụp ảnh) mã QR hiển thị trên màn hình.
* [ ] Kiểm tra Database (`orders`) thấy mã `qr_code` dạng UUID đã được lưu.

---

## Bước 2: Tài xế Đăng nhập và Nhận Thông báo Phân công
**Vai trò**: Driver

### Hành động (Actions):
1. Cầm thiết bị test của Tài xế, mở Driver App.
2. Đăng nhập bằng số điện thoại và password của tài khoản tài xế. 
3. Giữ màn hình App lúc này.

### Kiểm chứng (Verifications):
* [ ] Gần như ngay khi Admin tạo đơn (ở Bước 1), tài khoản Driver này sẽ nhận một thông báo Push FCM (Có tiêu đề: "Bạn vừa được giao một đơn hàng mới"). 
* [ ] Giao diện màn hình Home của tài xế cập nhật qua Socket (event: `order:assigned`), hiển thị danh sách đơn hàng có đơn mới (đang chờ lấy hàng).

---

## Bước 3: Tài xế quét mã QR (Xác nhận lấy hàng)
**Vai trò**: Driver

### Hành động (Actions):
1. Trên Driver App, bấm vào đơn hàng mới và chọn **"Quét QR"** (Mở màn hình `scanner.tsx`).
2. Xác nhận quyền truy cập Camera nếu app hỏi.
3. Chĩa Camera vào mã QR (đã hiển thị/In ra ở Bước 1) và quét.
4. Màn hình App Driver sẽ tự động loading từ lúc bắt được mã QR.

### Kiểm chứng (Verifications):
* [ ] API `POST /orders/scan-qr` chạy với body có chứa chuỗi QR hợp lệ. HTTP response `200 OK`.
* [ ] Ngay khi quét thành công, trên giao diện Driver có hiệu ứng Tick xanh (Animation mượt màn hình) và lập tức chuyển cảnh sang trang Live Delivery (Bản đồ đi lại gốc).
* [ ] Quan trọng nhất: Độ trễ phản hồi kể từ lúc bắt được khung QR phải dưới 1 giây.

---

## Bước 4: Khách hàng nhận Notification & Xem Live Tracking
**Vai trò**: Customer

### Hành động (Actions):
1. Ở thiết bị test thứ 2 (App Customer), đảm bảo Customer đã cho phép Push Notification.
2. Từ lúc Driver quét (xong Bước 3), Customer lập tức nhận Cảnh báo Push FCM `(FCM High Priority)`: "Tài xế Nguyễn Văn A vừa lấy hàng!". 
3. Xem trên Notification Bar/Lock Screen của điện thoại, phải có một **Ongoing Notification** tĩnh, báo hiệu kiện hàng ở 0%.
4. Nhấn vào thông báo Ongoing này: Mở thẳng Application vào màn hình `tracking/[orderId]`.

### Kiểm chứng (Verifications):
* [ ] Trên App Customer, trạng thái đơn ở màn hình Home là `PICKED_UP` (hoặc `IN_TRANSIT`). 
* [ ] Màn hình Live Tracking mở ra, App Customer gửi lệnh Socket theo dõi `tracking:subscribe` thành công.
* [ ] Tại thời điểm này, màn hình Tracking có đủ: Nơi lấy hàng, Nơi đến, Đường đi Polyline kết xuất từ Google Maps, Biểu đồ tiến độ (ProgressBar) ở phía dưới.

---

## Bước 5: Giả lập Quá trình Di chuyển GPS (In-Transit)
**Vai trò**: Driver & Customer

### Hành động (Actions):
1. Cho Driver di chuyển (Nếu ngoài đường thật) HOẶC sử dụng công cụ *Simulate Location / Mock Location* trên thiết bị Android/iOS để nhích tọa độ từ điểm A dọc theo đường đi đến điểm B. 
   > Mẹo chạy Mock: Dùng Postman để bắn liên tục mock socket event `driver:location` hoặc dùng script `GPS Spoofer`.
2. Đeo chéo: Nhìn màn hình Driver và nhìn màn hình Customer cạnh nhau.

### Kiểm chứng (Verifications):
* [ ] **Cập nhật Backend**: API Redis GEOADD ghi nhận được vị trí xe.
* [ ] **Customer App Visuals**: 
   - Trên bản đồ khách hàng, Marker (hình chiếc xe) di chuyển dọc theo con đường.
   - Marker **không nhảy cóc** mà trượt mềm (Interpolation / AnimateMarker 4000ms).
   - Đường Polyline bị chém đôi (Đoạn màu Xám là đường đã qua, Đoạn màu Xanh là đường sắp tới).
* [ ] **UX & Battery**: (Nếu mock liên tục < 30s với quãng đường siêu nhỏ, Backend bỏ qua cập nhật / Deduplicate. Driver App cũng chỉ gửi thưa dần nếu thiết bị dừng một chỗ quá 60 giây).
* [ ] **Customer Notification**: Ongoing Notification trên thanh thông báo khách hàng đổi text liên tục: Ví dụ chuyển từ `[🚗 Nguyễn Văn A | 📍 Còn 3.2km]` sang `[🚗 Nguyễn Văn A | 📍 Còn 1.5km]`.

---

## Bước 6: Thử nghiệm Lệch tuyến và Mất mạng (Negative Scenarios)
**Vai trò**: Driver / Customer

### Hành động Lệch tuyến (Re-route):
1. Dùng Mock API/GPS Spoofer cho tọa độ của hệ thống tài xế văng ra xa tuyến đường (Polyline) dự phòng **khoảng 300 - 500m**.
2. **Kiểm chứng**: 
   * [ ] Customer App tự động bắt lại (Re-call Directions API) vì khoảng cách > 200m. ETA (Thời gian dự kiến) được tính mới (nhảy số phút). Đường màu xanh (đường còn lại) vẽ một nét mới hoàn toàn đi xuyên từ vị trí xe hiện tại về Cửa nhà đến.

### Hành động Tắt Màn Hình Customer:
1. Customer bấm nút Nguồn (Tắt màn hình điện thoại/Khoá máy).
2. Tọa độ của tài xế vẫn tiếp tục di chuyển đi sát về đích.
3. Bấm mở sáng màn hình điện thoại của Customer (Không mở App lên).
4. **Kiểm chứng**: 
   * [ ] Notification trên Lock-screen (Màn hình khóa) vẫn trượt %. Nghĩa là App và Socket Background (hoặc Fallback bằng cron/Silent push) hoạt động trơn tru.

---

## Bước 7: Hoàn tất Đơn Hàng (Delivered)
**Vai trò**: Driver / Customer / Admin

### Hành động (Actions):
1. Di chuyển tọa độ GPS của Driver đến < 5m so với vùng giao hàng. 
2. Driver bấm nút **"Hoàn thành giao hàng"** trên Application.
3. (Tùy chọn thiết lập hệ thống) Customer xác nhận đã nhận hàng (bằng QR / Bằng nút).

### Kiểm chứng (Verifications):
* [ ] Hành động đổi status thành `DELIVERED` được Backend xử lý ghi vào bảng PostgreSQL Database. Ngay lúc đó, Redis Cache `ZADD` và `GEOADD` phục vụ đơn hàng này/Tài xế này được xoá ngầm (Job Bullmq: Route Flush Job).
* [ ] Customer nhận thông báo nổi bật cuối cùng rụng xuống: `✅ Đơn hàng đã giao thành công và hoàn tất`. (Notification lúc này có thể quẹt tự tắt được, tháo gỡ 'Sticky Ongoing').
* [ ] Cùng lúc, Administrative Dashboard trên Website báo "Đơn hàng XXX" đã Completed. Kéo Route Snapshot từ `Route_Snapshots` lên có thể thấy toàn bộ quỹ đạo đường đi từ A đến B (Data lạnh).

---
## Kết luận
Bất kỳ điểm nứt gãy nào xảy ra trong kịch bản E2E trên (như Push notification rớt, Polyline điêu hay App Customer đứng hình khi lock máy) đều chứng tỏ yêu cầu vận hành chưa được hoàn thành. Việc test cần đặc biệt chú ý đến **độ mượt di chuyển Marker (Bước 5)** và **Thông báo tĩnh trên Notification (Bước 4, Bước 6)**.
