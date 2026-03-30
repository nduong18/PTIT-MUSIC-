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

## 📡 Chi tiết API Endpoints & Hướng dẫn Test Postman

Để hỗ trợ việc kiểm thử (test) bằng Postman, dưới đây là chi tiết từng cụm API với định dạng dữ liệu cụ thể.

### 📌 Ghi chú Hệ thống Phân trang (Pagination)
Hầu hết các API trả về dạng danh sách (bài hát, nghệ sĩ, thành viên, v.v...) đều **hỗ trợ phân trang**. Bạn có thể truyền định tuyến theo các query parameter sau:
- `?page=1` (Mặc định là undefined nếu không truyền, tương đương với việc trả về dạng mảng dữ liệu thuần tĩnh)
- `?limit=10` (Mặc định là 10, quy định số lượng kết quả mỗi trang)

**Ví dụ Request:** `GET /api/songs?page=1&limit=5`

**Cấu trúc dữ liệu trả về khi có phân trang:**
```json
{
  "data": [
    { "id": 1, "title": "Bài hát 1", "..." : "..." }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 5,
    "totalItems": 24,
    "totalPages": 5
  }
}
```
*(Nếu không truyền tham số `page`, API sẽ trả về cấu trúc mảng thuần tuý: `[ { id: 1, ... } ]` để đảm bảo tương thích ngược).*

### 1. Hệ thống Xác thực (Authentication)
**Base URL:** `http://localhost:3000/api/auth`

#### 📝 Đăng ký tài khoản
- **URL:** `http://localhost:3000/api/auth/register`
- **Method:** `POST`
- **Body (JSON):**
```json
{
  "username": "testuser",
  "email": "test@gmail.com",
  "password": "123"
}
```

#### 🔑 Đăng nhập
- **URL:** `http://localhost:3000/api/auth/login`
- **Method:** `POST`
- **Body (JSON):**
```json
{
  "username": "testuser",
  "password": "123"
}
```
*=> Sau khi đăng nhập, copy chuỗi `token` trong phản hồi để sử dụng cho các API sau.*

#### 👤 Thông tin cá nhân (Cần Token)
- **URL:** `http://localhost:3000/api/auth/me`
- **Method:** `GET`
- **Header:** `Authorization: Bearer <token>`

---

### 2. Quản lý Bài hát (Songs)
**Base URL:** `http://localhost:3000/api/songs`

#### 🎵 Lấy tất cả bài hát
- **URL:** `http://localhost:3000/api/songs` *(Hỗ trợ `?page=` & `?limit=` phân trang)*
- **Method:** `GET`

#### 📤 Upload bài hát (Admin Only - Cần Token)
- **URL:** `http://localhost:3000/api/songs`
- **Method:** `POST`
- **Header:** `Authorization: Bearer <admin_token>`
- **Body (form-data):**
  - `title`: (Text) - "Tên bài hát"
  - `artist_name`: (Text) - "Tên nghệ sĩ"
  - `mp3`: (File) - [Chọn file .mp3]
  - `cover`: (File) - [Chọn file ảnh .jpg/.png]

#### 🔍 Tìm kiếm bài hát
- **URL:** `http://localhost:3000/api/songs/search?q={keyword}` *(Hỗ trợ `&page=` & `limit=` phân trang)*
- **Method:** `GET`
- **Ví dụ:** `http://localhost:3000/api/songs/search?q=con mua&page=1&limit=5`
- *Kết quả trả về danh sách bài hát khớp với tiêu đề hoặc nghệ sĩ (hỗ trợ không dấu).*

#### 📈 Tăng lượt nghe
- **URL:** `http://localhost:3000/api/songs/{id}/play` (Ví dụ: `.../songs/1/play`)
- **Method:** `POST`

#### 🗑️ Xóa bài hát (Admin Only - Cần Token)
- **URL:** `http://localhost:3000/api/songs/{id}`
- **Method:** `DELETE`
- **Header:** `Authorization: Bearer <admin_token>`

---

### 3. Quản lý Playlist
**Base URL:** `http://localhost:3000/api/playlists`
*(Tất cả API playlist đều yêu cầu Header: Authorization: Bearer <token>)*

#### 📂 Lấy danh sách playlist của tôi
- **URL:** `http://localhost:3000/api/playlists`
- **Method:** `GET`

#### ➕ Tạo playlist mới
- **URL:** `http://localhost:3000/api/playlists`
- **Method:** `POST`
- **Body (JSON):**
```json
{
  "name": "Nhạc EDM 2024"
}
```

#### 🔗 Thêm bài hát vào playlist
- **URL:** `http://localhost:3000/api/playlists/{playlist_id}/songs`
- **Method:** `POST`
- **Body (JSON):**
```json
{
  "song_id": 5
}
```

#### 🎶 Lấy bài hát trong playlist
- **URL:** `http://localhost:3000/api/playlists/{id}/songs` *(Hỗ trợ phân trang: `?page=1`)*
- **Method:** `GET`

#### ✏️ Đổi tên playlist
- **URL:** `http://localhost:3000/api/playlists/{id}`
- **Method:** `PUT`
- **Body (JSON):**
```json
{
  "name": "Nhạc Chill Mỗi Ngày"
}
```

---

### 4. Quản trị viên (Admin Statistics & Users)
**Base URL:** `http://localhost:3000/api/admin`

#### 📊 Thống kê tổng quan
- **URL:** `http://localhost:3000/api/admin/stats`
- **Method:** `GET`

#### 👥 Danh sách người dùng
- **URL:** `http://localhost:3000/api/admin/users` *(Hỗ trợ phân trang: `?page=1`)*
- **Method:** `GET`

#### 🛠️ Cập nhật quyền (Role)
- **URL:** `http://localhost:3000/api/admin/users/{id}/role`
- **Method:** `PUT`
- **Body (JSON):**
```json
{
  "role": "admin"
}
```

---

### 5. Nghệ sĩ & Yêu thích
- **Lấy danh sách nghệ sĩ**: `GET http://localhost:3000/api/artists` *(Hỗ trợ `?page=`)*
- **Thêm nghệ sĩ (Admin)**: `POST http://localhost:3000/api/artists` (form-data: `name`, `bio`, `profile_image`)
- **Yêu thích bài hát**: `POST http://localhost:3000/api/liked/{song_id}` (Cần Token)
- **Xem danh sách yêu thích**: `GET http://localhost:3000/api/liked` (Cần Token) *(Hỗ trợ phân trang `?page=`)*

---

### 💡 Mẹo Postman:
1. Bạn có thể tạo **Environment** trong Postman, đặt biến `base_url` là `http://localhost:3000` và `token` để tái sử dụng trong các request bằng cách dùng `{{base_url}}` và `{{token}}`.
2. Đối với các API yêu cầu **Bearer Token**, hãy vào tab **Auth** -> chọn **Bearer Token** và dán token của bạn vào (đừng quên tiền tố `Bearer ` nếu bạn gán trực tiếp vào Header).
