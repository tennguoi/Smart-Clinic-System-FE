// src/components/doctor/CurrentPatientExamination.jsx
import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  PhoneCall, User, Calendar, Shield, FileText, Pill, Stethoscope,
  Save, Printer, CheckCircle, Plus, Trash2, X, Search
} from 'lucide-react';

import {
  getMyQueue,
  getCurrentPatient,
  callPatient as callPatientApi,
  completeExamination,
} from '../../api/doctorApi';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { billingApi } from '../../api/billingApi'; // ĐÃ CÓ

// ================== CÁC COMPONENT NHỎ (GIỮ NGUYÊN ĐẸP) ==================
function PatientContextPanel({ currentPatient, medicalHistory = [] }) {
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b bg-gradient-to-br from-emerald-50 to-white">
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl font-bold text-emerald-600">{currentPatient.queueNumber}</span>
            {currentPatient.hasInsurance && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                <Shield size={14} /> BHYT
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">{currentPatient.name}</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><User size={16} /><span>{currentPatient.age} tuổi • {currentPatient.gender}</span></div>
            <div className="flex items-center gap-2"><Calendar size={16} /><span>Vào phòng: {currentPatient.checkInTime}</span></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">Lịch sử khám</h3>
        {medicalHistory.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có lịch sử</p>
        ) : (
          <div className="space-y-3">
            {medicalHistory.map((r, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4 border">
                <div className="text-xs text-slate-500">{r.date}</div>
                <p className="text-sm font-medium">{r.diagnosis}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DiagnosisTab({ medicalRecord, setMedicalRecord }) {
  const handleChange = (field, value) => setMedicalRecord(prev => ({ ...prev, [field]: value }));
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <label className="block text-sm font-semibold mb-2">Triệu chứng / Diễn tiến</label>
        <textarea
          value={medicalRecord.clinicalExam || ''}
          onChange={e => handleChange('clinicalExam', e.target.value)}
          className="w-full h-40 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          placeholder="Mô tả triệu chứng..."
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Chẩn đoán <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={medicalRecord.diagnosis || ''}
          onChange={e => handleChange('diagnosis', e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          placeholder="Nhập chẩn đoán bắt buộc"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Ghi chú điều trị</label>
        <textarea
          value={medicalRecord.treatmentNotes || ''}
          onChange={e => handleChange('treatmentNotes', e.target.value)}
          className="w-full h-32 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
        />
      </div>
    </div>
  );
}

function PrescriptionTab({ prescriptions, setPrescriptions }) {
  const add = () => setPrescriptions(prev => [...prev, { id: Date.now(), medication: '', quantity: '', instructions: '' }]);
  const remove = (id) => setPrescriptions(prev => prev.filter(p => p.id !== id));
  const update = (id, field, value) => setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Đơn thuốc</h3>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <Plus size={18} /> Thêm thuốc
        </button>
      </div>
      {prescriptions.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed">
          <Pill size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">Chưa kê thuốc</p>
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-slate-100"><tr><th className="text-left p-3">Tên thuốc</th><th className="text-left p-3">Số lượng</th><th className="text-left p-3">Hướng dẫn</th><th></th></tr></thead>
          <tbody>
            {prescriptions.map(p => (
              <tr key={p.id} className="border-b">
                <td className="p-3"><input value={p.medication} onChange={e => update(p.id, 'medication', e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Paracetamol..." /></td>
                <td className="p-3"><input value={p.quantity} onChange={e => update(p.id, 'quantity', e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="2 vỉ" /></td>
                <td className="p-3"><input value={p.instructions} onChange={e => update(p.id, 'instructions', e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Uống 1 viên/ngày..." /></td>
                <td className="text-center"><button onClick={() => remove(p.id)} className="text-red-600 p-2"><Trash2 size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ServicesTab({ services, setServices }) {
  const available = ["Khám bệnh", "Xét nghiệm máu", "Siêu âm", "Chụp X-quang", "Điện tâm đồ", "Nội soi"];
  const add = (s) => !services.includes(s) && setServices(prev => [...prev, s]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Chỉ định dịch vụ</h3>
      <div className="grid grid-cols-2 gap-3">
        {available.map(s => (
          <button key={s} onClick={() => add(s)} disabled={services.includes(s)}
            className={`p-4 text-left rounded-lg border ${services.includes(s) ? 'bg-emerald-100 border-emerald-500' : 'hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>
      <div>
        <h4 className="font-medium mb-3">Đã chọn ({services.length})</h4>
        {services.length === 0 ? <p className="text-slate-500 py-8 text-center">Chưa chọn dịch vụ</p> : (
          <div className="space-y-2">
            {services.map((s, i) => (
              <div key={i} className="flex justify-between items-center bg-emerald-50 px-4 py-3 rounded-lg">
                <span className="font-medium">{i + 1}. {s}</span>
                <button onClick={() => setServices(prev => prev.filter(x => x !== s))} className="text-red-600"><X size={18} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DiagnosticInputArea({ activeTab, setActiveTab, medicalRecord, setMedicalRecord, prescriptions, setPrescriptions, services, setServices }) {
  const tabs = [
    { id: 'diagnosis', label: 'Bệnh án', icon: FileText },
    { id: 'prescription', label: 'Đơn thuốc', icon: Pill },
    { id: 'services', label: 'Dịch vụ', icon: Stethoscope },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b">
        <div className="flex gap-1 px-6 pt-4">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium ${activeTab === t.id ? 'bg-white text-emerald-600 border-t-2 border-emerald-500' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon size={18} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'diagnosis' && <DiagnosisTab medicalRecord={medicalRecord} setMedicalRecord={setMedicalRecord} />}
        {activeTab === 'prescription' && <PrescriptionTab prescriptions={prescriptions} setPrescriptions={setPrescriptions} />}
        {activeTab === 'services' && <ServicesTab services={services} setServices={setServices} />}
      </div>
    </div>
  );
}

function ActionFooter({ onSave, onPrint, onComplete, hasRequiredData, isSaving, isPrinting }) {
  return (
    <footer className="bg-white border-t px-6 py-4 shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex gap-3">
          <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70">
            <Save size={18} /> {isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
          <button onClick={onPrint} disabled={isPrinting} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70">
            <Printer size={18} /> {isPrinting ? 'Đang in...' : 'In'}
          </button>
        </div>
        <button
          onClick={onComplete}
          disabled={!hasRequiredData}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
            hasRequiredData
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle size={20} /> Hoàn thành khám
        </button>
      </div>
    </footer>
  );
}

// ================== MAIN COMPONENT – HOÀN CHỈNH 100% ==================
export default function CurrentPatientExamination() {
  const [queue, setQueue] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('diagnosis');
  const [medicalRecord, setMedicalRecord] = useState({ clinicalExam: '', diagnosis: '', treatmentNotes: '' });
  const [prescriptions, setPrescriptions] = useState([]);
  const [services, setServices] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [recordId, setRecordId] = useState(null);

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      const [queueRes, currentRes] = await Promise.all([
        getMyQueue().catch(() => []),
        getCurrentPatient().catch(() => null)
      ]);

      const waiting = (queueRes || []).filter(p => p.status !== 'Completed');
      const patient = currentRes ? {
        queueId: currentRes.queueId,
        patientId: currentRes.patientId,
        queueNumber: currentRes.queueNumber,
        name: currentRes.fullName || currentRes.patientName,
        age: currentRes.age || '--',
        gender: currentRes.gender === 'Male' ? 'Nam' : 'Nữ',
        hasInsurance: !!currentRes.hasInsurance,
        checkInTime: new Date(currentRes.startTime || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      } : null;

      setQueue(waiting);
      setCurrentPatient(patient);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const handleCallPatient = async (p) => {
    if (currentPatient) return toast.error('Đang khám bệnh nhân khác!');
    try {
      await callPatientApi(p.queueId);
      toast.success(`Đã gọi ${p.queueNumber} - ${p.fullName || p.patientName}`);
      await loadQueue();
    } catch { toast.error('Gọi thất bại'); }
  };

  const handleSave = async () => {
    if (!medicalRecord.diagnosis?.trim()) return toast.error('Vui lòng nhập chẩn đoán!');
    setIsSaving(true);
    try {
      const payload = {
        patientId: currentPatient.patientId,
        patientName: currentPatient.name,
        diagnosis: medicalRecord.diagnosis,
        treatmentNotes: medicalRecord.treatmentNotes,
        clinicalExam: medicalRecord.clinicalExam || '',
      };
      const res = await medicalRecordApi.create(payload);
      setRecordId(res.id || res.recordId);
      toast.success('Lưu hồ sơ thành công!');
    } catch (err) {
      toast.error('Lưu thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = async () => {
    if (!recordId) return toast.error('Chưa lưu hồ sơ!');
    setIsPrinting(true);
    try {
      const blob = await medicalRecordApi.exportAsPdf(recordId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Ho_so_${currentPatient.queueNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('In thành công!');
    } catch { toast.error('Lỗi in PDF'); } finally { setIsPrinting(false); }
  };

  // HÀM QUAN TRỌNG NHẤT: TỰ ĐỘNG TẠO HÓA ĐƠN + HOÀN THÀNH KHÁM
  const handleComplete = async () => {
    if (!medicalRecord.diagnosis?.trim()) return toast.error('Chưa nhập chẩn đoán!');

    try {
      let currentRecordId = recordId;

      // 1. Lưu hồ sơ nếu chưa có
      if (!currentRecordId) {
        const payload = {
          patientId: currentPatient.patientId,
          patientName: currentPatient.name,
          diagnosis: medicalRecord.diagnosis,
          treatmentNotes: medicalRecord.treatmentNotes,
          clinicalExam: medicalRecord.clinicalExam || '',
        };
        const res = await medicalRecordApi.create(payload);
        currentRecordId = res.id || res.recordId;
        setRecordId(currentRecordId);
        toast.success('Đã lưu hồ sơ bệnh án');
      }

      // 2. TỰ ĐỘNG TẠO HÓA ĐƠN (nếu có dịch vụ hoặc thuốc)
      const hasItems = services.length > 0 || prescriptions.length > 0;
      if (hasItems) {
        const billPayload = {
          recordId: currentRecordId,
          patientId: currentPatient.patientId,
          patientName: currentPatient.name,
          items: [
            ...services.map(s => ({ serviceName: s, quantity: 1, unitPrice: 150000, totalPrice: 150000 })),
            ...prescriptions.map(p => ({ serviceName: `Thuốc: ${p.medication}`, quantity: 1, unitPrice: 100000, totalPrice: 100000 }))
          ]
        };
        await billingApi.create(billPayload);
        toast.success('Đã tạo hóa đơn tự động! Lễ tân có thể thu tiền ngay');
      }

      // 3. Hoàn thành khám trong QUEUE
      await completeExamination();
      toast.success('Hoàn thành khám thành công! Bệnh nhân có thể thanh toán');

      // Reset form
      setMedicalRecord({ clinicalExam: '', diagnosis: '', treatmentNotes: '' });
      setPrescriptions([]);
      setServices([]);
      setRecordId(null);
      await loadQueue();

    } catch (err) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredQueue = queue.filter(p =>
    (p.fullName || p.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.queueNumber || '').includes(searchTerm)
  );

  // GIAO DIỆN KHI ĐANG KHÁM
  if (currentPatient) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <Toaster position="top-right" />
        <header className="bg-white border-b px-6 py-4 shadow-sm">
          <h1 className="text-2xl font-semibold">Phòng khám • {currentPatient.queueNumber} - {currentPatient.name}</h1>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <PatientContextPanel currentPatient={currentPatient} />
          <DiagnosticInputArea
            activeTab={activeTab} setActiveTab={setActiveTab}
            medicalRecord={medicalRecord} setMedicalRecord={setMedicalRecord}
            prescriptions={prescriptions} setPrescriptions={setPrescriptions}
            services={services} setServices={setServices}
          />
        </div>
        <ActionFooter
          onSave={handleSave}
          onPrint={handlePrint}
          onComplete={handleComplete}
          hasRequiredData={!!medicalRecord.diagnosis?.trim()}
          isSaving={isSaving}
          isPrinting={isPrinting}
        />
      </div>
    );
  }

  // GIAO DIỆN DANH SÁCH CHỜ
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Toaster position="top-right" />
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex justify-between">
          <div><h1 className="text-4xl font-bold">Phòng khám bác sĩ</h1><p className="text-xl mt-2">Sẵn sàng tiếp nhận</p></div>
          <div className="text-right"><div className="text-7xl font-bold">{queue.length}</div><div className="text-xl">Đang chờ</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text" placeholder="Tìm bệnh nhân..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 border rounded-xl focus:ring-4 focus:ring-emerald-200 outline-none"
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredQueue.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <p className="text-xl font-medium">Chưa có bệnh nhân nào trong hàng đợi</p>
            </div>
          ) : (
            filteredQueue.map(p => (
              <div key={p.queueId} className="flex items-center justify-between p-6 hover:bg-emerald-50 border-b">
                <div>
                  <div className="text-3xl font-bold text-emerald-600">{p.queueNumber}</div>
                  <p className="font-semibold">{p.fullName || p.patientName}</p>
                  <p className="text-sm text-slate-500">{p.phone}</p>
                </div>
                <button onClick={() => handleCallPatient(p)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 shadow-lg">
                  <PhoneCall size={22} /> Gọi vào khám
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}