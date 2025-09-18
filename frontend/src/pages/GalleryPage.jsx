import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';


const GalleryPage = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
  <div className="pt-24 md:pt-32 pb-10 md:pb-16">
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16 px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-abeze font-bold text-white mb-2 md:mb-4 break-words">
              Safari <span className="text-green-400">Gallery</span>
            </h1>
            <p className="text-green-200 font-abeze text-base sm:text-lg max-w-2xl md:max-w-3xl mx-auto">
              {t('gallery.subtitle')}
            </p>
          </div>
          {/* Gallery content will be implemented later */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GalleryPage;