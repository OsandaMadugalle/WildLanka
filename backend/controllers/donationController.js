import Stripe from "stripe";
import Donation from '../models/Donation.js';

// Lazy Stripe initialization (copied approach from booking controller)
let stripe = null;

const initializeStripe = () => {
	if (stripe) return stripe;
	try {
		const stripeKey = process.env.STRIPE_SECRET_KEY;
		if (!stripeKey || stripeKey.length < 100) {
			console.error('STRIPE_SECRET_KEY is missing or appears malformed');
			return null;
		}
		stripe = new Stripe(stripeKey);
		return stripe;
	} catch (error) {
		console.error('Failed to initialize Stripe:', error.message);
		return null;
	}
};

// Create Stripe checkout session for donations
const createDonationCheckout = async (req, res) => {
	try {
		const stripeInstance = initializeStripe();
		if (!stripeInstance) {
			return res.status(500).json({ success: false, message: 'Stripe not configured' });
		}

		const {
			amount, // expected in major units (e.g., USD dollars, LKR rupees)
			currency = 'USD',
			donor = {}, // { firstName, lastName, email, isAnonymous }
			donorDetails = {}, // { phone, address, country, postalCode, receiveUpdates }
		} = req.body || {};

		const parsedAmount = Number(amount);
		if (!parsedAmount || parsedAmount <= 0) {
			return res.status(400).json({ success: false, message: 'Invalid donation amount' });
		}

		// Create donation record in database
		const donation = new Donation({
			firstName: donor.firstName || '',
			lastName: donor.lastName || '',
			email: donor.email || '',
			phone: donorDetails.phone || '',
			address: donorDetails.address || '',
			country: donorDetails.country || '',
			postalCode: donorDetails.postalCode || '',
			amount: parsedAmount,
			currency: currency.toUpperCase(),
			isAnonymous: donor.isAnonymous || false,
			receiveUpdates: donorDetails.receiveUpdates !== false,
			paymentStatus: 'pending'
		});

		await donation.save();

		const successUrlBase = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
		const line_items = [
			{
				price_data: {
					currency: String(currency).toLowerCase(),
					product_data: {
						name: 'Wildlife Conservation Donation',
						description: donor?.isAnonymous
							? 'Anonymous donation to support wildlife conservation'
							: `Donation from ${donor?.firstName || 'Supporter'} ${donor?.lastName || ''}`.trim(),
					},
					unit_amount: Math.round(parsedAmount * 100),
				},
				quantity: 1,
			},
		];

		const metadata = {
			donationId: donation._id.toString(),
			donationAmount: String(parsedAmount),
			currency: String(currency).toUpperCase(),
			isAnonymous: donor?.isAnonymous ? 'true' : 'false',
			firstName: donor?.firstName || '',
			lastName: donor?.lastName || '',
			email: donor?.email || '',
		};

		const session = await stripeInstance.checkout.sessions.create({
			success_url: `${successUrlBase}/donation-success?success=true&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${successUrlBase}/donation-cancelled?success=false&session_id={CHECKOUT_SESSION_ID}`,
			line_items,
			mode: 'payment',
			metadata,
		});

		// Update donation with Stripe session ID
		donation.stripeSessionId = session.id;
		await donation.save();

		return res.json({ success: true, session_url: session.url, session_id: session.id });
	} catch (error) {
		console.error('Create donation Stripe checkout error:', error);
		return res.status(500).json({ success: false, message: 'Failed to create Stripe session' });
	}
};

// Verify donation payment by retrieving session from Stripe
const verifyDonationPayment = async (req, res) => {
	try {
		const stripeInstance = initializeStripe();
		if (!stripeInstance) {
			return res.status(500).json({ success: false, message: 'Stripe not configured' });
		}

		const { session_id } = req.body || {};
		if (!session_id) {
			return res.status(400).json({ success: false, message: 'Missing session_id' });
		}

		const session = await stripeInstance.checkout.sessions.retrieve(session_id);
		const paid = session.payment_status === 'paid';

		if (paid && session.metadata?.donationId) {
			// Update donation payment status in database
			const donation = await Donation.findById(session.metadata.donationId);
			if (donation) {
				donation.paymentStatus = 'completed';
				donation.stripePaymentIntentId = session.payment_intent;
				await donation.save();
			}
		}

		// Get the complete donation data for the response
		let donationData = null;
		if (paid && session.metadata?.donationId) {
			donationData = await Donation.findById(session.metadata.donationId);
		}

		return res.json({
			success: paid,
			payment_status: session.payment_status,
			amount_total: session.amount_total,
			currency: session.currency,
			metadata: session.metadata,
			payment_intent: session.payment_intent,
			donation: donationData
		});
	} catch (error) {
		console.error('Verify donation Stripe payment error:', error);
		return res.status(500).json({ success: false, message: 'Failed to verify payment' });
	}
};

// Get all donations for admin dashboard
const getAllDonations = async (req, res) => {
	try {
		const donations = await Donation.find({})
			.sort({ createdAt: -1 })
			.select('-__v');

		return res.json({
			success: true,
			donations: donations
		});
	} catch (error) {
		console.error('Get all donations error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch donations' });
	}
};

export { createDonationCheckout, verifyDonationPayment, getAllDonations };


