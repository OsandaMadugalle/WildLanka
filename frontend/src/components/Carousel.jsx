import React, { useState } from 'react';

const Carousel = ({ images = [], alt = '', className = '' }) => {
  const [current, setCurrent] = useState(0);
  if (!images.length) return null;

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className={`relative w-full h-full ${className}`}>
      <img
        src={images[current]}
        alt={alt}
        className="w-full h-full object-cover rounded-lg transition-all duration-300"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 z-10"
            aria-label="Previous image"
            type="button"
          >
            &#8592;
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 z-10"
            aria-label="Next image"
            type="button"
          >
            &#8594;
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block w-2 h-2 rounded-full ${idx === current ? 'bg-green-400' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;
