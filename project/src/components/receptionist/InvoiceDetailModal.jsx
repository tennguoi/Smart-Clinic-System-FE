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
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../utils/axiosConfig';
import toast from 'react-hot-toast';

const PAYMENT_STATUS = {
  Pending: { label: 'invoices.modal.statusMap.pending', color: 'bg-yellow-100 text-yellow-800' },
  Paid: { label: 'invoices.modal.statusMap.paid', color: 'bg-green-100 text-green-800' },
  PartiallyPaid: { label: 'invoices.modal.statusMap.partiallyPaid', color: 'bg-blue-100 text-blue-800' }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

export default function InvoiceDetailModal({ invoice, onClose, onUpdate, onPay }) {
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddService, setShowAddService] = useState(false);
  const [saving, setSaving] = useState(false);

  // Init editedItems from invoice safely
  useEffect(() => {
    if (invoice && Array.isArray(invoice.items)) {
      setEditedItems(invoice.items.map(item => ({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        subTotal: item.subTotal || (item.unitPrice || 0) * (item.quantity || 1),
        description: item.description || ''
      })));
    } else {
      setEditedItems([]);
    }
  }, [invoice]);

  // Load services when entering edit mode
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
          toast.error(t('common.error'));
        } finally {
          setLoadingServices(false);
        }
      };
      loadServices();
    }
  }, [isEditing, availableServices.length, t]);

  if (!invoice) return null;

  const canEdit = invoice.paymentStatus === 'Pending' && (!invoice.amountPaid || invoice.amountPaid === 0);
  const totalAmountLocal = editedItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
  // Choose which total to show depending on edit state:
  const totalAmount = isEditing ? totalAmountLocal : (invoice.totalAmount ?? totalAmountLocal);
  const status = PAYMENT_STATUS[invoice.paymentStatus] || PAYMENT_STATUS.Pending;

  const filteredServices = availableServices.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddService = (service) => {
    if (editedItems.some(i => i.serviceId === service.serviceId)) {
      toast.error(t('invoices.modal.serviceAlreadyExists'), { duration: 3000 });
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
    toast.success(`${t('invoices.modal.addedService')}: ${service.name}`);
    setShowAddService(false);
    setSearchQuery('');
    // optional: scroll into view or focus last added item in UI (left to implementation)
  };

  const handleRemoveItem = (index) => {
    if (editedItems.length === 1) {
      toast.error(t('invoices.modal.atLeastOneService'));
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

  const handleSave = async () => {
    if (editedItems.length === 0) {
      toast.error(t('invoices.modal.atLeastOneService'));
      return;
    }

    if (editedItems.some(item => !item.serviceId)) {
      toast.error(t('invoices.modal.missingServiceInfo'));
      return;
    }

    setSaving(true);

    try {
      await axiosInstance.put(`/api/billing/${invoice.billId}`, {
        items: editedItems.map(item => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          description: item.description || ''
        }))
      });

      toast.success(t('invoices.modal.updateSuccess'), {
        icon: <CheckCircle />
      });

      setIsEditing(false);
      setShowAddService(false);
      setSearchQuery('');
      onUpdate?.();

    } catch (err) {
      console.error('Lỗi cập nhật hóa đơn:', err);
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t('common.error')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowAddService(false);
    setSearchQuery('');
    // Reset edited items from current invoice safely
    setEditedItems(
      invoice && Array.isArray(invoice.items)
        ? invoice.items.map(item => ({
            serviceId: item.serviceId,
            serviceName: item.serviceName,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            subTotal: item.subTotal || (item.unitPrice || 0) * (item.quantity || 1),
            description: item.description || ''
          }))
        : []
    );
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
              <h2 className="text-2xl font-bold text-gray-900">{t('invoices.modal.title')}</h2>
              <p className="text-sm text-gray-500">
                {t('invoices.modal.code')}: {invoice.billId?.slice(0, 8).toUpperCase() || 'N/A'}
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
          {/* Patient & invoice info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-bold">{t('invoices.modal.patient')}</span>
              </div>
              <p className="text-lg font-semibold">{invoice.patientName || t('invoices.modal.noPatientName')}</p>
              <p className="text-gray-600">{invoice.patientPhone || t('invoices.modal.noPhone')}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="font-bold">{t('invoices.modal.invoiceInfo')}</span>
              </div>
              <p>
                {t('invoices.modal.createdDate')}: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
              <p className="mt-2">
                {t('invoices.modal.status')}: <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                  {t(status.label)}
                </span>
              </p>
            </div>
          </div>

          {/* Services list */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                {t('invoices.modal.servicesAndCosts')}
              </h3>

              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  <Edit2 className="w-5 h-5" />
                  {t('invoices.common.edit')}
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
                    {t('invoices.modal.addService')}
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition text-white ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('invoices.modal.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {t('common.save')}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCancelEdit}
                    className="px-5 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition"
                    disabled={saving}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </div>

            {/* Add service panel */}
            {showAddService && (
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-dashed border-green-300">
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('invoices.modal.searchServicePlaceholder')}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-green-100 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl">
                  {loadingServices ? (
                    <div className="p-10 text-center">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                      <p className="mt-3 text-gray-600">{t('invoices.modal.loadingServices')}</p>
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <p className="p-10 text-center text-gray-500">{t('invoices.modal.noServiceFound')}</p>
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
                  {t('invoices.common.close')}
                </button>
              </div>
            )}

            {/* Current services */}
            <div className="space-y-4">
              {editedItems.length === 0 ? (
                <p className="text-center text-gray-500 py-10">{t('invoices.modal.noServices')}</p>
              ) : (
                editedItems.map((item) => (
                  <div key={item.serviceId || item.serviceName} className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{item.serviceName}</div>
                      <div className="text-gray-600">{formatPrice(item.unitPrice)} × {item.quantity}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      {isEditing && (
                        <>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(editedItems.indexOf(item), -1)}
                              className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 text-xl font-bold"
                              disabled={saving}
                            >-</button>
                            <span className="w-16 text-center font-bold text-xl">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(editedItems.indexOf(item), 1)}
                              className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 text-xl font-bold"
                              disabled={saving}
                            >+</button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(editedItems.indexOf(item))}
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

          {/* Summary */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-4xl font-bold">
              {t('invoices.modal.remaining')}: {formatPrice(totalAmount - (invoice.amountPaid || 0))}
            </div>
            <div className="mt-4 text-xl opacity-90">
              {t('invoices.modal.total')}: {formatPrice(totalAmount)} • {t('invoices.modal.paid')}: {formatPrice(invoice.amountPaid || 0)}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-lg transition"
              disabled={saving}
            >
              {t('invoices.common.close')}
            </button>
            {invoice.paymentStatus === 'Pending' && !isEditing && (
              <button
                onClick={() => onPay?.(invoice)}
                className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-xl shadow-2xl flex items-center gap-3 hover:shadow-green-500/50 transition"
              >
                <CreditCard className="w-7 h-7" />
                {t('invoices.modal.payNow')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
