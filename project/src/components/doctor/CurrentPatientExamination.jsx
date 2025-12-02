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
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
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
          fullName: patientRes.patientName || patientRes.fullName || t('doctorExamination.unknownPatient'),
          gender: ['Male', 'Nam'].includes(patientRes.gender) ? t('common.male') : t('common.female'),
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
      toast.error(t('doctorExamination.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
        } catch { toast.error(t('doctorExamination.errors.loadServicesFailed')); }
        setLoadingServices(false);
      };
      fetch();
    }
  }, [currentPatient, services.length, t]);

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
      if (!currentPatient?.queueId) return toast.error(t('doctorExamination.errors.noPatient'));
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
      } catch { toast.error(t('doctorExamination.errors.addServiceFailed')); }
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
    } catch { toast.error(t('doctorExamination.errors.completeFailed')); }
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
                  <div><Calendar className="inline w-5 h-5 mr-2" />{currentPatient.gender} • {currentPatient.age} {t('common.years')}</div>
                  <div><Clock className="inline w-5 h-5 mr-2" />{t('doctorExamination.checkInTime')}: {currentPatient.checkInTime}</div>
                </div>

                <div className={`mt-6 p-5 border-2 rounded-2xl shadow-sm ${theme === 'dark' ? 'bg-amber-900/20 border-amber-800' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${theme === 'dark' ? 'bg-amber-900/50' : 'bg-amber-200'}`}>
                      <FileText className={`w-7 h-7 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-900'}`}>
                        {t('doctorExamination.symptomsTitle')}
                      </h3>
                      <div className={`p-4 rounded-xl border min-h-28 leading-relaxed whitespace-pre-wrap text-base text-left ${theme === 'dark' ? 'bg-gray-800 border-amber-800 text-gray-300' : 'bg-white border-amber-200 text-slate-800'}`}>
                        {currentPatient.notes?.trim() ? (
                          currentPatient.notes.trim()
                        ) : (
                          <span className="text-slate-400 italic">{t('doctorExamination.noSymptoms')}</span>
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
                {t('doctorExamination.waitingQueueTitle')} ({waitingQueue.length})
              </h3>
              {waitingQueue.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>{t('doctorExamination.noPatientsInQueue')}</p>
              ) : (
                <div className="space-y-3">
                  {waitingQueue.map((p, i) => (
                    <div key={p.queueId} className={`p-4 rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-blue-50 hover:bg-blue-100'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`font-bold text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{p.queueNumber}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>{p.patientName}</div>
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
            <div className={`border-b px-8 py-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
              <div className="flex gap-1">
                {[
                  { id: 'examination', label: t('doctorExamination.tabExamination'), icon: FileText },
                  { id: 'services', label: t('doctorExamination.tabServices'), icon: Stethoscope },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-8 py-4 font-semibold rounded-t-xl transition-all ${
                        activeTab === tab.id
                          ? (theme === 'dark' ? 'bg-gray-900 text-blue-400 border-t-4 border-blue-500' : 'bg-white text-blue-600 border-t-4 border-blue-600 shadow-sm')
                          : (theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-600 hover:bg-blue-50')
                      }`}
                    >
                      <Icon size={22} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50/50 to-white'}`}>
              <div className="max-w-5xl mx-auto">
                {/* Tab khám */}
                {activeTab === 'examination' && (
                  <div className="space-y-10">
                    <div>
                      <label className={`block text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('doctorExamination.diagnosisLabel')} <span className="text-red-500">*</span></label>
                      <textarea
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                        className={`w-full h-40 p-5 border rounded-xl focus:ring-4 resize-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50' : 'bg-white border-blue-200 focus:ring-blue-100'}`}
                        placeholder={t('doctorExamination.diagnosisPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className={`block text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('doctorExamination.treatmentNotesLabel')}</label>
                      <textarea
                        value={treatmentNotes}
                        onChange={e => setTreatmentNotes(e.target.value)}
                        className={`w-full h-32 p-5 border rounded-xl focus:ring-4 resize-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50' : 'bg-white border-blue-200 focus:ring-blue-100'}`}
                        placeholder={t('doctorExamination.treatmentNotesPlaceholder')}
                      />
                    </div>

                    <div className={`border-t pt-8 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <Pill size={28} /> {t('doctorExamination.prescriptionTitle')}
                      </h3>

                      <div className="space-y-4">
                        <div className={`grid grid-cols-12 gap-4 font-semibold text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                          <div className="col-span-1 text-center">STT</div>
                          <div className="col-span-5">{t('doctorExamination.drugName')} *</div>
                          <div className="col-span-5">{t('doctorExamination.instructions')} *</div>
                          <div className="col-span-1"></div>
                        </div>

                        {prescriptionItems.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4 items-start">
                            <div className={`col-span-1 flex items-center justify-center pt-3 font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {index + 1}
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                placeholder={t('doctorExamination.drugPlaceholder')}
                                value={item.drugName}
                                onChange={(e) => updateDrug(index, 'drugName', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500' : 'bg-white border-blue-200 focus:ring-blue-400'}`}
                              />
                            </div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                placeholder={t('doctorExamination.instructionsPlaceholder')}
                                value={item.instructions}
                                onChange={(e) => updateDrug(index, 'instructions', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500' : 'bg-white border-blue-200 focus:ring-blue-400'}`}
                              />
                            </div>
                            <div className="col-span-1 flex items-center justify-center pt-2">
                              <button
                                onClick={() => removeDrug(index)}
                                className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:text-red-700 hover:bg-red-50'}`}
                                title={t('common.delete')}
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={addDrug}
                          className={`w-full py-3 border-2 border-dashed rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-blue-800 text-blue-400 hover:bg-blue-900/30 hover:border-blue-600' : 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-500'}`}
                        >
                          <Plus size={20} />
                          {t('doctorExamination.addDrug')}
                        </button>
                      </div>

                      {prescriptionItems.some(item => item.drugName.trim() && item.instructions.trim()) && (
                        <div className={`mt-6 p-6 rounded-xl border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200'}`}>
                          <h4 className={`font-bold mb-4 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('doctorExamination.prescriptionPreviewTitle')}:</h4>
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
                            {t('doctorExamination.processing')}
                          </>
                        ) : (
                          <>
                            <CheckCircle size={28} />
                            {t('doctorExamination.completeButton')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab dịch vụ */}
                {activeTab === 'services' && (
                  <div className="space-y-8">
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t('doctorExamination.searchServicePlaceholder')}
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50' : 'bg-white border-blue-200 focus:ring-blue-100'}`}
                      />
                    </div>

                    {selectedServices.length > 0 && (
                      <div className={`p-6 rounded-xl border mb-6 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200'}`}>
                        <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <CheckIcon className="text-blue-600" size={20} />
                          {t('doctorExamination.selectedServicesTitle')} ({selectedServices.length})
                        </h3>
                        <div className="space-y-3">
                          {selectedServices.map((s, i) => (
                            <div key={i} className={`flex justify-between items-center p-4 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                              <div>
                                <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{s.name}</div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>{t('common.quantity')}: {s.quantity}</div>
                              </div>
                              <div className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                {formatPrice(s.price * s.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-4 pt-4 border-t text-right ${theme === 'dark' ? 'border-blue-800' : 'border-blue-200'}`}>
                          <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                            {t('doctorExamination.totalAmount')} {formatPrice(totalAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={`max-h-96 overflow-y-auto border rounded-xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'}`}>
                      {loadingServices ? (
                        <div className="p-16 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto" /></div>
                      ) : filteredServices.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">{t('doctorExamination.noServicesFound')}</div>
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

  // ==================== MÀN HÌNH CHỜ ====================
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-sky-50'}`}>
      <Toaster position="top-right" />

      <div className={`shadow-sm border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>{t('doctorExamination.noPatientTitle')}</h1>
          <p className={`text-xl mt-2 font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
            {t('doctorExamination.patientsWaiting', { count: waitingQueue.length })}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {waitingQueue.length === 0 ? (
          <div className={`text-center py-32 backdrop-blur-sm rounded-2xl shadow-lg border ${theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-blue-100'}`}>
            <div className={`text-8xl mb-6 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>Smile</div>
            <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              {t('doctorExamination.noPatientsToday')}
            </h2>
            <p className={`text-lg mt-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{t('doctorExamination.waitingForNext')}</p>
          </div>
        ) : (
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 py-5">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Clock className="w-6 h-6" />
                {t('doctorExamination.queueTitle')}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                  <tr>
                    <th className="px-6 py-4 text-left">{t('doctorExamination.queueNumber')}</th>
                    <th className="px-6 py-4 text-left">{t('doctorExamination.patientName')}</th>
                    <th className="px-6 py-4 text-center">{t('common.gender')}</th>
                    <th className="px-6 py-4 text-center">{t('common.age')}</th>
                    <th className="px-6 py-4 text-center">{t('doctorExamination.checkInTime')}</th>
                    <th className="px-6 py-4 text-center">{t('common.actions')}</th>
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
                            <span className={`font-bold text-2xl ${isNextPatient ? 'text-blue-600 dark:text-blue-400' : theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                              {patient.queueNumber}
                            </span>
                            {isNextPatient && (
                              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                                {t('doctorExamination.nextPatientBadge')}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className={`px-6 py-5 font-medium text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {patient.patientName}
                        </td>

                        <td className={`px-6 py-5 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {patient.gender === 'Male' || patient.gender === 'Nam' ? t('common.male') : t('common.female')}
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
                                  {t('doctorExamination.calling')}
                                </>
                              ) : (
                                <>
                                  <PhoneCall size={18} />
                                  {t('doctorExamination.callNextPatient')}
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