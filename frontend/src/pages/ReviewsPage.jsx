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
                <div key={review._id} className="bg-gradient-to-br from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center border border-green-400/30 cursor-pointer hover:shadow-lg hover:shadow-green-400/30 transition" onClick={() => openModal(review, 0)}>
                  {review.images && review.images.length > 0 ? (
                    <img src={review.images[0].url} alt={`Review by ${getUserName(review)}`} className="object-cover w-full h-48 rounded mb-2" />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-green-800/30 text-green-300 rounded mb-2">
                      <span className="text-green-300">No image</span>
                    </div>
                  )}
                  <div className="font-bold text-white text-center">{review.packageTitle || review.packageId?.title || 'Safari Package'}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-current drop-shadow-sm' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    <span className="text-amber-300 text-sm ml-1 font-bold">{review.rating}/5</span>
                  </div>
                  <div className="text-slate-400 text-xs text-center mt-1">By: {getUserName(review)}</div>
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
          <div className="bg-gradient-to-br from-green-600/20 to-green-400/20 backdrop-blur-md rounded-xl p-6 relative max-w-4xl w-full flex flex-col items-center border border-green-400/30 shadow-2xl mt-16 mb-16" onClick={e => e.stopPropagation()}>
            {selectedReview.images && selectedReview.images.length > 0 && (
              <img src={selectedReview.images[currentIndex].url} alt={`Review by ${getUserName(selectedReview)}`} className="max-h-[50vh] w-auto max-w-full rounded-lg shadow-lg object-contain" />
            )}
            <div className="text-white mt-4 font-abeze font-bold text-center text-lg">{selectedReview.packageTitle || selectedReview.packageId?.title || 'Safari Package'}</div>
            <div className="flex items-center justify-center space-x-1 mt-3 bg-white/10 px-4 py-2 rounded-full">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-6 h-6 ${i < selectedReview.rating ? 'text-amber-400 fill-current drop-shadow-md' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="text-amber-300 font-abeze ml-3 text-xl font-bold">{selectedReview.rating}/5</span>
            </div>
            <div className="text-green-300 text-sm text-center mt-3 font-abeze">By: {getUserName(selectedReview)}</div>
            {selectedReview.comment && (
              <div className="text-gray-300 text-base text-center mt-3 italic max-w-2xl font-abeze leading-relaxed">"{selectedReview.comment}"</div>
            )}
            {selectedReview.images && selectedReview.images.length > 1 && (
              <div className="flex items-center space-x-4 mt-6">
                <button onClick={prevImage} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-abeze font-medium transition-colors duration-300">Previous</button>
                <span className="text-green-300 text-sm font-abeze">{currentIndex + 1} / {selectedReview.images.length}</span>
                <button onClick={nextImage} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-abeze font-medium transition-colors duration-300">Next</button>
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
