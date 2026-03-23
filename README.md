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

## 📡 Danh sách API & Hướng dẫn Postman

Dưới đây là danh sách các API chính của hệ thống để bạn có thể kiểm tra bằng Postman. Tất cả các URL mặc định bắt đầu bằng `http://localhost:3000`.

### 1. Xác thực (Authentication) - `/api/auth`
| Endpoint | Phương thức | Body (JSON) | Mô tả |
| :--- | :--- | :--- | :--- |
| `/register` | **POST** | `{ "username", "email", "password" }` | Đăng ký tài khoản mới |
| `/login` | **POST** | `{ "username", "password" }` | Đăng nhập và nhận JWT Token |
| `/me` | **GET** | *Header: Authorization* | Lấy thông tin tài khoản hiện tại |

### 2. Bài hát (Songs) - `/api/songs`
| Endpoint | Phương thức | Body / Form-data | Mô tả |
| :--- | :--- | :--- | :--- |
| `/` | **GET** | Trống | Lấy danh sách tất cả bài hát |
| `/` | **POST** | `title`, `artist_name`, `mp3` (file), `cover` (file) | Upload bài hát mới (Admin) |
| `/:id` | **DELETE** | Trống | Xóa bài hát theo ID (Admin) |
| `/:id/play` | **POST** | Trống | Tăng lượt nghe cho bài hát |

### 3. Playlist (Playlists) - `/api/playlists`
*(Yêu cầu Header Authorization: Bearer <token>)*
| Endpoint | Phương thức | Body (JSON) | Mô tả |
| :--- | :--- | :--- | :--- |
| `/` | **GET** | Trống | Lấy danh sách playlist của tôi |
| `/` | **POST** | `{ "name" }` | Tạo playlist mới |
| `/:id/songs`| **POST** | `{ "song_id" }` | Thêm bài hát vào playlist |
| `/:id/songs`| **GET** | Trống | Lấy danh sách bài hát trong playlist |
| `/:id` | **PUT** | `{ "name" }` | Đổi tên playlist |
| `/:id` | **DELETE** | Trống | Xóa playlist |

### 4. Quản trị (Admin) - `/api/admin`
*(Yêu cầu Token có quyền Admin)*
| Endpoint | Phương thức | Body (JSON) | Mô tả |
| :--- | :--- | :--- | :--- |
| `/stats` | **GET** | Trống | Lấy thống kê tổng quan hệ thống |
| `/users` | **GET** | Trống | Lấy danh sách tất cả người dùng |
| `/users/:id` | **DELETE** | Trống | Xóa người dùng |
| `/users/:id/role`| **PUT** | `{ "role": "admin" / "user" }` | Cập nhật quyền người dùng |

### 5. Nghệ sĩ & Yêu thích
- **Artists (`/api/artists`)**: `GET /` (Danh sách), `POST /` (Thêm mới - Admin), `GET /:id/songs` (Biểu diễn bài hát).
- **Liked (`/api/liked`)**: `GET /` (Danh sách yêu thích), `POST /:id` (Thả tim/Bỏ thích).

---

### 💡 Hướng dẫn Test với Postman

1. **Đăng nhập**: Gọi API `/api/auth/login` để nhận chuỗi `token`.
2. **Thiết lập Authorization**:
   - Chọn tab **Authorization** trong Postman.
   - Chọn **Type**: `Bearer Token`.
   - Dán chuỗi `token` vừa nhận được vào ô **Token**.
3. **Thiết lập Header (nếu cần)**: Đảm bảo `Content-Type` là `application/json` đối với các request gửi dữ liệu JSON.
4. **Đối với Upload file**: Chọn tab **Body** -> **form-data**, sau đó thay đổi kiểu của key (ví dụ `mp3`, `cover`) từ `Text` sang `File`.
