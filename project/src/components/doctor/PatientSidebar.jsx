import { User, Calendar, Clock, FileText } from 'lucide-react';

export default function PatientSidebar({ currentPatient, waitingQueue, aiAssistantOpen }) {
  return (
    <div className={`w-full bg-white shadow-xl border-b lg:border-r border-blue-100 flex flex-col max-h-screen lg:h-screen overflow-y-auto ${
      aiAssistantOpen ? 'lg:w-72' : 'lg:w-96'
    }`}>
      {/* Thông tin bệnh nhân hiện tại */}
      <div className={`border-b border-blue-100 ${
        aiAssistantOpen ? 'p-2.5 lg:p-4' : 'p-4 lg:p-8'
      }`}>
        <div className={aiAssistantOpen ? 'space-y-2' : 'text-center'}>
          {/* Avatar + Số thứ tự */}
          <div className={aiAssistantOpen ? 'flex items-center gap-3' : 'text-center'}>
            <div className={`bg-blue-100 rounded-full flex items-center justify-center shadow-lg ${
              aiAssistantOpen ? 'w-16 h-16' : 'w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4'
            }`}>
              <User className={aiAssistantOpen ? 'w-8 h-8 text-blue-600' : 'w-12 h-12 lg:w-16 lg:h-16 text-blue-600'} />
            </div>
            {aiAssistantOpen && (
              <div className="flex-1">
                <div className="text-2xl font-bold text-blue-600">
                  {currentPatient.queueNumber}
                </div>
                <div className="text-base font-bold text-slate-800 truncate">
                  {currentPatient.fullName}
                </div>
              </div>
            )}
          </div>

          {/* Tên và số (khi AI tắt) */}
          {!aiAssistantOpen && (
            <>
              <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                {currentPatient.queueNumber}
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800">
                {currentPatient.fullName}
              </h2>
            </>
          )}

          {/* Thông tin cơ bản */}
          <div className={`space-y-1.5 text-slate-600 ${
            aiAssistantOpen ? 'text-xs' : 'mt-4'
          }`}>
            <div className={`flex items-center gap-2 ${aiAssistantOpen ? 'justify-start' : 'justify-center'}`}>
              <Calendar className={aiAssistantOpen ? 'w-3.5 h-3.5 text-blue-600' : 'w-5 h-5 text-blue-600'} />
              <span className={aiAssistantOpen ? 'text-xs' : 'text-sm lg:text-base'}>
                {currentPatient.gender} • {currentPatient.age} tuổi
              </span>
            </div>
            <div className={`flex items-center gap-2 ${aiAssistantOpen ? 'justify-start' : 'justify-center'}`}>
              <Clock className={aiAssistantOpen ? 'w-3.5 h-3.5 text-blue-600' : 'w-5 h-5 text-blue-600'} />
              <span className={aiAssistantOpen ? 'text-xs' : 'text-sm lg:text-base'}>
                Vào lúc: {currentPatient.checkInTime}
              </span>
            </div>
          </div>

          {/* Triệu chứng */}
          <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-sm ${
            aiAssistantOpen ? 'mt-2 p-2' : 'mt-6 p-4 lg:p-5'
          }`}>
            <div className={`flex items-start ${aiAssistantOpen ? 'gap-1.5' : 'gap-3'}`}>
              <div className={`bg-amber-200 rounded-lg flex-shrink-0 ${
                aiAssistantOpen ? 'p-1.5' : 'p-2.5'
              }`}>
                <FileText className={aiAssistantOpen ? 'w-4 h-4 text-amber-800' : 'w-6 h-6 lg:w-7 lg:h-7 text-amber-800'} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-amber-900 mb-1 ${
                  aiAssistantOpen ? 'text-xs' : 'text-base lg:text-lg'
                }`}>
                  Triệu chứng
                </h3>
                <div className={`bg-white rounded-lg border border-amber-200 text-slate-800 leading-relaxed whitespace-pre-wrap ${
                  aiAssistantOpen 
                    ? 'p-2 min-h-12 text-xs' 
                    : 'p-3 lg:p-4 min-h-20 lg:min-h-28 text-sm lg:text-base'
                }`}>
                  {currentPatient.notes?.trim() || (
                    <span className="text-slate-400 italic">
                      Chưa có ghi chú
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hàng đợi */}
      <div className={`flex-1 overflow-y-auto ${
        aiAssistantOpen ? 'p-2.5 lg:p-3' : 'p-4 lg:p-6'
      }`}>
        <h3 className={`font-bold text-slate-700 flex items-center gap-1.5 ${
          aiAssistantOpen ? 'text-sm mb-2' : 'text-lg lg:text-xl mb-4'
        }`}>
          <Clock className={aiAssistantOpen ? 'w-3.5 h-3.5 text-blue-600' : 'w-5 h-5 lg:w-6 lg:h-6 text-blue-600'} />
          Hàng đợi ({waitingQueue.length})
        </h3>
        {waitingQueue.length === 0 ? (
          <p className={`text-center text-slate-500 ${
            aiAssistantOpen ? 'py-4 text-xs' : 'py-8 text-sm lg:text-base'
          }`}>
            Không còn bệnh nhân
          </p>
        ) : (
          <div className={aiAssistantOpen ? 'space-y-1.5' : 'space-y-3'}>
            {waitingQueue.map((p, i) => (
              <div 
                key={p.queueId} 
                className={`bg-blue-50 rounded-lg hover:bg-blue-100 transition-all ${
                  aiAssistantOpen ? 'p-2' : 'p-4'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-blue-600 ${
                      aiAssistantOpen ? 'text-xs' : 'text-base lg:text-lg'
                    }`}>
                      {p.queueNumber}
                    </div>
                    <div className={`truncate ${aiAssistantOpen ? 'text-xs text-slate-700' : 'text-sm text-slate-700'}`}>
                      {p.patientName}
                    </div>
                  </div>
                  {i === 0 && (
                    <span className={`bg-blue-600 text-white rounded-full font-bold flex-shrink-0 ${
                      aiAssistantOpen ? 'px-1.5 py-0.5 text-xs ml-2' : 'px-3 py-1 text-xs'
                    }`}>
                      Tiếp
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}