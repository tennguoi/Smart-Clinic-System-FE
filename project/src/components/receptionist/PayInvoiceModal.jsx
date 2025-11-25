import React, { useState } from 'react';
import { CreditCard, Banknote, ArrowUpDown, X } from 'lucide-react';

const paymentMethods = [
  { value: 'Cash', label: 'Tiền mặt', icon: Banknote, color: 'text-green-600' },
  { value: 'Card', label: 'Thẻ ngân hàng', icon: CreditCard, color: 'text-blue-600' },
  { value: 'Transfer', label: 'Chuyển khoản', icon: ArrowUpDown, color: 'text-purple-600' },
];

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function PayInvoiceModal({ invoice, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isLoading, setIsLoading] = useState(false);

  if (!invoice) return null;

  const remaining = invoice.remainingAmount || (invoice.totalAmount - invoice.amountPaid) || 0;

  const handlePay = async () => {
    if (remaining <= 0) {
      alert('Hóa đơn đã thanh toán đủ');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8082/api/billing/${invoice.billId}/pay`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paidAmount: remaining,
          paymentMethod: paymentMethod
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Thanh toán thất bại');
      }

      const methodLabel = paymentMethods.find(m => m.value === paymentMethod)?.label || paymentMethod;
      alert(`✅ Thanh toán thành công ${formatPrice(remaining)} bằng ${methodLabel}!`);

      onSuccess?.();
      onClose();
    } catch (err) {
      alert('❌ ' + (err.message || 'Thanh toán thất bại. Vui lòng thử lại!'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Thanh toán hóa đơn</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Thông tin hóa đơn */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl mb-6 border-2 border-blue-200">
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <div className="text-gray-600 mb-1">Mã hóa đơn</div>
              <div className="text-blue-700 font-bold text-base">
                #{invoice.billId?.slice(0, 10).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Bệnh nhân</div>
              <div className="text-gray-900 font-semibold">{invoice.patientName}</div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Tổng tiền:</span>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(invoice.totalAmount)}
              </span>
            </div>
            
            {invoice.amountPaid > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Đã thanh toán:</span>
                <span className="text-lg font-semibold text-green-600">
                  - {formatPrice(invoice.amountPaid)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t-2 border-blue-300 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Số tiền thanh toán:</span>
              <span className="text-3xl font-bold text-red-600">
                {formatPrice(remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Chọn phương thức thanh toán
          </label>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.value;

              return (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  disabled={isLoading}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                  } disabled:opacity-60`}
                >
                  <Icon className={`w-10 h-10 mb-2 ${isSelected ? 'text-blue-600' : method.color}`} />
                  <span className={`font-semibold text-xs ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                    {method.label}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thông báo */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800 text-center">
            💡 Bạn sẽ thanh toán toàn bộ số tiền còn lại: <strong>{formatPrice(remaining)}</strong>
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handlePay}
            disabled={isLoading || remaining <= 0}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-base shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                XÁC NHẬN THANH TOÁN
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}