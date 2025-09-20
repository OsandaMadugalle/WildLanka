import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { publicGalleryApi } from '../services/publicGalleryApi';



const GalleryPage = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    publicGalleryApi.getApprovedImages()
      .then((data) => {
        if (data.success && Array.isArray(data.images)) {
          setImages(data.images);
        } else {
          setError(data.message || 'Failed to load images');
        }
      })
      .catch(() => setError('Error loading images'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900">
      <Header />
      <div className="pt-24 md:pt-32 pb-10 md:pb-16">
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16 px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-abeze font-bold text-white mb-2 md:mb-4 break-words">
              {(() => {
                const title = t('gallery.title');
                const [first, ...rest] = title.split(' ');
                return <>{first} <span className="text-green-400">{rest.join(' ')}</span></>;
              })()}
            </h1>
            <p className="text-green-200 font-abeze text-base sm:text-lg max-w-2xl md:max-w-3xl mx-auto">
              {t('gallery.subtitle')}
            </p>
          </div>
          {loading && <div className="text-slate-300 text-center">Loading images...</div>}
          {error && <div className="text-red-400 text-center mb-4">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div key={img._id} className="bg-gradient-to-br from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center border border-green-400/30 cursor-pointer hover:shadow-lg hover:shadow-green-400/30 transition" onClick={() => setModalImage(img)}>
                {img.imageUrl ? (
                  <img src={img.imageUrl} alt={img.title || 'Gallery Image'} className="object-cover w-full h-48 rounded mb-2" />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-green-800/30 text-green-300 rounded mb-2">
                    <span className="text-green-300">No image</span>
                  </div>
                )}
                {img.price && <div className="text-red-500 font-bold text-lg bg-white/10 px-3 py-1 rounded-full">Price: ${img.price}</div>}
              </div>
            ))}
          </div>
          {images.length === 0 && !loading && !error && (
            <div className="text-slate-400 text-center mt-8">No approved images found.</div>
          )}
        </div>
      </div>
      {/* Modal for image preview */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-gradient-to-br from-gray-900/95 via-green-950/90 to-gray-900/95 backdrop-blur-md p-4 pt-8 pb-8 overflow-y-auto" onClick={() => setModalImage(null)}>
          <div className="bg-gradient-to-br from-green-600/20 to-green-400/20 backdrop-blur-md rounded-xl p-6 relative max-w-4xl w-full flex flex-col items-center border border-green-400/30 shadow-2xl mt-16 mb-16" onClick={e => e.stopPropagation()}>
            <img src={modalImage.imageUrl} alt={modalImage.title || 'Gallery Image'} className="max-h-[50vh] w-auto max-w-full rounded-lg shadow-lg object-contain" />
            <div className="text-white mt-4 font-abeze font-bold text-center text-lg max-w-2xl leading-relaxed">{modalImage.title || 'Gallery Image'}</div>
            {modalImage.price && (
              <div className="text-red-500 font-bold text-xl bg-white/20 px-4 py-2 rounded-full mt-4 shadow-md">
                Price: ${modalImage.price}
              </div>
            )}
            <button 
              onClick={() => setModalImage(null)} 
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors duration-300 shadow-lg"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default GalleryPage;