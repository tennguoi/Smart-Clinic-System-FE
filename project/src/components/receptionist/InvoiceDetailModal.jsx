// src/components/receptionist/InvoiceDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Edit2,
  Save,
  Trash2,
  Plus,
  Search,
  Loader2,
  FileText,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = {
  Cash: 'Tiền mặt',
  Card: 'Thẻ ngân hàng',
  Transfer: 'Chuyển khoản'
};

const PAYMENT_STATUS = {
  Pending: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
  Paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  PartiallyPaid: { label: 'Thanh toán 1 phần', color: 'bg-blue-100 text-blue-800' }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

export default function InvoiceDetailModal({ invoice, onClose, onUpdate, onPay }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddService, setShowAddService] = useState(false);
  
  // Trạng thái loading khi lưu
  const [saving, setSaving] = useState(false);

  // Khởi tạo items từ invoice
  useEffect(() => {
    if (invoice?.items && Array.isArray(invoice.items)) {
      setEditedItems(invoice.items.map(item => ({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        subTotal: item.subTotal || 0,
        description: item.description || ''
      })));
    } else {
      setEditedItems([]);
    }
  }, [invoice]);

  // Tải danh sách dịch vụ khi bật chỉnh sửa
  useEffect(() => {
    if (isEditing && availableServices.length === 0) {
      const loadServices = async () => {
        setLoadingServices(true);
        try {
          const { data } = await axiosInstance.get('/api/public/services?page=0&size=500');
          const list = (data.content || data.services || []).map(s => ({
            serviceId: s.serviceId,
            name: s.name,
            price: s.price || 0
          }));
          setAvailableServices(list);
        } catch (err) {
          console.error('Lỗi tải dịch vụ:', err);
          toast.error('Không thể tải danh sách dịch vụ');
        } finally {
          setLoadingServices(false);
        }
      };
      loadServices();
    }
  }, [isEditing, availableServices.length]);

  if (!invoice) return null;

  const canEdit = invoice.paymentStatus === 'Pending' && (!invoice.amountPaid || invoice.amountPaid === 0);
  const totalAmount = editedItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  const status = PAYMENT_STATUS[invoice.paymentStatus] || PAYMENT_STATUS.Pending;

  const filteredServices = availableServices.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddService = (service) => {
    if (editedItems.some(i => i.serviceId === service.serviceId)) {
      toast.error('Dịch vụ đã tồn tại trong hóa đơn', { duration: 3000 });
      return;
    }
    setEditedItems(prev => [...prev, {
      serviceId: service.serviceId,
      serviceName: service.name,
      quantity: 1,
      unitPrice: service.price,
      subTotal: service.price,
      description: ''
    }]);
    toast.success(`Đã thêm: ${service.name}`);
    setShowAddService(false); // Đóng panel sau khi thêm
    setSearchQuery(''); // Xóa tìm kiếm
  };

  const handleRemoveItem = (index) => {
    if (editedItems.length === 1) {
      toast.error('Hóa đơn phải có ít nhất 1 dịch vụ');
      return;
    }
    setEditedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index, delta) => {
    setEditedItems(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty < 1) return prev;
      updated[index].quantity = newQty;
      updated[index].subTotal = updated[index].unitPrice * newQty;
      return updated;
    });
  };

  // Hàm lưu có loading
  const handleSave = async () => {
    if (editedItems.length === 0) {
      toast.error('Hóa đơn phải có ít nhất 1 dịch vụ');
      return;
    }

    if (editedItems.some(item => !item.serviceId)) {
      toast.error('Có dịch vụ bị thiếu thông tin. Vui lòng kiểm tra lại.');
      return;
    }

    setSaving(true); // Bắt đầu loading

    try {
      await axiosInstance.put(`/api/billing/${invoice.billId}`, {
        items: editedItems.map(item => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          description: item.description || ''
        }))
      });

      toast.success('Cập nhật hóa đơn thành công!', {
        icon: '✅',
        duration: 3000,
      });

      setIsEditing(false);
      setShowAddService(false);
      setSearchQuery('');
      onUpdate?.(); // Cập nhật danh sách ở component cha

    } catch (err) {
      console.error('Lỗi cập nhật hóa đơn:', err);
      toast.error(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Cập nhật hóa đơn thất bại. Vui lòng thử lại.'
      );
    } finally {
      setSaving(false); // Luôn tắt loading
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết hóa đơn</h2>
              <p className="text-sm text-gray-500">
                Mã: {invoice.billId?.slice(0, 8).toUpperCase() || 'N/A'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-gray-100 rounded-xl transition"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Thông tin bệnh nhân & hóa đơn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-bold">Bệnh nhân</span>
              </div>
              <p className="text-lg font-semibold">{invoice.patientName || 'Chưa có tên'}</p>
              <p className="text-gray-600">{invoice.patientPhone || 'Không có SĐT'}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="font-bold">Thông tin hóa đơn</span>
              </div>
              <p>Ngày tạo: {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</p>
              <p className="mt-2">
                Trạng thái: <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>{status.label}</span>
              </p>
            </div>
          </div>

          {/* Danh sách dịch vụ */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Dịch vụ & Chi phí
              </h3>

              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  <Edit2 className="w-5 h-5" />
                  Chỉnh sửa
                </button>
              )}

              {isEditing && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddService(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                    disabled={saving}
                  >
                    <Plus className="w-5 h-5" />
                    Thêm dịch vụ
                  </button>

                  {/* Nút Lưu với loading */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${
                      saving 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setShowAddService(false);
                      setSearchQuery('');
                      // Khôi phục dữ liệu gốc
                      setEditedItems(invoice.items.map(item => ({
                        serviceId: item.serviceId,
                        serviceName: item.serviceName,
                        quantity: item.quantity || 1,
                        unitPrice: item.unitPrice || 0,
                        subTotal: item.subTotal || 0,
                        description: item.description || ''
                      })));
                    }}
                    className="px-5 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition"
                    disabled={saving}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>

            {/* Panel thêm dịch vụ */}
            {showAddService && (
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-dashed border-green-300">
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm dịch vụ..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-green-100 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl">
                  {loadingServices ? (
                    <div className="p-10 text-center">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                      <p className="mt-3 text-gray-600">Đang tải dịch vụ...</p>
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <p className="p-10 text-center text-gray-500">Không tìm thấy dịch vụ nào</p>
                  ) : (
                    filteredServices.map(s => (
                      <button
                        key={s.serviceId}
                        onClick={() => handleAddService(s)}
                        className="w-full text-left p-4 hover:bg-green-50 border-b last:border-0 flex justify-between items-center transition"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{s.name}</div>
                          <div className="text-sm text-gray-600">{formatPrice(s.price)}</div>
                        </div>
                        <Plus className="w-6 h-6 text-green-600" />
                      </button>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setShowAddService(false)}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  Đóng
                </button>
              </div>
            )}

            {/* Danh sách dịch vụ hiện tại */}
            <div className="space-y-4">
              {editedItems.length === 0 ? (
                <p className="text-center text-gray-500 py-10">Chưa có dịch vụ nào</p>
              ) : (
                editedItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{item.serviceName}</div>
                      <div className="text-gray-600">{formatPrice(item.unitPrice)} × {item.quantity}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      {isEditing && (
                        <>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleUpdateQuantity(idx, -1)} 
                              className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 text-xl font-bold"
                              disabled={saving}
                            >-</button>
                            <span className="w-16 text-center font-bold text-xl">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(idx, 1)} 
                              className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 text-xl font-bold"
                              disabled={saving}
                            >+</button>
                          </div>
                          <button 
                            onClick={() => handleRemoveItem(idx)} 
                            className="text-red-600 hover:text-red-800"
                            disabled={saving}
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </>
                      )}
                      <div className="text-2xl font-bold text-blue-600 w-40 text-right">
                        {formatPrice(item.subTotal)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tổng kết */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-4xl font-bold">
              Còn lại: {formatPrice(totalAmount - (invoice.amountPaid || 0))}
            </div>
            <div className="mt-4 text-xl opacity-90">
              Tổng tiền: {formatPrice(totalAmount)} • Đã thu: {formatPrice(invoice.amountPaid || 0)}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-4">
            <button 
              onClick={onClose} 
              className="px-8 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-lg transition"
              disabled={saving}
            >
              Đóng
            </button>
            {invoice.paymentStatus === 'Pending' && !isEditing && (
              <button
                onClick={() => onPay?.(invoice)}
                className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-xl shadow-2xl flex items-center gap-3 hover:shadow-green-500/50 transition"
              >
                <CreditCard className="w-7 h-7" />
                Thanh toán ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}