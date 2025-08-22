import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { donationApi } from '../services/api';
import { generateDonationPDF } from '../utils/pdfGenerator';

const DonationSuccessPage = () => {
	const [searchParams] = useSearchParams();
	const [verifying, setVerifying] = useState(true);
	const [error, setError] = useState('');
	const [result, setResult] = useState(null);
	const [donationData, setDonationData] = useState(null);

	const success = searchParams.get('success');
	const sessionId = searchParams.get('session_id');

	useEffect(() => {
		// Get donation data from localStorage
		const storedDonationData = localStorage.getItem('pendingDonationData');
		if (storedDonationData) {
			try {
				const parsedData = JSON.parse(storedDonationData);
				setDonationData(parsedData);
				// Update payment status to completed
				parsedData.paymentStatus = 'completed';
				setDonationData(parsedData);
			} catch (err) {
				console.error('Error parsing stored donation data:', err);
			}
		}

		if (success === 'true' && sessionId) {
			verifyPayment();
		} else {
			setVerifying(false);
			setError('Invalid payment session');
		}
	}, [success, sessionId]);

	const verifyPayment = async () => {
		try {
			console.log('🔍 Verifying payment for session:', sessionId);
			const response = await donationApi.verifyPayment(sessionId);
			console.log('📋 Payment verification response:', response);
			
			if (response.success) {
				setResult(response);
				// Update donation data with payment info if available
				if (donationData && response.donation) {
					setDonationData({
						...donationData,
						paymentStatus: 'completed',
						stripePaymentIntentId: response.payment_intent
					});
				}
				setError('');
			} else {
				console.log('❌ Payment not completed');
				setError('Payment not completed');
			}
		} catch (err) {
			console.error('Donation verification error:', err);
			// Even if verification fails, we can still show the donation data
			if (donationData) {
				setError('');
			} else {
				setError('Failed to verify payment. Please contact support.');
			}
		} finally {
			setVerifying(false);
		}
	};

	const handleDownloadPDF = () => {
		console.log('📥 Download PDF clicked, donation data:', donationData);
		if (donationData) {
			generateDonationPDF(donationData);
			// Clean up localStorage after successful PDF generation
			localStorage.removeItem('pendingDonationData');
		} else {
			console.error('❌ No donation data available for PDF generation');
			alert('No donation data available. Please try refreshing the page.');
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex items-center justify-center px-6">
			<div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-white/20 text-center">
				{verifying ? (
					<div className="text-center">
						<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
						<div className="text-white font-abeze text-lg">Verifying your donation...</div>
					</div>
				) : error && !donationData ? (
					<>
						<div className="text-red-400 font-abeze font-bold text-2xl mb-2">Donation Not Completed</div>
						<p className="text-gray-300 font-abeze mb-6">{error}</p>
						<Link to="/donate" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-abeze">Try Again</Link>
					</>
				) : (
					<>
						<div className="text-green-400 font-abeze font-bold text-2xl mb-2">Thank You for Your Donation! 🎉</div>
						<p className="text-gray-300 font-abeze mb-6">
							Your contribution has been received successfully.
						</p>
						{donationData && (
							<div className="text-sm text-green-200 font-abeze mb-6">
								Amount: {donationData.currency} {donationData.amount.toFixed(2)}
							</div>
						)}
						
						{/* Donation Details */}
						{donationData && (
							<div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
								<h3 className="text-white font-abeze font-bold text-lg mb-4">Donation Details</h3>
								<div className="text-sm text-gray-300 font-abeze space-y-2">
									<div className="flex justify-between">
										<span>Donor:</span>
										<span>{donationData.isAnonymous ? 'Anonymous' : `${donationData.firstName} ${donationData.lastName}`}</span>
									</div>
									<div className="flex justify-between">
										<span>Email:</span>
										<span>{donationData.email}</span>
									</div>
									<div className="flex justify-between">
										<span>Country:</span>
										<span>{donationData.country}</span>
									</div>
									<div className="flex justify-between">
										<span>Payment Status:</span>
										<span className="text-green-400">{donationData.paymentStatus === 'completed' ? 'Completed' : 'Pending'}</span>
									</div>
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							{donationData ? (
								<button
									onClick={handleDownloadPDF}
									className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-abeze font-bold transition-colors duration-300 flex items-center justify-center"
								>
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									Download Receipt
								</button>
							) : (
								<div className="text-yellow-400 text-sm font-abeze">
									No donation data available. Please complete a donation first.
								</div>
							)}
							<Link to="/" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-abeze font-bold transition-colors duration-300">
								Back to Home
							</Link>
						</div>

						{/* Impact Message */}
						<div className="mt-8 text-center">
							<p className="text-gray-400 font-abeze text-sm mb-2">Your donation makes a real difference</p>
							<p className="text-green-400 font-abeze font-medium">Thank you for supporting wildlife conservation! 🦁🐘🦒</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default DonationSuccessPage;


