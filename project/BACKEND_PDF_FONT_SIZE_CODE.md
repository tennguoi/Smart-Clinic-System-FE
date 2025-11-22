# Code để tăng cỡ chữ "TMH 2CTW" trong PDF

## Vị trí: PdfExportService.java - Phần Header

Tìm và thay thế đoạn code tạo tên phòng khám bằng code sau:

### Code cần thay thế:

```java
if (clinic != null) {
    Paragraph clinicName = new Paragraph(clinic.getName() != null ? clinic.getName() : "PHÒNG KHÁM")
            .setFontSize(12)  // ← CỠ CHỮ CŨ
            .setBold()
            .setMarginBottom(3);
    infoCell.add(clinicName);
```

### Code mới (cỡ chữ lớn hơn):

```java
if (clinic != null) {
    Paragraph clinicName = new Paragraph(clinic.getName() != null ? clinic.getName() : "PHÒNG KHÁM")
            .setFontSize(18)  // ← TĂNG LÊN 18px (có thể dùng 16, 18, 20)
            .setBold()
            .setMarginBottom(5);  // Tăng margin một chút để đẹp hơn
    infoCell.add(clinicName);
```

## Tùy chọn cỡ chữ:

- **16px** - Lớn hơn vừa phải
- **18px** - Lớn rõ ràng (khuyến nghị) ⭐
- **20px** - Rất lớn, nổi bật
- **22px** - Cực lớn

## Code đầy đủ phần Header (tham khảo):

```java
// Thông tin phòng khám (xử lý null-safe)
Cell infoCell = new Cell();
infoCell.setPadding(5);
infoCell.setBorder(Border.NO_BORDER);

if (clinic != null) {
    // Tên phòng khám - CỠ CHỮ LỚN
    Paragraph clinicName = new Paragraph(clinic.getName() != null ? clinic.getName() : "PHÒNG KHÁM")
            .setFontSize(18)  // ← TĂNG CỠ CHỮ Ở ĐÂY (từ 12 lên 18)
            .setBold()
            .setMarginBottom(5);
    infoCell.add(clinicName);
    
    // Địa chỉ - giữ nguyên cỡ chữ
    if (clinic.getAddress() != null && !clinic.getAddress().isEmpty()) {
        Paragraph clinicAddress = new Paragraph("Địa chỉ: " + clinic.getAddress())
                .setFontSize(12)
                .setMarginBottom(2);
        infoCell.add(clinicAddress);
    }
    
    String contactInfo = "";
    if (clinic.getPhone() != null && !clinic.getPhone().isEmpty()) {
        contactInfo += "SĐT: " + clinic.getPhone();
    }
    if (clinic.getEmail() != null && !clinic.getEmail().isEmpty()) {
        if (!contactInfo.isEmpty()) contactInfo += " – ";
        contactInfo += "Email: " + clinic.getEmail();
    }
    if (!contactInfo.isEmpty()) {
        Paragraph clinicContact = new Paragraph(contactInfo)
                .setFontSize(12)
                .setMarginBottom(2);
        infoCell.add(clinicContact);
    }
    
    if (clinic.getWebsite() != null && !clinic.getWebsite().isEmpty()) {
        Paragraph clinicWebsite = new Paragraph("Website: " + clinic.getWebsite())
                .setFontSize(12);
        infoCell.add(clinicWebsite);
    }
} else {
    // Nếu không có thông tin phòng khám
    Paragraph clinicName = new Paragraph("PHÒNG KHÁM")
            .setFontSize(18)  // ← Cũng tăng cỡ chữ ở đây
            .setBold()
            .setMarginBottom(3);
    infoCell.add(clinicName);
    
    Paragraph notice = new Paragraph("Vui lòng cập nhật thông tin phòng khám trong hệ thống")
            .setFontSize(10)
            .setItalic();
    infoCell.add(notice);
}

headerTable.addCell(infoCell);
document.add(headerTable);
```

## So sánh:

| Cỡ chữ | Hiệu ứng |
|--------|----------|
| 12px | Nhỏ, bình thường (hiện tại) |
| 16px | Lớn hơn một chút |
| **18px** | **Lớn rõ ràng, nổi bật (khuyến nghị)** ⭐ |
| 20px | Rất lớn, chiếm nhiều không gian |
| 22px | Cực lớn, có thể quá to |

## Các bước thực hiện:

1. Mở file `PdfExportService.java` trong backend
2. Tìm dòng `.setFontSize(12)` trong phần tạo `clinicName`
3. Thay đổi thành `.setFontSize(18)` (hoặc cỡ chữ bạn muốn)
4. Có thể tăng `.setMarginBottom(3)` lên `.setMarginBottom(5)` để đẹp hơn
5. Rebuild và restart backend
6. Test bằng cách generate PDF mới

## Lưu ý:

- ✅ Chỉ sửa cỡ chữ cho **tên phòng khám** (clinicName)
- ✅ Giữ nguyên cỡ chữ cho địa chỉ, SĐT, email (12px)
- ✅ Giữ nguyên `.setBold()` để chữ vẫn đậm
- ✅ Có thể điều chỉnh margin nếu cần

