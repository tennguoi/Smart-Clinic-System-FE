// src/components/receptionist/InvoicesSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '../../api/billingApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceDetailModal from './InvoiceDetailModal';
import { formatPrice } from '../../utils/formatPrice';
import { FileText, Search, Plus, Eye, CreditCard, Receipt, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';
import { useTheme } from '../../contexts/ThemeContext';

const ITEMS_PER_PAGE = 10;

export default function InvoicesSection({ isDoctorView = false }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // DÙNG API MỚI: /my-bills → TỰ ĐỘNG PHÂN QUYỀN
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // API MỚI: Bác sĩ chỉ thấy của mình, lễ tân & admin thấy tất cả
      const res = await billingApi.getMyBills(0, 1000, search.trim());
      let data = res.content || res || [];

      // Lọc trạng thái client-side
      if (statusFilter === 'paid') {
        data = data.filter(i => i.paymentStatus === 'Paid');
      }
      if (statusFilter === 'pending') {
        data = data.filter(i => i.paymentStatus === 'Pending' || i.paymentStatus === 'PartiallyPaid');
      }
      if (showUnpaidOnly) {
        data = data.filter(i => i.paymentStatus !== 'Paid');
      }

      setInvoices(data);
      setCurrentPage(0); // Reset về trang đầu khi filter
    } catch (err) {
      console.error('Lỗi tải hóa đơn:', err);
      toast.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại khi search, filter thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, showUnpaidOnly]);

  // Phân trang
  const paginatedInvoices = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return invoices.slice(start, start + ITEMS_PER_PAGE);
  }, [invoices, currentPage]);

  const totalPages = Math.max(1, Math.ceil(invoices.length / ITEMS_PER_PAGE));

  const hasFilter = search || statusFilter !== 'all' || showUnpaidOnly;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full">Đã thanh toán</span>;
      case 'Pending':
        return <span className="px-3 py-1.5 text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full">Chưa thanh toán</span>;
      case 'PartiallyPaid':
        return <span className="px-3 py-1.5 text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full">Thanh toán 1 phần</span>;
      default:
        return <span className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full">—</span>;
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

  const handleDownloadPdf = async (billId, patientName) => {
    try {
      const response = await fetch(`http://localhost:8082/api/billing/${billId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải xuống hóa đơn');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hoa-don-${patientName}-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Xuất hóa đơn thành công!');
    } catch (err) {
      console.error('Lỗi tải PDF:', err);
      toast.error('Không thể xuất hóa đơn. Vui lòng thử lại.');
    }
  };

  return (
    <div className={`px-4 sm:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3 transition-colors duration-300`}>
          <Receipt className="w-9 h-9 text-blue-600" />
          <span>Quản Lý Hóa Đơn</span>
          <CountBadge 
            currentCount={paginatedInvoices.length} 
            totalCount={invoices.length} 
            label="hóa đơn" 
          />
        </h1>

        {/* Chỉ lễ tân mới được tạo hóa đơn */}
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
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-md border p-6 mb-6 transition-colors duration-300`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tên bệnh nhân, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
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
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Chỉ chưa thanh toán</span>
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
                className={`w-full px-4 py-3 rounded-xl transition font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
              >
                Xóa lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bảng hóa đơn + Phân trang */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-md border overflow-hidden transition-colors duration-300`}>
        {loading ? (
          <div className={`p-16 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="inline-flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span>Đang tải danh sách hóa đơn...</span>
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className="text-red-600 font-semibold">
              {hasFilter ? 'Không tìm thấy hóa đơn nào phù hợp' : 'Chưa có hóa đơn nào'}
            </p>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {hasFilter ? 'Thử thay đổi bộ lọc' : 'Vui lòng tạo hóa đơn mới'}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
                <tr>
                  <th className={`text-center px-4 py-3 text-xs font-bold uppercase tracking-wider w-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>STT</th>
                  <th className={`text-left px-6 py-3 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Mã hóa đơn</th>
                  <th className={`text-left px-6 py-3 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Bệnh nhân</th>
                  <th className={`text-left px-6 py-3 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Ngày lập</th>
                  <th className={`text-right px-6 py-3 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tổng tiền</th>
                  <th className={`text-center px-6 py-3 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Trạng thái</th>
                  <th className={`text-center px-6 py-3 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Thao tác</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedInvoices.map((inv, index) => (
                  <tr key={inv.billId} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition`}>
                    <td className={`px-4 py-4 text-center font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {currentPage * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400 font-medium">
                      #{inv.billId?.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{inv.patientName}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{inv.patientPhone}</div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(inv.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(inv.paymentStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewDetail(inv)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-full transition group relative"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                            Xem chi tiết
                          </span>
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(inv.billId, inv.patientName)}
                          className="p-2.5 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30 rounded-full transition group relative"
                          title="Xuất PDF"
                        >
                          <Download className="w-5 h-5" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                            Xuất PDF
                          </span>
                        </button>

                        {/* Chỉ lễ tân mới thấy nút thu tiền */}
                        {!isDoctorView && inv.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => handlePayInvoice(inv)}
                            className="p-2.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 rounded-full transition group relative"
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

            {/* PAGINATION NẰM TRONG BẢNG */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal chi tiết */}
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

      {/* Modal tạo hóa đơn */}
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

      {/* TOASTER ĐÃ ĐỒNG BỘ 100% VỚI toastConfig.js */}
      <Toaster
        position={toastConfig.position}
        containerStyle={toastConfig.containerStyle}
        toastOptions={toastConfig.toastOptions}
      />
    </div>
  );
}