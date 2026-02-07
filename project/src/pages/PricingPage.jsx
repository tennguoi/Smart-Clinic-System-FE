import { Check } from 'lucide-react';
import { entServices, getCategoryLabel, formatPrice } from '../data/services';
import Footer from '../components/Footer';

export default function PricingPage() {
  const packages = entServices.filter(s => s.category === 'goi-kham');

  return (
    <div className="pt-20 bg-gradient-to-b from-white via-blue-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 transition-colors duration-300">
      <div className="bg-gradient-to-br from-cyan-50/50 via-blue-50/40 to-teal-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Bảng Giá & Gói Khám
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light">
              Giá dịch vụ minh bạch, chi phí hợp lý
            </p>
            <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 mx-auto rounded-full mt-6"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-16 text-center">
          Các Gói Khám Tổng Hợp
        </h2>

        <div className="grid md:grid-cols-2 gap-10 mb-24">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden hover:border-cyan-400 dark:hover:border-cyan-500 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-105 transform"
            >
              <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 p-8 text-white">
                <h3 className="text-3xl font-bold mb-3">{pkg.name}</h3>
                <p className="text-cyan-100 text-lg">{pkg.description}</p>
              </div>

              <div className="p-8">
                <div className="mb-8">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                    {formatPrice(pkg.price)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-3 text-lg">/ lần</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <Check className="w-6 h-6 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300 text-lg">Thời gian: {pkg.duration} phút</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-16 text-center">
          Bảng Giá Dịch Vụ
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <th className="px-8 py-5 text-left text-base font-bold text-gray-900 dark:text-white">
                  Dịch Vụ
                </th>
                <th className="px-8 py-5 text-left text-base font-bold text-gray-900 dark:text-white">
                  Loại Dịch Vụ
                </th>
                <th className="px-8 py-5 text-center text-base font-bold text-gray-900 dark:text-white">
                  Thời Gian
                </th>
                <th className="px-8 py-5 text-right text-base font-bold text-gray-900 dark:text-white">
                  Giá
                </th>
              </tr>
            </thead>
            <tbody>
              {entServices.map((service) => (
                <tr key={service.id} className="border-t-2 border-gray-200 dark:border-gray-700 hover:bg-cyan-50/30 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="px-8 py-5">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{service.name}</div>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1">{service.description}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                      {getCategoryLabel(service.category)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center text-gray-700 dark:text-gray-300 font-medium">
                    {service.duration} phút
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 text-xl">
                      {formatPrice(service.price)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-10">
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-10 text-center border-2 border-green-200 dark:border-gray-600 hover:shadow-2xl hover:shadow-green-500/20 hover:scale-105 transition-all duration-300 transform">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Giá Cạnh Tranh</h3>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">Giá dịch vụ cộng tác với các phòng khám hàng đầu</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-10 text-center border-2 border-blue-200 dark:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 transform">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Minh Bạch</h3>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">Không phí ẩn, hóa đơn rõ ràng cho mỗi dịch vụ</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-10 text-center border-2 border-purple-200 dark:border-gray-600 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300 transform">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Gói Ưu Đãi</h3>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">Giảm giá cho khám định kỳ và gia đình</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}