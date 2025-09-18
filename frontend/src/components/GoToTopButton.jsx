import React, { useEffect, useState } from 'react';

const GoToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
  className={`fixed bottom-8 right-24 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-label="Go to top"
    >
      ↑
    </button>
  );
};

export default GoToTopButton;
