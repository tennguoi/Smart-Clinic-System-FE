// WaitingQueueScreen.jsx - Version có phân trang
import { useState, useEffect } from 'react';
import { PhoneCall, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import { calculateAge, formatTime } from '../../utils/helpers';
import { useTheme } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosConfig';

export default function WaitingQueueScreen({ onCallNext, isLoading }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Pagination states
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(5); // 5 bệnh nhân mỗi trang
  const [loading, setLoading] = useState(false);

  // Load data với phân trang
  useEffect(() => {
    const loadWaitingQueue = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/doctor/queue/waiting/paged', {
          params: {
            page: currentPage,
            size: pageSize
          }
        });
        
        setWaitingQueue(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } catch (error) {
        console.error('Error loading waiting queue:', error);
        toast.error(
          t('common.loadError') ?? 'Lỗi tải danh sách chờ',
          toastConfig.toastOptions.error
        );
      } finally {
        setLoading(false);
      }
    };

    loadWaitingQueue();
    
    // Polling mỗi 8 giây
    const interval = setInterval(loadWaitingQueue, 8000);
    return () => clearInterval(interval);
  }, [currentPage, pageSize, t]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCallNextPatient = async () => {
    await onCallNext();
    // Sau khi gọi bệnh nhân, quay về trang đầu
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-sky-50'}`}>
      <Toaster position={toastConfig.position} />
      
      {/* Header */}
      <div className={`shadow-sm border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
            {t('waitingQueue.title', 'Hàng chờ khám bệnh')}
          </h1>
          <p className={`text-xl mt-2 font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
            {t('waitingQueue.patientsWaiting', { count: totalElements })} 
            {totalElements > 0 && ` (${t('waitingQueue.showing', 'Đang hiển thị')} ${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, totalElements)})`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading && waitingQueue.length === 0 ? (
          <div className={`text-center py-32 backdrop-blur-sm rounded-2xl shadow-lg border ${theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-blue-100'}`}>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('waitingQueue.loading', 'Đang tải danh sách...')}
            </p>
          </div>
        ) : totalElements === 0 ? (
          // No patient
          <div className={`text-center py-32 backdrop-blur-sm rounded-2xl shadow-lg border ${theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-blue-100'}`}>
            <div className={`text-8xl mb-6 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>😊</div>
            <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              {t('waitingQueue.noPatients', 'Không có bệnh nhân đang chờ')}
            </h2>
            <p className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} text-lg mt-3`}>
              {t('waitingQueue.waitingSystem', 'Hệ thống đang chờ bệnh nhân mới')}
            </p>
          </div>
        ) : (
          // Have patients
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 py-5">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Clock className="w-6 h-6" />
                {t('waitingQueue.queueTitle', 'Danh sách chờ khám')}
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full">
                <thead className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                  <tr>
                    <th className="px-6 py-4 text-left">{t('waitingQueue.table.stt', 'STT')}</th>
                    <th className="px-6 py-4 text-left">{t('waitingQueue.table.queueNumber', 'Số thứ tự')}</th>
                    <th className="px-6 py-4 text-left">{t('waitingQueue.table.fullName', 'Họ và tên')}</th>
                    <th className="px-6 py-4 text-center">{t('waitingQueue.table.gender', 'Giới tính')}</th>
                    <th className="px-6 py-4 text-center">{t('waitingQueue.table.age', 'Tuổi')}</th>
                    <th className="px-6 py-4 text-center">{t('waitingQueue.table.checkInTime', 'Giờ vào')}</th>
                    <th className="px-6 py-4 text-center">{t('waitingQueue.table.actions', 'Thao tác')}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-blue-100'}`}>
                  {waitingQueue.map((patient, index) => {
                    const globalIndex = currentPage * pageSize + index;
                    const isFirstPatientGlobally = globalIndex === 0;
                    
                    return (
                      <tr
                        key={patient.queueId}
                        className={`transition-all duration-200 ${
                          isFirstPatientGlobally
                            ? (theme === 'dark'
                                ? 'bg-blue-900/20 border-l-4 border-blue-500'
                                : 'bg-blue-50/70 border-l-4 border-blue-600 font-medium')
                            : (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50/30')
                        }`}
                      >
                        <td className={`px-6 py-5 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {globalIndex + 1}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-2xl ${isFirstPatientGlobally ? 'text-blue-600 dark:text-blue-400' : theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                              {patient.queueNumber}
                            </span>
                            {isFirstPatientGlobally && (
                              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                                {t('waitingQueue.nextBadge', 'Tiếp theo')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`px-6 py-5 font-medium text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {patient.patientName}
                        </td>
                        <td className={`px-6 py-5 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {patient.gender === 'Male' || patient.gender === 'Nam' ? t('waitingQueue.gender.male', 'Nam') : t('waitingQueue.gender.female', 'Nữ')}
                        </td>
                        <td className={`px-6 py-5 text-center font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          {calculateAge(patient.dob)}
                        </td>
                        <td className={`px-6 py-5 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatTime(patient.checkInTime)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          {isFirstPatientGlobally && (
                            <button
                              onClick={handleCallNextPatient}
                              disabled={isLoading}
                              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:from-blue-400 disabled:to-sky-400 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 mx-auto min-w-[160px]"
                            >
                              <PhoneCall size={18} />
                              {isLoading ? t('waitingQueue.calling', 'Đang gọi...') : t('waitingQueue.callButton', 'Gọi vào khám')}
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
                const globalIndex = currentPage * pageSize + index;
                const isFirstPatientGlobally = globalIndex === 0;
                
                return (
                  <div
                    key={patient.queueId}
                    className={`p-4 rounded-2xl border transition-all ${
                      isFirstPatientGlobally
                        ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200')
                        : (theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100')
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>#{globalIndex + 1}</span>
                        <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{patient.queueNumber}</span>
                        {isFirstPatientGlobally && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {t('waitingQueue.nextBadge', 'Tiếp theo')}
                          </span>
                        )}
                      </div>
                      {isFirstPatientGlobally && (
                        <button
                          onClick={handleCallNextPatient}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-4 py-2 rounded-lg font-bold shadow-md disabled:opacity-50"
                        >
                          <PhoneCall size={16} className="inline mr-1" />
                          {isLoading ? t('waitingQueue.calling', 'Gọi...') : t('waitingQueue.callButton', 'Gọi')}
                        </button>
                      )}
                    </div>
                    <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} font-medium`}>{patient.patientName}</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                      {patient.gender === 'Male' || patient.gender === 'Nam' ? t('waitingQueue.gender.male', 'Nam') : t('waitingQueue.gender.female', 'Nữ')}
                      {' • '}
                      {calculateAge(patient.dob)} {t('waitingQueue.yearsOld', 'tuổi')}
                      {' • '}
                      {formatTime(patient.checkInTime)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`px-6 py-4 border-t flex items-center justify-between ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('waitingQueue.pagination.showing', 'Hiển thị')} {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} {t('waitingQueue.pagination.of', 'trong')} {totalElements}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      currentPage === 0
                        ? (theme === 'dark' ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                        : (theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300')
                    }`}
                  >
                    <ChevronLeft size={18} />
                    {t('waitingQueue.pagination.previous', 'Trước')}
                  </button>

                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(idx)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          currentPage === idx
                            ? 'bg-blue-600 text-white'
                            : (theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300')
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      currentPage === totalPages - 1
                        ? (theme === 'dark' ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                        : (theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300')
                    }`}
                  >
                    {t('waitingQueue.pagination.next', 'Sau')}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}