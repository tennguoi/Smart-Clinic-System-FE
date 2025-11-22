# Hướng dẫn thiết lập Logo 2CTW cho PDF

## Logo Phòng Khám

Logo hiện tại: **2CTW** với biểu tượng chữ thập y tế màu xanh và Rod of Asclepius

## Vị trí Logo trong Backend

Backend Java đang tìm logo tại: `/static/logo.png` trong classpath resources.

## Cách thiết lập Logo cho Backend (Spring Boot)

### Bước 1: Copy logo vào backend project

1. **Tạo thư mục** (nếu chưa có):
   ```
   src/main/resources/static/
   ```

2. **Copy file logo:**
   - Copy file `logo.png` từ frontend project (`project/src/images/logo.png` hoặc `project/public/static/logo.png`)
   - Đặt vào: `src/main/resources/static/logo.png` trong backend project

### Bước 2: Kiểm tra logo

- Format: PNG (đã có sẵn)
- Kích thước: Backend sẽ tự động resize về 80x80px
- Nền: Logo có nền trong suốt, hiển thị tốt trên PDF

### Bước 3: Restart và test

1. Restart backend server
2. Generate PDF mới
3. Logo 2CTW sẽ xuất hiện ở góc trên bên trái của PDF

## Logo trong Frontend

✅ Logo đã có sẵn tại:
- `src/images/logo.png` (source)
- `public/static/logo.png` (copy để serve static)

## Cấu trúc thư mục Backend cần có:

```
backend-project/
└── src/
    └── main/
        └── resources/
            └── static/
                └── logo.png  ← Đặt logo ở đây
```

## Lưu ý

- ✅ Backend code đã có logic fallback: nếu không tìm thấy logo, sẽ hiển thị placeholder "LOGO"
- ✅ Logo 2CTW có nền trong suốt, hiển thị đẹp trên PDF trắng
- ✅ Logo sẽ được resize tự động về 80x80px trong PDF

