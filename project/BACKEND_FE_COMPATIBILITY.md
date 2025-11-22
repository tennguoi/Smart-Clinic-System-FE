# Tương thích Frontend với Backend PDF mới

## Tổng quan thay đổi Backend

Backend đã được cập nhật với các thay đổi chính:

### 1. Logo và Thông tin Phòng khám
- ✅ Logo được load từ database (`ClinicService.getClinicEntity()`) hoặc từ static folder
- ✅ Thông tin phòng khám (tên, địa chỉ, SĐT, email, website) được lấy từ database
- ✅ Fallback: Nếu không có thông tin, hiển thị placeholder

### 2. Layout PDF đã được cải thiện
- ✅ Bỏ border cho bảng thông tin chung (Ngày khám, Số phiếu, Bác sĩ)
- ✅ Đơn thuốc hiển thị dưới dạng bảng 2 cột (Thuốc | Hướng dẫn sử dụng)
- ✅ Chữ ký bác sĩ không còn dùng bảng, chỉ dùng Paragraph căn phải

## Frontend - Đã tương thích ✅

### API Endpoints
Các API endpoints trong `medicalRecordApi.js` đã đúng và tương thích:

```javascript
// ✅ Xuất PDF hồ sơ bệnh án
exportAsPdf: async (recordId) => {
  const { data } = await axiosInstance.get(
    `/api/doctor/medical-records/${recordId}/export-pdf`,
    { responseType: 'blob' }
  );
  return data;
}

// ✅ Xuất PDF đơn thuốc
exportPrescriptionAsPdf: async (recordId) => {
  const { data } = await axiosInstance.get(
    `/api/doctor/medical-records/${recordId}/export-prescription`,
    { responseType: 'blob' }
  );
  return data;
}
```

### Components đã hỗ trợ PDF Export
1. ✅ **RecordRow.jsx** - Có nút xuất PDF hồ sơ và PDF đơn thuốc
2. ✅ **RecordDetailModal.jsx** - Có nút xuất PDF trong modal
3. ✅ **CurrentPatientExamination.jsx** - Có nút in PDF trong footer

### Utility Functions
✅ **pdfDownload.js** - Utility function để download PDF với error handling tốt

## Không cần thay đổi gì trong Frontend

Frontend hiện tại đã hoàn toàn tương thích với backend mới vì:

1. ✅ API endpoints đã đúng
2. ✅ Backend tự động lấy thông tin phòng khám từ database (không cần frontend gửi)
3. ✅ Logo được backend tự động load (không cần frontend xử lý)
4. ✅ PDF generation hoàn toàn ở phía backend

## Lưu ý cho Backend

### Cần đảm bảo trong Backend:

1. **Clinic Entity phải có dữ liệu:**
   - `name` - Tên phòng khám
   - `address` - Địa chỉ
   - `phone` - Số điện thoại
   - `email` - Email
   - `website` - Website (optional)
   - `logoUrl` - URL logo (optional, nếu có sẽ ưu tiên dùng)

2. **Logo file:**
   - Đặt logo tại: `src/main/resources/static/logo.png`
   - Hoặc set `logoUrl` trong database trỏ đến URL logo

3. **ClinicService:**
   - Phải có method `getClinicEntity()` trả về Clinic entity
   - Nếu không có clinic, có thể trả về null (backend sẽ xử lý fallback)

## Test Checklist

Sau khi backend được cập nhật, test các chức năng sau:

- [ ] Generate PDF hồ sơ bệnh án → Logo xuất hiện
- [ ] Generate PDF hồ sơ bệnh án → Thông tin phòng khám đúng
- [ ] Generate PDF hồ sơ bệnh án → Không có border ở phần thông tin chung
- [ ] Generate PDF hồ sơ bệnh án → Đơn thuốc hiển thị dạng bảng 2 cột
- [ ] Generate PDF đơn thuốc → Hoạt động bình thường
- [ ] Nếu không có logo → Hiển thị placeholder "LOGO"
- [ ] Nếu không có thông tin phòng khám → Hiển thị thông báo phù hợp

## Kết luận

✅ **Frontend không cần thay đổi gì** - Tất cả đã tương thích với backend mới!

Backend sẽ tự động:
- Load logo từ database hoặc static folder
- Lấy thông tin phòng khám từ database
- Generate PDF với layout mới (không border, bảng 2 cột cho đơn thuốc)

Frontend chỉ cần gọi API và download PDF như hiện tại.

