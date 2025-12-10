
// ServiceSelection.jsx
import { Search, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/helpers';
import { useTheme } from '../../contexts/ThemeContext';

export default function ServiceSelection({
  services,
  selectedServices,
  searchQuery,
  onSearchChange,
  onToggleService,
  loadingServices,
  aiAssistantOpen,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalAmount = selectedServices.reduce(
    (sum, srv) => sum + srv.price * srv.quantity,
    0
  );

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={t('serviceSelection.searchPlaceholder')}
          className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-4 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50'
              : 'bg-white border-blue-200 focus:ring-blue-100'
          }`}
        />
      </div>

      {/* Selected services summary */}
      {selectedServices.length > 0 && (
        <div
          className={`p-6 rounded-xl border mb-6 ${
            theme === 'dark'
              ? 'bg-blue-900/20 border-blue-800'
              : 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200'
          }`}
        >
          <h3
            className={`font-bold text-lg mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t('serviceSelection.selectedTitle', { count: selectedServices.length })}
          </h3>
          <div className="space-y-3">
            {selectedServices.map((s, i) => (
              <div
                key={i}
                className={`flex justify-between items-center p-4 rounded-lg shadow-sm ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div>
                  <div
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {s.name}
                  </div>
                  <div
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
                    }`}
                  >
                    {t('serviceSelection.quantity')}: {s.quantity}
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {formatPrice(s.price * s.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div
            className={`mt-4 pt-4 border-t text-right ${
              theme === 'dark' ? 'border-blue-800' : 'border-blue-200'
            }`}
          >
            <span
              className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
              }`}
            >
              {t('serviceSelection.total')} {formatPrice(totalAmount)}
            </span>
          </div>
        </div>
      )}

      {/* Services list */}
      <div
        className={`max-h-96 overflow-y-auto border rounded-xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'
        }`}
      >
        {loadingServices ? (
          <div className="p-16 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            {t('serviceSelection.noResults')}
          </div>
        ) : (
          filteredServices.map(svc => {
            const selected = selectedServices.some(s => s.id === svc.id);
            return (
              <div
                key={svc.id}
                onClick={() => onToggleService(svc)}
                className={`p-5 cursor-pointer border-b last:border-0 transition-all ${
                  selected
                    ? (theme === 'dark'
                        ? 'bg-blue-900/30 border-l-4 border-l-blue-500 border-b-gray-700'
                        : 'bg-blue-50 border-l-4 border-l-blue-600 border-b-blue-100')
                    : (theme === 'dark'
                        ? 'hover:bg-gray-700 border-gray-700'
                        : 'hover:bg-blue-50 border-blue-100')
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {svc.name}
                    </div>
                    <div
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
                      }`}
                    >
                      {formatPrice(svc.price)}
                    </div>
                  </div>
                  {selected && <Check className="w-7 h-7 text-blue-600" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
