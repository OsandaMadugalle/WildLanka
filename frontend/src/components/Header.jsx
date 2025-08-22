import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Login from './Login';
import Signup from './Signup';
import StaffLogin from './StaffLogin';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../assets/logo.png';

const Header = ({ triggerLogin = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, redirectAfterLogin } = useAuth();
  const { t } = useLanguage();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Expose the login trigger function to parent components
  React.useEffect(() => {
    if (triggerLogin) {
      triggerLogin.current = () => {
        setShowLogin(true);
        setShowSignup(false);
        setShowStaffLogin(false);
      };
    }
  }, [triggerLogin]);

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowSignup(false);
    setShowStaffLogin(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignupClick = () => {
    setShowSignup(true);
    setShowLogin(false);
    setShowStaffLogin(false);
    setIsMobileMenuOpen(false);
  };

  const handleStaffLoginClick = () => {
    setShowStaffLogin(true);
    setShowLogin(false);
    setShowSignup(false);
    setIsMobileMenuOpen(false);
  };

  const handleCloseModal = () => {
    setShowLogin(false);
    setShowSignup(false);
    setShowStaffLogin(false);
  };

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const switchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const switchToStaffLogin = () => {
    setShowLogin(false);
    setShowStaffLogin(true);
  };

  const switchToRegularLogin = () => {
    setShowStaffLogin(false);
    setShowLogin(true);
  };

  const navigateToHome = () => {
    navigate('/');
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const navigateToTravelPackages = () => {
    navigate('/travel-packages');
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const navigateToContact = () => {
    navigate('/contact');
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const navigateToAbout = () => {
    navigate('/about');
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const navigateToGallery = () => {
    navigate('/gallery');
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const navigateToAccount = () => {
    // Redirect based on user role
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/account');
    }
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const scrollToAwareness = () => {
    if (location.pathname === '/') {
      const element = document.getElementById('awareness');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#awareness');
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Show a message if there's a redirect path set
  const showRedirectMessage = () => {
    if (redirectAfterLogin && !isAuthenticated) {
      return (
        <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-3 mb-4">
          <p className="text-green-400 font-abeze text-sm text-center">
            Please login to continue with your booking
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="cursor-pointer" onClick={navigateToHome}>
                <img 
                  src={logo} 
                  alt="Wild Path Logo" 
                  className="h-12 w-auto"
                />
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={navigateToHome}
                className={`font-abeze font-medium transition-colors ${
                  location.pathname === '/' ? 'text-green-400' : 'text-white hover:text-green-400'
                }`}
              >
                {t('nav.home')}
              </button>
              <button 
                onClick={scrollToAwareness}
                className="text-white font-abeze font-medium hover:text-green-400 transition-colors"
              >
                {t('nav.awareness')}
              </button>
              <button 
                onClick={navigateToTravelPackages}
                className={`font-abeze font-medium transition-colors ${
                  location.pathname === '/travel-packages' ? 'text-green-400' : 'text-white hover:text-green-400'
                }`}
              >
                {t('nav.packages')}
              </button>
              <button 
                onClick={navigateToGallery}
                className={`font-abeze font-medium transition-colors ${
                  location.pathname === '/gallery' ? 'text-green-400' : 'text-white hover:text-green-400'
                }`}
              >
                {t('nav.gallery')}
              </button>
              <button 
                onClick={navigateToAbout}
                className={`font-abeze font-medium transition-colors ${
                  location.pathname === '/about' ? 'text-green-400' : 'text-white hover:text-green-400'
                }`}
              >
                {t('nav.about')}
              </button>
              <button 
                onClick={navigateToContact}
                className={`font-abeze font-medium transition-colors ${
                  location.pathname === '/contact' ? 'text-green-400' : 'text-white hover:text-green-400'
                }`}
              >
                {t('nav.contact')}
              </button>
            </nav>

            {/* Login/Account Button */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {isAuthenticated ? (
                <button 
                  onClick={navigateToAccount}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-abeze font-medium transition-colors duration-300"
                >
                  {user?.role === 'admin' ? t('nav.admin') : t('nav.myAccount')}
                </button>
              ) : (
                <button 
                  onClick={handleLoginClick}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-abeze font-medium transition-colors duration-300 text-sm"
                >
                  {t('nav.login')}
                </button>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden text-white p-2"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/20">
              <nav className="flex flex-col space-y-4 pt-4">
                <button 
                  onClick={navigateToHome}
                  className={`text-left font-abeze font-medium transition-colors ${
                    location.pathname === '/' ? 'text-green-400' : 'text-white hover:text-green-400'
                  }`}
                >
                  {t('nav.home')}
                </button>
                <button 
                  onClick={scrollToAwareness}
                  className="text-left text-white font-abeze font-medium hover:text-green-400 transition-colors"
                >
                  {t('nav.awareness')}
                </button>
                <button 
                  onClick={navigateToTravelPackages}
                  className={`text-left font-abeze font-medium transition-colors ${
                    location.pathname === '/travel-packages' ? 'text-green-400' : 'text-white hover:text-green-400'
                  }`}
                >
                  {t('nav.packages')}
                </button>
                <button 
                  onClick={navigateToGallery}
                  className={`text-left font-abeze font-medium transition-colors ${
                    location.pathname === '/gallery' ? 'text-green-400' : 'text-white hover:text-green-400'
                  }`}
                >
                  {t('nav.gallery')}
                </button>
                <button 
                  onClick={navigateToAbout}
                  className={`text-left font-abeze font-medium transition-colors ${
                    location.pathname === '/about' ? 'text-green-400' : 'text-white hover:text-green-400'
                  }`}
                >
                  {t('nav.about')}
                </button>
                <button 
                  onClick={navigateToContact}
                  className={`text-left font-abeze font-medium transition-colors ${
                    location.pathname === '/contact' ? 'text-green-400' : 'text-white hover:text-green-400'
                  }`}
                >
                  {t('nav.contact')}
                </button>
                {isAuthenticated ? (
                  <button 
                    onClick={navigateToAccount}
                    className="text-left text-white font-abeze font-medium hover:text-green-400 transition-colors"
                  >
                    {user?.role === 'admin' ? t('nav.admin') : t('nav.myAccount')}
                  </button>
                ) : (
                  <button 
                    onClick={handleLoginClick}
                    className="text-left text-white font-abeze font-medium hover:text-green-400 transition-colors"
                  >
                    {t('nav.login')}
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Login Modal */}
      {showLogin && (
        <Login 
          onClose={handleCloseModal}
          onSwitchToSignup={switchToSignup}
          onSwitchToStaffLogin={switchToStaffLogin}
        />
      )}

      {/* Signup Modal */}
      {showSignup && (
        <Signup 
          onClose={handleCloseModal}
          onSwitchToLogin={switchToLogin}
        />
      )}

      {/* Staff Login Modal */}
      {showStaffLogin && (
        <StaffLogin 
          onClose={handleCloseModal}
          onSwitchToRegularLogin={switchToRegularLogin}
        />
      )}
    </>
  );
};

export default Header; 