
// WaitingQueueScreen.jsx
import { PhoneCall, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import { calculateAge, formatTime } from '../../utils/helpers';
import { useTheme } from '../../contexts/ThemeContext';

export default function WaitingQueueScreen({ waitingQueue, onCallNext, isLoading }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-sky-50'}`}>
      <Toaster position={toastConfig.position} />
      {/* Header */}
      <div className={`shadow-sm border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
            {t('waitingQueue.title')}
          </h1>
          <p className={`text-xl mt-2 font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
            {t('waitingQueue.patientsWaiting', { count: waitingQueue.length })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {waitingQueue.length === 0 ? (
          // No patient
          <div className={`text-center py-32 backdrop-blur-sm rounded-2xl shadow-lg border ${theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-blue-100'}`}>
            <div className={`text-8xl mb-6 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>😊</div>
            <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              {t('waitingQueue.noPatients')}
            </h2>
            <p className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} text-lg mt-3`}>
              {t('waitingQueue.waitingSystem')}
            </p>
          </div>
        ) : (
          // Have patients
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 py-5">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Clock className="w-6 h-6" />
                {t('waitingQueue.queueTitle')}
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full">
                <thead className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                  <tr>
                    <th className="px-6 py-4 text-left">{t('waitingQueue.table.queueNumber')}</th>
                    <th className="px-6 py-4 text-left">{t('waitingQueue.table.fullName')}</th>
                    <th className="px-6 py-4 text-center">{t('waitingQueue.table.gender')}</th>
                    <th className="px-6 py-4 text-center">{t('waitingQueue.table.age')}</th>
                    <th className="px-6 py-4 text-center">{t('waitingQueue.table.checkInTime')}</th>
                    <th className="px-6 py-4 text-center">{t('waitingQueue.table.actions')}</th>
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
                            ? (theme === 'dark'
                                ? 'bg-blue-900/20 border-l-4 border-blue-500'
                                : 'bg-blue-50/70 border-l-4 border-blue-600 font-medium')
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
                                {t('waitingQueue.nextBadge')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`px-6 py-5 font-medium text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {patient.patientName}
                        </td>
                        <td className={`px-6 py-5 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {patient.gender === 'Male' || patient.gender === 'Nam' ? t('waitingQueue.gender.male') : t('waitingQueue.gender.female')}
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
                              onClick={onCallNext}
                              disabled={isLoading}
                              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:from-blue-400 disabled:to-sky-400 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 mx-auto min-w-[160px]"
                            >
                              <PhoneCall size={18} />
                              {isLoading ? t('waitingQueue.calling') : t('waitingQueue.callButton')}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {waitingQueue.map((patient, index) => {
                const isNextPatient = index === 0;
                return (
                  <div
                    key={patient.queueId}
                    className={`p-4 rounded-2xl border transition-all ${
                      isNextPatient
                        ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200')
                        : (theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100')
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{patient.queueNumber}</span>
                        {isNextPatient && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {t('waitingQueue.nextBadge')}
                          </span>
                        )}
                      </div>
                      {isNextPatient && (
                        <button
                          onClick={onCallNext}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-4 py-2 rounded-lg font-bold shadow-md disabled:opacity-50"
                        >
                          <PhoneCall size={16} className="inline mr-1" />
                          {isLoading ? t('waitingQueue.calling') : t('waitingQueue.callButton')}
                        </button>
                      )}
                    </div>
                    <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} font-medium`}>{patient.patientName}</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                      {patient.gender === 'Male' || patient.gender === 'Nam' ? t('waitingQueue.gender.male') : t('waitingQueue.gender.female')}
                      {' • '}
                      {calculateAge(patient.dob)} {t('waitingQueue.yearsOld')}
                      {' • '}
                      {formatTime(patient.checkInTime)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
