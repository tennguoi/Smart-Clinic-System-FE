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
    <section className="py-12 bg-gradient-to-b from-white to-cyan-50/30 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề phần (nếu muốn có) */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('values.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-cyan-500/20 border border-gray-100 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-500 transform hover:-translate-y-2"
            >
              <div
                className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${gradientColors[index]} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <value.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}