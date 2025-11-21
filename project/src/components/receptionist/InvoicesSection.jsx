// src/components/receptionist/InvoicesSection.jsx
import React, { useState, useEffect } from 'react';
import { invoiceApi } from '../../api/invoiceApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import PayInvoiceModal from './PayInvoiceModal';
import { formatPrice } from '../../utils/formatPrice'; // ← THÊM DÒNG NÀY

export default function InvoicesSection() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await invoiceApi.getAll(page, 20, search);
      setInvoices(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi tải dữ liệu';
      setError(msg);
      console.error('Lỗi hóa đơn:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, search]);

  const getStatusBadge = (status) => {
    const styles = {
      PAID: 'bg-green-100 text-green-800',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
      ISSUED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    const texts = {
      PAID: 'Đã thanh toán',
      PARTIALLY_PAID: 'Thanh toán 1 phần',
      ISSUED: 'Chưa thanh toán',
      CANCELLED: 'Đã hủy',
    };
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-bold ${styles[status] || styles.ISSUED}`}>
        {texts[status] || 'Chưa thanh toán'}
      </span>
    );
  };

  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="bg-red-50 border border-red-300 rounded-2xl p-10 max-w-lg mx-auto">
          <p className="text-2xl font-bold text-red-700 mb-4">Lỗi kết nối!</p>
          <p className="text-gray-700 mb-6">{error}</p>
          <button onClick={fetchInvoices} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 className="text-4xl font-bold text-gray-800">Quản lý Hóa đơn</h1>
        <button
          onClick={() => alert('Chức năng tạo hóa đơn đang được phát triển!')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition"
        >
          + Tạo hóa đơn mới
        </button>
      </div>

      <input
        type="text"
        placeholder="Tìm kiếm bệnh nhân, số điện thoại..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        className="w-full max-w-2xl px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-lg"
      />

      {loading && (
        <div className="bg-white rounded-3xl shadow-2xl p-24 text-center">
          <div className="text-2xl text-gray-600 animate-pulse">Đang tải danh sách hóa đơn...</div>
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-6 text-left font-bold text-gray-700">Mã HD</th>
                  <th className="px-8 py-6 text-left font-bold text-gray-700">Bệnh nhân</th>
                  <th className="px-8 py-6 text-left font-bold text-gray-700">Ngày lập</th>
                  <th className="px-8 py-6 text-right font-bold text-gray-700">Tổng tiền</th>
                  <th className="px-8 py-6 text-right font-bold text-gray-700">Đã thu</th>
                  <th className="px-8 py-6 text-center font-bold text-gray-700">Trạng thái</th>
                  <th className="px-8 py-6 text-center font-bold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-24 text-gray-500 text-xl">
                      Không tìm thấy hóa đơn nào
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.invoiceId} className="hover:bg-blue-50 transition">
                      <td className="px-8 py-6 font-bold text-indigo-600 text-xl">{inv.invoiceCode}</td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-gray-800">{inv.patientName}</div>
                        <div className="text-gray-500 text-sm">{inv.patientPhone}</div>
                      </td>
                      <td className="px-8 py-6 text-gray-600">
                        {format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-2xl text-gray-800">
                        {formatPrice(inv.totalAmount)}
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-2xl text-green-600">
                        {formatPrice(inv.paidAmount)}
                      </td>
                      <td className="px-8 py-6 text-center">{getStatusBadge(inv.status)}</td>
                      <td className="px-8 py-6 text-center space-x-4">
                        <button className="text-blue-600 hover:text-blue-800 font-bold">Xem</button>
                        {Number(inv.remainingAmount) > 0 && (
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="text-green-600 hover:text-green-800 font-bold"
                          >
                            Thu tiền
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-8 bg-gray-50 flex justify-center items-center gap-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-8 py-4 bg-white border-2 rounded-xl disabled:opacity-50 hover:bg-gray-100 font-bold"
              >
                Trước
              </button>
              <span className="text-xl font-bold">Trang {page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
                className="px-8 py-4 bg-white border-2 rounded-xl disabled:opacity-50 hover:bg-gray-100 font-bold"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedInvoice && (
        <PayInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={() => {
            setSelectedInvoice(null);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}