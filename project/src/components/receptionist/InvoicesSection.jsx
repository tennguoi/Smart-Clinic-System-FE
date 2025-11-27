// src/components/receptionist/InvoicesSection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '../../api/billingApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceDetailModal from './InvoiceDetailModal';
import { formatPrice } from '../../utils/formatPrice';
import { FileText, Search, Plus, Eye, CreditCard, Receipt } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import CountBadge from '../common/CountBadge';

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

  const handlePayInvoice = (invoice) => {
    navigate(`/reception/payment/${invoice.billId}`);
  };

  const handlePayFromDetail = (invoice) => {
    setShowDetailModal(false);
    navigate(`/reception/payment/${invoice.billId}`);
  };

  return (
    <div className="px-4 sm:px-8 pt-4 pb-8 min-h-screen bg-gray-50">
      <Toaster {...toastConfig} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          <Receipt className="w-9 h-9 text-blue-600" />
          <span>Quản Lý Hóa Đơn</span>
          <CountBadge 
            currentCount={invoices.length} 
            totalCount={invoices.length} 
            label="hóa đơn" 
          />
        </h1>

        {!isDoctorView && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo hóa đơn
          </button>
        )}
      </div>
      {/* Bộ lọc */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tên bệnh nhân, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chưa thanh toán / Chưa đủ</option>
            </select>
          </div>

          <div className="lg:col-span-3 flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnpaidOnly}
                onChange={(e) => setShowUnpaidOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Chỉ chưa thanh toán</span>
            </label>
          </div>

          {hasFilter && (
            <div className="lg:col-span-1 flex items-end">
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setShowUnpaidOnly(false);
                }}
                className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-medium"
              >
                Xóa lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bảng hóa đơn */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
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
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider w-20">
                    STT
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Mã hóa đơn</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Bệnh nhân</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Ngày lập</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Tổng tiền</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((inv, index) => (
                  <tr key={inv.billId} className="hover:bg-gray-50 transition">
                    {/* STT - Đã thêm */}
                    <td className="px-4 py-4 text-center font-semibold text-gray-700">
                      {index + 1}
                    </td>

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
                      <div className="flex items-center justify-center gap-3">
                        {/* Xem chi tiết */}
                        <button
                          onClick={() => handleViewDetail(inv)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-full transition group relative"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                            Xem chi tiết
                          </span>
                        </button>

                        {/* Thu tiền - chỉ hiện khi chưa thanh toán và không phải doctor */}
                        {!isDoctorView && inv.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => handlePayInvoice(inv)}
                            className="p-2.5 text-green-600 hover:bg-green-50 rounded-full transition group relative"
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