# Quy trình vận hành Livemove (B2B Fleet Management)

Tài liệu này mô tả quy trình vận hành từ đầu đến cuối (End-to-End Workflow) của hệ thống Livemove, tập trung vào sự phối hợp giữa 3 tác nhân chính: **Admin**, **Customer** (Khách hàng) và **Driver** (Tài xế).

## 1. Quy trình tổng quát (Trạng thái đơn hàng)

Quy trình vòng đời của một đơn hàng trải qua 5 trạng thái chính:
`PENDING` (Chờ xử lý) → `ASSIGNED` (Đã giao tài xế) → `PICKED_UP` (Đã lấy hàng) → `IN_TRANSIT` (Đang vận chuyển) → `DELIVERED` (Hoàn thành/Giao thành công).

---

## 2. Sự phối hợp giữa 3 bên và yêu cầu cụ thể

### Bước 1: Khởi tạo và Điều phối (Admin/Staff)
*   **Công việc**: Admin/Nhân viên điều phối tạo đơn hàng trên hệ thống và chỉ định tài xế phụ trách.
*   **Phối hợp**: Hệ thống tự động thiết lập dữ liệu ban đầu, khởi tạo mã QR cho đơn hàng và thông báo cho tài xế được nhận đơn.
*   **Yêu cầu cụ thể**:
    *   **Tạo đơn**: Nhập đầy đủ thông tin (địa chỉ lấy/giao, tọa độ GPS tương ứng, thông tin người nhận, mô tả hàng hóa).
    *   **Mã QR**: Hệ thống phải tự động sinh mã QR định danh (định dạng UUID, unique) và render ảnh QR để Admin có thể in ra dán lên kiện hàng.
    *   **Thông báo & Phân công**: Khi chuyển trạng thái sang `ASSIGNED`, hệ thống phải bắn thông báo Push (FCM) và qua Socket đến App của tài xế ngay lập tức.

### Bước 2: Xác nhận lấy hàng (Driver & Admin)
*   **Công việc**: Tài xế đi đến điểm lấy hàng, sử dụng Mobile App để quét mã QR dán trên kiện hàng nhằm xác nhận đã lấy kiện hàng thành công.
*   **Phối hợp**: Khi quét thành công, trạng thái đơn hàng chuyển sang `PICKED_UP`. Backend sẽ xử lý bất đồng bộ để gửi thông báo đến Khách hàng rằng tài xế đã lấy hàng và bắt đầu di chuyển.
*   **Yêu cầu cụ thể (Driver)**:
    *   Mobile App phải sử dụng **CameraView** tích hợp để quét QR mượt mà.
    *   Backend phải kiểm tra tính hợp lệ: Đúng tài xế được phân công, đúng mã QR của đơn hàng, đơn hàng đang ở trạng thái `ASSIGNED` mới cho phép xác nhận.
    *   **Độ trễ (Latency)**: Thời gian từ lúc ứng dụng gửi mã QR lên server đến lúc khách hàng nhận được Push notification phải **< 1 giây**.

### Bước 3: Theo dõi hành trình Real-time (Driver & Customer)
*   **Công việc**: Tài xế bắt đầu di chuyển từ điểm lấy hàng đến địa chỉ đích. App tài xế tự động gửi tọa độ GPS lên server. App khách hàng nhận tọa độ này và hiển thị vị trí của tài xế đang chạy trên bản đồ.
*   **Phối hợp**: Vị trí được fan-out cho các khách hàng đang subscribe room socket của đơn hàng đó. Khách hàng theo dõi được ETA (thời gian dự kiến đến) và % tiến trình giao hàng.
*   **Yêu cầu cụ thể (Driver)**:
    *   **Adaptive Tracking (Tối ưu pin)**: App phải thay đổi chu kỳ gửi vị trí tùy trạng thái. Cập nhật 3s/lần khi gần đích (<500m), 5-10s khi đang đi bình thường, và thưa hơn (lên tới 60s) khi đứng yên. Điều này giúp giảm ~60% hao pin.
    *   Dữ liệu gửi lên phải kèm trạng thái chuyển động (`isMoving`), hướng di chuyển (`heading`) và tốc độ.
*   **Yêu cầu cụ thể (Customer)**:
    *   **Ongoing Notification**: Phải hiển thị thanh tiến trình (%) và ETA liên tục trên thanh thông báo hoặc màn hình khóa (giống cách Grab hay ShopeeFood hoạt động).
    *   **Live Map**: Bản đồ chia làm 2 màu đường đi (viết từ Google Directions API): phần đã đi (màu xám), phần còn lại (màu xanh). App phải tự động tính lại đường (Re-routing) kết hợp với Backend nếu tài xế đi lệch khỏi lộ trình > 200m.

### Bước 4: Hoàn thành đơn hàng (Driver, Customer & Admin)
*   **Công việc**: Tài xế đến nơi, giao hàng tận tay khách. Khách hàng kiểm tra và (nếu cần) xác nhận. Tài xế bấm cập nhật hoàn thành hoặc khách hàng xác nhận nhận hàng trên hệ thống.
*   **Phối hợp**: Trạng thái đơn hàng chuyển thành `DELIVERED`. Hệ thống gỡ bỏ các thông báo Ongoing, xóa cache Redis và lưu cứng dữ liệu lịch sử hành trình.
*   **Yêu cầu cụ thể**:
    *   **Lưu trữ**: Chuyển tọa độ hành trình dạng mảng (route snapshot) từ bộ nhớ động (Redis) sang cơ sở dữ liệu vĩnh viễn (PostgreSQL) thông qua một Queue Job chạy ngầm (BullMQ).
    *   **Thông báo & UI**: Gửi thông báo Push thành công cho khách hàng, Admin để dễ dàng quản lý và đối soát cước phí. Trên Customer App sẽ ẩn marker và hiển thị màn hình chúc mừng.

---

## 3. Bản tóm tắt nhiệm vụ theo System Components

| Đối tượng | Hệ thống/Thiết bị | Yêu cầu quan trọng nhất |
| :--- | :--- | :--- |
| **Admin** | Trang Quản lý Web/App | Quản lý đội xe (Fleet), tạo đơn hàng, giám sát trạng thái trực tuyến của toàn bộ tài xế qua một bản đồ tổng quát. |
| **Driver** | Mobile App (Android/iOS) | **Background Location**: Việc theo dõi GPS phải hoạt động chính xác ngay cả khi khóa màn hình hoặc ứng dụng bị đẩy xuống Background. |
| **Customer** | Mobile App (Android/iOS) | **Real-time UX**: Dấu báo vị trí (Marker) của tài xế trên bản đồ phải tự chuyển động mượt mà (interpolation) dựa trên GPS. |
| **Hệ thống** | Backend (NestJS + Redis) | Xử lý hiệu năng cao, mở rộng theo chiều ngang (Horizontal Scaling) với Redis-adapter, chịu tải ít nhất 1.000 tài xế + 1.000 khách đồng thời. |
