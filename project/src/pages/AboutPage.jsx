// src/pages/AboutPage.jsx (hoặc đường dẫn bạn đang dùng)
import { Award, Users, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('about.heroTitle')}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('about.heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="ENT Clinic Team"
                  className="w-full h-[480px] object-cover"
                />
              </div>

              {/* Certification Badge */}
              <div className="absolute bottom-6 left-6 bg-white rounded-xl shadow-lg p-4 max-w-xs border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t('about.certifiedBy')}</div>
                    <div className="text-xs text-gray-600">ISO 9001:2015</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {t('about.storyTitle')}
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t('about.story.p1')}</p>
                <p>{t('about.story.p2')}</p>
                <p>{t('about.story.p3')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.mvv.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('about.mvv.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-200 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                {t('about.mission.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">{t('about.mission.desc')}</p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-200 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                {t('about.vision.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">{t('about.vision.desc')}</p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-200 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                {t('about.values.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-900">{t('about.values.core')}</span>{' '}
                {t('about.values.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.whyChoose.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('about.whyChoose.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-cyan-50 rounded-2xl p-8 border border-cyan-100 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-300 hover:bg-cyan-100 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                <Award className="w-7 h-7 text-cyan-600 group-hover:text-cyan-700" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors duration-300">15+</div>
              <div className="text-base font-semibold text-gray-900 mb-3">{t('about.stats.years')}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{t('about.stats.yearsDesc')}</p>
            </div>

            <div className="group bg-cyan-50 rounded-2xl p-8 border border-cyan-100 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-300 hover:bg-cyan-100 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                <Users className="w-7 h-7 text-cyan-600 group-hover:text-cyan-700" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors duration-300">50K+</div>
              <div className="text-base font-semibold text-gray-900 mb-3">{t('about.stats.patients')}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{t('about.stats.patientsDesc')}</p>
            </div>

            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-2xl hover:-translate-y-2 hover:border-green-300 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                <Shield className="w-7 h-7 text-green-600 group-hover:text-green-700" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                <svg className="w-10 h-10 text-green-600 group-hover:text-green-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-base font-semibold text-gray-900 mb-3">{t('about.stats.certified')}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{t('about.stats.certifiedDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How We're Different */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.different.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('about.different.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              'smartSystem',
              'modernEquipment',
              'onlineBooking',
              'followUpCare'
            ].map((key) => (
              <div key={key} className="group flex items-start space-x-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:border-cyan-200 transition-all duration-300 cursor-pointer h-full">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                  <svg className="w-6 h-6 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-cyan-600 transition-colors duration-300">
                    {t(`about.different.features.${key}.title`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {t(`about.different.features.${key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Process Highlights */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {t('about.process.title')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="text-center">
                  <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                    {step}
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">
                    {t(`about.process.step${step}.title`)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t(`about.process.step${step}.desc`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}