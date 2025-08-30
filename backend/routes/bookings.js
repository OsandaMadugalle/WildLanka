
import express from 'express';
import { 
    createStripeCheckout, 
    verifyStripePayment, 
    getUserBookings, 
    getAllBookings, 
    getBookingDetails, 
    updateBookingStatus,
    getPendingBookingsForDriver,
    getDriverAcceptedBookings,
    acceptBooking,
    completeBooking,
    testDriverAuth,
    getAvailableBookingsForGuide,
    getGuideAcceptedBookings,
    getGuideCompletedBookings,
    acceptBookingAsGuide,
    completeTourAsGuide,
    assignDriverToBooking,
    assignGuideToBooking,
    completeBookingByAdmin,
    requestCancellation
} from '../controllers/bookingController.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const bookingRouter = express.Router();

// User requests cancellation for confirmed booking
bookingRouter.post('/request-cancellation/:bookingId', auth, requestCancellation);

// User routes (require authentication)
bookingRouter.post('/stripe-checkout', auth, createStripeCheckout);
bookingRouter.post('/verify-payment', verifyStripePayment);
bookingRouter.get('/user', auth, getUserBookings);
bookingRouter.get('/details/:bookingId', auth, getBookingDetails);

// Admin/Staff routes (require authentication)
bookingRouter.get('/all', auth, getAllBookings);
bookingRouter.put('/status/:bookingId', auth, updateBookingStatus);

// Driver routes (require authentication and driver role)
bookingRouter.get('/driver/pending', auth, getPendingBookingsForDriver);
bookingRouter.get('/driver/accepted', auth, getDriverAcceptedBookings);
bookingRouter.post('/driver/accept/:bookingId', auth, acceptBooking);
bookingRouter.post('/driver/complete/:bookingId', auth, completeBooking);
bookingRouter.get('/driver/test-auth', auth, testDriverAuth);

// Tour Guide routes (require authentication and tour_guide role)
bookingRouter.get('/guide/available', auth, getAvailableBookingsForGuide);
bookingRouter.get('/guide/accepted', auth, getGuideAcceptedBookings);
bookingRouter.get('/guide/completed', auth, getGuideCompletedBookings);
bookingRouter.post('/guide/accept/:bookingId', auth, acceptBookingAsGuide);
bookingRouter.post('/guide/complete/:bookingId', auth, completeTourAsGuide);

// Admin routes (require authentication and admin role)
bookingRouter.post('/admin/assign-driver/:bookingId', auth, assignDriverToBooking);
bookingRouter.post('/admin/assign-guide/:bookingId', auth, assignGuideToBooking);
bookingRouter.post('/admin/complete/:bookingId', auth, completeBookingByAdmin);

export default bookingRouter;
