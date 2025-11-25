// src/components/receptionist/InvoiceDetailModal.jsx (hoặc đường dẫn hiện tại của bạn)
import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Trash2, Plus, Search, Loader2,FileText, User, Calendar, DollarSign, CreditCard } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';
import { billingApi } from '../../api/billingApi';
import { toast } from 'react-toastify';

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

  // Khởi tạo items từ invoice
  useEffect(() => {
    if (invoice?.items) {
      setEditedItems(invoice.items.map(item => ({
        ...item,
        description: item.description || ''
      })));
    }
  }, [invoice]);

  // TẢI DANH SÁCH DỊCH VỤ KHI BẬT CHỈNH SỬA – GIỐNG HỆT CurrentPatient
  useEffect(() => {
    if (isEditing && availableServices.length === 0) {
      const loadServices = async () => {
        setLoadingServices(true);
        try {
          const { data } = await axiosInstance.get('/api/public/services?page=0&size=500');
          const list = (data.content || data.services || []).map(s => ({
            serviceId: s.serviceId,
            name: s.name,
            price: s.price
          }));
          setAvailableServices(list);
        } catch (err) {
          toast.error('Không tải được danh sách dịch vụ');
          console.error(err);
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

  // Lọc dịch vụ theo tìm kiếm
  const filteredServices = availableServices.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddService = (service) => {
    const exists = editedItems.some(item => item.serviceId === service.serviceId);
    if (exists) {
      toast.warning('Dịch vụ đã có trong hóa đơn');
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
  };

  const handleRemoveItem = (index) => {
    if (editedItems.length === 1) {
      toast.error('Hóa đơn phải có ít nhất 1 dịch vụ');
      return;
    }
    setEditedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index, delta) => {
    const newQty = editedItems[index].quantity + delta;
    if (newQty < 1) return;
    setEditedItems(prev => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      updated[index].subTotal = updated[index].unitPrice * newQty;
      return updated;
    });
  };

  // DÙNG billingApi.updateInvoice ĐÃ CÓ SẴN
  const handleSave = async () => {
    if (editedItems.length === 0) {
      toast.error('Hóa đơn phải có ít nhất 1 dịch vụ');
      return;
    }

    try {
      await billingApi.updateInvoice(invoice.billId, {
        items: editedItems.map(item => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          description: item.description || ''
        }))
      });
      toast.success('Cập nhật hóa đơn thành công!');
      setIsEditing(false);
      setShowAddService(false);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const status = PAYMENT_STATUS[invoice.paymentStatus] || PAYMENT_STATUS.Pending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết hóa đơn</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Mã: {invoice.billId?.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">Thông tin bệnh nhân</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="font-semibold text-gray-900">{invoice.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="font-semibold text-gray-900">{invoice.patientPhone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-700">Thông tin hóa đơn</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Người tạo:</span>
                  <span className="font-semibold text-gray-900">{invoice.createdBy || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách dịch vụ */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Dịch vụ & Chi phí
              </h3>
              {canEdit && (
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowAddService(!showAddService)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm dịch vụ
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        <Save className="w-4 h-4" />
                        Lưu
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setShowAddService(false);
                          setEditedItems(invoice.items || []);
                        }}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
                      >
                        Hủy
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Panel thêm dịch vụ – giờ đã hoạt động hoàn hảo */}
            {showAddService && (
              <div className="mb-6 p-4 bg-white rounded-lg border-2 border-green-200">
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm dịch vụ..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {loadingServices ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <p className="p-8 text-center text-gray-500">Không tìm thấy dịch vụ</p>
                  ) : (
                    filteredServices.map(service => (
                      <button
                        key={service.serviceId}
                        onClick={() => handleAddService(service)}
                        className="w-full text-left p-3 border-b border-gray-100 hover:bg-green-50 transition last:border-0 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-600">{formatPrice(service.price)}</div>
                        </div>
                        <Plus className="w-5 h-5 text-green-600" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Danh sách dịch vụ hiện tại */}
            <div className="space-y-2">
              {editedItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{item.serviceName}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isEditing && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(index, -1)}
                            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(index, 1)}
                            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold"
                          >
                            +
                          </button>
                        </div>
                      )}
                      <div className="text-lg font-bold text-gray-900 min-w-[120px] text-right">
                        {formatPrice(item.subTotal)}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-gray-700">Tổng cộng:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(isEditing ? totalAmount : invoice.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Đã thanh toán:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(invoice.amountPaid || 0)}
                </span>
              </div>
              <div className="pt-3 border-t-2 border-emerald-300 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Còn lại:</span>
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice((isEditing ? totalAmount : invoice.totalAmount) - (invoice.amountPaid || 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Đóng
            </button>
            {invoice.paymentStatus === 'Pending' && !isEditing && (
              <button
                onClick={() => onPay?.(invoice)}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                Thanh toán ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}