import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingApi } from "../services/api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const BookingSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState(null);

  const success = searchParams.get("success");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Don't require authentication for Stripe redirect
    // Stripe handles the security, and we verify the session_id

    if (success === "true" && sessionId) {
      verifyPayment();
    } else {
      setVerifying(false);
      setError("Invalid payment session");
    }
  }, [success, sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await bookingApi.verifyPayment(sessionId);

      if (response.success) {
        setVerificationSuccess(true);
      } else {
        setError(response.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setError("Failed to verify payment. Please contact support.");
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
            <div className="text-white font-abeze text-lg">
              Verifying your payment...
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="bg-red-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-abeze font-bold text-white mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-gray-300 font-abeze mb-6">{error}</p>
            <button
              onClick={() => navigate("/account")}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-abeze font-bold transition-colors duration-300"
            >
              Go to Account
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="bg-green-600/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-12 h-12 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl md:text-5xl font-abeze font-bold text-white mb-6">
              Payment <span className="text-green-400">Successful!</span>
            </h1>

            <p className="text-gray-300 font-abeze text-lg mb-8">
              Your safari booking has been confirmed and payment has been
              processed successfully. We've sent you a confirmation email with
              all the details.
            </p>

            {/* Next Steps */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
              <h2 className="text-2xl font-abeze font-bold text-white mb-4">
                What's Next?
              </h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-abeze font-medium">
                      Confirmation Email
                    </h3>
                    <p className="text-gray-300 font-abeze text-sm">
                      Check your email for booking confirmation and itinerary
                      details
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-abeze font-medium">
                      Driver Assignment
                    </h3>
                    <p className="text-gray-300 font-abeze text-sm">
                      Your booking will be assigned to a qualified driver who
                      will contact you with pickup details
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-abeze font-medium">
                      Pre-Trip Information
                    </h3>
                    <p className="text-gray-300 font-abeze text-sm">
                      We'll send you detailed information about your safari
                      adventure
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-white font-abeze font-medium">
                      Contact Support
                    </h3>
                    <p className="text-gray-300 font-abeze text-sm">
                      Our team is available 24/7 for any questions or special
                      requests
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/account")}
                className="bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-lg font-abeze font-bold transition-colors duration-300"
              >
                View My Bookings
              </button>

              <button
                onClick={() => navigate("/travel-packages")}
                className="bg-transparent hover:bg-white/10 text-white py-4 px-8 rounded-lg font-abeze font-bold border border-white/20 transition-colors duration-300"
              >
                Explore More Packages
              </button>
            </div>

            {/* Contact Info */}
            <div className="mt-12 text-center">
              <p className="text-gray-400 font-abeze text-sm mb-2">
                Need immediate assistance?
              </p>
              <p className="text-green-400 font-abeze font-medium">
                +94 71 123 4567 | support@safari.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingSuccessPage;
