import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import BackgroundSlideshow from './BackgroundSlideshow';

const Home = () => {
  const { t } = useLanguage();
  
  return (
    <BackgroundSlideshow>
      <section id="home" className="min-h-screen flex items-center pt-20">
        {/* Content */}
        <div className="w-full px-2 sm:px-4">
          {/* Main Headline - Centered and Full Width */}
          <div className="text-center mb-8 pt-10 w-full">
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-abeze font-black leading-tight text-white break-words">
              <span className="text-green-400">{t('home.discover')}</span>{' '}
              <span className="text-white">{t('home.sriLanka')}</span>
            </h1>
            {/* Subtext */}
            <div className="mt-6 space-y-6">
              <p className="text-green-400 font-abeze-italic font-semibold text-lg sm:text-2xl md:text-3xl lg:text-4xl">
                {t('home.slogan')}
              </p>
              <p className="text-gray-300 text-base sm:text-lg md:text-xl font-abeze font-semibold leading-relaxed max-w-3xl mx-auto px-2">
                {t('home.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Reviews Section removed */}
    </BackgroundSlideshow>
  );
};

export default Home;