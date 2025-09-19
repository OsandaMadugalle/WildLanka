import React from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const faqs = [
  {
    question: 'faq.q1',
    answer: 'faq.a1',
  },
  {
    question: 'faq.q2',
    answer: 'faq.a2',
  },
  {
    question: 'faq.q3',
    answer: 'faq.a3',
  },
  {
    question: 'faq.q4',
    answer: 'faq.a4',
  },
  {
    question: 'faq.q5',
    answer: 'faq.a5',
  },
  {
    question: 'faq.q6',
    answer: 'faq.a6',
  },
  {
    question: 'faq.q7',
    answer: 'faq.a7',
  },
  {
    question: 'faq.q8',
    answer: 'faq.a8',
  },
];

const FAQPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 pt-24 md:pt-32">
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16 px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-abeze font-bold text-white mb-2 md:mb-4 break-words">
              {t('faq.title', 'Frequently Asked Questions')}
            </h1>
            <p className="text-green-200 font-abeze text-base sm:text-lg max-w-2xl md:max-w-3xl mx-auto">
              {t('faq.description', 'Find answers to the most common questions about our safaris, bookings, and services.')}
            </p>
          </div>
          <div className="max-w-3xl mx-auto grid gap-8 md:gap-10 pb-10">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-lg transition-transform hover:scale-[1.02] hover:shadow-2xl"
              >
                <h2 className="font-semibold text-lg md:text-xl text-green-300 mb-2 font-abeze">{t(faq.question)}</h2>
                <p className="text-gray-200 font-abeze text-base md:text-lg leading-relaxed">{t(faq.answer)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQPage;
