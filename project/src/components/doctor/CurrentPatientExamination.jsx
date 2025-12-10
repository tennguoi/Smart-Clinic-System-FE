
// CurrentPatientExamination.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FileText, Stethoscope, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import components
import AIAssistantPanel from './AIAssistantPanel';
import ResizablePanel from './ResizablePanel';
import PatientSidebar from './PatientSidebar';
import ExaminationForm from './ExaminationForm';
import ServiceSelection from './ServiceSelection';
import WaitingQueueScreen from './WaitingQueueScreen';

// Import API
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

// Import helpers
import { calculateAge, formatTime } from '../../utils/helpers';

// Import toast config
import { toastConfig } from '../../config/toastConfig';

// ✅ Theme
import { useTheme } from '../../contexts/ThemeContext';

export default function CurrentPatientExamination() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // States
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
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
  const [prescriptionItems, setPrescriptionItems] = useState([
    { drugName: '', instructions: '' }
  ]);

  const [activeTab, setActiveTab] = useState('examination');

  // Track user modifications
  const userModifiedDiagnosis = useRef(false);
  const userModifiedTreatmentNotes = useRef(false);
  const userModifiedPrescription = useRef(false);
  const currentPatientId = useRef(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [waitingRes, patientRes] = await Promise.all([
        getWaitingQueue(),
        getCurrentPatient()
      ]);
      setWaitingQueue(waitingRes ?? []);

      if (patientRes) {
        const patient = {
          ...patientRes,
          notes: patientRes.notes ?? patientRes.patient?.notes ?? '',
          fullName: patientRes.patientName ?? patientRes.fullName,
          queueNumber: patientRes.queueNumber,
          gender: patientRes.gender === 'Male' || patientRes.gender === 'Nam' ? 'Nam' : 'Nữ',
          age: calculateAge(patientRes.dob),
          checkInTime: formatTime(patientRes.checkInTime ?? patientRes.startTime),
          patientId: patientRes.patientId,
          queueId: patientRes.queueId ?? patientRes.id
        };

        const isNewPatient = currentPatientId.current !== patient.patientId;
        if (isNewPatient) {
          currentPatientId.current = patient.patientId;
          userModifiedDiagnosis.current = false;
          userModifiedTreatmentNotes.current = false;
          userModifiedPrescription.current = false;
        }

        setCurrentPatient(patient);

        const summaryRes = await getExaminationSummary();
        setSummary(summaryRes);

        if (!userModifiedDiagnosis.current || isNewPatient) {
          setDiagnosis(summaryRes?.diagnosis ?? '');
        }
        if (!userModifiedTreatmentNotes.current || isNewPatient) {
          setTreatmentNotes(summaryRes?.treatmentNotes ?? '');
        }

        if (summaryRes?.serviceItems) {
          setSelectedServices(
            summaryRes.serviceItems.map(item => ({
              id: item.serviceId,
              name: item.serviceName,
              price: item.unitPrice,
              quantity: item.quantity ?? 1
            }))
          );
        }

        if (!userModifiedPrescription.current || isNewPatient) {
          if (summaryRes?.prescription?.drugs) {
            const drugs = summaryRes.prescription.drugs.split('\n').filter(Boolean);
            const insts = (summaryRes.prescription.instructions ?? '').split('\n');
            const items = drugs.map((d, i) => ({
              drugName: d.trim(),
              instructions: (insts[i] ?? '').trim()
            }));
            setPrescriptionItems(items.length > 0 ? items : [{ drugName: '', instructions: '' }]);
          } else {
            setPrescriptionItems([{ drugName: '', instructions: '' }]);
          }
        }
      } else {
        currentPatientId.current = null;
        userModifiedDiagnosis.current = false;
        userModifiedTreatmentNotes.current = false;
        userModifiedPrescription.current = false;

        setCurrentPatient(null);
        setSummary(null);
        setDiagnosis('');
        setTreatmentNotes('');
        setPrescriptionItems([{ drugName: '', instructions: '' }]);
        setSelectedServices([]);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('common.loadError') ?? 'Lỗi tải dữ liệu', toastConfig.toastOptions.error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Load services
  useEffect(() => {
    if (currentPatient && services.length === 0) {
      const fetchServices = async () => {
        setLoadingServices(true);
        try {
          const { data } = await axiosInstance.get('/api/public/services?page=0&size=500');
          setServices((data.content ?? []).map(s => ({
            id: s.serviceId,
            name: s.name,
            price: s.price
          })));
        } catch {
          toast.error(
            t('appointmentManagement.loadServicesError') ?? 'Không tải được dịch vụ',
            toastConfig.toastOptions.error
          );
        } finally {
          setLoadingServices(false);
        }
      };
      fetchServices();
    }
  }, [currentPatient, services.length, t]);

  // Polling
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  // AI callback
  const handleApplyTreatmentPlanFromAI = (plan) => {
    if (plan.treatmentNotes && plan.treatmentNotes.trim()) {
      setTreatmentNotes(plan.treatmentNotes.trim());
      userModifiedTreatmentNotes.current = true;
    }
    if (plan.drugs && plan.drugs.length > 0) {
      setPrescriptionItems([{ drugName: '', instructions: '' }]);
      setTimeout(() => {
        plan.drugs.forEach((drug, index) => {
          if (index === 0) {
            setPrescriptionItems([{
              drugName: drug.drugName,
              instructions: drug.instructions
            }]);
          } else {
            setPrescriptionItems(prev => [...prev, {
              drugName: drug.drugName,
              instructions: drug.instructions
            }]);
          }
        });
        userModifiedPrescription.current = true;
      }, 100);
    }
    toast.success('✅ Đã áp dụng phác đồ từ AI vào form!', toastConfig.toastOptions.success);
  };

  // Handlers
  const toggleService = async (service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
      toast.success(
        `${t('doctorExamination.serviceRemoved')} ${service.name}`,
        toastConfig.toastOptions.success
      );
      const updated = await getExaminationSummary();
      setSummary(updated);
    } else {
      if (!currentPatient?.queueId) {
        return toast.error(
          t('doctorExamination.noMorePatients') ?? 'Không có bệnh nhân',
          toastConfig.toastOptions.error
        );
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
        toast.success(
          `${t('doctorExamination.serviceAdded')} ${service.name}`,
          toastConfig.toastOptions.success
        );
      } catch {
        toast.error(
          t('common.error') ?? 'Lỗi thêm dịch vụ',
          toastConfig.toastOptions.error
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleComplete = async () => {
    if (!diagnosis.trim()) {
      return toast.error(
        t('doctorExamination.diagnosisRequired') ?? 'Vui lòng nhập chẩn đoán',
        toastConfig.toastOptions.error
      );
    }

    const valid = prescriptionItems.filter(i => i.drugName.trim() || i.instructions.trim());
    for (const i of valid) {
      if (i.drugName.trim() && !i.instructions.trim()) {
        return toast.error(
          t('doctorExamination.drugInstructionsRequired') ?? 'Thiếu hướng dẫn',
          toastConfig.toastOptions.error
        );
      }
      if (!i.drugName.trim() && i.instructions.trim()) {
        return toast.error(
          t('doctorExamination.drugNameRequired') ?? 'Thiếu tên thuốc',
          toastConfig.toastOptions.error
        );
      }
    }

    setIsLoading(true);
    try {
      await medicalRecordApi.update(summary.recordId, {
        diagnosis: diagnosis.trim(),
        treatmentNotes: treatmentNotes.trim(),
        patientId: currentPatient.patientId,
        patientName: currentPatient.fullName
      });

      if (valid.length > 0) {
        await medicalRecordApi.addPrescription({
          recordId: summary.recordId,
          drugs: valid.map(i => i.drugName.trim()).join('\n'),
          instructions: valid.map(i => i.instructions.trim()).join('\n')
        });
      }

      if (selectedServices.length > 0) {
        await axiosInstance.post('/api/doctor/create-invoice');
      }

      await completeExamination();
      toast.success(
        t('doctorExamination.completeSuccess') ?? 'Hoàn thành khám thành công!',
        toastConfig.toastOptions.success
      );

      userModifiedDiagnosis.current = false;
      userModifiedTreatmentNotes.current = false;
      userModifiedPrescription.current = false;

      loadData();
    } catch (e) {
      toast.error(
        e.response?.data?.message ?? t('common.error') ?? 'Lỗi',
        toastConfig.toastOptions.error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallNext = async () => {
    setIsLoading(true);
    try {
      await callNextPatient();
      loadData();
    } catch (e) {
      console.error(e);
      toast.error(
        t('doctorExamination.noMorePatients') ?? 'Không còn bệnh nhân',
        toastConfig.toastOptions.error
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Prescription handlers
  const addPrescriptionItem = () => {
    userModifiedPrescription.current = true;
    setPrescriptionItems([...prescriptionItems, { drugName: '', instructions: '' }]);
  };
  const removePrescriptionItem = (i) => {
    userModifiedPrescription.current = true;
    setPrescriptionItems(p =>
      p.length === 1
        ? [{ drugName: '', instructions: '' }]
        : p.filter((_, idx) => idx !== i)
    );
  };
  const updatePrescriptionItem = (idx, field, val) => {
    userModifiedPrescription.current = true;
    setPrescriptionItems(p => {
      const n = [...p];
      n[idx][field] = val;
      return n;
    });
  };
  const handleDiagnosisChange = (value) => {
    userModifiedDiagnosis.current = true;
    setDiagnosis(value);
  };
  const handleTreatmentNotesChange = (value) => {
    userModifiedTreatmentNotes.current = true;
    setTreatmentNotes(value);
  };

  // Render
  if (currentPatient) {
    return (
      <div
        className={`min-h-screen ${
          theme === 'dark'
            ? 'bg-gray-900'
            : 'bg-gradient-to-br from-blue-50 to-sky-50'
        }`}
      >
        <Toaster
          position={toastConfig.position}
          containerStyle={toastConfig.containerStyle}
          toastOptions={toastConfig.toastOptions}
        />
        <div className="flex flex-col lg:flex-row h-screen">
          <PatientSidebar
            currentPatient={currentPatient}
            waitingQueue={waitingQueue}
            aiAssistantOpen={aiAssistantOpen}
          />

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                className={`border-b shadow-sm px-4 lg:px-8 py-3 lg:py-4 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-blue-100'
                }`}
              >
                <div className={`flex gap-2 ${aiAssistantOpen ? 'flex-col' : 'overflow-x-auto'}`}>
                  <div className={`flex gap-2 ${aiAssistantOpen ? 'flex-col' : ''}`}>
                    {[
                      { id: 'examination', label: t('doctorExamination.tabExamination'), icon: FileText },
                      { id: 'services', label: t('doctorExamination.tabServices'), icon: Stethoscope },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-3 font-semibold rounded-lg transition-all text-sm lg:text-base whitespace-nowrap ${
                            isActive
                              ? (theme === 'dark'
                                  ? 'bg-gray-900 text-blue-400 border-2 border-blue-500'
                                  : 'bg-blue-50 text-blue-600 border-2 border-blue-600')
                              : (theme === 'dark'
                                  ? 'text-gray-400 hover:bg-gray-700'
                                  : 'text-slate-600 hover:bg-blue-50')
                          } ${aiAssistantOpen ? 'w-full justify-start' : ''}`}
                        >
                          <Icon size={18} className="lg:w-5 lg:h-5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {aiAssistantOpen ? (
                    <div className={`h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} my-2`} />
                  ) : (
                    <div className={`w-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} mx-2`} />
                  )}

                  <button
                    onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
                    className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg font-semibold transition-all shadow-md text-sm lg:text-base whitespace-nowrap ${
                      aiAssistantOpen
                        ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white w-full justify-start'
                        : (theme === 'dark'
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                    }`}
                  >
                    <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>
                      {aiAssistantOpen ? t('doctorExamination.aiAssistantOn') : t('doctorExamination.aiAssistantOff')}
                    </span>
                  </button>
                </div>
              </div>

              <div
                className={`flex-1 overflow-y-auto ${
                  aiAssistantOpen ? 'p-3 lg:p-4' : 'p-4 lg:p-8'
                } ${
                  theme === 'dark'
                    ? 'bg-gray-900'
                    : 'bg-gradient-to-b from-blue-50/50 to-white'
                }`}
              >
                <div className={aiAssistantOpen ? 'max-w-2xl mx-auto' : 'max-w-5xl mx-auto'}>
                  {activeTab === 'examination' && (
                    <ExaminationForm
                      diagnosis={diagnosis}
                      treatmentNotes={treatmentNotes}
                      prescriptionItems={prescriptionItems}
                      onDiagnosisChange={handleDiagnosisChange}
                      onTreatmentNotesChange={handleTreatmentNotesChange}
                      onAddPrescription={addPrescriptionItem}
                      onRemovePrescription={removePrescriptionItem}
                      onUpdatePrescription={updatePrescriptionItem}
                      onComplete={handleComplete}
                      isLoading={isLoading}
                      aiAssistantOpen={aiAssistantOpen}
                    />
                  )}

                  {activeTab === 'services' && (
                    <ServiceSelection
                      services={services}
                      selectedServices={selectedServices}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onToggleService={toggleService}
                      loadingServices={loadingServices}
                      aiAssistantOpen={aiAssistantOpen}
                    />
                  )}
                </div>
              </div>
            </div>

            <ResizablePanel isOpen={aiAssistantOpen}>
              <AIAssistantPanel onApplyTreatmentPlan={handleApplyTreatmentPlanFromAI} />
            </ResizablePanel>
          </div>
        </div>
      </div>
    );
  }

  // Waiting screen
  return (
    <WaitingQueueScreen
      waitingQueue={waitingQueue}
      onCallNext={handleCallNext}
      isLoading={isLoading}
    />
  );
}
