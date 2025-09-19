import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const TermsOfServicePage = () => {
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
                {t('footer.policies.terms', 'Terms of Service')}
              </h1>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="mb-6 text-gray-900 dark:text-green-100 text-center">
                <strong className="text-green-900 dark:text-green-200">{t('privacyPolicy.lastUpdated', 'Last updated:')}</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('terms.acceptance.title', '1. Acceptance of Terms')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('terms.acceptance.desc', "By accessing and using Wild Path Safari's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.")}
                </p>
              </section>
              <hr className="my-8 border-green-200 dark:border-green-800" />

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('terms.description.title', '2. Description of Service')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('terms.description.desc', 'Wild Path Safari provides wildlife safari experiences, tour packages, and related services in Sri Lanka. Our services include:')}
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-900 dark:text-green-100">
                  <li>{t('terms.description.list.1', 'Safari tour bookings and reservations')}</li>
                  <li>{t('terms.description.list.2', 'Wildlife photography tours')}</li>
                  <li>{t('terms.description.list.3', 'Educational wildlife experiences')}</li>
                  <li>{t('terms.description.list.4', 'Transportation and accommodation arrangements')}</li>
                  <li>{t('terms.description.list.5', 'Professional tour guide services')}</li>
                </ul>
              </section>
              <hr className="my-8 border-green-200 dark:border-green-800" />

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('terms.booking.title', '3. Booking and Payment Terms')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-abeze font-semibold text-green-600 dark:text-green-300 mb-2">{t('terms.booking.reservations.title', '3.1 Reservations')}</h3>
                    <p className="text-gray-900 dark:text-green-100">
                      {t('terms.booking.reservations.desc', 'All bookings are subject to availability. We recommend booking at least 2 weeks in advance for peak season tours.')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-abeze font-semibold text-green-600 dark:text-green-300 mb-2">{t('terms.booking.payment.title', '3.2 Payment')}</h3>
                    <p className="text-gray-900 dark:text-green-100">
                      {t('terms.booking.payment.desc', 'Full payment is required at the time of booking. We accept major credit cards and bank transfers.')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-abeze font-semibold text-green-600 dark:text-green-300 mb-2">{t('terms.booking.pricing.title', '3.3 Pricing')}</h3>
                    <p className="text-gray-900 dark:text-green-100">
                      {t('terms.booking.pricing.desc', 'All prices are quoted in Sri Lankan Rupees (LKR) and include applicable taxes. Prices are subject to change without notice.')}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('terms.cancellation.title', '4. Cancellation and Refund Policy')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-abeze font-semibold text-green-600 dark:text-green-300 mb-2">{t('terms.cancellation.customer.title', '4.1 Cancellation by Customer')}</h3>
                    <ul className="list-disc pl-6 text-gray-900 dark:text-green-100">
                      <li>{t('terms.cancellation.customer.list.1', 'More than 7 days before tour: 90% refund')}</li>
                      <li>{t('terms.cancellation.customer.list.2', '3-7 days before tour: 50% refund')}</li>
                      <li>{t('terms.cancellation.customer.list.3', 'Less than 3 days before tour: No refund')}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-abeze font-semibold text-green-600 dark:text-green-300 mb-2">{t('terms.cancellation.company.title', '4.2 Cancellation by Company')}</h3>
                    <p className="text-gray-900 dark:text-green-100">
                      {t('terms.cancellation.company.desc', 'We reserve the right to cancel tours due to weather conditions, safety concerns, or insufficient bookings. Full refunds will be provided in such cases.')}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('terms.safety.title', '5. Safety and Conduct')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-abeze font-semibold text-green-600 dark:text-green-300 mb-2">{t('terms.safety.guidelines.title', '5.1 Safety Guidelines')}</h3>
                    <p className="text-gray-900 dark:text-green-100">
                      {t('terms.safety.guidelines.desc', 'All participants must follow safety instructions provided by our guides. Failure to comply may result in removal from the tour without refund.')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-abeze font-semibold text-green-600 dark:text-green-300 mb-2">{t('terms.safety.age.title', '5.2 Age Restrictions')}</h3>
                    <p className="text-gray-900 dark:text-green-100">
                      {t('terms.safety.age.desc', 'Children under 5 years are not permitted on safari tours. Children 5-12 years must be accompanied by an adult.')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-abeze font-semibold text-green-600 dark:text-green-300 mb-2">{t('terms.safety.health.title', '5.3 Health Requirements')}</h3>
                    <p className="text-gray-900 dark:text-green-100">
                      {t('terms.safety.health.desc', 'Participants should be in good health. Please inform us of any medical conditions that may affect your participation.')}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('terms.liability.title', '6. Liability and Insurance')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('terms.liability.desc', 'Wild Path Safari maintains comprehensive insurance coverage. However, we are not liable for:')}
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-900 dark:text-green-100">
                  <li>{t('terms.liability.list.1', 'Personal injury due to participant negligence')}</li>
                  <li>{t('terms.liability.list.2', 'Loss or damage of personal belongings')}</li>
                  <li>{t('terms.liability.list.3', 'Delays due to weather or natural events')}</li>
                  <li>{t('terms.liability.list.4', 'Changes in wildlife behavior or sightings')}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('terms.privacy.title', '7. Privacy and Data Protection')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('terms.privacy.desc', 'Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('terms.intellectual.title', '8. Intellectual Property')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('terms.intellectual.desc', 'All content on this website, including text, images, and logos, is the property of Wild Path Safari and is protected by copyright laws.')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('terms.modifications.title', '9. Modifications to Terms')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('terms.modifications.desc', 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website.')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-abeze font-semibold text-green-900 dark:text-green-100 mb-4 border-b border-green-200 dark:border-green-800 pb-2">
                  {t('terms.contact.title', '10. Contact Information')}
                </h2>
                <p className="mb-4 text-gray-900 dark:text-green-100">
                  {t('terms.contact.desc', 'For questions about these terms, please contact us:')}
                </p>
                <div className="bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-green-100">
                    <strong className="text-green-900 dark:text-green-200">{t('terms.contact.email', 'Email:')}</strong> <a href="mailto:legal@wildlankasafari.com" className="hover:underline hover:text-green-700 dark:hover:text-green-300 transition-colors">legal@wildlankasafari.com</a><br />
                    <strong className="text-green-900 dark:text-green-200">{t('terms.contact.phone', 'Phone:')}</strong> <a href="tel:+94112345678" className="hover:underline hover:text-green-700 dark:hover:text-green-300 transition-colors">+94 11 234 5678</a><br />
                    <strong className="text-green-900 dark:text-green-200">{t('terms.contact.address', 'Address:')}</strong> 123 Safari Road, Colombo, Sri Lanka
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

export default TermsOfServicePage;
