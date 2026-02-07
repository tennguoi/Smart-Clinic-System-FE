import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section id="home" className="relative bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-16 pb-8 overflow-hidden transition-colors duration-300">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-300/20 via-blue-200/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200/30 via-teal-100/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-blue-200/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block animate-slide-in-left">
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-full text-base md:text-lg font-semibold shadow-xl shadow-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-105 transform">
                {t('hero.topBadge')}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              {t('hero.titleLine1')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 tracking-wide">
                {t('hero.highlight')}
              </span>
              <br />
              {t('hero.titleLine3')}
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-light">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link
                to="/appointment"
                className="group bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-cyan-700 hover:to-blue-700 transition-all font-semibold text-lg flex items-center justify-center space-x-3 shadow-2xl shadow-cyan-500/50 hover:shadow-3xl hover:shadow-cyan-500/70 hover:scale-105 transform duration-300"
              >
                <span>{t('hero.bookButton')}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>

              <Link
                to="/services"
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-cyan-700 dark:text-cyan-400 px-8 py-4 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all font-semibold text-lg border-2 border-cyan-300 dark:border-cyan-700 hover:border-cyan-500 shadow-lg hover:shadow-xl hover:scale-105 transform duration-300"
              >
                {t('hero.servicesButton')}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-12 border-t-2 border-gray-200/60 dark:border-gray-700/60">
              <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all shadow-md hover:shadow-xl hover:-translate-y-1 transform duration-300 border border-cyan-100/50 dark:border-gray-700/50">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">15+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">{t('hero.stats.years')}</div>
              </div>
              <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all shadow-md hover:shadow-xl hover:-translate-y-1 transform duration-300 border border-cyan-100/50 dark:border-gray-700/50">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">50K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">{t('hero.stats.patients')}</div>
              </div>
              <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all shadow-md hover:shadow-xl hover:-translate-y-1 transform duration-300 border border-cyan-100/50 dark:border-gray-700/50">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">{t('hero.stats.satisfaction')}</div>
              </div>
            </div>
          </div>

          {/* Image + Certificate Badge */}
          <div className="relative animate-fade-in">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white/50 dark:ring-gray-700/50 hover:ring-cyan-500/30 transition-all duration-300">
              <img
                src="https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt={t('hero.imageAlt')}
                className="w-full h-[550px] object-cover hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 via-transparent to-transparent"></div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-7 max-w-xs border-4 border-cyan-100 dark:border-gray-700 hover:shadow-cyan-500/30 transition-all hover:scale-105 transform duration-300">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-3xl text-white">✓</span>
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">{t('hero.certificate.title')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('hero.certificate.by')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}