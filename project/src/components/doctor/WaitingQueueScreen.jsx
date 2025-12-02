import { PhoneCall, Clock, User, Loader2 } from 'lucide-react';
import { calculateAge, formatTime } from '../../utils/helpers';

export default function WaitingQueueScreen({ 
  waitingQueue, 
  onCallNext, 
  isLoading 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-900">
            Phòng khám của tôi
          </h1>
          <p className="text-lg lg:text-xl text-blue-600 mt-2 font-medium">
            {waitingQueue.length} bệnh nhân đang chờ khám
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
        {waitingQueue.length === 0 ? (
          /* Không có bệnh nhân */
          <div className="text-center py-16 lg:py-32 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100">
            <div className="text-6xl lg:text-8xl mb-6">😊</div>
            <h2 className="text-xl lg:text-2xl font-semibold text-blue-800">
              Hiện chưa có bệnh nhân nào
            </h2>
            <p className="text-base lg:text-lg text-blue-600 mt-3">
              Hệ thống đang chờ bệnh nhân tiếp theo...
            </p>
          </div>
        ) : (
          /* Có bệnh nhân chờ */
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            {/* Header bảng */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white px-4 lg:px-6 py-4 lg:py-5">
              <h2 className="text-lg lg:text-xl font-bold flex items-center gap-3">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6" />
                Hàng chờ khám bệnh
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 text-blue-800 text-sm font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">STT</th>
                    <th className="px-6 py-4 text-left">Họ và tên</th>
                    <th className="px-6 py-4 text-center">Giới tính</th>
                    <th className="px-6 py-4 text-center">Tuổi</th>
                    <th className="px-6 py-4 text-center">Giờ vào</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {waitingQueue.map((patient, index) => {
                    const isNextPatient = index === 0;
                    return (
                      <tr 
                        key={patient.queueId} 
                        className={`transition-all duration-200 ${
                          isNextPatient 
                            ? 'bg-blue-50/70 border-l-4 border-blue-600 font-medium' 
                            : 'hover:bg-blue-50/30'
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-2xl ${
                              isNextPatient ? 'text-blue-700' : 'text-gray-800'
                            }`}>
                              {patient.queueNumber}
                            </span>
                            {isNextPatient && (
                              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                                Tiếp theo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-gray-900 font-medium text-lg">
                          {patient.patientName}
                        </td>
                        <td className="px-6 py-5 text-center text-gray-700">
                          {patient.gender === 'Male' || patient.gender === 'Nam' ? 'Nam' : 'Nữ'}
                        </td>
                        <td className="px-6 py-5 text-center text-gray-800 font-semibold">
                          {calculateAge(patient.dob)}
                        </td>
                        <td className="px-6 py-5 text-center text-gray-600">
                          {formatTime(patient.checkInTime)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          {isNextPatient && (
                            <button
                              onClick={onCallNext}
                              disabled={isLoading}
                              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:from-blue-400 disabled:to-sky-400 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 mx-auto min-w-[160px]"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="animate-spin" size={18} />
                                  Đang gọi...
                                </>
                              ) : (
                                <>
                                  <PhoneCall size={18} />
                                  Gọi vào khám
                                </>
                              )}
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
            <div className="lg:hidden divide-y divide-blue-100">
              {waitingQueue.map((patient, index) => {
                const isNextPatient = index === 0;
                return (
                  <div
                    key={patient.queueId}
                    className={`p-4 transition-all ${
                      isNextPatient
                        ? 'bg-blue-50/70 border-l-4 border-blue-600'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-3xl ${
                          isNextPatient ? 'text-blue-700' : 'text-gray-800'
                        }`}>
                          {patient.queueNumber}
                        </span>
                        {isNextPatient && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                            Tiếp theo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {patient.patientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          {patient.gender === 'Male' || patient.gender === 'Nam' ? 'Nam' : 'Nữ'}
                        </span>
                        <span>•</span>
                        <span className="font-semibold">
                          {calculateAge(patient.dob)} tuổi
                        </span>
                        <span>•</span>
                        <span>{formatTime(patient.checkInTime)}</span>
                      </div>
                    </div>

                    {isNextPatient && (
                      <button
                        onClick={onCallNext}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:from-blue-400 disabled:to-sky-400 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Đang gọi...
                          </>
                        ) : (
                          <>
                            <PhoneCall size={18} />
                            Gọi vào khám
                          </>
                        )}
                      </button>
                    )}
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