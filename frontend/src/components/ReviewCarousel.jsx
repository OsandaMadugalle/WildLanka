import { useEffect, useState } from 'react';
import { reviewApi } from '../services/api';

const ReviewCarousel = ({ autoAdvance = true, showImages = true, interval = 5000 }) => {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchReviews() {
      const res = await reviewApi.getPublicReviews();
      if (res && res.reviews) setReviews(res.reviews.slice(0, 10)); // Show top 10
    }
    fetchReviews();
  }, []);

  useEffect(() => {
    if (!autoAdvance || reviews.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoAdvance, reviews, interval]);

  if (!reviews.length) return null;

  const review = reviews[current];

  return (
    <div className="w-full max-w-xl mx-auto py-8">
      <div className="bg-gray-800 rounded-2xl p-8 shadow-lg flex flex-col items-center relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button
            onClick={() => setCurrent((current - 1 + reviews.length) % reviews.length)}
            className="bg-gray-700 text-white rounded-full p-2 shadow hover:bg-emerald-500 transition-colors"
            aria-label="Previous review"
          >
            &#8592;
          </button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={() => setCurrent((current + 1) % reviews.length)}
            className="bg-gray-700 text-white rounded-full p-2 shadow hover:bg-emerald-500 transition-colors"
            aria-label="Next review"
          >
            &#8594;
          </button>
        </div>
        <div className="flex flex-col items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-bold mb-2 ${
            review.rating === 5 ? 'bg-green-500 text-white' :
            review.rating >= 3 ? 'bg-yellow-400 text-white' :
            'bg-red-500 text-white'
          }`}>
            {review.rating} stars
          </span>
          <p className="text-white font-abeze font-semibold text-lg mb-2">
            {review.packageId?.title || review.bookingId?.packageDetails?.title || 'N/A'}
          </p>
          <p className="text-slate-300 font-abeze mb-4 text-center max-w-md">
            {review.comment || 'No comment provided.'}
          </p>
          {showImages && review.images && review.images.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {review.images.slice(0, 3).map((img, idx) => (
                <img
                  key={img.id || idx}
                  src={img.url}
                  alt={`Review image ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded border border-gray-600 shadow"
                />
              ))}
              {review.images.length > 3 && (
                <span className="text-xs text-gray-400 ml-2">+{review.images.length - 3} more</span>
              )}
            </div>
          )}
          <p className="text-slate-400 text-xs mt-2">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
      <div className="flex justify-center mt-4 gap-2">
        {reviews.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full ${idx === current ? 'bg-emerald-500' : 'bg-gray-500'} focus:outline-none`}
            aria-label={`Go to review ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewCarousel;
