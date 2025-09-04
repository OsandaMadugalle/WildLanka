import React, { useState } from 'react';

const AddReviewModal = ({ onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: rating, 2: comment, 3: photos, 4: review

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    setFiles(selected);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment, files });
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return rating > 0;
      case 2: return true; // comment is optional
      case 3: return true; // photos are optional
      case 4: return rating > 0;
      default: return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Rate Your Experience";
      case 2: return "Share Your Thoughts";
      case 3: return "Add Photos";
      case 4: return "Review & Submit";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "How would you rate your safari adventure?";
      case 2: return "Tell us about your experience (optional)";
      case 3: return "Share your favorite moments (optional)";
      case 4: return "Review your submission before sending";
      default: return "";
    }
  };

  const renderRatingStep = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transform hover:scale-110 transition-all duration-200"
            >
              <svg
                className={`w-16 h-16 ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-400'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <div className="text-white font-abeze">
          {rating > 0 && (
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {rating === 5 && "Outstanding! 🌟"}
                {rating === 4 && "Great Experience! 👍"}
                {rating === 3 && "Good Time! 😊"}
                {rating === 2 && "Fair Experience! 🤔"}
                {rating === 1 && "Needs Improvement! 📝"}
              </p>
              <p className="text-sm text-green-200">
                {rating === 5 && "Your safari was absolutely perfect!"}
                {rating === 4 && "You had a wonderful safari adventure!"}
                {rating === 3 && "You enjoyed a decent safari experience."}
                {rating === 2 && "Your safari had some room for improvement."}
                {rating === 1 && "We'd love to hear how we can improve."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCommentStep = () => (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 font-abeze resize-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
          placeholder="Share your safari story... What was your favorite moment? Any wildlife encounters? How was the guide? (optional)"
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {comment.length}/500
        </div>
      </div>
      <div className="text-center text-sm text-green-200">
        💡 Tip: Share specific details about your experience to help other travelers!
      </div>
    </div>
  );

  const renderPhotosStep = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-green-400/50 rounded-lg p-6 text-center hover:border-green-400/70 transition-colors duration-200">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="hidden"
          id="photo-upload"
        />
        <label htmlFor="photo-upload" className="cursor-pointer">
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-white font-abeze font-semibold">Click to upload photos</p>
              <p className="text-green-200 text-sm">Up to 5 images (JPG, PNG)</p>
            </div>
          </div>
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-white font-abeze font-medium">Selected Photos:</p>
          <div className="grid grid-cols-2 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
                <p className="text-xs text-green-200 mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-center text-sm text-green-200">
        📸 Share your best safari moments with the community!
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-green-200 font-abeze">Rating:</span>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-white ml-2">{rating}/5</span>
          </div>
        </div>
        
        {comment && (
          <div className="mb-3">
            <span className="text-green-200 font-abeze">Comment:</span>
            <p className="text-white text-sm mt-1 italic">"{comment}"</p>
          </div>
        )}
        
        {files.length > 0 && (
          <div>
            <span className="text-green-200 font-abeze">Photos:</span>
            <p className="text-white text-sm mt-1">{files.length} photo{files.length !== 1 ? 's' : ''} selected</p>
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-green-200">
        ✨ Ready to share your safari experience with the world!
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderRatingStep();
      case 2: return renderCommentStep();
      case 3: return renderPhotosStep();
      case 4: return renderReviewStep();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 rounded-3xl shadow-2xl max-w-2xl w-full border border-green-600/50 overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-green-600/50 bg-gradient-to-r from-green-800/50 to-green-700/50">
          <div className="text-center">
            <h3 className="text-2xl font-abeze font-bold text-white mb-2">{getStepTitle()}</h3>
            <p className="text-green-200 font-abeze">{getStepDescription()}</p>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-green-200 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-green-800/30">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  stepNum < step 
                    ? 'bg-green-500 text-white' 
                    : stepNum === step 
                    ? 'bg-green-400 text-white ring-4 ring-green-400/30' 
                    : 'bg-white/20 text-green-200'
                }`}>
                  {stepNum < step ? '✓' : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-12 h-1 mx-2 transition-all duration-300 ${
                    stepNum < step ? 'bg-green-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-abeze transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-abeze transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  disabled={submitting || !canProceed()}
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-abeze font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Review</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export { AddReviewModal };


