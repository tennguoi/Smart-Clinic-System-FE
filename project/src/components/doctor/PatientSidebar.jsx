
// PatientSidebar.jsx
import { User, Calendar, Clock, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function PatientSidebar({ currentPatient, waitingQueue = [] /* aiAssistantOpen không còn ảnh hưởng layout */ }) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (!currentPatient) return null;

  // Chuẩn hoá hiển thị giới tính để tránh “đảo” Nam/Nữ khi dữ liệu trộn English/Vietnamese
  const rawGender = (currentPatient.gender ?? '').toString().toLowerCase();
  const isMale =
    rawGender.includes('male') ||
    rawGender.includes('nam') ||
    rawGender === 'm';
  const displayGender = isMale ? t('doctorExamination.male') : t('doctorExamination.female');

  return (
    <aside
      className={`w-96 shadow-xl border-r flex flex-col ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'
      }`}
    >
      {/* ——— BỆNH NHÂN HIỆN TẠI ——— */}
      <div className={`p-8 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-blue-100'}`}>
        <div className="text-center">
          {/* Avatar */}
          <div
            className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-4 ${
              theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}
          >
            <User className={`w-16 h-16 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>

          {/* Luôn hiển thị nhất quán (KHÔNG phụ thuộc aiAssistantOpen) */}
          <div className={`text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            {currentPatient.queueNumber}
          </div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            {currentPatient.fullName}
          </h2>
        </div>

        {/* Giới tính/tuổi + thời gian vào khám */}
        <div className={`mt-4 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
          <div>
            <Calendar className="inline w-5 h-5 mr-2" />
            {displayGender} • {currentPatient.age} {t('doctorExamination.years')}
          </div>
          <div>
            <Clock className="inline w-5 h-5 mr-2" />
            {t('doctorExamination.checkInTime')}: {currentPatient.checkInTime}
          </div>
        </div>
      </div>

      {/* ——— TRIỆU CHỨNG / GHI CHÚ ——— */}
      <div
        className={`m-6 p-5 border-2 rounded-2xl shadow-sm ${
          theme === 'dark' ? 'bg-amber-900/20 border-amber-800' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${theme === 'dark' ? 'bg-amber-900/50' : 'bg-amber-200'}`}>
            <FileText className={`w-7 h-7 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-900'}`}>
              {t('doctorExamination.symptomsTitle')}
            </h3>
            <div
              className={`p-4 rounded-xl border min-h-28 leading-relaxed whitespace-pre-wrap text-base text-left ${
                theme === 'dark'
                  ? 'bg-gray-800 border-amber-800 text-gray-300'
                  : 'bg-white border-amber-200 text-slate-800'
              }`}
            >
              {currentPatient.notes?.trim() ? (
                currentPatient.notes.trim()
              ) : (
                <span className={theme === 'dark' ? 'text-gray-400 italic' : 'text-slate-400 italic'}>
                  {t('doctorExamination.noSymptoms')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ——— HÀNG ĐỢI ——— */}
      <div className="px-6 pb-6">
        <h3
          className={`font-bold text-xl mb-4 flex items-center gap-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-slate-700'
          }`}
        >
          {t('doctorExamination.waitingQueueTitle')} ({waitingQueue.length})
        </h3>

        {waitingQueue.length === 0 ? (
          <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'} text-center py-4`}>
            {t('doctorExamination.noPatientsInQueue')}
          </p>
        ) : (
          <div className="space-y-3">
            {waitingQueue.map((p, i) => (
              <div
                key={p.queueId ?? `${p.patientId}-${i}`}
                className={`p-4 rounded-xl transition-all ${
                  theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`font-bold text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {p.queueNumber}
                    </div>
                    <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'} text-sm`}>
                      {p.patientName}
                    </div>
                  </div>
                  {i === 0 && (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {t('doctorExamination.nextPatientBadge')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}