// src/components/receptionist/PayInvoiceModal.jsx
import React, { useState } from 'react';
import { invoiceApi } from '../../api/invoiceApi';
import { formatPrice } from '../../utils/formatPrice';

export default function PayInvoiceModal({ invoice, onClose, onSuccess }) {
  const [amount, setAmount] = useState(
    invoice?.remainingAmount ? Number(invoice.remainingAmount) : 0
  );
  const [isLoading, setIsLoading] = useState(false); // ← thay cho mutation.isPending
  const [error, setError] = useState('');           // ← hiển thị lỗi nếu có

  if (!invoice) return null;

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0 || Number(amount) > Number(invoice.remainingAmount)) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await invoiceApi.pay(invoice.invoiceId, Number(amount));
      alert('Thanh toán thành công!');
      onSuccess(); // đóng modal + refresh danh sách
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi thanh toán';
      setError(msg);
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-2xl mx-4 overflow-y-auto max-h-screen">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Thanh toán hóa đơn
        </h2>

        {/* Thông tin hóa đơn */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-lg">
          <div>
            <strong>Mã HD:</strong>{' '}
            <span className="text-blue-600 font-bold text-xl">
              {invoice.invoiceCode}
            </span>
          </div>
          <div>
            <strong>Bệnh nhân:</strong> {invoice.patientName}
          </div>
          <div>
            <strong>Tổng tiền:</strong>{' '}
            <span className="font-bold">{formatPrice(invoice.totalAmount)}</span>
          </div>
          <div>
            <strong>Đã thanh toán:</strong>{' '}
            <span className="text-green-600 font-bold">
              {formatPrice(invoice.paidAmount)}
            </span>
          </div>
          <div className="col-span-2 text-2xl font-bold text-red-600">
            Còn lại: {formatPrice(invoice.remainingAmount)}
          </div>
        </div>

        {/* Input số tiền */}
        <div className="mb-8">
          <label className="block text-lg font-semibold mb-3">
            Số tiền khách đưa
          </label>
          <input
            type="number"
            value={amount || ''}
            onChange={(e) => {
              const val = e.target.value;
              setAmount(val === '' ? '' : Number(val));
            }}
            max={Number(invoice.remainingAmount)}
            min="1"
            disabled={isLoading}
            className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition disabled:bg-gray-100"
            placeholder="Nhập số tiền"
          />
          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </div>

        {/* Nút bấm */}
        <div className="flex gap-6">
          <button
            onClick={handlePay}
            disabled={
              isLoading ||
              !amount ||
              Number(amount) <= 0 ||
              Number(amount) > Number(invoice.remainingAmount)
            }
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-xl font-bold text-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-5 rounded-xl font-bold text-xl transition disabled:opacity-50"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}