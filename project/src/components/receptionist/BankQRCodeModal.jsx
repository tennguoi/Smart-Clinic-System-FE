import React, { useState, useEffect } from 'react';
import { X, Copy, Download, CheckCircle, Smartphone } from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function BankQRCodeModal({ amount, billId, onClose, onConfirmPayment }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Thông tin ngân hàng của bạn - CẬP NHẬT THÔNG TIN NÀY
  const bankInfo = {
    bankCode: 'MB',        // Mã ngân hàng (VCB, TCB, MB, ACB, etc.)
    accountNo: '0332763869094', // Số tài khoản
    accountName: 'PHAM MINH DAN', // Tên chủ tài khoản
    template: 'compact2'     // Template QR
  };

  useEffect(() => {
    // Tạo nội dung chuyển khoản
    const transferContent = `Thanh toan ${billId?.slice(0, 8).toUpperCase()}`;
    
    // Tạo URL QR code sử dụng API VietQR
    const qrApiUrl = `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNo}-${bankInfo.template}.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
    
    setQrUrl(qrApiUrl);
  }, [amount, billId]);

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(bankInfo.accountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-${billId?.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      await onConfirmPayment();
      
      // Dispatch event to notify other components about payment completion
      window.dispatchEvent(new CustomEvent('paymentCompleted', {
        detail: {
          billId: billId,
          amount: amount,
          paymentMethod: 'BankTransfer',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header - Compact */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">Quét mã QR thanh toán</h2>
                <p className="text-blue-100 text-xs">Mã HĐ: #{billId?.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Số tiền - Compact */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center border-2 border-emerald-200">
            <div className="text-xs text-gray-600 mb-1">Số tiền thanh toán</div>
            <div className="text-3xl font-bold text-emerald-600">{formatPrice(amount)}</div>
          </div>

          {/* QR Code - Lớn hơn */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <div className="text-center mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Mở app ngân hàng và quét mã QR
              </p>
            </div>
            
            {qrUrl ? (
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl border-4 border-blue-500 shadow-lg">
                  <img 
                    src={qrUrl} 
                    alt="QR Code" 
                    className="w-80 h-80 object-contain"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-80">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Button tải QR - Nhỏ gọn */}
            <button
              onClick={handleDownloadQR}
              className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Tải xuống
            </button>
          </div>

          {/* Thông tin ngân hàng - Compact */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-gray-900 text-center text-sm mb-2">
              Hoặc chuyển khoản thủ công
            </h3>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Ngân hàng:</span>
                <span className="font-semibold text-gray-900">{bankInfo.bankCode}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Chủ TK:</span>
                <span className="font-semibold text-gray-900">{bankInfo.accountName}</span>
              </div>

              <div className="flex justify-between items-center gap-2 bg-white p-2.5 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">Số tài khoản</div>
                  <div className="font-mono font-bold text-gray-900 text-sm">{bankInfo.accountNo}</div>
                </div>
                <button
                  onClick={handleCopyAccountNumber}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                  title="Sao chép"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-bold text-emerald-600">{formatPrice(amount)}</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <div className="text-xs text-amber-800 mb-0.5 font-semibold">Nội dung CK:</div>
                <div className="font-mono text-sm text-amber-900 font-bold">
                  Thanh toan {billId?.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Lưu ý - Compact */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <h4 className="font-semibold text-blue-900 mb-1.5 flex items-center gap-1.5 text-sm">
              <span className="text-base">💡</span>
              Lưu ý quan trọng
            </h4>
            <ul className="text-xs text-blue-800 space-y-0.5 list-disc list-inside">
              <li>Chuyển <strong>đúng số tiền</strong> và <strong>đúng nội dung</strong></li>
              <li>Sau khi CK, nhấn "Xác nhận đã thanh toán"</li>
              <li>Giao dịch được xác nhận trong vài phút</li>
            </ul>
          </div>

          {/* Nút hành động - Nhỏ gọn */}
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={isConfirming}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-sm"
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Xác nhận đã thanh toán
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}