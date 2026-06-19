# Phụ Kiện Túi Lọc



Dự án e-commerce với **1 backend chung** và **2 frontend riêng**: cửa hàng (storefront) + quản trị (admin). Theme màu vàng, React + shadcn/ui, ASP.NET Core + EF Core.



## Cấu trúc



```

PhuKienTuiLoc/

├── backend/      # ASP.NET Core Web API + EF Core + SQL Server

├── frontend/     # React + Vite — cửa hàng (port 5173)

└── admin/        # React + Vite — quản trị web (port 5174)

```



## Yêu cầu



- Node.js 20+

- .NET 10 SDK

- SQL Server (localhost)



## Database



Connection string dev nằm trong `backend/appsettings.Development.json` (chỉ load khi `ASPNETCORE_ENVIRONMENT=Development`).



```bash

cd backend

dotnet ef database update

```



## Mở backend trong Visual Studio



Mở file solution:



```

backend/PhuKienTuiLoc.sln

```



Project: `backend/PhuKienTuiLoc.Api.csproj`



## Chạy dự án



```bash

# Backend

cd backend && dotnet run --launch-profile http



# Cửa hàng (storefront)

cd frontend && npm install && npm run dev



# Quản trị (admin)

cd admin && npm install && npm run dev

```



| App | URL |

|-----|-----|

| API | http://localhost:5280 |

| Swagger | http://localhost:5280/swagger |

| Cửa hàng | http://localhost:5173 |

| Admin | http://localhost:5174 |



### Đăng nhập admin

Copy file mẫu rồi **đặt mật khẩu local** (không commit):

```bash
cp backend/appsettings.Development.json.example backend/appsettings.Development.json
# Sửa Admin:Users và Jwt:Key trong appsettings.Development.json
```

| Username | Vai trò |
|----------|---------|
| `admin` | Quản trị viên — toàn quyền |
| `ketoan` | Kế toán — quản lý mã giảm giá, xem sản phẩm |
| `nhanvien` | Nhân viên — quản lý sản phẩm, tin tức, upload ảnh |

Mật khẩu nằm trong `backend/appsettings.Development.json` (file gitignore).



## Kiến trúc



- **Backend** phục vụ cả storefront và admin qua REST API.

- **GET** (đọc dữ liệu): public — dùng cho cửa hàng.

- **POST/PUT/DELETE**: yêu cầu JWT Bearer, phân quyền theo role (Admin / Accountant / Employee).
- **Upload ảnh**: `POST /api/uploads/images` (Admin, Nhân viên).
- Admin lưu token trong `localStorage`, gửi header `Authorization: Bearer <token>`.

### Phân quyền cơ bản

| Chức năng | Admin | Kế toán | Nhân viên |
|-----------|-------|---------|-----------|
| Danh mục (CRUD) | ✓ | — | — |
| Sản phẩm (CRUD) | ✓ | Xem | ✓ |
| Mã giảm giá (CRUD) | ✓ | ✓ | — |
| Tin tức (CRUD) | ✓ | — | ✓ |
| Upload ảnh | ✓ | — | ✓ |

Ảnh upload lưu tại `backend/wwwroot/uploads/images/`, URL dạng `http://localhost:5280/uploads/images/...`.



## RESTful API



### Nguyên tắc



- **Danh từ số nhiều**, kebab-case: `/api/news-articles`

- **ID** trong URL cho resource đơn: `/api/products/{id}`

- **Nested resource**: `/api/categories/{categoryId}/products`

- **Query filter** trên collection: `?categoryId=1&isHot=true`

- **Phân trang**: `?page=1&pageSize=50` → response `{ items, page, pageSize, totalCount, totalPages }`

- **HTTP status**: `200` OK, `201` Created, `204` No Content, `404` Not Found, `409` Conflict

- **Lỗi**: RFC 7807 Problem Details



### Auth `/api/auth`



| Method | Path | Mô tả |

|--------|------|-------|

| POST | `/api/auth/login` | Đăng nhập → JWT token |

| GET | `/api/auth/me` | Thông tin user (mọi role đã đăng nhập) |

#### Uploads `/api/uploads`

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/uploads/images` | Upload ảnh (multipart/form-data) → `{ url, path }` (Admin, Nhân viên) |



### Endpoints



#### Categories `/api/categories`



| Method | Path | Mô tả |

|--------|------|-------|

| GET | `/api/categories` | Danh sách (`?slug=`, `?page=`, `?pageSize=`) |

| GET | `/api/categories/{id}` | Chi tiết |

| GET | `/api/categories/{categoryId}/products` | Sản phẩm theo danh mục (nested) |

| POST | `/api/categories` | Tạo → 201 (Admin) |

| PUT | `/api/categories/{id}` | Cập nhật → 200 (Admin) |

| DELETE | `/api/categories/{id}` | Xóa → 204 (Admin) |



#### Products `/api/products`



| Method | Path | Mô tả |

|--------|------|-------|

| GET | `/api/products` | Danh sách (`?categoryId=`, `?isHot=`, `?isSale=`, `?page=`, `?pageSize=`) |

| GET | `/api/products/{id}` | Chi tiết |

| GET | `/api/products/by-slug/{slug}` | Chi tiết theo slug |

| POST | `/api/products` | Tạo → 201 (Admin, Nhân viên) — body có `imageUrls[]` |

| PUT | `/api/products/{id}` | Cập nhật → 200 — `imageUrls[]` gallery |

| DELETE | `/api/products/{id}` | Xóa → 204 |

Sản phẩm hỗ trợ **gallery nhiều ảnh**: `imageUrls` (mảng URL), `imageUrl` = ảnh bìa (ảnh đầu tiên). Bảng `ProductImages` lưu thứ tự ảnh.



#### Coupons `/api/coupons`



| Method | Path | Mô tả |

|--------|------|-------|

| GET | `/api/coupons` | Danh sách |

| GET | `/api/coupons/{id}` | Chi tiết |

| POST | `/api/coupons` | Tạo → 201 (Admin) |

| PUT | `/api/coupons/{id}` | Cập nhật → 200 (Admin) |

| DELETE | `/api/coupons/{id}` | Xóa → 204 (Admin) |



#### News Articles `/api/news-articles`



| Method | Path | Mô tả |

|--------|------|-------|

| GET | `/api/news-articles` | Danh sách |

| GET | `/api/news-articles/{id}` | Chi tiết |

| POST | `/api/news-articles` | Tạo → 201 (Admin) |

| PUT | `/api/news-articles/{id}` | Cập nhật → 200 (Admin) |

| DELETE | `/api/news-articles/{id}` | Xóa → 204 (Admin) |



### Response mẫu (collection)



```json

{

  "items": [...],

  "page": 1,

  "pageSize": 50,

  "totalCount": 15,

  "totalPages": 1

}

```


