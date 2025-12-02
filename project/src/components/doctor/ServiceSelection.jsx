import { Search, Check, Loader2 } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

export default function ServiceSelection({
  services,
  selectedServices,
  searchQuery,
  onSearchChange,
  onToggleService,
  loadingServices,
  aiAssistantOpen
}) {
  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalAmount = selectedServices.reduce(
    (sum, srv) => sum + srv.price * srv.quantity, 
    0
  );

  return (
    <div className={aiAssistantOpen ? 'space-y-4 lg:space-y-5' : 'space-y-6 lg:space-y-8'}>
      {/* Tìm kiếm */}
      <div className="relative bg-white p-2 rounded-2xl shadow-lg border border-blue-200">
        <Search className={`absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 text-slate-400 ${
          aiAssistantOpen ? 'w-4 h-4' : 'w-5 h-5'
        }`} />
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm dịch vụ..."
          className={`w-full border-2 border-transparent rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm lg:text-base transition-all ${
            aiAssistantOpen ? 'pl-10 pr-3 py-2.5' : 'pl-12 pr-4 py-3.5'
          }`}
        />
      </div>

      {/* Dịch vụ đã chọn */}
      {selectedServices.length > 0 && (
        <div className={`bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl border border-blue-200 shadow-lg ${
          aiAssistantOpen ? 'p-3 lg:p-4' : 'p-4 lg:p-6'
        }`}>
          <h3 className={`font-bold flex items-center gap-2 text-slate-800 ${
            aiAssistantOpen ? 'text-sm lg:text-base mb-2 lg:mb-3' : 'text-base lg:text-lg mb-4'
          }`}>
            <Check className="text-blue-600" size={aiAssistantOpen ? 18 : 20} />
            Dịch vụ đã chọn ({selectedServices.length})
          </h3>
          <div className={aiAssistantOpen ? 'space-y-2' : 'space-y-2 lg:space-y-3'}>
            {selectedServices.map((s, i) => (
              <div 
                key={i} 
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white rounded-xl shadow-sm border border-blue-100 ${
                  aiAssistantOpen ? 'p-3' : 'p-4'
                }`}
              >
                <div className="flex-1">
                  <div className={`font-semibold text-slate-800 ${
                    aiAssistantOpen ? 'text-xs lg:text-sm' : 'text-sm lg:text-base'
                  }`}>
                    {s.name}
                  </div>
                  <div className="text-xs text-slate-600">
                    Số lượng: {s.quantity}
                  </div>
                </div>
                <div className={`font-bold text-blue-600 ${
                  aiAssistantOpen ? 'text-sm lg:text-base' : 'text-base lg:text-lg'
                }`}>
                  {formatPrice(s.price * s.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className={`text-right border-t border-blue-200 ${
            aiAssistantOpen ? 'mt-2 pt-2' : 'mt-4 pt-4'
          }`}>
            <span className={`font-bold text-blue-700 ${
              aiAssistantOpen ? 'text-base lg:text-lg' : 'text-xl lg:text-2xl'
            }`}>
              Tổng: {formatPrice(totalAmount)}
            </span>
          </div>
        </div>
      )}

      {/* Danh sách dịch vụ */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
        <div className={`bg-gradient-to-r from-blue-600 to-sky-600 px-4 lg:px-6 ${
          aiAssistantOpen ? 'py-2.5 lg:py-3' : 'py-3 lg:py-4'
        }`}>
          <h3 className={`font-bold text-white ${
            aiAssistantOpen ? 'text-sm lg:text-base' : 'text-base lg:text-lg'
          }`}>
            Danh sách dịch vụ
          </h3>
        </div>
        <div className={aiAssistantOpen ? 'max-h-64 lg:max-h-80 overflow-y-auto' : 'max-h-96 lg:max-h-[500px] overflow-y-auto'}>
          {loadingServices ? (
            <div className={aiAssistantOpen ? 'p-8 text-center' : 'p-12 lg:p-16 text-center'}>
              <Loader2 className={`animate-spin mx-auto text-blue-600 ${
                aiAssistantOpen ? 'w-8 h-8' : 'w-10 h-10 lg:w-12 lg:h-12'
              }`} />
            </div>
          ) : filteredServices.map(svc => {
            const selected = selectedServices.some(s => s.id === svc.id);
            return (
              <div
                key={svc.id}
                onClick={() => onToggleService(svc)}
                className={`cursor-pointer hover:bg-blue-50 border-b border-blue-100 last:border-0 transition-all ${
                  selected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                } ${aiAssistantOpen ? 'p-3 lg:p-4' : 'p-4 lg:p-5'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className={`font-semibold text-slate-900 ${
                      aiAssistantOpen ? 'text-xs lg:text-sm' : 'text-sm lg:text-base'
                    }`}>
                      {svc.name}
                    </div>
                    <div className={`text-slate-600 mt-1 ${
                      aiAssistantOpen ? 'text-xs' : 'text-xs lg:text-sm'
                    }`}>
                      {formatPrice(svc.price)}
                    </div>
                  </div>
                  {selected && (
                    <div className="ml-3">
                      <Check className={`text-blue-600 ${
                        aiAssistantOpen ? 'w-5 h-5' : 'w-6 h-6 lg:w-7 lg:h-7'
                      }`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}