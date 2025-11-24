// src/components/receptionist/PayInvoiceModal.jsx
import React, { useState } from 'react';
import { billingApi } from '../../api/billingApi';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'react-toastify';

export default function PayInvoiceModal({ invoice, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!invoice) return null;

  const remaining = invoice.remainingAmount || invoice.amountRemaining || 0;

  const handlePay = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0 || numAmount > remaining) {
      setError('Số tiền không hợp lệ');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await billingApi.pay(invoice.billId || invoice.invoiceId, numAmount, 'Cash');
      toast.success('Thanh toán thành công!');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Thanh toán thất bại';
      setError(msg);
      toast.error(msg);
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

        <div className="grid grid-cols-2 gap-6 mb-8 text-lg">
          <div>
            <strong>Mã HD:</strong>{' '}
            <span className="text-blue-600 font-bold text-xl">
              {invoice.billCode || invoice.invoiceCode || invoice.billId?.slice(0, 10)}
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
              {formatPrice(invoice.amountPaid || invoice.paidAmount || 0)}
            </span>
          </div>
          <div className="col-span-2 text-2xl font-bold text-red-600">
            Còn lại: {formatPrice(remaining)}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-lg font-semibold mb-3">
            Số tiền khách đưa
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={remaining}
            min="1"
            disabled={isLoading}
            className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition disabled:bg-gray-100"
            placeholder="Nhập số tiền"
            autoFocus
          />
          {error && <p className="text-red-600 mt-2 font-medium">{error}</p>}
        </div>

        <div className="flex gap-6">
          <button
            onClick={handlePay}
            disabled={isLoading || !amount || Number(amount) <= 0 || Number(amount) > remaining}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-xl font-bold text-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-5 rounded-xl font-bold text-xl transition"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}