# PTIT Music

PTIT Music là một ứng dụng nghe nhạc trực tuyến được xây dựng với đầy đủ các tính năng cơ bản của một nền tảng âm nhạc hiện đại, lấy cảm hứng từ giao diện của Spotify. Dự án bao gồm cả phần backend (RESTful API) và frontend (Web App).

## 🚀 Tính năng nổi bật

### Dành cho Người dùng (User)
- **Xác thực**: Đăng ký, Đăng nhập an toàn (sử dụng JWT & Bcrypt).
- **Phát nhạc**: Trình phát nhạc mượt mà với đầy đủ các điều khiển (Phát/Tạm dừng, Chuyển bài, Lặp lại, Phát ngẫu nhiên, Điều chỉnh âm lượng).
- **Khám phá Âm nhạc**: Tìm kiếm bài hát, khám phá các bài hát mới.
- **Quản lý Playlist**: Tạo, chỉnh sửa (đổi tên), và xóa playlist cá nhân.
- **Tương tác**: Thích bài hát (Yêu thích).

### Dành cho Quản trị viên (Admin)
- **Dashboard Tổng quan**: Theo dõi các số liệu thống kê chung (số lượng người dùng, bài hát, lượt nghe...).
- **Quản lý Bài hát**: Tải lên bài hát mới kèm theo ảnh bìa (sử dụng Multer).
- **Quản lý Nghệ sĩ**: Thêm và quản lý thông tin nghệ sĩ.
- **Quản lý Người dùng**: Xem và quản lý danh sách tài khoản người dùng trong hệ thống.

## 🛠️ Công nghệ sử dụng

- **Frontend**: 
  - HTML5, CSS3 (Vanilla), JavaScript (Vanilla JS).
  - Thuần phong cách giao diện hiện đại (Modern Web Design), Responsive.
- **Backend**:
  - Node.js & Express.js.
  - Xử lý file upload với `multer`.
  - Xác thực người dùng bằng `jsonwebtoken` (JWT) và mã hóa mật khẩu `bcrypt`.
  - Cơ sở dữ liệu tương tác qua `mysql2`.
- **Database**:
  - MySQL Database.

## 📁 Cấu trúc thư mục

```text
PTIT-MUSIC/
├── backend/                  # Mã nguồn server
│   ├── db/                   # Chứa các file liên quan đến cấu hình & khởi tạo DB (schema.sql, database.js...)
│   ├── middleware/           # Các middleware như xác thực (auth.js)
│   ├── routes/               # Định nghĩa các RESTful API endpoints (auth, songs, playlists, admin...)
│   ├── uploads/              # Thư mục lưu trữ mpm3 file và ảnh bìa tải lên
│   └── server.js             # File khởi chạy Express server
├── frontend/                 # Mã nguồn giao diện người dùng
│   ├── assets/               # Hình ảnh, biểu tượng tĩnh
│   ├── css/                  # Các file style cho giao diện (style.css)
│   ├── js/                   # Xử lý logic phía client (app.js, api.js, player.js)
│   ├── index.html            # Trang chủ và giao diện nghe nhạc chính
│   └── admin.html            # Giao diện dành cho admin
└── package.json              # Thông tin cấu hình và dependencies của Node.js
```

## ⚙️ Hướng dẫn cài đặt và chạy dự án

### 1. Yêu cầu hệ thống
- **Node.js**: (Khuyến nghị phiên bản LTS mới nhất)
- **MySQL**: Cài đặt MySQL Server đang hoạt động trên máy hoặc sử dụng XAMPP/WAMP.

### 2. Thiết lập Cơ sở dữ liệu
1. Mở MySQL.
2. Tạo database mới hoặc cấu hình theo dữ liệu trong file `backend/db/schema.sql`.
3. Chạy các lệnh SQL trong `schema.sql` để tạo mới các bảng (`users`, `songs`, `playlists`, `artists`, `liked_songs`...).
4. Bạn cũng có thể dùng lệnh khởi tạo hoặc script `backend/db/initDb.js` nếu đã được thiết lập sẵn.

### 3. Cài đặt Backend
Di chuyển vào thư mục gốc của dự án và cài đặt các thư viện Node.js:
```bash
npm install
```

Cấu hình các biến môi trường:
- Tạo một file `.env` ở thư mục gốc (nếu chưa có).
- Khai báo các biến liên quan đến kết nối MySQL và JWT Secret:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ptit_music
JWT_SECRET=your_jwt_secret_key
PORT=3000
```
> **Lưu ý**: Hãy thay đổi các giá trị ở trên cho phù hợp với cấu hình MySQL trên máy bạn.

### 4. Khởi chạy Server
Chạy Backend server:
```bash
node backend/server.js
```
Server sẽ mặc định chạy trên cổng `3000`.

### 5. Sử dụng Hệ thống (Frontend)
- **Giao diện người dùng**: Mở trực tiếp file `frontend/index.html` trên trình duyệt hoặc sử dụng Live Server.
- **Giao diện quản trị viên**: Mở trực tiếp file `frontend/admin.html` (yêu cầu đăng nhập tài khoản có quyền admin).
- Nếu frontend đang gọi API thông qua cổng cụ thể, hãy chắc chắn đường dẫn gọi API thống nhất với URL host của Backend (ví dụ `http://localhost:3000`).
