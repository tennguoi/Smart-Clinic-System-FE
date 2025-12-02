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
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
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
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-sky-50'}`}>
        <Toaster position="top-right" />
        <div className="flex h-screen">
          {/* Sidebar trái */}
          <div className={`w-96 shadow-xl border-r flex flex-col ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className={`p-8 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-blue-100'}`}>
              <div className="text-center">
                <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <User className={`w-16 h-16 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div className={`text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{currentPatient.queueNumber}</div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{currentPatient.fullName}</h2>
                <div className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                  <div><Calendar className="inline w-5 h-5 mr-2" />{currentPatient.gender} • {currentPatient.age} tuổi</div>
                  <div><Clock className="inline w-5 h-5 mr-2" />Vào lúc: {currentPatient.checkInTime}</div>
                </div>

                <div className={`mt-6 p-5 border-2 rounded-2xl shadow-sm ${theme === 'dark' ? 'bg-amber-900/20 border-amber-800' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${theme === 'dark' ? 'bg-amber-900/50' : 'bg-amber-200'}`}>
                      <FileText className={`w-7 h-7 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-900'}`}>
                        Triệu chứng / Lý do đến khám
                      </h3>
                      <div className={`p-4 rounded-xl border min-h-28 leading-relaxed whitespace-pre-wrap text-base text-left ${theme === 'dark' ? 'bg-gray-800 border-amber-800 text-gray-300' : 'bg-white border-amber-200 text-slate-800'}`}>
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
              <h3 className={`font-bold text-xl mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                <Clock className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                Hàng đợi tiếp theo ({waitingQueue.length})
              </h3>
              {waitingQueue.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>Không còn bệnh nhân nào</p>
              ) : (
                <div className="space-y-3">
                  {waitingQueue.map((p, i) => (
                    <div key={p.queueId} className={`p-4 rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-blue-50 hover:bg-blue-100'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`font-bold text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{p.queueNumber}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>{p.patientName}</div>
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
            <div className={`border-b px-8 py-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
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
                          ? (theme === 'dark' ? 'bg-gray-900 text-blue-400 border-t-4 border-blue-500' : 'bg-white text-blue-600 border-t-4 border-blue-600 shadow-sm')
                          : (theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-600 hover:bg-blue-50')
                      }`}
                    >
                      <Icon size={22} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50/50 to-white'}`}>
              <div className="max-w-5xl mx-auto">
                {activeTab === 'examination' && (
                  <div className="space-y-10">
                    <div>
                      <label className={`block text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Chẩn đoán <span className="text-red-500">*</span></label>
                      <textarea
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                        className={`w-full h-40 p-5 border rounded-xl focus:ring-4 resize-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50' : 'bg-white border-blue-200 focus:ring-blue-100'}`}
                        placeholder="Nhập chẩn đoán chi tiết..."
                      />
                    </div>

                    <div>
                      <label className={`block text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ghi chú điều trị</label>
                      <textarea
                        value={treatmentNotes}
                        onChange={e => setTreatmentNotes(e.target.value)}
                        className={`w-full h-32 p-5 border rounded-xl focus:ring-4 resize-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50' : 'bg-white border-blue-200 focus:ring-blue-100'}`}
                        placeholder="Ghi chú về quá trình điều trị, theo dõi..."
                      />
                    </div>

                    <div className={`border-t pt-8 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <Pill size={28} /> Kê đơn thuốc
                      </h3>

                      <div className="space-y-4">
                        <div className={`grid grid-cols-12 gap-4 font-semibold text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                          <div className="col-span-1 text-center">STT</div>
                          <div className="col-span-5">TÊN THUỐC <span className="text-red-500">*</span></div>
                          <div className="col-span-5">HƯỚNG DẪN SỬ DỤNG <span className="text-red-500">*</span></div>
                          <div className="col-span-1 text-center">THAO TÁC</div>
                        </div>

                        {prescriptionItems.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4 items-start">
                            <div className={`col-span-1 flex items-center justify-center pt-3 font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {index + 1}
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                placeholder="VD: Paracetamol 500mg (10 viên)"
                                value={item.drugName}
                                onChange={(e) => updatePrescriptionItem(index, 'drugName', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500' : 'bg-white border-blue-200 focus:ring-blue-400'}`}
                              />
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                placeholder="VD: Uống 1 viên/lần, 3 lần/ngày sau ăn"
                                value={item.instructions}
                                onChange={(e) => updatePrescriptionItem(index, 'instructions', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500' : 'bg-white border-blue-200 focus:ring-blue-400'}`}
                              />
                            </div>
                            <div className="col-span-1 flex items-center justify-center pt-2">
                              <button
                                onClick={() => removePrescriptionItem(index)}
                                className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:text-red-700 hover:bg-red-50'}`}
                                title="Xóa thuốc"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={addPrescriptionItem}
                          className={`w-full py-3 border-2 border-dashed rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-blue-800 text-blue-400 hover:bg-blue-900/30 hover:border-blue-600' : 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-500'}`}
                        >
                          <Plus size={20} />
                          Thêm thuốc mới
                        </button>
                      </div>

                      {prescriptionItems.some(item => item.drugName.trim() && item.instructions.trim()) && (
                        <div className={`mt-6 p-6 rounded-xl border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200'}`}>
                          <h4 className={`font-bold mb-4 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Đơn thuốc hiện tại:</h4>
                          <div className="space-y-3">
                            {prescriptionItems
                              .filter(item => item.drugName.trim() && item.instructions.trim())
                              .map((item, index) => (
                                <div key={index} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                  <div className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                    {index + 1}. {item.drugName}
                                  </div>
                                  <div className={`text-sm italic ml-4 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                                    {item.instructions}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={`flex justify-center pt-8 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
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
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50' : 'bg-white border-blue-200 focus:ring-blue-100'}`}
                      />
                    </div>

                    {selectedServices.length > 0 && (
                      <div className={`p-6 rounded-xl border mb-6 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200'}`}>
                        <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <CheckIcon className="text-blue-600" size={20} />
                          Dịch vụ đã chọn ({selectedServices.length})
                        </h3>
                        <div className="space-y-3">
                          {selectedServices.map((s, i) => (
                            <div key={i} className={`flex justify-between items-center p-4 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                              <div>
                                <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{s.name}</div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>Số lượng: {s.quantity}</div>
                              </div>
                              <div className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                {formatPrice(s.price * s.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-4 pt-4 border-t text-right ${theme === 'dark' ? 'border-blue-800' : 'border-blue-200'}`}>
                          <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                            Tổng: {formatPrice(totalAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={`max-h-96 overflow-y-auto border rounded-xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'}`}>
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
                              className={`p-5 cursor-pointer border-b last:border-0 transition-all ${
                                selected 
                                  ? (theme === 'dark' ? 'bg-blue-900/30 border-l-4 border-l-blue-500 border-b-gray-700' : 'bg-blue-50 border-l-4 border-l-blue-600 border-b-blue-100')
                                  : (theme === 'dark' ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-blue-50 border-blue-100')
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{svc.name}</div>
                                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>{formatPrice(svc.price)}</div>
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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-sky-50'}`}>
      <Toaster position="top-right" />

      <div className={`shadow-sm border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>Phòng khám của tôi</h1>
          <p className={`text-xl mt-2 font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
            {waitingQueue.length} bệnh nhân đang chờ khám
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {waitingQueue.length === 0 ? (
          <div className={`text-center py-32 backdrop-blur-sm rounded-2xl shadow-lg border ${theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-blue-100'}`}>
            <div className={`text-8xl mb-6 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>Smile</div>
            <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              Hiện chưa có bệnh nhân nào
            </h2>
            <p className={`text-lg mt-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Hệ thống đang chờ bệnh nhân tiếp theo...</p>
          </div>
        ) : (
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 py-5">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Clock className="w-6 h-6" />
                Hàng chờ khám bệnh
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                  <tr>
                    <th className="px-6 py-4 text-left">STT</th>
                    <th className="px-6 py-4 text-left">Họ và tên</th>
                    <th className="px-6 py-4 text-center">Giới tính</th>
                    <th className="px-6 py-4 text-center">Tuổi</th>
                    <th className="px-6 py-4 text-center">Giờ vào</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-blue-100'}`}>
                  {waitingQueue.map((patient, index) => {
                    const isNextPatient = index === 0;

                    return (
                      <tr
                        key={patient.queueId}
                        className={`transition-all duration-200 ${
                          isNextPatient
                            ? (theme === 'dark' ? 'bg-blue-900/20 border-l-4 border-blue-500' : 'bg-blue-50/70 border-l-4 border-blue-600 font-medium')
                            : (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50/30')
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-2xl ${isNextPatient ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'}`}>
                              {patient.queueNumber}
                            </span>
                            {isNextPatient && (
                              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                                Tiếp theo
                              </span>
                            )}
                          </div>
                        </td>

                        <td className={`px-6 py-5 font-medium text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {patient.patientName}
                        </td>

                        <td className={`px-6 py-5 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {patient.gender === 'Male' || patient.gender === 'Nam' ? 'Nam' : 'Nữ'}
                        </td>

                        <td className={`px-6 py-5 text-center font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          {calculateAge(patient.dob)}
                        </td>

                        <td className={`px-6 py-5 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
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