import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  PhoneCall, User, Calendar, Plus, Search, Loader2, CheckCircle, X, Clock,
  FileText, Pill, Stethoscope, Check as CheckIcon
} from 'lucide-react';

import {
  getCurrentPatient,
  callNextPatient,
  completeExamination,
  getWaitingQueue,
} from '../../api/doctorApi';

import {
  addService,
  getExaminationSummary,
  getPatientMedicalHistory
} from '../../api/examinationApi';

import medicalRecordApi from '../../api/medicalRecordApi';
import axiosInstance from '../../utils/axiosConfig';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

const calculateAge = (dob) => {
  if (!dob) return '--';
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch {
    return '--';
  }
};

const formatTime = (dateString) => {
  if (!dateString) return '--';
  try {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--';
  }
};

export default function CurrentPatientExamination() {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [summary, setSummary] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState([{ drugName: '', instructions: '' }]);
  const [activeTab, setActiveTab] = useState('examination');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [waitingRes, patientRes] = await Promise.all([
        getWaitingQueue(),
        getCurrentPatient()
      ]);

      setWaitingQueue(waitingRes || []);

      if (patientRes) {
        const patient = {
          ...patientRes,
          notes: patientRes.notes || patientRes.patient?.notes || '',
          fullName: patientRes.patientName || patientRes.fullName,
          queueNumber: patientRes.queueNumber,
          gender: patientRes.gender === 'Male' || patientRes.gender === 'Nam' ? 'Nam' : 'Nữ',
          age: calculateAge(patientRes.dob),
          checkInTime: formatTime(patientRes.checkInTime || patientRes.startTime)
        };
        setCurrentPatient(patient);

        const [summaryRes, historyRes] = await Promise.all([
          getExaminationSummary(),
          getPatientMedicalHistory(patientRes.patientId).catch(() => [])
        ]);
        setSummary(summaryRes);
        setMedicalHistory(historyRes || []);

        if (summaryRes?.diagnosis) setDiagnosis(summaryRes.diagnosis);
        if (summaryRes?.treatmentNotes) setTreatmentNotes(summaryRes.treatmentNotes);

        if (summaryRes?.serviceItems) {
          setSelectedServices(summaryRes.serviceItems.map(item => ({
            id: item.serviceId,
            name: item.serviceName,
            price: item.unitPrice,
            quantity: item.quantity
          })));
        }

        if (summaryRes?.prescription) {
          const drugs = summaryRes.prescription.drugs || '';
          const instructions = summaryRes.prescription.instructions || '';
          if (drugs && instructions) {
            const drugLines = drugs.split('\n').filter(d => d.trim());
            const instructionLines = instructions.split('\n').filter(i => i.trim());
            if (drugLines.length > 0) {
              const items = drugLines.map((drug, i) => ({
                drugName: drug.trim(),
                instructions: instructionLines[i]?.trim() || ''
              }));
              setPrescriptionItems(items);
            }
          }
        }
      } else {
        setCurrentPatient(null);
        setSummary(null);
        setSelectedServices([]);
        setDiagnosis('');
        setTreatmentNotes('');
        setPrescriptionItems([{ drugName: '', instructions: '' }]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Lỗi tải dữ liệu phòng khám');
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
  }, [currentPatient, services.length]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CHỨC NĂNG THÊM / BỎ CHỌN DỊCH VỤ – HOÀN HẢO, KHÔNG CẦN BE XÓA
  const toggleService = async (service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);

    if (isSelected) {
      // BỎ CHỌN → Chỉ cập nhật lại từ summary (an toàn nhất)
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
      toast.success(`Đã bỏ chọn: ${service.name}`);

      // Đồng bộ lại với backend (lấy summary mới)
      try {
        const updatedSummary = await getExaminationSummary();
        setSummary(updatedSummary);
      } catch (err) {
        console.error('Không thể đồng bộ summary sau khi bỏ chọn');
      }
    } else {
      // THÊM DỊCH VỤ
      if (!currentPatient?.queueId) {
        toast.error('Không tìm thấy thông tin bệnh nhân');
        return;
      }
      setIsLoading(true);
      try {
        const res = await addService({
          currentQueueId: currentPatient.queueId,
          serviceId: String(service.id),
          quantity: 1,
          note: ''
        });
        setSummary(res);
        setSelectedServices(prev => [...prev, { ...service, quantity: 1 }]);
        toast.success(`Đã thêm: ${service.name}`);
      } catch (error) {
        toast.error(error.response?.data || 'Lỗi thêm dịch vụ');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleComplete = async () => {
    if (!diagnosis.trim()) {
      toast.error('Vui lòng nhập chẩn đoán');
      return;
    }

    const validPrescriptions = prescriptionItems.filter(
      item => item.drugName.trim() !== '' || item.instructions.trim() !== ''
    );

    for (const item of validPrescriptions) {
      if (item.drugName.trim() && !item.instructions.trim()) {
        toast.error('Vui lòng nhập hướng dẫn sử dụng cho tất cả các thuốc');
        return;
      }
      if (!item.drugName.trim() && item.instructions.trim()) {
        toast.error('Vui lòng nhập tên thuốc');
        return;
      }
    }

    setIsLoading(true);
    try {
      const recordId = summary?.recordId;
      if (!recordId) {
        toast.error('Không tìm thấy thông tin bệnh án');
        setIsLoading(false);
        return;
      }

      await medicalRecordApi.update(recordId, {
        patientId: currentPatient.patientId,
        patientName: currentPatient.fullName,
        diagnosis: diagnosis.trim(),
        treatmentNotes: treatmentNotes.trim()
      });

      if (validPrescriptions.length > 0) {
        const drugsText = validPrescriptions.map(item => item.drugName.trim()).join('\n');
        const instructionsText = validPrescriptions.map(item => item.instructions.trim()).join('\n');
        await medicalRecordApi.addPrescription({
          recordId: recordId,
          drugs: drugsText,
          instructions: instructionsText
        });
      }

      if (selectedServices.length > 0) {
        const invoiceRes = await axiosInstance.post('/api/doctor/create-invoice');
        toast.success(`Tạo hóa đơn thành công: ${invoiceRes.data.invoiceCode}`);
      }

      await completeExamination();
      toast.success('Hoàn thành khám thành công!');
      await loadData();
    } catch (error) {
      console.error('Error completing examination:', error);
      toast.error(error.response?.data?.message || 'Lỗi hoàn thành khám');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallNext = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await callNextPatient();
      toast.success('Đã gọi bệnh nhân tiếp theo!');
      await loadData();
    } catch (err) {
      toast.error('Không còn bệnh nhân trong hàng chờ');
    } finally {
      setIsLoading(false);
    }
  };

  const addPrescriptionItem = () => {
    setPrescriptionItems([...prescriptionItems, { drugName: '', instructions: '' }]);
  };

  const removePrescriptionItem = (index) => {
    if (prescriptionItems.length === 1) {
      setPrescriptionItems([{ drugName: '', instructions: '' }]);
    } else {
      setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
    }
  };

  const updatePrescriptionItem = (index, field, value) => {
    const newItems = [...prescriptionItems];
    newItems[index][field] = value;
    setPrescriptionItems(newItems);
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);

  // ==================== GIAO DIỆN KHI ĐANG KHÁM – XANH DƯƠNG + TRẮNG ====================
  if (currentPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50">
        <Toaster position="top-right" />
        <div className="flex h-screen">
          {/* Sidebar trái */}
          <div className="w-96 bg-white shadow-xl border-r border-blue-100 flex flex-col">
            <div className="p-8 border-b border-blue-100">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <User className="w-16 h-16 text-blue-600" />
                </div>
                <div className="text-5xl font-bold text-blue-600 mb-2">{currentPatient.queueNumber}</div>
                <h2 className="text-2xl font-bold text-slate-800">{currentPatient.fullName}</h2>
                <div className="mt-4 space-y-2 text-slate-600">
  <div><Calendar className="inline w-5 h-5 mr-2" />{currentPatient.gender} • {currentPatient.age} tuổi</div>
  <div><Clock className="inline w-5 h-5 mr-2" />Vào lúc: {currentPatient.checkInTime}</div>
</div>

<div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-sm">
  <div className="flex items-start gap-3">
    <div className="bg-amber-200 p-2.5 rounded-xl flex-shrink-0">
      <FileText className="w-7 h-7 text-amber-800" />
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-amber-900 text-lg mb-2">
        Triệu chứng / Lý do đến khám
      </h3>
      <div className="bg-white p-4 rounded-xl border border-amber-200 min-h-28 text-slate-800 leading-relaxed whitespace-pre-wrap text-base">
        {currentPatient.notes?.trim() ? (
          currentPatient.notes.trim()
        ) : (
          <span className="text-slate-400 italic">Chưa có ghi chú từ lễ tân</span>
        )}
      </div>
    </div>
  </div>
</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-bold text-xl text-slate-700 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Hàng đợi tiếp theo ({waitingQueue.length})
              </h3>
              {waitingQueue.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Không còn bệnh nhân nào</p>
              ) : (
                <div className="space-y-3">
                  {waitingQueue.map((p, i) => (
                    <div key={p.queueId} className="bg-blue-50 p-4 rounded-xl hover:bg-blue-100 transition-all">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-lg text-blue-600">{p.queueNumber}</div>
                          <div className="text-sm text-slate-700">{p.patientName}</div>
                        </div>
                        {i === 0 && (
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Tiếp theo
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nội dung chính */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-blue-100 px-8 py-4">
              <div className="flex gap-1">
                {[
                  { id: 'examination', label: 'Khám & Kê đơn', icon: FileText },
                  { id: 'services', label: 'Chỉ định dịch vụ', icon: Stethoscope },
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-3 px-8 py-4 font-semibold rounded-t-xl transition-all ${
                        activeTab === t.id
                          ? 'bg-white text-blue-600 border-t-4 border-blue-600 shadow-sm'
                          : 'text-slate-600 hover:bg-blue-50'
                      }`}
                    >
                      <Icon size={22} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-blue-50/50 to-white">
              <div className="max-w-5xl mx-auto">
                {activeTab === 'examination' && (
                  <div className="space-y-10">
                    <div>
                      <label className="block text-lg font-bold mb-3">Chẩn đoán <span className="text-red-500">*</span></label>
                      <textarea
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                        className="w-full h-40 p-5 border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 resize-none"
                        placeholder="Nhập chẩn đoán chi tiết..."
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-bold mb-3">Ghi chú điều trị</label>
                      <textarea
                        value={treatmentNotes}
                        onChange={e => setTreatmentNotes(e.target.value)}
                        className="w-full h-32 p-5 border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 resize-none"
                        placeholder="Ghi chú về quá trình điều trị, theo dõi..."
                      />
                    </div>

                    <div className="border-t pt-8">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <Pill size={28} /> Kê đơn thuốc
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-slate-600 mb-2">
                          <div className="col-span-1 text-center">STT</div>
                          <div className="col-span-5">TÊN THUỐC <span className="text-red-500">*</span></div>
                          <div className="col-span-5">HƯỚNG DẪN SỬ DỤNG <span className="text-red-500">*</span></div>
                          <div className="col-span-1 text-center">THAO TÁC</div>
                        </div>

                        {prescriptionItems.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4 items-start">
                            <div className="col-span-1 flex items-center justify-center pt-3 font-semibold">
                              {index + 1}
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                placeholder="VD: Paracetamol 500mg (10 viên)"
                                value={item.drugName}
                                onChange={(e) => updatePrescriptionItem(index, 'drugName', e.target.value)}
                                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400"
                              />
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                placeholder="VD: Uống 1 viên/lần, 3 lần/ngày sau ăn"
                                value={item.instructions}
                                onChange={(e) => updatePrescriptionItem(index, 'instructions', e.target.value)}
                                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400"
                              />
                            </div>
                            <div className="col-span-1 flex items-center justify-center pt-2">
                              <button
                                onClick={() => removePrescriptionItem(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                title="Xóa thuốc"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={addPrescriptionItem}
                          className="w-full py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 font-semibold hover:bg-blue-50 hover:border-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={20} />
                          Thêm thuốc mới
                        </button>
                      </div>

                      {prescriptionItems.some(item => item.drugName.trim() && item.instructions.trim()) && (
                        <div className="mt-6 bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200">
                          <h4 className="font-bold mb-4 text-lg">Đơn thuốc hiện tại:</h4>
                          <div className="space-y-3">
                            {prescriptionItems
                              .filter(item => item.drugName.trim() && item.instructions.trim())
                              .map((item, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg">
                                  <div className="font-semibold text-slate-800 mb-1">
                                    {index + 1}. {item.drugName}
                                  </div>
                                  <div className="text-sm text-slate-600 italic ml-4">
                                    {item.instructions}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center pt-8 border-t">
                      <button
                        onClick={handleComplete}
                        disabled={!diagnosis.trim() || isLoading}
                        className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-12 py-4 rounded-2xl text-xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 transition-all"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={28} />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={28} />
                            Hoàn thành khám
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div className="space-y-8">
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm dịch vụ..."
                        className="w-full pl-12 pr-4 py-3.5 border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {selectedServices.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200 mb-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <CheckIcon className="text-blue-600" size={20} />
                          Dịch vụ đã chọn ({selectedServices.length})
                        </h3>
                        <div className="space-y-3">
                          {selectedServices.map((s, i) => (
                            <div key={i} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                              <div>
                                <div className="font-semibold text-slate-900">{s.name}</div>
                                <div className="text-sm text-slate-600">Số lượng: {s.quantity}</div>
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {formatPrice(s.price * s.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-200 text-right">
                          <span className="text-2xl font-bold text-blue-700">
                            Tổng: {formatPrice(totalAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="max-h-96 overflow-y-auto border border-blue-200 rounded-xl bg-white">
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
                              className={`p-5 cursor-pointer hover:bg-blue-50 border-b border-blue-100 last:border-0 transition-all ${
                                selected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-slate-900">{svc.name}</div>
                                  <div className="text-sm text-slate-600">{formatPrice(svc.price)}</div>
                                </div>
                                {selected && <CheckIcon className="w-7 h-7 text-blue-600" />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MÀN HÌNH CHỜ – BẢNG DUY NHẤT, XANH DƯƠNG + TRẮNG ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50">
      <Toaster position="top-right" />

      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Phòng khám của tôi</h1>
          <p className="text-xl text-blue-600 mt-2 font-medium">
            {waitingQueue.length} bệnh nhân đang chờ khám
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {waitingQueue.length === 0 ? (
          <div className="text-center py-32 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100">
            <div className="text-8xl mb-6">Smile</div>
            <h2 className="text-2xl font-semibold text-blue-800">
              Hiện chưa có bệnh nhân nào
            </h2>
            <p className="text-lg text-blue-600 mt-3">Hệ thống đang chờ bệnh nhân tiếp theo...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 py-5">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Clock className="w-6 h-6" />
                Hàng chờ khám bệnh
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 text-blue-800 text-sm font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">STT</th>
                    <th className="px-6 py-4 text-left">Họ và tên</th>
                    <th className="px-6 py-4 text-center">Giới tính</th>
                    <th className="px-6 py-4 text-center">Tuổi</th>
                    <th className="px-6 py-4 text-center">Giờ vào</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {waitingQueue.map((patient, index) => {
                    const isNextPatient = index === 0;

                    return (
                      <tr
                        key={patient.queueId}
                        className={`transition-all duration-200 ${
                          isNextPatient
                            ? 'bg-blue-50/70 border-l-4 border-blue-600 font-medium'
                            : 'hover:bg-blue-50/30'
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-2xl ${isNextPatient ? 'text-blue-700' : 'text-gray-800'}`}>
                              {patient.queueNumber}
                            </span>
                            {isNextPatient && (
                              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                                Tiếp theo
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-gray-900 font-medium text-lg">
                          {patient.patientName}
                        </td>

                        <td className="px-6 py-5 text-center text-gray-700">
                          {patient.gender === 'Male' || patient.gender === 'Nam' ? 'Nam' : 'Nữ'}
                        </td>

                        <td className="px-6 py-5 text-center text-gray-800 font-semibold">
                          {calculateAge(patient.dob)}
                        </td>

                        <td className="px-6 py-5 text-center text-gray-600">
                          {formatTime(patient.checkInTime)}
                        </td>

                        <td className="px-6 py-5 text-center">
                          {isNextPatient && (
                            <button
                              onClick={handleCallNext}
                              disabled={isLoading}
                              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:from-blue-400 disabled:to-sky-400 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 mx-auto min-w-[160px]"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="animate-spin" size={18} />
                                  Đang gọi...
                                </>
                              ) : (
                                <>
                                  <PhoneCall size={18} />
                                  Gọi vào khám
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}