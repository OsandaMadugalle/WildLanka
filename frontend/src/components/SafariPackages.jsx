import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SafariPackages = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navigateToTravelPackages = () => {
    navigate('/travel-packages');
  };

  return (
    <section id="safaris" className="py-20 bg-gradient-to-br from-gray-900 via-green-950 to-gray-900">
      <div className="container mx-auto px-6">

        {/* See More Packages Link */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30">
            <h3 className="text-2xl font-abeze font-bold text-white mb-4">
              {t('safariPackages.exploreCollection')}
            </h3>
            <p className="text-gray-300 font-abeze mb-6 max-w-2xl mx-auto">
              {t('safariPackages.discoverMore')}
            </p>
            <button 
              onClick={navigateToTravelPackages}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-abeze font-bold transition-colors duration-300"
            >
              {t('safariPackages.seeAllPackages')}
            </button>
          </div>
        </div>


      </div>
    </section>
  );
};

export default SafariPackages; 