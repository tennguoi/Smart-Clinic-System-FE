/**
 * Utility function để tải PDF từ blob
 * @param {Blob} pdfBlob - Blob chứa dữ liệu PDF
 * @param {string} filename - Tên file để tải xuống
 * @returns {Promise<void>}
 */
export const downloadPdf = (pdfBlob, filename) => {
  return new Promise((resolve, reject) => {
    try {
      // Kiểm tra blob hợp lệ
      if (!pdfBlob || !(pdfBlob instanceof Blob)) {
        reject(new Error('Dữ liệu PDF không hợp lệ'));
        return;
      }

      // Kiểm tra kích thước blob
      if (pdfBlob.size === 0) {
        reject(new Error('File PDF trống'));
        return;
      }

      // Tạo URL từ blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Tạo link để download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'document.pdf';
      
      // Thêm vào DOM, click, và xóa
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Giải phóng URL sau một chút thời gian để đảm bảo download đã bắt đầu
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        resolve();
      }, 100);
    } catch (error) {
      reject(new Error('Lỗi khi tải PDF: ' + (error.message || 'Vui lòng thử lại')));
    }
  });
};

/**
 * Helper function để tạo tên file PDF cho hồ sơ bệnh án
 * @param {string|number} recordId - ID của hồ sơ
 * @returns {string}
 */
export const getMedicalRecordFilename = (recordId) => {
  return `HoSoBenhAn_${recordId}.pdf`;
};

/**
 * Helper function để tạo tên file PDF cho đơn thuốc
 * @param {string|number} recordId - ID của hồ sơ
 * @returns {string}
 */
export const getPrescriptionFilename = (recordId) => {
  return `DonThuoc_${recordId}.pdf`;
};

