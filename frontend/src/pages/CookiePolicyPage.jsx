import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const CookiePolicyPage = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="App">
      <Header />
      <div className="min-h-screen bg-gray-900 pt-24 pb-12 transition-colors duration-500">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="relative bg-gradient-to-br from-green-200/90 via-green-100/90 to-green-50/90 dark:from-green-900/90 dark:via-green-950/80 dark:to-green-900/90 rounded-3xl shadow-2xl border border-green-700/70 p-8 mt-16" style={{animation: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)'}}>
            {/* Decorative Icon */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-700 dark:to-green-900 rounded-full shadow-lg border-4 border-white dark:border-green-950 z-10">
              <svg className="w-10 h-10 text-white dark:text-green-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <div className="flex flex-col items-center mb-8 mt-12">
              <h1 className="text-4xl font-abeze font-bold text-green-900 dark:text-green-100 drop-shadow-lg tracking-tight">
                {t('cookiePolicy.title')}
              </h1>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="mb-6 text-gray-900 dark:text-green-100">
                {t('cookiePolicy.intro')}
              </p>
              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('cookiePolicy.section1')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('cookiePolicy.section1.desc')}
                </p>
              </section>
              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('cookiePolicy.section2')}
                </h2>
                <ul className="list-disc pl-6 mb-4 text-gray-900 dark:text-green-100">
                  <li><strong>{t('cookiePolicy.section2.essential.title')}</strong> {t('cookiePolicy.section2.essential.desc')}</li>
                  <li><strong>{t('cookiePolicy.section2.analytics.title')}</strong> {t('cookiePolicy.section2.analytics.desc')}</li>
                  <li><strong>{t('cookiePolicy.section2.preference.title')}</strong> {t('cookiePolicy.section2.preference.desc')}</li>
                  <li><strong>{t('cookiePolicy.section2.marketing.title')}</strong> {t('cookiePolicy.section2.marketing.desc')}</li>
                </ul>
              </section>
              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('cookiePolicy.section3')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('cookiePolicy.section3.desc')}
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-900 dark:text-green-100">
                  <li>{t('cookiePolicy.section3.list.1')}</li>
                  <li>{t('cookiePolicy.section3.list.2')}</li>
                  <li>{t('cookiePolicy.section3.list.3')}</li>
                  <li>{t('cookiePolicy.section3.list.4')}</li>
                </ul>
              </section>
              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('cookiePolicy.section4')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('cookiePolicy.section4.desc')}
                </p>
              </section>
              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('cookiePolicy.section5')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('cookiePolicy.section5.desc')}
                </p>
              </section>
              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('cookiePolicy.section6')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('cookiePolicy.section6.desc')}
                </p>
              </section>
              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('cookiePolicy.section7')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('cookiePolicy.section7.desc')}
                </p>
                <div className="bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-green-100">
                    <strong className="text-green-900 dark:text-green-200">{t('cookiePolicy.section7.email', 'Email')}:</strong> <a href="mailto:info@wildlankasafari.com" className="hover:underline hover:text-green-700 dark:hover:text-green-300 transition-colors">info@wildlankasafari.com</a><br />
                    <strong className="text-green-900 dark:text-green-200">{t('cookiePolicy.section7.phone', 'Phone')}:</strong> <a href="tel:+94711234567" className="hover:underline hover:text-green-700 dark:hover:text-green-300 transition-colors">+94 71 123 4567</a><br />
                    <strong className="text-green-900 dark:text-green-200">{t('cookiePolicy.section7.address', 'Address')}:</strong> 123 Safari Road, Yala, Sri Lanka
                  </p>
                </div>
              </section>
              <p className="mb-6 text-gray-900 dark:text-green-100">
                <strong className="text-green-900 dark:text-green-200">{t('cookiePolicy.lastUpdated', 'Last updated:')}</strong> 16 September 2025
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicyPage;
