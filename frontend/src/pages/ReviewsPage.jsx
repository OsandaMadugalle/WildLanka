import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { reviewApi } from '../services/api';
import React, { useEffect, useState } from 'react';

const ReviewsPage = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (!selectedReview) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      else if (e.key === 'ArrowLeft') prevImage();
      else if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedReview, currentIndex]);

  const loadReviews = async () => {
    try {
      const response = await reviewApi.getPublicReviews();
      if (response.reviews) setReviews(response.reviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayedReviews = [...(reviews || [])].sort((a, b) => {
    if (filter === 'recent' || filter === 'all') return new Date(b.createdAt) - new Date(a.createdAt);
    if (filter === 'popular') {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  const openModal = (review, startIndex = 0) => {
    setSelectedReview(review);
    setCurrentIndex(startIndex);
  };
  const closeModal = () => { setSelectedReview(null); setCurrentIndex(0); };
  const nextImage = () => { if (!selectedReview) return; setCurrentIndex((prev) => (prev + 1) % selectedReview.images.length); };
  const prevImage = () => { if (!selectedReview) return; setCurrentIndex((prev) => (prev - 1 + selectedReview.images.length) % selectedReview.images.length); };
  const getUserName = (review) => {
    const first = review.userId?.firstName;
    const last = review.userId?.lastName;
    return first && last ? `${first} ${last}` : 'Anonymous';
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900">
      <Header />
  <div className="pt-24 md:pt-32 pb-10 md:pb-16">
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16 px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-abeze font-bold text-white mb-2 md:mb-4 break-words">
              {(() => {
                const title = t('nav.reviews') || 'Customer Reviews';
                const [first, ...rest] = title.split(' ');
                return <>{first} <span className="text-green-400">{rest.join(' ')}</span></>;
              })()}
            </h1>
            <p className="text-green-200 font-abeze text-base sm:text-lg max-w-2xl md:max-w-3xl mx-auto">
              {t('reviews.subtitle') || 'See what our guests say about their experiences with WildLanka'}
            </p>
          </div>
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 sm:p-2 border border-white/20">
              <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${filter === 'all' ? 'bg-green-600 text-white' : 'text-green-200 hover:text-white hover:bg-white/10'}`}>{t('gallery.filters.all') || 'All'}</button>
              <button onClick={() => setFilter('recent')} className={`px-6 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${filter === 'recent' ? 'bg-green-600 text-white' : 'text-green-200 hover:text-white hover:bg-white/10'}`}>{t('gallery.filters.recent') || 'Recent'}</button>
              <button onClick={() => setFilter('popular')} className={`px-6 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${filter === 'popular' ? 'bg-green-600 text-white' : 'text-green-200 hover:text-white hover:bg-white/10'}`}>{t('gallery.filters.topRated') !== 'gallery.filters.topRated' ? t('gallery.filters.topRated') : 'Top Rated'}</button>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-green-200 font-abeze text-lg">{t('gallery.loading') || 'Loading reviews...'}</p>
            </div>
          ) : displayedReviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-abeze font-bold text-white mb-2">{t('gallery.noReviews') || 'No reviews yet.'}</h3>
              <p className="text-gray-300 font-abeze">{t('gallery.beFirst') || 'Be the first to leave a review!'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedReviews.map((review) => (
                <div key={review._id} className="bg-gradient-to-br from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-xl p-4 flex flex-col border border-green-400/30 cursor-pointer hover:shadow-xl hover:shadow-green-400/20 hover:scale-105 transition-all duration-300" onClick={() => openModal(review, 0)}>
                  {review.images && review.images.length > 0 ? (
                    <img src={review.images[0].url} alt={`Review by ${getUserName(review)}`} className="object-cover w-full h-48 rounded-lg mb-3 shadow-md" />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-green-800/30 text-green-300 rounded-lg mb-3 shadow-md">
                      <span className="text-green-300">No image</span>
                    </div>
                  )}
                  <div className="flex-1 flex flex-col">
                    <div className="font-bold text-white text-center text-lg mb-2 font-abeze">{review.packageTitle || review.packageId?.title || 'Safari Package'}</div>
                    <div className="flex items-center justify-center mb-3">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 rounded-full flex items-center space-x-1 shadow-md">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'text-white fill-current' : 'text-amber-200/50'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                        <span className="text-white text-sm ml-2 font-bold">{review.rating}/5</span>
                      </div>
                    </div>
                    <div className="text-green-200 text-sm text-center font-abeze bg-green-800/20 px-3 py-1 rounded-full">By: {getUserName(review)}</div>
                  </div>
                  {review.images && review.images.length > 1 && (
                    <div className="text-slate-400 text-xs text-center mt-1">{review.images.length} photos</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {displayedReviews.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-gray-300 font-abeze">
                {`Showing ${displayedReviews.length} reviews with photos`}
              </p>
            </div>
          )}
        </div>
      </div>
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-gradient-to-br from-gray-900/95 via-green-950/90 to-gray-900/95 backdrop-blur-md p-4 pt-8 pb-8 overflow-y-auto" onClick={closeModal}>
          <div className="bg-gradient-to-br from-green-600/20 to-green-400/20 backdrop-blur-md rounded-2xl p-8 relative max-w-4xl w-full flex flex-col items-center border border-green-400/30 shadow-2xl mt-16 mb-16" onClick={e => e.stopPropagation()}>
            {selectedReview.images && selectedReview.images.length > 0 && (
              <div className="relative group">
                <img src={selectedReview.images[currentIndex].url} alt={`Review by ${getUserName(selectedReview)}`} className="max-h-[50vh] w-auto max-w-full rounded-xl shadow-2xl object-contain" />
                
                {/* Navigation buttons positioned near the image */}
                {selectedReview.images.length > 1 && (
                  <>
                    {/* Previous button - left side */}
                    <button 
                      onClick={prevImage} 
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 shadow-lg opacity-70 hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Next button - right side */}
                    <button 
                      onClick={nextImage} 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 shadow-lg opacity-70 hover:opacity-100"
                      aria-label="Next image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {/* Image counter - bottom center */}
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-abeze">
                      {currentIndex + 1} of {selectedReview.images.length}
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="text-white mt-6 font-abeze font-bold text-center text-2xl">{selectedReview.packageTitle || selectedReview.packageId?.title || 'Safari Package'}</div>
            <div className="flex items-center justify-center mt-4">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < selectedReview.rating ? 'text-white fill-current' : 'text-amber-200/50'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
                <span className="text-white font-abeze ml-3 text-lg font-bold">{selectedReview.rating}/5 Rating</span>
              </div>
            </div>
            <div className="mt-4 bg-green-800/30 px-4 py-2 rounded-lg">
              <div className="text-green-200 text-base text-center font-abeze">Reviewed by: <span className="font-bold text-green-100">{getUserName(selectedReview)}</span></div>
            </div>
            {selectedReview.comment && (
              <div className="mt-6 bg-white/5 p-4 rounded-xl border border-green-400/20">
                <div className="text-gray-200 text-lg text-center italic max-w-2xl font-abeze leading-relaxed">"{selectedReview.comment}"</div>
              </div>
            )}
            <button 
              onClick={closeModal} 
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

export default ReviewsPage;
