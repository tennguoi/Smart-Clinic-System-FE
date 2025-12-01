import { Check } from 'lucide-react';
import { entServices, getCategoryLabel, formatPrice } from '../data/services';
import Footer from '../components/Footer';

export default function PricingPage() {
  const packages = entServices.filter(s => s.category === 'goi-kham');

  return (
    <div className="pt-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Bảng Giá & Gói Khám
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Giá dịch vụ minh bạch, chi phí hợp lý
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Các Gói Khám Tổng Hợp
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all"
            >
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-blue-100">{pkg.description}</p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(pkg.price)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/ lần</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">Thời gian: {pkg.duration} phút</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Bảng Giá Dịch Vụ
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Dịch Vụ
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Loại Dịch Vụ
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Thời Gian
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Giá
                </th>
              </tr>
            </thead>
            <tbody>
              {entServices.map((service) => (
                <tr key={service.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                      {getCategoryLabel(service.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                    {service.duration} phút
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                      {formatPrice(service.price)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center border border-green-100 dark:border-gray-600">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Giá Cạnh Tranh</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Giá dịch vụ cộng tác với các phòng khám hàng đầu</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center border border-blue-100 dark:border-gray-600">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Minh Bạch</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Không phí ẩn, hóa đơn rõ ràng cho mỗi dịch vụ</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center border border-purple-100 dark:border-gray-600">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Gói Ưu Đãi</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Giảm giá cho khám định kỳ và gia đình</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}