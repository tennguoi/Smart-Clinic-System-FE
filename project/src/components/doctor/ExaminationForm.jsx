import { FileText, CheckCircle, Loader2 } from 'lucide-react';
import PrescriptionForm from './PrescriptionForm';

export default function ExaminationForm({
  diagnosis,
  treatmentNotes,
  prescriptionItems,
  onDiagnosisChange,
  onTreatmentNotesChange,
  onAddPrescription,
  onRemovePrescription,
  onUpdatePrescription,
  onComplete,
  isLoading,
  aiAssistantOpen
}) {
  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Chẩn đoán */}
      <div className="bg-white p-3 lg:p-4 rounded-xl shadow-md border border-blue-200">
        <label className="block text-sm font-bold mb-2 text-slate-800">
          Chẩn đoán <span className="text-red-500">*</span>
        </label>
        <textarea
          value={diagnosis}
          onChange={e => onDiagnosisChange(e.target.value)}
          className="w-full h-24 lg:h-28 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 resize-none text-sm transition-all"
          placeholder="Nhập chẩn đoán chi tiết..."
        />
      </div>

      {/* Ghi chú điều trị */}
      <div className="bg-white p-3 lg:p-4 rounded-xl shadow-md border border-blue-200">
        <label className="block text-sm font-bold mb-2 text-slate-800">
          Ghi chú điều trị
        </label>
        <textarea
          value={treatmentNotes}
          onChange={e => onTreatmentNotesChange(e.target.value)}
          className="w-full h-20 lg:h-24 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 resize-none text-sm transition-all"
          placeholder="Ghi chú về quá trình điều trị, theo dõi..."
        />
      </div>

      {/* Kê đơn thuốc */}
      <PrescriptionForm
        prescriptionItems={prescriptionItems}
        onAdd={onAddPrescription}
        onRemove={onRemovePrescription}
        onUpdate={onUpdatePrescription}
        aiAssistantOpen={aiAssistantOpen}
      />

      {/* Button hoàn thành */}
      <div className="pt-2">
        <button
          onClick={onComplete}
          disabled={!diagnosis.trim() || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 py-3 rounded-xl text-base font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Đang xử lý...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Hoàn thành khám
            </>
          )}
        </button>
      </div>
    </div>
  );
}