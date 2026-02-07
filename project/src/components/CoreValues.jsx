import { Award, Microscope, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CoreValues() {
  const { t } = useTranslation();

  const values = [
    {
      icon: Award,
      title: t('values.professional'),
      description: t('values.professionalDesc')
    },
    {
      icon: Microscope,
      title: t('values.modern'),
      description: t('values.modernDesc')
    },
    {
      icon: Heart,
      title: t('values.caring'),
      description: t('values.caringDesc')
    }
  ];

  const gradientColors = [
    'from-cyan-600 to-blue-500',
    'from-purple-600 to-indigo-500',
    'from-pink-600 to-rose-500',
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-cyan-50/30 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề phần */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('values.title')}
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {values.map((value, index) => (
            <div
              key={index}
              className="group text-center p-10 rounded-3xl bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/30 border-2 border-gray-100 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 transform hover:-translate-y-3 hover:scale-105"
            >
              <div
                className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${gradientColors[index]} rounded-3xl mb-8 shadow-xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-500`}
              >
                <value.icon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}