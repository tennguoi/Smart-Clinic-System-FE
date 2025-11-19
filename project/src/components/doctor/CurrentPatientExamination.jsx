// src/components/doctor/CurrentPatientExamination.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  PhoneCall, Users, Search, User, Calendar, Shield,
  FileText, Pill, Stethoscope, Save, Printer, CheckCircle,
  AlertCircle, Plus, Trash2, X
} from 'lucide-react';

import {
  getMyQueue,
  getCurrentPatient,
  callPatient as callPatientApi,
  completeExamination,
} from '../../api/doctorApi';
import { medicalRecordApi } from '../../api/medicalRecordApi';

// ================== TẤT CẢ COMPONENT ĐÃ CHUYỂN THÀNH JSX ==================

// PatientContextPanel
function PatientContextPanel({ currentPatient, medicalHistory = [] }) {
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-emerald-50 to-white">
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl font-bold text-emerald-600">{currentPatient.queueNumber}</span>
            {currentPatient.hasInsurance && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                <Shield size={14} /> <span>BHYT</span>
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">{currentPatient.name}</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              <span>{currentPatient.age} tuổi • {currentPatient.gender}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <span>Vào phòng: {currentPatient.checkInTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          Lịch sử khám bệnh
        </h3>
        <div className="space-y-3">
          {medicalHistory.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có lịch sử</p>
          ) : (
            medicalHistory.map((record, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{record.date}</span>
                </div>
                <p className="text-sm font-medium text-slate-700">{record.diagnosis}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// DiagnosisTab
function DiagnosisTab({ medicalRecord, setMedicalRecord }) {
  const handleChange = (field, value) => {
    setMedicalRecord(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Khám Lâm Sàng / Triệu Chứng / Diễn Tiến Bệnh
        </label>
        <textarea
          value={medicalRecord.clinicalExam}
          onChange={e => handleChange('clinicalExam', e.target.value)}
          className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          placeholder="Nhập triệu chứng, diễn tiến..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Chẩn Đoán <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={medicalRecord.diagnosis}
            onChange={e => handleChange('diagnosis', e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Nhập chẩn đoán (bắt buộc)"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Ghi Chú Điều Trị
        </label>
        <textarea
          value={medicalRecord.treatmentNotes}
          onChange={e => handleChange('treatmentNotes', e.target.value)}
          className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          placeholder="Lưu ý, hướng dẫn..."
        />
      </div>
    </div>
  );
}

// PrescriptionTab
function PrescriptionTab({ prescriptions, setPrescriptions }) {
  const add = () => {
    setPrescriptions(prev => [...prev, { id: Date.now() + '', medication: '', quantity: '', instructions: '' }]);
  };

  const remove = (id) => {
    setPrescriptions(prev => prev.filter(p => p.id !== id));
  };

  const update = (id, field, value) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Đơn Thuốc</h3>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <Plus size={18} /> Thêm Thuốc
        </button>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <Pill size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">Chưa có thuốc nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-4 py-3">Tên thuốc</th>
                <th className="text-left px-4 py-3">Số lượng</th>
                <th className="text-left px-4 py-3">Hướng dẫn dùng</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-3">
                    <input
                      value={p.medication}
                      onChange={e => update(p.id, 'medication', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Paracetamol 500mg..."
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={p.quantity}
                      onChange={e => update(p.id, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="2 vỉ"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={p.instructions}
                      onChange={e => update(p.id, 'instructions', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Uống 1 viên/lần, ngày 3 lần..."
                    />
                  </td>
                  <td className="text-center">
                    <button onClick={() => remove(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ServicesTab (đơn giản hóa)
function ServicesTab({ services, setServices }) {
  const available = [
    "Xét nghiệm máu tổng quát", "Xét nghiệm nước tiểu", "Siêu âm bụng",
    "Chụp X-quang phổi", "Điện tâm đồ", "Nội soi dạ dày"
  ];

  const add = (s) => !services.includes(s) && setServices(prev => [...prev, s]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Chỉ Định Dịch Vụ</h3>
        <div className="grid grid-cols-2 gap-3">
          {available.map(s => (
            <button
              key={s}
              onClick={() => add(s)}
              disabled={services.includes(s)}
              className={`p-4 text-left rounded-lg border ${services.includes(s) ? 'bg-emerald-100 border-emerald-400' : 'bg-white hover:bg-slate-50'} transition`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Đã chọn ({services.length})</h4>
        {services.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Chưa chọn dịch vụ nào</p>
        ) : (
          <div className="space-y-2">
            {services.map((s, i) => (
              <div key={i} className="flex justify-between items-center bg-emerald-50 px-4 py-3 rounded-lg">
                <span className="font-medium">{i + 1}. {s}</span>
                <button onClick={() => setServices(prev => prev.filter(x => x !== s))} className="text-red-600">
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// DiagnosticInputArea
function DiagnosticInputArea({ activeTab, setActiveTab, medicalRecord, setMedicalRecord, prescriptions, setPrescriptions, services, setServices }) {
  const tabs = [
    { id: 'diagnosis', label: 'Bệnh Án & Chẩn Đoán', icon: FileText },
    { id: 'prescription', label: 'Đơn Thuốc', icon: Pill },
    { id: 'services', label: 'Chỉ Định Dịch Vụ', icon: Stethoscope },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-slate-200">
        <div className="flex gap-1 px-6 pt-4">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium transition-all ${activeTab === t.id ? 'bg-white text-emerald-600 border-t-2 border-emerald-500 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Icon size={18} /> <span>{t.label}</span>
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

// ActionFooter
function ActionFooter({ onSaveDraft, onSave, onPrint, onComplete, hasRequiredData, isSaving, isPrinting }) {
  return (
    <footer className="bg-white border-t border-slate-200 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex gap-3">
          <button onClick={onSaveDraft} className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
            <Save size={18} /> Lưu Nháp
          </button>
          <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400">
            <Save size={18} /> {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button onClick={onPrint} disabled={isPrinting} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
            <Printer size={18} /> {isPrinting ? 'Đang in...' : 'In'}
          </button>
        </div>

        <button
          onClick={onComplete}
          disabled={!hasRequiredData}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold ${hasRequiredData ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
        >
          <CheckCircle size={20} /> Hoàn Thành Khám
        </button>
      </div>
    </footer>
  );
}

// ================== MAIN COMPONENT ==================
export default function CurrentPatientExamination() {
  const [queue, setQueue] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // State cho form khám
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

      const waiting = (queueRes || []).filter(p => p.status !== 'Completed').map(p => ({
        queueId: p.queueId,
        queueNumber: p.queueNumber,
        fullName: p.patientName || p.fullName,
        phone: p.phone,
        checkInTime: p.checkInTime,
      }));

      const patient = currentRes ? {
        queueId: currentRes.queueId,
        patientId: currentRes.patientId,
        queueNumber: currentRes.queueNumber,
        name: currentRes.fullName,
        age: currentRes.age || '--',
        gender: currentRes.gender === 'Male' ? 'Nam' : 'Nữ',
        hasInsurance: currentRes.hasInsurance || false,
        checkInTime: new Date(currentRes.startTime || currentRes.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
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
      toast.success(`Đã gọi ${p.queueNumber} - ${p.fullName}`);
      await loadQueue();
    } catch { toast.error('Gọi thất bại'); }
  };

  const handleSave = async () => {
    if (!medicalRecord.diagnosis.trim()) {
      toast.error('Vui lòng nhập chẩn đoán!');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        patientId: currentPatient?.patientId,
        patientName: currentPatient?.name,
        diagnosis: medicalRecord.diagnosis,
        treatmentNotes: medicalRecord.treatmentNotes,
      };
      const result = await medicalRecordApi.create(payload);
      setRecordId(result.id);
      toast.success('Lưu hồ sơ thành công!');
      window.dispatchEvent(new Event('medical-records:refresh'));
    } catch (err) {
      toast.error('Lỗi khi lưu hồ sơ: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = async () => {
    if (!recordId) {
      toast.error('Vui lòng lưu hồ sơ trước khi in!');
      return;
    }
    setIsPrinting(true);
    try {
      const pdfBlob = await medicalRecordApi.exportAsPdf(recordId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medical-record-${recordId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('In PDF thành công!');
    } catch (err) {
      toast.error('Lỗi khi in PDF: ' + (err.message || 'Vui lòng thử lại'));
      setIsPrinting(false);
    }
  };

  const handleComplete = async () => {
    if (!medicalRecord.diagnosis.trim()) {
      toast.error('Vui lòng nhập chẩn đoán!');
      return;
    }
    try {
      // Bước 1: Lưu hồ sơ y tế nếu chưa lưu
      if (!recordId) {
        const payload = {
          patientId: currentPatient?.patientId,
          patientName: currentPatient?.name,
          diagnosis: medicalRecord.diagnosis,
          treatmentNotes: medicalRecord.treatmentNotes,
        };
        const result = await medicalRecordApi.create(payload);
        setRecordId(result.id);
        toast.success('Lưu hồ sơ thành công!');
      }

      // Bước 2: Hoàn thành khám
      await completeExamination();
      toast.success('Hoàn thành khám thành công! Phòng đã được giải phóng.');

      // Reset form
      setMedicalRecord({ clinicalExam: '', diagnosis: '', treatmentNotes: '' });
      setPrescriptions([]);
      setServices([]);
      setRecordId(null);

      // Refresh lịch sử
      window.dispatchEvent(new Event('medical-records:refresh'));

      // Tự động reload để thấy phòng trống
      await loadQueue();
    } catch (err) {
      toast.error('Lỗi khi hoàn thành khám: ' + (err.message || ''));
    }
  };

  const filtered = queue.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.queueNumber.includes(searchTerm)
  );

  // KHI ĐANG KHÁM → DÙNG GIAO DIỆN ĐẸP
  if (currentPatient) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <Toaster position="top-right" />
        <header className="bg-white border-b px-6 py-4 shadow-sm">
          <h1 className="text-2xl font-semibold">Phòng Khám Bác Sĩ</h1>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <PatientContextPanel currentPatient={currentPatient} medicalHistory={[]} />
          <DiagnosticInputArea
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            medicalRecord={medicalRecord}
            setMedicalRecord={setMedicalRecord}
            prescriptions={prescriptions}
            setPrescriptions={setPrescriptions}
            services={services}
            setServices={setServices}
          />
        </div>

        <ActionFooter
          onSaveDraft={() => toast('Đã lưu nháp')}
          onSave={handleSave}
          onPrint={handlePrint}
          onComplete={handleComplete}
          hasRequiredData={!!medicalRecord.diagnosis.trim()}
          isSaving={isSaving}
          isPrinting={isPrinting}
        />
      </div>
    );
  }

  // CHƯA CÓ BỆNH NHÂN → DANH SÁCH CHỜ
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex justify-between">
            <div>
              <h1 className="text-4xl font-bold">Phòng Khám Bác Sĩ</h1>
              <p className="text-xl mt-2">Sẵn sàng khám bệnh</p>
            </div>
            <div className="text-right">
              <div className="text-7xl font-bold">{queue.length}</div>
              <div className="text-xl">Đang chờ</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm bệnh nhân..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 border rounded-xl focus:ring-4 focus:ring-emerald-200 outline-none"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-24 text-slate-500">
                <p className="text-xl font-medium">Chưa có bệnh nhân nào</p>
              </div>
            ) : (
              filtered.map(p => (
                <div key={p.queueId} className="flex items-center justify-between p-6 hover:bg-emerald-50 border-b">
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">{p.queueNumber}</div>
                    <div className="mt-1">
                      <p className="font-semibold">{p.fullName}</p>
                      <p className="text-sm text-slate-500">{p.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCallPatient(p)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 shadow-lg"
                  >
                    <PhoneCall size={22} /> Gọi vào khám
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}