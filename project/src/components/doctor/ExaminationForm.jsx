import { useState } from 'react';
import { FileText, CheckCircle, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import PrescriptionForm from './PrescriptionForm';
import { useTranslation } from 'react-i18next';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedDrugs, setSuggestedDrugs] = useState([]);
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);

  // Gọi AI để sinh ghi chú điều trị và đề xuất thuốc
  const generateTreatmentPlan = async () => {
    if (!diagnosis.trim()) {
      alert(t('doctorExamination.diagnosisRequired'));
      return;
    }

    setIsGenerating(true);
    setShowDrugSuggestions(false);

    try {
      // Gọi n8n để sinh phác đồ điều trị
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

QUAN TRỌNG: Chỉ trả về JSON, không thêm text giải thích.`
        }),
      });

      if (!response.ok) throw new Error('Không thể kết nối AI');

      const data = await response.json();
      const aiText = (data.output || data.text || '').toString().trim();

      // Parse kết quả AI
      parseAIResponse(aiText);

    } catch (error) {
      console.error('Lỗi sinh phác đồ:', error);
      alert(t('doctorExamination.generatePlanError') || 'Không thể sinh phác đồ tự động. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse response từ AI
  const parseAIResponse = (text) => {
    try {
      // Loại bỏ markdown code block nếu có
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Tìm JSON object
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Xử lý ghi chú điều trị
        if (parsed.treatmentNotes && parsed.treatmentNotes.trim()) {
          onTreatmentNotesChange(parsed.treatmentNotes.trim());
        }

        // Xử lý danh sách thuốc
        if (parsed.drugs && Array.isArray(parsed.drugs)) {
          const validDrugs = parsed.drugs.filter(d => 
            d.drugName && d.drugName.trim() && 
            d.instructions && d.instructions.trim()
          );

          if (validDrugs.length > 0) {
            setSuggestedDrugs(validDrugs);
            setShowDrugSuggestions(true);
          } else {
            alert(t('doctorExamination.noDrugsRecommended') || 'AI không đề xuất thuốc cụ thể. Vui lòng kê đơn thủ công.');
          }
        }
      } else {
        // Fallback: tìm array thuốc
        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          const drugs = JSON.parse(arrayMatch[0]);
          const validDrugs = drugs.filter(d => 
            d.drugName && d.drugName.trim() && 
            d.instructions && d.instructions.trim()
          );
          
          if (validDrugs.length > 0) {
            setSuggestedDrugs(validDrugs);
            setShowDrugSuggestions(true);
          }
          
          // Lấy text trước array làm ghi chú
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
      alert(t('doctorExamination.parseError') || 'Không thể phân tích kết quả AI. Vui lòng thử lại hoặc kê đơn thủ công.');
    }
  };

  // Chọn/bỏ chọn thuốc từ danh sách đề xuất
  const toggleDrugSelection = (drug, isSelected) => {
    if (isSelected) {
      // Kiểm tra xem có item rỗng không
      const emptyIndex = prescriptionItems.findIndex(
        item => !item.drugName.trim() && !item.instructions.trim()
      );
      
      if (emptyIndex !== -1) {
        // Nếu có item rỗng, điền vào item đó
        onUpdatePrescription(emptyIndex, 'drugName', drug.drugName);
        onUpdatePrescription(emptyIndex, 'instructions', drug.instructions);
      } else {
        // Nếu không, thêm mới
        const currentLength = prescriptionItems.length;
        onAddPrescription();
        
        // Delay nhỏ để đảm bảo item mới đã được thêm
        setTimeout(() => {
          onUpdatePrescription(currentLength, 'drugName', drug.drugName);
          onUpdatePrescription(currentLength, 'instructions', drug.instructions);
        }, 50);
      }
    } else {
      // Xóa thuốc khỏi form
      const indexToRemove = prescriptionItems.findIndex(
        item => item.drugName.trim() === drug.drugName.trim()
      );
      if (indexToRemove !== -1) {
        onRemovePrescription(indexToRemove);
      }
    }
  };

  // Kiểm tra thuốc đã được chọn chưa
  const isDrugSelected = (drug) => {
    return prescriptionItems.some(
      item => item.drugName.trim() === drug.drugName.trim()
    );
  };

  // Áp dụng tất cả thuốc đề xuất
  const applyAllDrugs = () => {
    // Xóa tất cả items hiện tại
    const currentLength = prescriptionItems.length;
    for (let i = currentLength - 1; i > 0; i--) {
      onRemovePrescription(i);
    }
    
    // Reset item đầu tiên
    onUpdatePrescription(0, 'drugName', '');
    onUpdatePrescription(0, 'instructions', '');

    // Thêm tất cả thuốc đề xuất
    suggestedDrugs.forEach((drug, index) => {
      if (index === 0) {
        // Item đầu tiên: cập nhật item rỗng
        setTimeout(() => {
          onUpdatePrescription(0, 'drugName', drug.drugName);
          onUpdatePrescription(0, 'instructions', drug.instructions);
        }, 100);
      } else {
        // Items sau: thêm mới
        setTimeout(() => {
          onAddPrescription();
          setTimeout(() => {
            onUpdatePrescription(index, 'drugName', drug.drugName);
            onUpdatePrescription(index, 'instructions', drug.instructions);
          }, 50);
        }, 100 + (index * 100));
      }
    });

    setTimeout(() => setShowDrugSuggestions(false), 500);
  };

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Chẩn đoán với nút AI */}
      <div className="bg-white p-3 lg:p-4 rounded-xl shadow-md border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-slate-800">
            {t('doctorExamination.diagnosisLabel')} <span className="text-red-500">*</span>
          </label>
          
          <button
            onClick={generateTreatmentPlan}
            disabled={!diagnosis.trim() || isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                {t('doctorExamination.generating') || 'Đang sinh...'}
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {t('doctorExamination.aiGeneratePlan') || 'AI Sinh Phác Đồ'}
              </>
            )}
          </button>
        </div>

        <textarea
          value={diagnosis}
          onChange={e => onDiagnosisChange(e.target.value)}
          className="w-full h-24 lg:h-28 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 resize-none text-sm transition-all"
          placeholder={t('doctorExamination.diagnosisPlaceholder') || "Nhập chẩn đoán chi tiết..."}
        />

        <p className="text-xs text-gray-500 mt-2">
          💡 {t('doctorExamination.aiHint') || 'Nhập chẩn đoán → Nhấn "AI Sinh Phác Đồ" để tự động tạo ghi chú và thuốc'}
        </p>
      </div>

      {/* Ghi chú điều trị */}
      <div className="bg-white p-3 lg:p-4 rounded-xl shadow-md border border-blue-200">
        <label className="block text-sm font-bold mb-2 text-slate-800">
          {t('doctorExamination.treatmentNotesLabel')}
        </label>
        <textarea
          value={treatmentNotes}
          onChange={e => onTreatmentNotesChange(e.target.value)}
          className="w-full h-20 lg:h-24 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 resize-none text-sm transition-all"
          placeholder={t('doctorExamination.treatmentNotesPlaceholder') || "Ghi chú về quá trình điều trị, theo dõi..."}
        />
      </div>

      {/* Danh sách thuốc đề xuất */}
      {showDrugSuggestions && suggestedDrugs.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-300 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600" />
              {t('doctorExamination.aiSuggestedDrugs', { count: suggestedDrugs.length }) || `AI Đề Xuất ${suggestedDrugs.length} Thuốc`}
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={applyAllDrugs}
                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-all flex items-center gap-1"
              >
                <CheckCircle size={14} />
                {t('doctorExamination.applyAll') || 'Áp dụng tất cả'}
              </button>
              
              <button
                onClick={() => setShowDrugSuggestions(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-all"
              >
                {t('common.close') || 'Đóng'}
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {suggestedDrugs.map((drug, index) => {
              const isSelected = isDrugSelected(drug);
              
              return (
                <label
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-100 border-purple-500 shadow-md'
                      : 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => toggleDrugSelection(drug, e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 mb-1">
                      {drug.drugName}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {drug.instructions}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <p className="text-xs text-purple-700 mt-3 italic flex items-center gap-1">
            <Sparkles size={12} />
            {t('doctorExamination.selectDrugsHint') || 'Tick chọn thuốc cần dùng hoặc áp dụng tất cả'}
          </p>
        </div>
      )}

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
              {t('common.processing') || 'Đang xử lý...'}
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              {t('doctorExamination.completeButton')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}