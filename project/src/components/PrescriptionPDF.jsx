import React from 'react';

const PrescriptionPDF = ({ prescription, onClose }) => {
  if (!prescription) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Sử dụng browser's print to PDF functionality
    // Hoặc có thể sử dụng thư viện như jsPDF để tạo PDF
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 overflow-hidden">
        {/* Header với controls */}
        <div className="bg-blue-600 text-white px-6 py-4 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Xuất toa thuốc PDF
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrint}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                In toa thuốc
              </button>
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Tải PDF
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* PDF Content - Responsive cho preview và print */}
        <div className="h-full overflow-auto print:overflow-visible">
          <div className="max-w-none p-8 bg-white print:p-0 print:m-0" id="prescription-content">
            {/* Header phòng khám */}
            <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
              <h1 className="text-2xl font-bold text-blue-600 mb-2">PHÒNG KHÁM SMART CLINIC</h1>
              <div className="text-sm text-gray-600">
                <p>Địa chỉ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM</p>
                <p>Điện thoại: (028) 1234-5678 | Email: contact@smartclinic.vn</p>
              </div>
            </div>

            {/* Tiêu đề toa thuốc */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold uppercase mb-2">ĐơN THUỐC</h2>
              <p className="text-sm text-gray-600">Số toa thuốc: {prescription.prescriptionCode}</p>
            </div>

            {/* Thông tin bệnh nhân và bác sĩ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">THÔNG TIN BỆNH NHÂN</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-24">Họ tên:</span>
                    <span>{prescription.patientName}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">Mã BN:</span>
                    <span>{prescription.patientCode}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">Ngày sinh:</span>
                    <span>_____________</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">Địa chỉ:</span>
                    <span>_____________</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">THÔNG TIN KHÁM BỆNH</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-24">Bác sĩ:</span>
                    <span>{prescription.doctorName}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">Ngày kê:</span>
                    <span>{formatDate(prescription.prescribedDate)}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">Chẩn đoán:</span>
                    <span>{prescription.diagnosis || 'Không có'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách thuốc */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">DANH SÁCH THUỐC</h3>
              
              {prescription.items && prescription.items.length > 0 ? (
                <div className="space-y-4">
                  {prescription.items.map((item, index) => (
                    <div key={item.itemId || index} className="border border-gray-300 rounded p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {index + 1}. {item.medicationName}
                          </h4>
                          {item.activeIngredient && (
                            <p className="text-gray-600 text-sm mt-1">
                              <span className="font-medium">Hoạt chất:</span> {item.activeIngredient}
                            </p>
                          )}
                          {item.strength && (
                            <p className="text-gray-600 text-sm">
                              <span className="font-medium">Hàm lượng:</span> {item.strength}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {item.quantity} {item.unit || 'viên'}
                          </div>
                          {item.dosageForm && (
                            <div className="text-sm text-gray-600">{item.dosageForm}</div>
                          )}
                        </div>
                      </div>

                      {item.dosageInstructions && (
                        <div className="bg-blue-50 p-3 rounded mt-3">
                          <p className="text-sm">
                            <span className="font-semibold text-blue-800">Cách dùng:</span>{' '}
                            <span className="text-blue-700">{item.dosageInstructions}</span>
                          </p>
                          {item.frequency && (
                            <p className="text-sm mt-1">
                              <span className="font-semibold text-blue-800">Tần suất:</span>{' '}
                              <span className="text-blue-700">{item.frequency}</span>
                            </p>
                          )}
                          {item.duration && (
                            <p className="text-sm mt-1">
                              <span className="font-semibold text-blue-800">Thời gian:</span>{' '}
                              <span className="text-blue-700">{item.duration}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {item.specialInstructions && (
                        <div className="bg-yellow-50 p-3 rounded mt-2">
                          <p className="text-sm">
                            <span className="font-semibold text-yellow-800">Lưu ý đặc biệt:</span>{' '}
                            <span className="text-yellow-700">{item.specialInstructions}</span>
                          </p>
                        </div>
                      )}

                      {item.precautions && (
                        <div className="bg-red-50 p-3 rounded mt-2">
                          <p className="text-sm">
                            <span className="font-semibold text-red-800">Thận trọng:</span>{' '}
                            <span className="text-red-700">{item.precautions}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Không có thuốc nào trong đơn</p>
              )}
            </div>

            {/* Hướng dẫn điều trị */}
            {prescription.treatmentInstructions && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">HƯỚNG DẪN ĐIỀU TRỊ</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm">{prescription.treatmentInstructions}</p>
                </div>
              </div>
            )}

            {/* Lời khuyên lối sống */}
            {prescription.lifestyleAdvice && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">LỜI KHUYÊN VỀ LỐI SỐNG</h3>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm">{prescription.lifestyleAdvice}</p>
                </div>
              </div>
            )}

            {/* Hẹn tái khám */}
            {prescription.followUpDate && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">LỊCH TÁI KHÁM</h3>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm">
                    <span className="font-medium">Ngày tái khám:</span> {formatDateTime(prescription.followUpDate)}
                  </p>
                  {prescription.followUpInstructions && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Hướng dẫn:</span> {prescription.followUpInstructions}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Ghi chú thêm */}
            {prescription.additionalNotes && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">GHI CHÚ THÊM</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm">{prescription.additionalNotes}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-end mt-8 pt-6 border-t border-gray-300">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-8">Người bệnh/Người nhà</div>
                <div className="border-b border-gray-400 w-32 mx-auto"></div>
                <div className="text-xs text-gray-500 mt-1">(Ký, ghi rõ họ tên)</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                </div>
                <div className="text-sm text-gray-600 mb-6">Bác sĩ điều trị</div>
                <div className="border-b border-gray-400 w-32 mx-auto"></div>
                <div className="text-xs text-gray-500 mt-1">{prescription.doctorName}</div>
              </div>
            </div>

            {/* Lưu ý quan trọng */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                <strong>LưU Ý:</strong> Thuốc chỉ được sử dụng theo đúng chỉ định của bác sĩ. 
                Không tự ý thay đổi liều lượng hoặc ngừng thuốc khi chưa hết liệu trình điều trị.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:overflow-visible { overflow: visible !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-blue-50, .bg-green-50, .bg-yellow-50, .bg-red-50, .bg-gray-50 {
            background-color: #f8f9fa !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrescriptionPDF;
