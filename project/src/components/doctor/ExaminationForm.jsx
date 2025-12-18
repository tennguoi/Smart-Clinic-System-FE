// ExaminationForm.jsx
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';
import PrescriptionForm from './PrescriptionForm';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';

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
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Media queries từ react-responsive
  const isMobile = useMediaQuery({ query: '(max-width: 1023px)' });
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedDrugs, setSuggestedDrugs] = useState([]);
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);

  // Kiểm tra chẩn đoán có liên quan đến tai mũi họng không
  const isENTRelated = (diagnosisText) => {
    const entKeywords = [
      'tai', 'mũi', 'họng', '후두', 'amidan', 'viêm họng', 'viêm tai', 'viêm xoang',
      'polyp', 'xoang', 'thanh quản', 'thính giác', 'ù tai', 'ngạt mũi', 
      'chảy nước mũi', 'ho', 'khàn tiếng', 'nuốt khó', 'đau họng', 'sổ mũi',
      'viêm VA', 'viêm amidan', 'viêm후두', 'chảy máu cam', 'ngứa tai',
      'ent', 'otitis', 'rhinitis', 'pharyngitis', 'laryngitis', 'sinusitis',
      'tonsillitis', 'adenoiditis', 'otolaryngology', 'eustachian', 'turbinate'
    ];
    
    const lowerDiagnosis = diagnosisText.toLowerCase();
    return entKeywords.some(keyword => lowerDiagnosis.includes(keyword.toLowerCase()));
  };

  // Gọi AI để sinh ghi chú điều trị và đề xuất thuốc
  const generateTreatmentPlan = async () => {
    if (!diagnosis.trim()) {
      toast.error(
        t('doctorExamination.diagnosisRequired') ?? 'Vui lòng nhập chẩn đoán trước',
        toastConfig.toastOptions.error
      );
      return;
    }

    // Kiểm tra chẩn đoán có liên quan đến tai mũi họng
    if (!isENTRelated(diagnosis)) {
      toast.error(
        '⚠️ Chẩn đoán không liên quan đến Tai - Mũi - Họng. Vui lòng nhập chẩn đoán phù hợp với chuyên khoa.',
        {
          ...toastConfig.toastOptions.error,
          duration: 5000,
        }
      );
      return;
    }

    setIsGenerating(true);
    setShowDrugSuggestions(false);
    try {
      const response = await fetch('https://n8n.quanliduan-pms.site/webhook/ai-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `TREATMENT_GEN_${Date.now()}`,
          chatInput: `Dựa trên chẩn đoán: "${diagnosis}".
Hãy trả về ĐÚNG FORMAT JSON này:
{
 "treatmentNotes": "Ghi chú điều trị phải giải thích chi tiết, dễ hiểu cho bệnh nhân và bác sĩ",
 "drugs": [
 {"drugName": "Tên thuốc + liều lượng", "instructions": "Hướng dẫn chi tiết"}
 ]
}
QUAN TRỌNG: Chỉ trả về JSON, không thêm text giải thích.`,
        }),
      });
      if (!response.ok) throw new Error('Không thể kết nối AI');
      const data = await response.json();
      const aiText = (data.output ?? data.text ?? '').toString().trim();
      parseAIResponse(aiText);
    } catch (error) {
      console.error('Lỗi sinh phác đồ:', error);
      toast.error(
        t('doctorExamination.generatePlanError') ?? 'Không thể sinh phác đồ tự động. Vui lòng thử lại.',
        toastConfig.toastOptions.error
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse response từ AI
  const parseAIResponse = (text) => {
    try {
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.treatmentNotes && parsed.treatmentNotes.trim()) {
          onTreatmentNotesChange(parsed.treatmentNotes.trim());
        }
        if (parsed.drugs && Array.isArray(parsed.drugs)) {
          const validDrugs = parsed.drugs.filter(
            d => d.drugName && d.drugName.trim() && d.instructions && d.instructions.trim()
          );
          if (validDrugs.length > 0) {
            setSuggestedDrugs(validDrugs);
            setShowDrugSuggestions(true);
            toast.success(
              `✨ AI đã đề xuất ${validDrugs.length} loại thuốc`,
              toastConfig.toastOptions.success
            );
          } else {
            toast.info(
              t('doctorExamination.noDrugsRecommended') ?? 'AI không đề xuất thuốc cụ thể. Vui lòng kê đơn thủ công.',
              toastConfig.toastOptions.info
            );
          }
        }
      } else {
        const arrayMatch = text.match(/\[\[\s\S]*\]/);
        if (arrayMatch) {
          const drugs = JSON.parse(arrayMatch[0]);
          const validDrugs = drugs.filter(
            d => d.drugName && d.drugName.trim() && d.instructions && d.instructions.trim()
          );
          if (validDrugs.length > 0) {
            setSuggestedDrugs(validDrugs);
            setShowDrugSuggestions(true);
            toast.success(
              `✨ AI đã đề xuất ${validDrugs.length} loại thuốc`,
              toastConfig.toastOptions.success
            );
          }
          const notesText = text.substring(0, text.indexOf('[')).trim();
          if (notesText.length > 10) {
            const sentences = notesText.split(/[.!?]\s+/).slice(0, 3).join('. ');
            onTreatmentNotesChange(sentences + '.');
          }
        } else {
          throw new Error('Không tìm thấy JSON hợp lệ');
        }
      }
    } catch (e) {
      console.error('Lỗi parse AI response:', e);
      console.log('Raw text:', text);
      toast.error(
        t('doctorExamination.parseError') ?? 'Không thể phân tích kết quả AI. Vui lòng thử lại hoặc kê đơn thủ công.',
        toastConfig.toastOptions.error
      );
    }
  };

  // Chọn/bỏ chọn thuốc đề xuất
  const toggleDrugSelection = (drug, isSelected) => {
    if (isSelected) {
      const emptyIndex = prescriptionItems.findIndex(
        item => !item.drugName.trim() && !item.instructions.trim()
      );
      if (emptyIndex !== -1) {
        onUpdatePrescription(emptyIndex, 'drugName', drug.drugName);
        onUpdatePrescription(emptyIndex, 'instructions', drug.instructions);
      } else {
        const currentLength = prescriptionItems.length;
        onAddPrescription();
        setTimeout(() => {
          onUpdatePrescription(currentLength, 'drugName', drug.drugName);
          onUpdatePrescription(currentLength, 'instructions', drug.instructions);
        }, 50);
      }
      toast.success(
        `✅ Đã thêm: ${drug.drugName}`,
        toastConfig.toastOptions.success
      );
    } else {
      const indexToRemove = prescriptionItems.findIndex(
        item => item.drugName.trim() === drug.drugName.trim()
      );
      if (indexToRemove !== -1) {
        onRemovePrescription(indexToRemove);
        toast.info(
          `🗑️ Đã xóa: ${drug.drugName}`,
          toastConfig.toastOptions.info
        );
      }
    }
  };

  const isDrugSelected = (drug) =>
    prescriptionItems.some(item => item.drugName.trim() === drug.drugName.trim());

  return (
    <div className={`space-y-4 ${isMobile ? 'space-y-5' : ''} ${isDesktop ? 'lg:space-y-6' : ''}`}>
      {/* Diagnosis + AI button */}
      <div className={`p-4 ${isMobile ? 'p-5' : ''} ${isDesktop ? 'lg:p-6' : ''} rounded-xl shadow-md border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <label className={`block text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            {t('doctorExamination.diagnosisLabel')} <span className="text-red-500">*</span>
          </label>
          <button
            onClick={generateTreatmentPlan}
            disabled={!diagnosis.trim() || isGenerating}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isGenerating
                ? (theme === 'dark' ? 'bg-purple-900/40 text-purple-200' : 'bg-purple-200 text-purple-700')
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                {t('doctorExamination.generating') ?? 'Đang sinh...'}
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {t('doctorExamination.aiGeneratePlan') ?? 'AI Sinh Phác Đồ'}
              </>
            )}
          </button>
        </div>
        <textarea
          value={diagnosis}
          onChange={e => onDiagnosisChange(e.target.value)}
          className={`w-full h-32 ${isMobile ? 'h-36' : ''} ${isDesktop ? 'lg:h-40' : ''} p-3 border rounded-lg focus:ring-2 resize-none text-sm transition-all ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700'
              : 'bg-white border-blue-200 focus:ring-blue-400 focus:border-blue-500'
          }`}
          placeholder={t('doctorExamination.diagnosisPlaceholder') ?? 'Nhập chẩn đoán chi tiết...'}
        />
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs mt-3`}>
          💡 {t('doctorExamination.aiHint') ?? 'Nhập chẩn đoán → Nhấn "AI Sinh Phác Đồ" để tự động tạo ghi chú và thuốc'}
        </p>
      </div>

      {/* Treatment notes */}
      <div className={`p-4 ${isMobile ? 'p-5' : ''} ${isDesktop ? 'lg:p-6' : ''} rounded-xl shadow-md border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'
      }`}>
        <label className={`block text-sm font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          {t('doctorExamination.treatmentNotesLabel')}
        </label>
        <textarea
          value={treatmentNotes}
          onChange={e => onTreatmentNotesChange(e.target.value)}
          className={`w-full h-28 ${isMobile ? 'h-32' : ''} ${isDesktop ? 'lg:h-36' : ''} p-3 border rounded-lg focus:ring-2 resize-none text-sm transition-all ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700'
              : 'bg-white border-blue-200 focus:ring-blue-400 focus:border-blue-500'
          }`}
          placeholder={t('doctorExamination.treatmentNotesPlaceholder') ?? 'Ghi chú về quá trình điều trị, theo dõi...'}
        />
      </div>

      {/* AI suggested drugs */}
      {showDrugSuggestions && suggestedDrugs.length > 0 && (
        <div className={`p-5 ${isMobile ? 'p-6' : ''} ${isDesktop ? 'lg:p-7' : ''} rounded-xl border-2 shadow-lg animate-fade-in ${
          theme === 'dark'
            ? 'bg-purple-900/20 border-purple-700'
            : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-base ${isMobile ? 'text-base' : ''} font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-purple-900'}`}>
              <Sparkles size={20} className="text-purple-600" />
              {t('doctorExamination.aiSuggestedDrugs', { count: suggestedDrugs.length }) ?? `AI Đề Xuất ${suggestedDrugs.length} Thuốc`}
            </h3>
            <button
              onClick={() => setShowDrugSuggestions(false)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('doctorExamination.close') || 'Đóng'}
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestedDrugs.map((drug, index) => {
              const isSelected = isDrugSelected(drug);
              return (
                <label
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? (theme === 'dark' ? 'bg-purple-900/30 border-purple-600' : 'bg-purple-100 border-purple-500 shadow-md')
                      : (theme === 'dark' ? 'bg-gray-800 border-purple-700 hover:border-purple-500' : 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-sm')
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => toggleDrugSelection(drug, e.target.checked)}
                    className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-base mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {drug.drugName}
                    </p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed`}>
                      {drug.instructions}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          <p className={`${theme === 'dark' ? 'text-purple-200' : 'text-purple-700'} text-sm mt-4 italic flex items-center gap-1`}>
            <Sparkles size={14} />
            {t('doctorExamination.selectDrugsHint') ?? 'Tick chọn từng thuốc cần dùng'}
          </p>
        </div>
      )}

      {/* Prescription form */}
      <PrescriptionForm
        prescriptionItems={prescriptionItems}
        onAdd={onAddPrescription}
        onRemove={onRemovePrescription}
        onUpdate={onUpdatePrescription}
        aiAssistantOpen={aiAssistantOpen}
      />

      {/* Complete button */}
      <div className={`pt-4 ${isMobile ? 'pt-6' : ''}`}>
        <button
          onClick={onComplete}
          disabled={!diagnosis.trim() || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              {t('doctorExamination.processing') ?? 'Đang xử lý...'}
            </>
          ) : (
            <>
              <CheckCircle size={24} />
              {t('doctorExamination.completeButton')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}