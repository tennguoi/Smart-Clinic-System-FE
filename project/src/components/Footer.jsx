import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useClinic } from '../contexts/ClinicContext';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const { clinicInfo } = useClinic();

  const clinicName = clinicInfo?.name?.trim() || t('header.defaultName');
  const clinicAddress = clinicInfo?.address?.trim() || '';
  const clinicPhone = clinicInfo?.phone?.trim() || '';
  const clinicEmail = clinicInfo?.email?.trim() || '';
  const baseLogoUrl = clinicInfo?.logoUrl?.trim() || '';
  const cacheBuster = clinicInfo?.updatedAt ? new Date(clinicInfo.updatedAt).getTime() : Date.now();
  const clinicLogoUrl = baseLogoUrl ? `${baseLogoUrl}?v=${cacheBuster}` : '';

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">

          {/* Cột 1: Logo & Giới thiệu */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              {clinicLogoUrl ? (
                <img
                  key={clinicLogoUrl}
                  src={clinicLogoUrl}
                  alt={clinicName}
                  className="w-10 h-10 object-contain rounded"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-medium">
                  {clinicName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-white font-bold text-lg">{clinicName}</span>
            </div>

            <p className="text-sm mb-4 text-gray-400">
              {t('footer.updateInfo')}
            </p>

            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                 className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                 className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Cột 2: Dịch vụ */}
          <div>
            <h3 className="text-white font-bold mb-4">{t('footer.servicesTitle')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="hover:text-blue-400 transition-colors">{t('footer.serviceEntConsultation')}</a></li>
              <li><a href="#services" className="hover:text-blue-400 transition-colors">{t('footer.serviceEndoscopy')}</a></li>
              <li><a href="#services" className="hover:text-blue-400 transition-colors">{t('footer.serviceProcedures')}</a></li>
            </ul>
          </div>

          {/* Cột 3: Về chúng tôi */}
          <div>
            <h3 className="text-white font-bold mb-4">{t('footer.aboutTitle')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#doctors" className="hover:text-blue-400 transition-colors">{t('footer.doctorsTeam')}</a></li>
              <li><a href="#testimonials" className="hover:text-blue-400 transition-colors">{t('footer.patientReviews')}</a></li>
              <li><a href="/news" className="hover:text-blue-400 transition-colors">{t('footer.news')}</a></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="text-white font-bold mb-4">{t('footer.contactTitle')}</h3>
            <ul className="space-y-3 text-sm">
              {clinicAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{clinicAddress}</span>
                </li>
              )}
              {clinicPhone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href={`tel:${clinicPhone.replace(/\s/g, '')}`} className="hover:text-blue-400">
                    {clinicPhone}
                  </a>
                </li>
              )}
              {clinicEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href={`mailto:${clinicEmail}`} className="hover:text-blue-400">
                    {clinicEmail}
                  </a>
                </li>
              )}
              {clinicInfo?.website && (
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={clinicInfo.website.startsWith('http') ? clinicInfo.website : `https://${clinicInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 truncate block max-w-[200px]"
                  >
                    {clinicInfo.website.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>
              © {currentYear} {clinicName}. {t('footer.rights')}
            </p>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-blue-400 transition-colors">
                {t('footer.privacyPolicy')}
              </a>
              <a href="/terms" className="hover:text-blue-400 transition-colors">
                {t('footer.termsOfService')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}