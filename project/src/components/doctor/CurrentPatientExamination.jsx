// src/components/doctor/CurrentPatientExamination.jsx
import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  PhoneCall, User, Calendar, FileText, Pill, Stethoscope,
  CheckCircle, Plus, Search, Loader2, Check, Receipt
} from 'lucide-react';

import {
  getMyQueue,
  getCurrentPatient,
  callPatient as callPatientApi,
  completeExamination,
} from '../../api/doctorApi';

import {
  addService,
  addPrescription,
  getExaminationSummary,
  getPatientMedicalHistory
} from '../../api/examinationApi';

import axiosInstance from '../../utils/axiosConfig';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

export default function CurrentPatientExamination() {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [queue, setQueue] = useState([]);
  const [summary, setSummary] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dịch vụ
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  // Form khám
  const [diagnosis, setDiagnosis] = useState('');
  const [newDrug, setNewDrug] = useState({ medication: '', quantity: '', instructions: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('examination'); // examination | services | invoice

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [queueRes, patientRes] = await Promise.all([
        getMyQueue(),
        getCurrentPatient()
      ]);

      const waiting = (queueRes || []).filter(q => q.status !== 'Completed');
      setQueue(waiting);

      if (patientRes) {
        const patient = {
          ...patientRes,
          fullName: patientRes.fullName,
          queueNumber: patientRes.queueNumber,
          gender: patientRes.gender === 'Male' ? 'Nam' : 'Nữ',
          age: patientRes.age || '--',
          checkInTime: new Date(patientRes.startTime || patientRes.checkInTime)
            .toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setCurrentPatient(patient);

        const [summaryRes, historyRes] = await Promise.all([
          getExaminationSummary(),
          getPatientMedicalHistory(patientRes.patientId).catch(() => [])
        ]);
        setSummary(summaryRes);
        setMedicalHistory(historyRes || []);

        if (summaryRes?.diagnosis) setDiagnosis(summaryRes.diagnosis);

        if (summaryRes?.serviceItems) {
          setSelectedServices(summaryRes.serviceItems.map(item => ({
            id: item.serviceId,
            name: item.serviceName,
            price: item.unitPrice,
            quantity: item.quantity
          })));
        }
      } else {
        setCurrentPatient(null);
        setSummary(null);
        setSelectedServices([]);
        setDiagnosis('');
      }
    } catch (err) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentPatient && services.length === 0) {
      const fetch = async () => {
        setLoadingServices(true);
        try {
          const { data } = await axiosInstance.get('/api/public/services?page=0&size=500');
          setServices((data.content || []).map(s => ({
            id: s.serviceId,
            name: s.name,
            price: s.price
          })));
        } catch {
          toast.error('Không tải được danh sách dịch vụ');
        } finally {
          setLoadingServices(false);
        }
      };
      fetch();
    }
  }, [currentPatient]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleService = async (service) => {
    if (selectedServices.some(s => s.id === service.id)) {
      toast.info('Dịch vụ đã được chọn');
      return;
    }
    setIsLoading(true);
    try {
      const res = await addService({
        currentQueueId: currentPatient.queueId,
        serviceId: service.id,
        quantity: 1,
        note: ''
      });
      setSummary(res);
      setSelectedServices(prev => [...prev, { ...service, quantity: 1 }]);
      toast.success(`Đã thêm: ${service.name}`);
    } catch {
      toast.error('Lỗi thêm dịch vụ');
    } finally {
      setIsLoading(false);
    }
  };

  const addDrug = async () => {
    if (!newDrug.medication.trim() || !newDrug.instructions.trim()) {
      toast.error('Vui lòng nhập tên thuốc và hướng dẫn dùng');
      return;
    }
    setIsLoading(true);
    try {
      const res = await addPrescription({
        currentQueueId: currentPatient.queueId,
        drugs: `${newDrug.medication} - ${newDrug.quantity || ''}`.trim(),
        instructions: newDrug.instructions
      });
      setSummary(res);
      setNewDrug({ medication: '', quantity: '', instructions: '' });
      toast.success('Đã kê đơn thành công');
    } catch {
      toast.error('Lỗi kê đơn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (selectedServices.length === 0) {
      toast.error('Chưa chỉ định dịch vụ nào');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/api/doctor/create-invoice');
      toast.success(`Tạo hóa đơn thành công: ${res.data.invoiceCode}`);
      setActiveTab('invoice');
    } catch (err) {
      toast.error(err.response?.data || 'Lỗi tạo hóa đơn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!diagnosis.trim()) {
      toast.error('Vui lòng nhập chẩn đoán');
      return;
    }
    try {
      await completeExamination();
      toast.success('Hoàn thành khám thành công!');
      await loadData();
    } catch {
      toast.error('Lỗi hoàn thành khám');
    }
  };

  const handleCallPatient = async (p) => {
    if (currentPatient) {
      toast.error('Đang khám bệnh nhân khác');
      return;
    }
    try {
      await callPatientApi(p.queueId);
      toast.success(`Đã gọi ${p.queueNumber} - ${p.fullName || p.patientName}`);
      await loadData();
    } catch {
      toast.error('Gọi bệnh nhân thất bại');
    }
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);

  // ==================== KHI ĐANG KHÁM ====================
  if (currentPatient) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <Toaster position="top-right" />
        <header className="bg-white border-b px-6 py-4 shadow-sm">
          <h1 className="text-2xl font-semibold">Khám bệnh - {currentPatient.fullName}</h1>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-slate-200 p-6 space-y-6 overflow-y-auto">
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border-l-4 border-emerald-500">
              <div className="text-5xl font-bold text-emerald-600">{currentPatient.queueNumber}</div>
              <h2 className="text-xl font-bold mt-2">{currentPatient.fullName}</h2>
              <div className="text-sm text-slate-600 mt-4 space-y-2">
                <div><User size={16} className="inline mr-2" />{currentPatient.gender} • {currentPatient.age} tuổi</div>
                <div><Calendar size={16} className="inline mr-2" />Vào: {currentPatient.checkInTime}</div>
              </div>
            </div>

            {medicalHistory.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-700 mb-3">Lịch sử khám gần đây</h3>
                <div className="space-y-3">
                  {medicalHistory.slice(0, 4).map((r, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg text-sm">
                      <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                      <div className="font-medium">{r.diagnosis}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white overflow-y-auto">
            {/* Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex gap-1 px-8 pt-4">
                {[
                  { id: 'examination', label: 'Khám & Kê đơn', icon: FileText },
                  { id: 'services', label: 'Chỉ định dịch vụ', icon: Stethoscope },
                  { id: 'invoice', label: 'Hóa đơn', icon: Receipt },
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-3 px-8 py-4 font-semibold rounded-t-xl transition-all ${
                        activeTab === t.id
                          ? 'bg-white text-emerald-600 border-t-4 border-emerald-500 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={22} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-8 max-w-5xl mx-auto">
              {/* TAB: Khám & Kê đơn */}
              {activeTab === 'examination' && (
                <div className="space-y-10">
                  <div>
                    <label className="block text-lg font-bold mb-3">Chẩn đoán <span className="text-red-500">*</span></label>
                    <textarea
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      className="w-full h-48 p-5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-100 resize-none"
                      placeholder="Nhập chẩn đoán chi tiết..."
                    />
                  </div>

                  <div className="border-t pt-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <Pill size={28} /> Kê đơn thuốc
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <input placeholder="Tên thuốc + hàm lượng" value={newDrug.medication}
                        onChange={e => setNewDrug({ ...newDrug, medication: e.target.value })}
                        className="px-4 py-3 border rounded-xl" />
                      <input placeholder="Số lượng" value={newDrug.quantity}
                        onChange={e => setNewDrug({ ...newDrug, quantity: e.target.value })}
                        className="px-4 py-3 border rounded-xl" />
                      <input placeholder="Hướng dẫn dùng" value={newDrug.instructions}
                        onChange={e => setNewDrug({ ...newDrug, instructions: e.target.value })}
                        className="px-4 py-3 border rounded-xl md:col-span-2" />
                      <button onClick={addDrug} disabled={isLoading}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                        Kê đơn
                      </button>
                    </div>

                    {summary?.prescription && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                        <h4 className="font-bold mb-3">Đơn thuốc đã kê:</h4>
                        <pre className="font-medium whitespace-pre-wrap">{summary.prescription.drugs}</pre>
                        <p className="text-sm italic text-slate-600 mt-3">{summary.prescription.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: Chỉ định dịch vụ */}
              {activeTab === 'services' && (
                <div className="space-y-8">
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm dịch vụ..."
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-purple-100"
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50">
                    {loadingServices ? (
                      <div className="p-16 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto" /></div>
                    ) : filteredServices.length === 0 ? (
                      <div className="p-16 text-center text-slate-500">Không tìm thấy dịch vụ</div>
                    ) : (
                      filteredServices.map(svc => {
                        const selected = selectedServices.some(s => s.id === svc.id);
                        return (
                          <div
                            key={svc.id}
                            onClick={() => toggleService(svc)}
                            className={`p-5 cursor-pointer hover:bg-white border-b border-slate-100 last:border-0 transition-all ${
                              selected ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-slate-900">{svc.name}</div>
                                <div className="text-sm text-slate-600">{formatPrice(svc.price)}</div>
                              </div>
                              {selected && <Check className="w-7 h-7 text-purple-600" />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB: Hóa đơn */}
              {activeTab === 'invoice' && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-10 rounded-3xl border-2 border-emerald-300">
                  <h2 className="text-3xl font-bold text-emerald-800 mb-10 text-center flex items-center justify-center gap-4">
                    <Receipt size={40} /> HÓA ĐƠN KHÁM BỆNH
                  </h2>

                  {selectedServices.length === 0 ? (
                    <div className="text-center py-20 text-xl text-slate-500">Chưa có dịch vụ nào được chỉ định</div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-10">
                        {selectedServices.map((s, i) => (
                          <div key={i} className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-md">
                            <div>
                              <div className="font-bold text-lg">{s.name}</div>
                              <div className="text-sm text-slate-600">Số lượng: {s.quantity}</div>
                            </div>
                            <div className="text-2xl font-bold text-emerald-700">
                              {formatPrice(s.price * s.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center border-t-4 border-emerald-500 pt-8">
                        <div className="text-4xl font-bold text-emerald-700">
                          Tổng tiền: {formatPrice(totalAmount)}
                        </div>
                      </div>

                      <div className="flex justify-center gap-8 mt-12">
                        <button
                          onClick={handleCreateInvoice}
                          disabled={isLoading || selectedServices.length === 0}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl disabled:opacity-60 flex items-center gap-4"
                        >
                          {isLoading ? <Loader2 className="animate-spin" /> : <Receipt size={32} />}
                          Tạo hóa đơn chính thức
                        </button>

                        <button
                          onClick={handleComplete}
                          disabled={!diagnosis.trim()}
                          className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl disabled:opacity-60 flex items-center gap-4"
                        >
                          <CheckCircle size={32} />
                          Hoàn thành khám
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== TRANG CHỜ BỆNH NHÂN ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-emerald-700">Phòng khám bác sĩ</h1>
          <p className="text-2xl text-emerald-600 mt-4">{queue.length} bệnh nhân đang chờ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {queue.length === 0 ? (
            <div className="col-span-full text-center py-32">
              <div className="text-6xl mb-6">Không có bệnh nhân</div>
              <p className="text-2xl text-slate-500">Hiện tại chưa có bệnh nhân nào trong hàng chờ</p>
            </div>
          ) : (
            queue.map(p => (
              <div key={p.queueId} className="bg-white rounded-3xl shadow-2xl p-10 text-center hover:shadow-3xl transition-all">
                <div className="text-8xl font-bold text-emerald-600 mb-4">{p.queueNumber}</div>
                <h3 className="text-2xl font-bold mb-2">{p.fullName || p.patientName}</h3>
                <p className="text-slate-600 text-lg">{p.phone}</p>
                <button
                  onClick={() => handleCallPatient(p)}
                  className="mt-8 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 rounded-2xl text-2xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-xl"
                >
                  <PhoneCall size={36} className="inline mr-3" />
                  Gọi vào khám
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}