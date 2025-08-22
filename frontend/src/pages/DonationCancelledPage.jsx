import React from 'react';
import { Link } from 'react-router-dom';

const DonationCancelledPage = () => {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-6">
			<div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-white/20 text-center">
				<div className="text-yellow-300 font-abeze font-bold text-2xl mb-2">Donation Cancelled</div>
				<p className="text-gray-300 font-abeze mb-6">
					You cancelled the donation payment or it was interrupted. You can try again anytime.
				</p>
				<div className="flex items-center justify-center gap-4">
					<Link to="/donate" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-abeze">Try Again</Link>
					<Link to="/" className="bg-transparent border border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-abeze">Back to Home</Link>
				</div>
			</div>
		</div>
	);
};

export default DonationCancelledPage;


