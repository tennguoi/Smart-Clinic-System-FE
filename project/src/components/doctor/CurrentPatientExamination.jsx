import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FileText, Stethoscope, Sparkles } from 'lucide-react';

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

export default function CurrentPatientExamination() {
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

  // Load data
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
          checkInTime: formatTime(patientRes.checkInTime || patientRes.startTime),
          patientId: patientRes.patientId,
          queueId: patientRes.queueId || patientRes.id
        };
        setCurrentPatient(patient);

        const summaryRes = await getExaminationSummary();
        setSummary(summaryRes);

        setDiagnosis(summaryRes?.diagnosis || '');
        setTreatmentNotes(summaryRes?.treatmentNotes || '');

        if (summaryRes?.serviceItems) {
          setSelectedServices(summaryRes.serviceItems.map(item => ({
            id: item.serviceId,
            name: item.serviceName,
            price: item.unitPrice,
            quantity: item.quantity || 1
          })));
        }

        if (summaryRes?.prescription?.drugs) {
          const drugs = summaryRes.prescription.drugs.split('\n').filter(Boolean);
          const insts = (summaryRes.prescription.instructions || '').split('\n');
          const items = drugs.map((d, i) => ({
            drugName: d.trim(),
            instructions: (insts[i] || '').trim()
          }));
          setPrescriptionItems(items.length > 0 ? items : [{ drugName: '', instructions: '' }]);
        }
      } else {
        setCurrentPatient(null);
        setSummary(null);
        setDiagnosis('');
        setTreatmentNotes('');
        setPrescriptionItems([{ drugName: '', instructions: '' }]);
        setSelectedServices([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load services
  useEffect(() => {
    if (currentPatient && services.length === 0) {
      const fetchServices = async () => {
        setLoadingServices(true);
        try {
          const { data } = await axiosInstance.get('/api/public/services?page=0&size=500');
          setServices((data.content || []).map(s => ({
            id: s.serviceId,
            name: s.name,
            price: s.price
          })));
        } catch {
          toast.error('Không tải được dịch vụ');
        } finally {
          setLoadingServices(false);
        }
      };
      fetchServices();
    }
  }, [currentPatient, services.length]);

  // Polling
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handlers
  const toggleService = async (service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
      toast.success(`Đã bỏ chọn: ${service.name}`);
      const updated = await getExaminationSummary();
      setSummary(updated);
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
        toast.success(`Đã thêm: ${service.name}`);
      } catch {
        toast.error('Lỗi thêm dịch vụ');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleComplete = async () => {
    if (!diagnosis.trim()) return toast.error('Vui lòng nhập chẩn đoán');

    const valid = prescriptionItems.filter(i => i.drugName.trim() || i.instructions.trim());
    for (const i of valid) {
      if (i.drugName.trim() && !i.instructions.trim()) return toast.error('Thiếu hướng dẫn');
      if (!i.drugName.trim() && i.instructions.trim()) return toast.error('Thiếu tên thuốc');
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
      toast.success('Hoàn thành khám thành công!');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallNext = async () => {
    setIsLoading(true);
    try {
      await callNextPatient();
      toast.success('Đã gọi bệnh nhân tiếp theo');
      loadData();
    } catch {
      toast.error('Không còn bệnh nhân');
    } finally {
      setIsLoading(false);
    }
  };

  // Prescription handlers
  const addPrescriptionItem = () => {
    setPrescriptionItems([...prescriptionItems, { drugName: '', instructions: '' }]);
  };
  
  const removePrescriptionItem = (i) => {
    setPrescriptionItems(p => 
      p.length === 1 
        ? [{ drugName: '', instructions: '' }] 
        : p.filter((_, idx) => idx !== i)
    );
  };
  
  const updatePrescriptionItem = (idx, field, val) => {
    setPrescriptionItems(p => {
      const n = [...p];
      n[idx][field] = val;
      return n;
    });
  };

  // Nếu có bệnh nhân đang khám
  if (currentPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50">
        <Toaster position="top-right" />
        <div className="flex flex-col lg:flex-row h-screen">

          {/* Sidebar bệnh nhân */}
          <PatientSidebar 
            currentPatient={currentPatient} 
            waitingQueue={waitingQueue}
            aiAssistantOpen={aiAssistantOpen}
          />

          {/* Nội dung chính + AI panel */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Form khám */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header với tabs */}
              <div className="bg-white border-b border-blue-100 shadow-sm px-4 lg:px-8 py-3 lg:py-4">
                <div className={`flex gap-2 ${aiAssistantOpen ? 'flex-col' : 'overflow-x-auto'}`}>
                  {/* Tabs */}
                  <div className={`flex gap-2 ${aiAssistantOpen ? 'flex-col' : ''}`}>
                    {[
                      { id: 'examination', label: 'Khám & Kê đơn', icon: FileText },
                      { id: 'services', label: 'Chỉ định dịch vụ', icon: Stethoscope },
                    ].map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setActiveTab(t.id)}
                          className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-3 font-semibold rounded-lg transition-all text-sm lg:text-base whitespace-nowrap ${
                            activeTab === t.id
                              ? 'bg-blue-50 text-blue-600 border-2 border-blue-600'
                              : 'text-slate-600 hover:bg-blue-50'
                          } ${aiAssistantOpen ? 'w-full justify-start' : ''}`}
                        >
                          <Icon size={18} className="lg:w-5 lg:h-5" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  {aiAssistantOpen ? (
                    <div className="h-px bg-gray-300 my-2"></div>
                  ) : (
                    <div className="w-px bg-gray-300 mx-2"></div>
                  )}

                  {/* Button AI */}
                  <button
                    onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
                    className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg font-semibold transition-all shadow-md text-sm lg:text-base whitespace-nowrap ${
                      aiAssistantOpen
                        ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white w-full justify-start'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>
                      {aiAssistantOpen ? 'Đang bật AI' : 'Bật AI Trợ lý'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Nội dung form */}
              <div className={`flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/50 to-white ${
                aiAssistantOpen ? 'p-3 lg:p-4' : 'p-4 lg:p-8'
              }`}>
                <div className={aiAssistantOpen ? 'max-w-2xl mx-auto' : 'max-w-5xl mx-auto'}>
                  {activeTab === 'examination' && (
                    <ExaminationForm
                      diagnosis={diagnosis}
                      treatmentNotes={treatmentNotes}
                      prescriptionItems={prescriptionItems}
                      onDiagnosisChange={setDiagnosis}
                      onTreatmentNotesChange={setTreatmentNotes}
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

            {/* AI Panel */}
            <ResizablePanel isOpen={aiAssistantOpen}>
              <AIAssistantPanel />
            </ResizablePanel>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình chờ bệnh nhân
  return (
    <WaitingQueueScreen
      waitingQueue={waitingQueue}
      onCallNext={handleCallNext}
      isLoading={isLoading}
    />
  );
}