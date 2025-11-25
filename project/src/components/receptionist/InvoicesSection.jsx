// src/components/receptionist/InvoicesSection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '../../api/billingApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceDetailModal from './InvoiceDetailModal';
import { formatPrice } from '../../utils/formatPrice';
import { FileText, Search, Plus, Eye, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

export default function InvoicesSection({ isDoctorView = false }) {
  const navigate = useNavigate();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await billingApi.getAll(0, 100, search);
      let data = res.content || res.data || [];

      if (statusFilter === 'paid') data = data.filter(i => i.paymentStatus === 'Paid');
      if (statusFilter === 'pending') data = data.filter(i => i.paymentStatus === 'Pending' || i.paymentStatus === 'PartiallyPaid');
      if (showUnpaidOnly) data = data.filter(i => i.paymentStatus !== 'Paid');

      setInvoices(data);
    } catch (err) {
      toast.error('Không tải được danh sách hóa đơn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchInvoices, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, showUnpaidOnly]);

  const hasFilter = search || statusFilter !== 'all' || showUnpaidOnly;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Đã thanh toán</span>;
      case 'Pending':
        return <span className="px-3 py-1.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">Chưa thanh toán</span>;
      case 'PartiallyPaid':
        return <span className="px-3 py-1.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">Thanh toán 1 phần</span>;
      default:
        return <span className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">—</span>;
    }
  };

  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  // THAY ĐỔI: Navigate đến trang thanh toán thay vì mở modal
  const handlePayInvoice = (invoice) => {
    navigate(`/reception/payment/${invoice.billId}`);
  };

  // THAY ĐỔI: Navigate đến trang thanh toán từ modal chi tiết
  const handlePayFromDetail = (invoice) => {
    setShowDetailModal(false);
    navigate(`/reception/payment/${invoice.billId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quản lý Hóa đơn</h1>
              <p className="text-sm text-gray-500">
                {isDoctorView
                  ? 'Xem chi tiết thanh toán của bệnh nhân'
                  : 'Theo dõi và xử lý thanh toán bệnh nhân'}
              </p>
            </div>
          </div>

          {!isDoctorView && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Tạo hóa đơn mới
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Bộ lọc */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên bệnh nhân, số điện thoại..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chưa thanh toán / Chưa đủ</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnpaidOnly}
                  onChange={(e) => setShowUnpaidOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Chỉ hiển thị chưa thanh toán</span>
              </label>

              {hasFilter && (
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setShowUnpaidOnly(false);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bảng hóa đơn */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-gray-500">
              <div className="inline-flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Đang tải danh sách hóa đơn...</span>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-red-600 font-semibold">
                {hasFilter ? 'Không tìm thấy hóa đơn nào phù hợp' : 'Chưa có hóa đơn nào trong hệ thống'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {hasFilter ? 'Thử thay đổi bộ lọc' : 'Vui lòng tạo hóa đơn mới'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Mã hóa đơn</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Bệnh nhân</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Ngày lập</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Tổng tiền</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.billId} className="hover:bg-gray-50 transition">
                    {/* Mã hóa đơn */}
                    <td className="px-6 py-4 font-mono text-blue-600 font-medium">
                      #{inv.billId?.slice(0, 8).toUpperCase()}
                    </td>

                    {/* Bệnh nhân */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{inv.patientName}</div>
                      <div className="text-sm text-gray-500">{inv.patientPhone}</div>
                    </td>

                    {/* Ngày lập */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </td>

                    {/* Tổng tiền */}
                    <td className="px-6 py-4 text-right font-bold text-lg text-gray-900">
                      {formatPrice(inv.totalAmount)}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(inv.paymentStatus)}
                    </td>

                    {/* Thao tác */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Nút Xem chi tiết */}
                        <button
                          onClick={() => handleViewDetail(inv)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition group relative"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                            Xem chi tiết
                          </span>
                        </button>

                        {/* Nút Thu tiền - chỉ hiện khi chưa thanh toán và không phải doctor view */}
                        {!isDoctorView && inv.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => handlePayInvoice(inv)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition group relative"
                            title="Thu tiền"
                          >
                            <CreditCard className="w-5 h-5" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                              Thu tiền
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Chi tiết hóa đơn */}
      {showDetailModal && selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvoice(null);
          }}
          onUpdate={fetchInvoices}
          onPay={handlePayFromDetail}
        />
      )}

      {/* Modal Tạo hóa đơn */}
      {!isDoctorView && createModalOpen && (
        <CreateInvoiceModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}