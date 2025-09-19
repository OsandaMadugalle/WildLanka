
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const PrivacyPolicyPage = () => {
  const { t } = useLanguage();

  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v6c0 5.25-3.5 10-7 10s-7-4.75-7-10V6l7-4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="flex flex-col items-center mb-8 mt-12">
              <h1 className="text-4xl font-abeze font-bold text-green-900 dark:text-green-100 drop-shadow-lg tracking-tight">
                {t('footer.policies.privacy')}
              </h1>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="mb-6 text-gray-900 dark:text-green-100">
                <strong className="text-green-900 dark:text-green-200">{t('privacyPolicy.lastUpdated', 'Last updated:')}</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('privacyPolicy.section1', '1. Information We Collect')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('privacyPolicy.section1.desc', 'We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This may include:')}
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-900 dark:text-green-100">
                  <li>{t('privacyPolicy.section1.item1', 'Name, email address, and phone number')}</li>
                  <li>{t('privacyPolicy.section1.item2', 'Payment information (processed securely through our payment partners)')}</li>
                  <li>{t('privacyPolicy.section1.item3', 'Booking preferences and special requests')}</li>
                  <li>{t('privacyPolicy.section1.item4', 'Communication history with our team')}</li>
                </ul>
              </section>
              <hr className="my-8 border-green-200 dark:border-green-800" />

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('privacyPolicy.section2', '2. How We Use Your Information')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('privacyPolicy.section2.desc', 'We use the information we collect to:')}
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-900 dark:text-green-100">
                  <li>{t('privacyPolicy.section2.item1', 'Process and manage your safari bookings')}</li>
                  <li>{t('privacyPolicy.section2.item2', 'Communicate with you about your reservations')}</li>
                  <li>{t('privacyPolicy.section2.item3', 'Provide customer support and respond to inquiries')}</li>
                  <li>{t('privacyPolicy.section2.item4', 'Send you updates about our services (with your consent)')}</li>
                  <li>{t('privacyPolicy.section2.item5', 'Improve our website and services')}</li>
                </ul>
              </section>
              <hr className="my-8 border-green-200 dark:border-green-800" />

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('privacyPolicy.section3', '3. Information Sharing')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('privacyPolicy.section3.desc', 'We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:')}
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-900 dark:text-green-100">
                  <li>{t('privacyPolicy.section3.item1', 'With your explicit consent')}</li>
                  <li>{t('privacyPolicy.section3.item2', 'To comply with legal obligations')}</li>
                  <li>{t('privacyPolicy.section3.item3', 'To protect our rights and safety')}</li>
                  <li>{t('privacyPolicy.section3.item4', 'With trusted service providers who assist in our operations')}</li>
                </ul>
              </section>
              <hr className="my-8 border-green-200 dark:border-green-800" />

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('privacyPolicy.section4', '4. Data Security')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('privacyPolicy.section4.desc', 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4">
                  {t('privacyPolicy.section5', '5. Your Rights')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('privacyPolicy.section5.desc', 'You have the right to:')}
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-900 dark:text-green-100">
                  <li>{t('privacyPolicy.section5.item1', 'Access your personal information')}</li>
                  <li>{t('privacyPolicy.section5.item2', 'Correct inaccurate information')}</li>
                  <li>{t('privacyPolicy.section5.item3', 'Request deletion of your information')}</li>
                  <li>{t('privacyPolicy.section5.item4', 'Opt-out of marketing communications')}</li>
                  <li>{t('privacyPolicy.section5.item5', 'Withdraw consent at any time')}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4">
                  {t('privacyPolicy.section6', '6. Cookies and Tracking')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('privacyPolicy.section6.desc', 'We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and understand where our visitors are coming from. You can control cookie settings through your browser preferences.')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4">
                  {t('privacyPolicy.section7', '7. Changes to This Policy')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('privacyPolicy.section7.desc', 'We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4">
                  {t('privacyPolicy.section8', '8. Contact Us')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('privacyPolicy.section8.desc', 'If you have any questions about this privacy policy or our data practices, please contact us at:')}
                </p>
                <div className="bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-green-100">
                    <strong className="text-green-900 dark:text-green-200">{t('privacyPolicy.section8.email', 'Email')}:</strong> <a href="mailto:privacy@wildlankasafari.com" className="hover:underline hover:text-green-700 dark:hover:text-green-300 transition-colors">privacy@wildlankasafari.com</a><br />
                    <strong className="text-green-900 dark:text-green-200">{t('privacyPolicy.section8.phone', 'Phone')}:</strong> <a href="tel:+94112345678" className="hover:underline hover:text-green-700 dark:hover:text-green-300 transition-colors">+94 11 234 5678</a><br />
                    <strong className="text-green-900 dark:text-green-200">{t('privacyPolicy.section8.address', 'Address')}:</strong> 123 Safari Road, Colombo, Sri Lanka
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
