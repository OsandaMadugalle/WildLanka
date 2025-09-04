import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { reviewApi } from '../services/api';
import React, { useEffect, useState } from 'react';

const ReviewsPage = () => {
  const { t } = useLanguage();
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

  const reviewsWithImages = (reviews || []).filter(r => r.images && r.images.length > 0);
  const displayedReviews = [...reviewsWithImages].sort((a, b) => {
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
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <div className="pt-30 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-abeze font-bold text-white mb-4">
              {t('nav.reviews') || 'Reviews'}
            </h1>
            <p className="text-green-200 font-abeze text-lg max-w-2xl mx-auto">
              {t('gallery.subtitle') || 'See what our guests say about their experiences.'}
            </p>
          </div>
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
              <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${filter === 'all' ? 'bg-green-600 text-white' : 'text-green-200 hover:text-white hover:bg-white/10'}`}>{t('gallery.filters.all') || 'All'}</button>
              <button onClick={() => setFilter('recent')} className={`px-6 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${filter === 'recent' ? 'bg-green-600 text-white' : 'text-green-200 hover:text-white hover:bg-white/10'}`}>{t('gallery.filters.recent') || 'Recent'}</button>
              <button onClick={() => setFilter('popular')} className={`px-6 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${filter === 'popular' ? 'bg-green-600 text-white' : 'text-green-200 hover:text-white hover:bg-white/10'}`}>{t('gallery.filters.popular') || 'Popular'}</button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedReviews.map((review) => (
                <div key={review._id} className="group relative bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:border-green-400/50 transition-all duration-300 cursor-pointer" onClick={() => openModal(review, 0)}>
                  <div className="aspect-square overflow-hidden">
                    <img src={review.images[0].url} alt={`Review by ${getUserName(review)}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-abeze font-bold text-sm truncate">{review.packageId?.title || t('gallery.safariPackage') || 'Safari Package'}</h4>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-.1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                          <span className="text-white font-abeze ml-2 text-xs">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-gray-300 font-abeze text-xs flex items-center justify-between">
                        <span>{t('gallery.by') || 'By'} {getUserName(review)}</span>
                        <span>{review.images.length} {review.images.length === 1 ? (t('gallery.photos') || 'photo') : (t('gallery.photosPlural') || 'photos')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {displayedReviews.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-gray-300 font-abeze">
                {displayedReviews.length === 1 ? (t('gallery.showingReviews', { count: displayedReviews.length }) || `Showing ${displayedReviews.length} review`) : (t('gallery.showingReviewsPlural', { count: displayedReviews.length }) || `Showing ${displayedReviews.length} reviews`)}
              </p>
            </div>
          )}
        </div>
      </div>
      {selectedReview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="relative max-w-5xl w-full mt-8">
            <button onClick={closeModal} className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20">
              <div className="relative">
                <img src={selectedReview.images[currentIndex].url} alt={`Image ${currentIndex + 1} of ${selectedReview.images.length}`} className="w-full max-h-[70vh] object-contain bg-black" />
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full" aria-label={t('gallery.previousImage') || 'Previous'}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full" aria-label={t('gallery.nextImage') || 'Next'}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-abeze font-bold text-white truncate mr-3">{selectedReview.packageId?.title || t('gallery.safariPackage') || 'Safari Package'}</h3>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-.1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                    <span className="text-white font-abeze ml-2">{selectedReview.rating}/5</span>
                  </div>
                </div>
                <p className="text-gray-300 font-abeze mb-3"><span className="text-green-400">{t('gallery.by') || 'By'}:</span> {getUserName(selectedReview)}</p>
                {selectedReview.comment && (<p className="text-gray-300 font-abeze mb-3 italic">"{selectedReview.comment}"</p>)}
                <p className="text-gray-400 font-abeze text-sm">{new Date(selectedReview.createdAt).toLocaleDateString()} • {t('gallery.imageOf', { current: currentIndex + 1, total: selectedReview.images.length }) || `Image ${currentIndex + 1} of ${selectedReview.images.length}`}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ReviewsPage;
