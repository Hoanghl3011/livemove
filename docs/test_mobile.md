# Hướng dẫn Kiểm thử Toàn diện Livemove Mobile App (React Native)

Tài liệu này hướng dẫn chi tiết các bước để khởi chạy và kiểm thử chức năng của ứng dụng di động (Customer App & Driver App) được xây dựng trên nền tảng **Expo React Native** trong Phase 4.

---

## 🛠 Phần 1: Khởi động Môi trường (Cực kỳ Quan trọng)

Ứng dụng di động cần kết nối với Backend để hoạt động socket và API. Bạn cần phải bật Backend lên trước.

### 1. Khởi động Backend
1. Mở Terminal mới (hoặc CMD).
2. Di chuyển vào thư mục backend: `cd d:\Livemove\backend`
3. Chạy lệnh: `npm run start:dev` (Hãy đảm bảo Redis server trên Docker/máy đã chạy).

### 2. Khởi động Mobile App
1. Mở một Terminal khác.
2. Di chuyển vào thư mục mobile: `cd d:\Livemove\mobile`
3. Cài đặt các gói phần mềm (nếu đây là lần đầu): `npm install`
4. Chạy ứng dụng: `npm start`
5. Một mã QR (QR Code) sẽ hiện ra trên Terminal hoặc mở trên trình duyệt web (thường là `http://localhost:8081`).

### 3. Xem App trên Điện thoại thật
1. Tải ứng dụng **Expo Go** từ App Store (iOS) hoặc Google Play (Android).
2. Trên Android: Mở ứng dụng Expo Go và bấm **Scan QR Code**.
3. Trên iOS: Mở ứng dụng Camera mặc định của iPhone, quét mã QR trên màn hình PC và chọn mở bằng Expo Go.

*(Lưu ý: Điện thoại và máy tính phải dùng chung một mạng Wi-Fi).*

---

## 🚚 Phần 2: Kịch bản Test Dành cho Tài Xế (Driver App) Mới nhất

Dưới đây là luồng trải nghiệm tính năng của người Tài Xế nhận cuốc:

**Bước 1: Đăng nhập**
- Tại màn hình Auth, đăng nhập bằng tài khoản: `driver@livemove.com` (Mật khẩu: `123456`).
- Hệ thống sẽ chuyển hướng bạn đến tab Giao diện Tài xế `(driver)/home`.

**Bước 2: Xem chi tiết điều phối (Trang Chủ)**
- Tại trang chủ (`home.tsx`), bạn có thể thấy danh sách các đơn hàng "Đang chờ" được Admin Web gán xuống.
- Bạn sẽ thấy Số lượng đơn hàng, Quãng đường, và Tiền cước ước tính.

**Bước 3: Chức năng Scan QR (Cực kỳ Hiện Đại)**
- Chọn tab **Quét mã** (`scanner.tsx`).
- Camera sẽ mở ra, hãy quét bừa vào 1 mã vạch hoặc mã QR bất kỳ trên mạng để mô phỏng "Bắn mã nhãn kiện hàng".
- Nếu quét thành công, trạng thái trên hệ thống lập tức đổ Order sang "Đã tiếp nhận hàng".

**Bước 4: Xem Bản đồ Hành trình Giao hàng**
- Mở tab **Bản đồ Đi đường** (`delivery.tsx`).
- Tại đây, ứng dụng sẽ hiện bản đồ React Native Maps bám sát hệ thống GeoLocation (nếu bạn cấp quyền GPS).
- Giao diện được thiết kế để dẫn đường bạn đi với OSRM Route tương tự Web Admin.

---

## 🙋 Phần 3: Kịch bản Test Dành cho Khách Hàng (Customer App)

Luồng của người nhận hàng luôn muốn xem tài xế đang đi tới đâu, xe chở gì, và bao lâu nữa sẽ đến:

**Bước 1: Đăng nhập**
- Sử dụng nút Đăng xuất (Log out) ở tài khoản Tài xế.
- Sau đó, tạo account khách hoặc đăng nhập bằng: `customer@livemove.com` (Pass: `123456`).
- Màn hình sẽ nhảy qua luồng Giao diện của Khách hàng (`customer/home`).

**Bước 2: Kiểm tra Đơn hàng đang được Vận chuyển**
- Tại màn hình chính, Khách hàng sẽ thấy ngay tấm thẻ "Đơn hàng #2026-X: Đang hướng tới bạn".
- Bạn có thể click trực tiếp vào tấm thẻ để mở giao diện Tracking (`tracking/`).

**Bước 3: Live Tracking (Mô phỏng Uber/Grab Tracking)**
- Đây là màn hình quan trọng nhất của khách hàng. Nó sẽ gọi đến WebSocket của `backend` mà chúng ta cấu hình ở `Phase 3`.
- Bạn sẽ thấy chi tiết điểm đi, điểm đến. 
- Do liên kết chặt chẽ với Web Admin, bất kể điều chỉnh nào (ví dụ Admin nhấn hoàn thành) thì màn hình khách hàng sẽ hiển thị Pop-up Ting Ting 🔔 "Chuyến đi đã hoàn tất".

---

## 💡 Troubleshooting (Mẹo Xử Lý Lỗi)

- **Màn hình Trắng / Báo lỗi Network Error**: Trạm Backend chưa được bật, hoặc IP máy tính mạng LAN bị chặn. Hãy bấm Fím `d` trên CMD của Expo để bật Developer Menu và check lỗi nhé.
- **Không thấy Map load được Tiles**: Firebase hoặc Leaflet không tương thích trên Android Emulator. Chạy trên Điện thoại vật lý là tốt nhất.
- Tại Web Admin, tạo những đơn gán đúng vào số ID của Driver này để trên Mobile App hiện ra Pop-up tức thời chứ không cần load lại.

🚀 **Chúc bạn trải nghiệm App Mobile chuẩn Seamless Experience thành công!**
