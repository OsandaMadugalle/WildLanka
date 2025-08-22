import express from 'express';
import { createDonationCheckout, verifyDonationPayment, getAllDonations } from '../controllers/donationController.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const donationRouter = express.Router();

// Public donation endpoints (no auth required)
donationRouter.post('/stripe-checkout', createDonationCheckout);
donationRouter.post('/verify-payment', verifyDonationPayment);

// Admin endpoint (requires authentication)
donationRouter.get('/all', auth, getAllDonations);

export default donationRouter;


