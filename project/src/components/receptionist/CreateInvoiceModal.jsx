// src/components/receptionist/CreateInvoiceModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, User, Phone, FileText, Plus, Trash2, Loader } from 'lucide-react';
import { billingApi } from '../../api/billingApi';
import { patientApi } from '../../api/patientApi';
import { serviceApi, formatPrice } from '../../api/serviceApi';
import { toast } from 'react-toastify';

const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Tiền mặt' },
  { value: 'Card', label: 'Thẻ tín dụng/ghi nợ' },
  { value: 'Transfer', label: 'Chuyển khoản' },
];

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }) {
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
        toast.error('Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isOpen]);

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
    if (!res.ok) throw new Error('Không tìm thấy hồ sơ khám');
    return (await res.json()).recordId;
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return toast.error('Vui lòng chọn bệnh nhân');
    if (selectedServices.length === 0) return toast.error('Vui lòng chọn ít nhất 1 dịch vụ');

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

      toast.success('Tạo hóa đơn thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Tạo hóa đơn thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
  <FileText className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tạo hóa đơn mới</h2>
              <p className="text-sm text-gray-600">Nhanh chóng lập hóa đơn cho bệnh nhân</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* 1. Chọn bệnh nhân */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tìm & chọn bệnh nhân <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập tên hoặc số điện thoại..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Danh sách bệnh nhân */}
            {searchPatient && (
              <div className="mt-3 max-h-64 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-lg">
                {filteredPatients.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">Không tìm thấy bệnh nhân</p>
                ) : (
                  filteredPatients.slice(0, 8).map(patient => (
                    <div
                      key={patient.patientId}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchPatient('');
                      }}
                      className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-center gap-3"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{patient.fullName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
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
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600" />
                <div>
                  <span className="font-semibold text-blue-900">{selectedPatient.fullName}</span>
                  <span className="text-blue-700 ml-3">• {selectedPatient.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Chọn dịch vụ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Chọn dịch vụ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {services.map(service => (
                <div
                  key={service.serviceId}
                  onClick={() => addService(service)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedServices.find(s => s.serviceId === service.serviceId)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{formatPrice(service.price)}</div>
                  {selectedServices.find(s => s.serviceId === service.serviceId) && (
                    <div className="mt-2 text-xs font-semibold text-blue-600">Đã thêm</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedServices.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <h4 className="font-semibold text-gray-900">Dịch vụ đã chọn ({selectedServices.length})</h4>
              {selectedServices.map(s => (
                <div key={s.serviceId} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex-1">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-sm text-gray-500 ml-3">× {s.quantity}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatPrice(s.price * s.quantity)}</span>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phương thức thanh toán</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 flex items-center justify-between">
              <span className="text-lg font-semibold">Tổng tiền</span>
              <span className="text-2xl font-bold">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedPatient || selectedServices.length === 0 || submitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Đang tạo...
              </>
            ) : (
              'Tạo hóa đơn'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}