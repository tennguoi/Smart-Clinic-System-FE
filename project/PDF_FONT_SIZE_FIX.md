# Hướng dẫn tăng cỡ chữ "TMH 2CTW" trong PDF

## Vị trí cần sửa trong Backend

Trong file `PdfExportService.java`, tìm phần tạo tên phòng khám (khoảng dòng 150-200).

## Code hiện tại (cần sửa):

```java
if (clinic != null) {
    Paragraph clinicName = new Paragraph(clinic.getName() != null ? clinic.getName() : "PHÒNG KHÁM")
            .setFontSize(12)  // ← ĐÂY LÀ CỠ CHỮ HIỆN TẠI
            .setBold()
            .setMarginBottom(3);
    infoCell.add(clinicName);
    ...
}
```

## Code sau khi sửa (tăng cỡ chữ):

```java
if (clinic != null) {
    Paragraph clinicName = new Paragraph(clinic.getName() != null ? clinic.getName() : "PHÒNG KHÁM")
            .setFontSize(16)  // ← TĂNG TỪ 12 LÊN 16 (hoặc 18, 20 tùy ý)
            .setBold()
            .setMarginBottom(3);
    infoCell.add(clinicName);
    ...
}
```

## Các tùy chọn cỡ chữ:

- **14px** - Hơi lớn hơn một chút
- **16px** - Lớn hơn rõ ràng (khuyến nghị)
- **18px** - Khá lớn
- **20px** - Rất lớn

## Code đầy đủ phần Header (tham khảo):

```java
// Thông tin phòng khám (xử lý null-safe)
Cell infoCell = new Cell();
infoCell.setPadding(5);
infoCell.setBorder(Border.NO_BORDER);

if (clinic != null) {
    // Tên phòng khám - CỠ CHỮ LỚN HƠN
    Paragraph clinicName = new Paragraph(clinic.getName() != null ? clinic.getName() : "PHÒNG KHÁM")
            .setFontSize(16)  // ← TĂNG CỠ CHỮ Ở ĐÂY
            .setBold()
            .setMarginBottom(3);
    infoCell.add(clinicName);
    
    if (clinic.getAddress() != null && !clinic.getAddress().isEmpty()) {
        Paragraph clinicAddress = new Paragraph("Địa chỉ: " + clinic.getAddress())
                .setFontSize(12)  // Giữ nguyên cỡ chữ cho địa chỉ
                .setMarginBottom(2);
        infoCell.add(clinicAddress);
    }
    
    // ... các phần khác giữ nguyên
}
```

## Lưu ý:

1. **Chỉ sửa cỡ chữ cho tên phòng khám** (clinicName), không cần sửa địa chỉ, SĐT, email
2. **Giữ nguyên `.setBold()`** để chữ vẫn đậm
3. **Có thể điều chỉnh `.setMarginBottom()`** nếu cần thêm khoảng cách

## Sau khi sửa:

1. Rebuild backend project
2. Restart backend server
3. Generate PDF mới
4. Kiểm tra tên phòng khám "TMH 2CTW" đã to hơn

## Ví dụ kết quả:

- **Trước:** Tên phòng khám cỡ 12px
- **Sau:** Tên phòng khám cỡ 16px (hoặc 18px, 20px tùy chọn)

