import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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
} from '../../api/examinationApi';

import medicalRecordApi from '../../api/medicalRecordApi';
import axiosInstance from '../../utils/axiosConfig';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
const calculateAge = (dob) => {
  if (!dob) return '--';
  try {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  } catch { return '--'; }
};
const formatTime = (date) => {
  if (!date) return '--';
  try {
    return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch { return '--'; }
};

export default function CurrentPatientExamination() {
  const { t } = useTranslation();

  const [currentPatient, setCurrentPatient] = useState(null);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [summary, setSummary] = useState(null);
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
      const [queueRes, patientRes] = await Promise.all([getWaitingQueue(), getCurrentPatient()]);
      setWaitingQueue(queueRes || []);

      if (patientRes && patientRes.queueId) {
        const patient = {
          queueId: patientRes.queueId,
          patientId: patientRes.patientId || patientRes.patient?.id,
          queueNumber: patientRes.queueNumber || 'N/A',
          fullName: patientRes.patientName || patientRes.fullName || 'Không rõ',
          gender: ['Male', 'Nam'].includes(patientRes.gender) ? 'Nam' : 'Nữ',
          age: calculateAge(patientRes.dob || patientRes.patient?.dob),
          checkInTime: formatTime(patientRes.checkInTime || patientRes.startTime),
          notes: patientRes.notes || patientRes.patient?.notes || ''
        };
        setCurrentPatient(patient);

        const summaryRes = await getExaminationSummary();
        setSummary(summaryRes);

        if (summaryRes?.diagnosis) setDiagnosis(summaryRes.diagnosis);
        if (summaryRes?.treatmentNotes) setTreatmentNotes(summaryRes.treatmentNotes);

        if (summaryRes?.serviceItems?.length) {
          setSelectedServices(summaryRes.serviceItems.map(item => ({
            id: item.serviceId,
            name: item.serviceName,
            price: item.unitPrice,
            quantity: item.quantity || 1
          })));
        }

        if (summaryRes?.prescription?.drugs && summaryRes.prescription?.instructions) {
          const drugs = summaryRes.prescription.drugs.split('\n').filter(Boolean);
          const insts = summaryRes.prescription.instructions.split('\n').filter(Boolean);
          const items = drugs.map((d, i) => ({ drugName: d.trim(), instructions: (insts[i] || '').trim() }));
          setPrescriptionItems(items.length ? items : [{ drugName: '', instructions: '' }]);
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
            price: s.price || 0
          })));
        } catch { toast.error('Không tải được dịch vụ'); }
        setLoadingServices(false);
      };
      fetch();
    }
  }, [currentPatient, services.length]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleService = async (service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
      toast.success(`${t('doctorExamination.serviceRemoved')} ${service.name}`);
    } else {
      if (!currentPatient?.queueId) return toast.error('Không có bệnh nhân');
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
        toast.success(`${t('doctorExamination.serviceAdded')} ${service.name}`);
      } catch { toast.error('Lỗi thêm dịch vụ'); }
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!diagnosis.trim()) return toast.error(t('doctorExamination.diagnosisRequired'));

    const filled = prescriptionItems.filter(i => i.drugName.trim() || i.instructions.trim());
    for (const item of filled) {
      if (item.drugName.trim() && !item.instructions.trim())
        return toast.error(t('doctorExamination.drugInstructionsRequired'));
      if (!item.drugName.trim() && item.instructions.trim())
        return toast.error(t('doctorExamination.drugNameRequired'));
    }

    setIsLoading(true);
    try {
      const recordId = summary?.recordId;
      if (!recordId) throw new Error();

      await medicalRecordApi.update(recordId, {
        patientId: currentPatient.patientId,
        patientName: currentPatient.fullName,
        diagnosis: diagnosis.trim(),
        treatmentNotes: treatmentNotes.trim()
      });

      if (filled.length) {
        await medicalRecordApi.addPrescription({
          recordId,
          drugs: filled.map(i => i.drugName.trim()).join('\n'),
          instructions: filled.map(i => i.instructions.trim()).join('\n')
        });
      }

      if (selectedServices.length) {
        const inv = await axiosInstance.post('/api/doctor/create-invoice');
        toast.success(t('doctorExamination.invoiceCreated', { code: inv.data.invoiceCode }));
      }

      await completeExamination();
      toast.success(t('doctorExamination.completeSuccess'));
      await loadData();
    } catch { toast.error('Lỗi hoàn thành khám'); }
    setIsLoading(false);
  };

  const handleCallNext = async () => {
    setIsLoading(true);
    try {
      await callNextPatient();
      toast.success(t('doctorExamination.callNextSuccess'));
      await loadData();
    } catch { toast.error(t('doctorExamination.noMorePatients')); }
    setIsLoading(false);
  };

  const addDrug = () => setPrescriptionItems([...prescriptionItems, { drugName: '', instructions: '' }]);
  const removeDrug = (i) => setPrescriptionItems(prescriptionItems.length === 1 ? [{ drugName: '', instructions: '' }] : prescriptionItems.filter((_, idx) => idx !== i));
  const updateDrug = (i, field, value) => {
    const updated = [...prescriptionItems];
    updated[i][field] = value;
    setPrescriptionItems(updated);
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price * (s.quantity || 1), 0);

  // ==================== KHI ĐANG KHÁM ====================
  if (currentPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50">
        <Toaster position="top-right" />
        <div className="flex h-screen">
          {/* Sidebar trái */}
          <div className="w-96 bg-white shadow-xl border-r border-blue-100 flex flex-col">
            <div className="p-8 border-b border-blue-100 text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-blue-600" />
              </div>
              <div className="text-5xl font-bold text-blue-600 mb-2">{currentPatient.queueNumber}</div>
              <h2 className="text-2xl font-bold text-slate-800">{currentPatient.fullName}</h2>
              <div className="mt-4 space-y-2 text-slate-600">
                <div><Calendar className="inline w-5 h-5 mr-2" />{currentPatient.gender} • {currentPatient.age} tuổi</div>
                <div><Clock className="inline w-5 h-5 mr-2" />{t('doctorExamination.checkInTime')}: {currentPatient.checkInTime}</div>
              </div>

              <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-200 p-2.5 rounded-xl"><FileText className="w-7 h-7 text-amber-800" /></div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-lg mb-2">{t('doctorExamination.symptomsTitle')}</h3>
                    <div className="bg-white p-4 rounded-xl border border-amber-200 min-h-28 text-slate-800 whitespace-pre-wrap">
                      {currentPatient.notes?.trim() || <span className="text-slate-400 italic">{t('doctorExamination.noSymptoms')}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-bold text-xl text-slate-700 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                {t('doctorExamination.waitingQueueTitle')} ({waitingQueue.length})
              </h3>
              {waitingQueue.length === 0 ? (
                <p className="text-center text-slate-500 py-8">{t('doctorExamination.noPatientsInQueue')}</p>
              ) : (
                <div className="space-y-3">
                  {waitingQueue.map((p, i) => (
                    <div key={p.queueId} className="bg-blue-50 p-4 rounded-xl hover:bg-blue-100 transition">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-lg text-blue-600">{p.queueNumber}</div>
                          <div className="text-sm text-slate-700">{p.patientName}</div>
                        </div>
                        {i === 0 && <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{t('doctorExamination.nextPatientBadge')}</span>}
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
                {[{ id: 'examination', label: t('doctorExamination.tabExamination'), icon: FileText },
                  { id: 'services', label: t('doctorExamination.tabServices'), icon: Stethoscope }].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-8 py-4 font-semibold rounded-t-xl transition ${activeTab === tab.id ? 'bg-white text-blue-600 border-t-4 border-blue-600 shadow-sm' : 'text-slate-600 hover:bg-blue-50'}`}
                  >
                    <tab.icon size={22} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-blue-50/50 to-white">
              <div className="max-w-5xl mx-auto">
                {/* Tab khám */}
                {activeTab === 'examination' && (
                  <div className="space-y-10">
                    <div>
                      <label className="block text-lg font-bold mb-3">{t('doctorExamination.diagnosisLabel')} <span className="text-red-500">*</span></label>
                      <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full h-40 p-5 border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 resize-none" placeholder="Nhập chẩn đoán..." />
                    </div>

                    <div>
                      <label className="block text-lg font-bold mb-3">{t('doctorExamination.treatmentNotesLabel')}</label>
                      <textarea value={treatmentNotes} onChange={e => setTreatmentNotes(e.target.value)} className="w-full h-32 p-5 border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 resize-none" placeholder="Ghi chú điều trị..." />
                    </div>

                    <div className="border-t pt-8">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Pill size={28} /> {t('doctorExamination.prescriptionTitle')}</h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-slate-600">
                          <div className="col-span-1 text-center">STT</div>
                          <div className="col-span-5">{t('doctorExamination.drugName')} *</div>
                          <div className="col-span-5">{t('doctorExamination.instructions')} *</div>
                          <div className="col-span-1"></div>
                        </div>

                        {prescriptionItems.map((item, i) => (
                          <div key={i} className="grid grid-cols-12 gap-4 items-start">
                            <div className="col-span-1 flex justify-center pt-3 font-semibold">{i + 1}</div>
                            <div className="col-span-5"><input type="text" placeholder={t('doctorExamination.drugPlaceholder')} value={item.drugName} onChange={e => updateDrug(i, 'drugName', e.target.value)} className="w-full px-4 py-3 border border-blue-200 rounded-xl" /></div>
                            <div className="col-span-5"><input type="text" placeholder={t('doctorExamination.instructionsPlaceholder')} value={item.instructions} onChange={e => updateDrug(i, 'instructions', e.target.value)} className="w-full px-4 py-3 border border-blue-200 rounded-xl" /></div>
                            <div className="col-span-1 flex justify-center pt-2"><button onClick={() => removeDrug(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><X size={20} /></button></div>
                          </div>
                        ))}

                        <button onClick={addDrug} className="w-full py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 font-semibold hover:bg-blue-50 flex items-center justify-center gap-2">
                          <Plus size={20} /> {t('doctorExamination.addDrug')}
                        </button>
                      </div>

                      {prescriptionItems.some(p => p.drugName.trim() && p.instructions.trim()) && (
                        <div className="mt-6 bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200">
                          <h4 className="font-bold mb-4 text-lg">{t('doctorExamination.prescriptionPreviewTitle')}</h4>
                          {prescriptionItems.filter(p => p.drugName.trim()).map((p, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg mb-3"><strong>{p.drugName}</strong>: {p.instructions}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center pt-8 border-t">
                      <button onClick={handleComplete} disabled={isLoading || !diagnosis.trim()} className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-12 py-4 rounded-2xl text-xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 flex items-center gap-4">
                        {isLoading ? <Loader2 className="animate-spin" size={28} /> : <CheckCircle size={28} />}
                        {isLoading ? t('doctorExamination.processing') : t('doctorExamination.completeButton')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab dịch vụ */}
                {activeTab === 'services' && (
                  <div className="space-y-8">
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('doctorExamination.searchServicePlaceholder')} className="w-full pl-12 pr-4 py-3.5 border border-blue-200 rounded-xl" />
                    </div>

                    {selectedServices.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-200">
                        <h3 className="font-bold text-lg mb-4">{t('doctorExamination.selectedServicesTitle')} ({selectedServices.length})</h3>
                        {selectedServices.map((s, i) => (
                          <div key={i} className="flex justify-between items-center bg-white p-4 rounded-lg mb-3">
                            <div><div className="font-semibold">{s.name}</div><div className="text-sm text-slate-600">SL: {s.quantity}</div></div>
                            <div className="text-lg font-bold text-blue-600">{formatPrice(s.price * (s.quantity || 1))}</div>
                          </div>
                        ))}
                        <div className="pt-4 border-t text-right text-2xl font-bold text-blue-700">
                          {t('doctorExamination.totalAmount')} {formatPrice(totalAmount)}
                        </div>
                      </div>
                    )}

                    <div className="max-h-96 overflow-y-auto border border-blue-200 rounded-xl bg-white">
                      {loadingServices ? <div className="p-16 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto" /></div> : filteredServices.map(svc => {
                        const selected = selectedServices.some(s => s.id === svc.id);
                        return (
                          <div key={svc.id} onClick={() => toggleService(svc)} className={`p-5 cursor-pointer hover:bg-blue-50 border-b last:border-0 ${selected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
                            <div className="flex justify-between items-center">
                              <div><div className="font-semibold">{svc.name}</div><div className="text-sm text-slate-600">{formatPrice(svc.price)}</div></div>
                              {selected && <CheckIcon className="w-7 h-7 text-blue-600" />}
                            </div>
                          </div>
                        );
                      })}
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

  // ==================== MÀN HÌNH CHỜ ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50">
      <Toaster position="top-right" />
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900">{t('doctorExamination.noPatientTitle')}</h1>
          <p className="text-xl text-blue-600 mt-2">{t('doctorExamination.patientsWaiting', { count: waitingQueue.length })}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {waitingQueue.length === 0 ? (
          <div className="text-center py-32 bg-white/90 rounded-2xl shadow-lg border border-blue-100">
            <div className="text-8xl mb-6">Smile</div>
            <h2 className="text-2xl font-semibold text-blue-800">{t('doctorExamination.noPatientsToday')}</h2>
            <p className="text-lg text-blue-600 mt-3">{t('doctorExamination.waitingForNext')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 py-5">
              <h2 className="text-xl font-bold flex items-center gap-3"><Clock className="w-6 h-6" /> {t('doctorExamination.queueTitle')}</h2>
            </div>
            <table className="w-full">
              <thead className="bg-blue-50 text-blue-800 text-sm font-semibold uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">{t('doctorExamination.queueNumber')}</th>
                  <th className="px-6 py-4 text-left">Họ tên</th>
                  <th className="px-6 py-4 text-center">Giới tính</th>
                  <th className="px-6 py-4 text-center">Tuổi</th>
                  <th className="px-6 py-4 text-center">Giờ vào</th>
                  <th className="px-6 py-4 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {waitingQueue.map((p, i) => {
                  const isNext = i === 0;
                  return (
                    <tr key={p.queueId} className={isNext ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-blue-50/30'}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-2xl text-blue-700">{p.queueNumber}</span>
                          {isNext && <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{t('doctorExamination.nextPatientBadge')}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-lg font-medium">{p.patientName}</td>
                      <td className="px-6 py-5 text-center">{p.gender === 'Male' || p.gender === 'Nam' ? 'Nam' : 'Nữ'}</td>
                      <td className="px-6 py-5 text-center font-semibold">{calculateAge(p.dob)}</td>
                      <td className="px-6 py-5 text-center">{formatTime(p.checkInTime)}</td>
                      <td className="px-6 py-5 text-center">
                        {isNext && (
                          <button onClick={handleCallNext} disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:opacity-70 text-white font-bold px-6 py-3 rounded-lg shadow-md flex items-center gap-2 mx-auto">
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <PhoneCall size={18} />}
                            {isLoading ? t('doctorExamination.calling') : t('doctorExamination.callNextPatient')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}