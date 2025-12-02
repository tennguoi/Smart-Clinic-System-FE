// src/components/receptionist/CreateInvoiceModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, User, Phone, FileText, Plus, Trash2, Loader } from 'lucide-react';
import { billingApi } from '../../api/billingApi';
import { patientApi } from '../../api/patientApi';
import { serviceApi, formatPrice } from '../../api/serviceApi';
import toast from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const PAYMENT_METHODS = [
    { value: 'Cash', label: t('createInvoice.paymentMethods.cash') },
    { value: 'Card', label: t('createInvoice.paymentMethods.card') },
    { value: 'Transfer', label: t('createInvoice.paymentMethods.transfer') },
  ];

  const [searchPatient, setSearchPatient] = useState('');
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load dữ liệu khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [patientsRes, servicesRes] = await Promise.all([
          patientApi.getAll(0, 200),
          serviceApi.getAllServices(0, 200),
        ]);

        setPatients(patientsRes.patients || []);
        setServices(servicesRes.services || servicesRes.data || []);
      } catch (err) {
        toast.error(t('createInvoice.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isOpen, t]);

  const filteredPatients = patients.filter(p =>
    p.fullName?.toLowerCase().includes(searchPatient.toLowerCase()) ||
    p.phone?.includes(searchPatient)
  );

  const addService = (service) => {
    if (!selectedServices.find(s => s.serviceId === service.serviceId)) {
      setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setSelectedServices(prev => prev.map(s => s.serviceId === id ? { ...s, quantity: qty } : s));
  };

  const removeService = (id) => {
    setSelectedServices(prev => prev.filter(s => s.serviceId !== id));
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0);

  const getLatestRecordId = async (patientId) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const res = await fetch(`http://localhost:8082/api/medical-records/patient/${patientId}/latest`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(t('createInvoice.errors.noRecord'));
    return (await res.json()).recordId;
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return toast.error(t('createInvoice.errors.selectPatient'));
    if (selectedServices.length === 0) return toast.error(t('createInvoice.errors.selectService'));

    setSubmitting(true);
    try {
      const recordId = await getLatestRecordId(selectedPatient.patientId);

      await billingApi.create({
        recordId,
        paymentMethod,
        items: selectedServices.map(s => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
          description: ''
        }))
      });

      toast.success(t('createInvoice.success'));
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || t('createInvoice.errors.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <FileText className={`w-7 h-7 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('createInvoice.title')}</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('createInvoice.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* 1. Chọn bệnh nhân */}
          <div>
            <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('createInvoice.selectPatient')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('createInvoice.searchPlaceholder')}
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            {/* Danh sách bệnh nhân */}
            {searchPatient && (
              <div className={`mt-3 max-h-64 overflow-y-auto border rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {filteredPatients.length === 0 ? (
                  <p className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('createInvoice.noPatientFound')}</p>
                ) : (
                  filteredPatients.slice(0, 8).map(patient => (
                    <div
                      key={patient.patientId}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchPatient('');
                      }}
                      className={`p-4 cursor-pointer border-b last:border-0 flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-blue-50 border-gray-100'}`}
                    >
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{patient.fullName}</div>
                        <div className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Phone className="w-3 h-3" /> {patient.phone}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Bệnh nhân đã chọn */}
          {selectedPatient && (
            <div className={`border rounded-xl p-5 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center gap-3">
                <User className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>{selectedPatient.fullName}</span>
                  <span className={`ml-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>• {selectedPatient.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Chọn dịch vụ */}
          <div>
            <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              {t('createInvoice.selectServices')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {services.map(service => (
                <div
                  key={service.serviceId}
                  onClick={() => addService(service)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedServices.find(s => s.serviceId === service.serviceId)
                      ? (theme === 'dark' ? 'border-blue-500 bg-blue-900/30' : 'border-blue-500 bg-blue-50')
                      : (theme === 'dark' ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50')
                  }`}
                >
                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{service.name}</div>
                  <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{formatPrice(service.price)}</div>
                  {selectedServices.find(s => s.serviceId === service.serviceId) && (
                    <div className={`mt-2 text-xs font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{t('createInvoice.added')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedServices.length > 0 && (
            <div className={`rounded-xl p-5 space-y-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('createInvoice.selectedServices', { count: selectedServices.length })}
              </h4>
              {selectedServices.map(s => (
                <div key={s.serviceId} className={`flex items-center justify-between rounded-lg p-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex-1">
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{s.name}</span>
                    <span className={`text-sm ml-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>× {s.quantity}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatPrice(s.price * s.quantity)}</span>
                    <button onClick={() => removeService(s.serviceId)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tổng tiền + Phương thức thanh toán */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                {t('createInvoice.paymentMethod')}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 flex items-center justify-between">
              <span className="text-lg font-semibold">{t('createInvoice.totalAmount')}</span>
              <span className="text-2xl font-bold">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 p-6 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <button
            onClick={onClose}
            className={`px-6 py-3 border rounded-xl font-medium transition ${theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {t('createInvoice.common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedPatient || selectedServices.length === 0 || submitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {t('createInvoice.creating')}
              </>
            ) : (
              t('createInvoice.createButton')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}