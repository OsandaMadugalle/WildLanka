
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
    requestCancellation,
    updateBookingDetails
} from '../controllers/bookingController.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const bookingRouter = express.Router();
// User creates a booking (Book Now, Pay Later)
bookingRouter.post('/', auth, async (req, res) => {
    try {
        const {
            packageId,
            startDate,
            endDate,
            numberOfPeople,
            specialRequests,
            emergencyContact,
            dietaryRestrictions,
            accommodationPreference,
            transportationPreference
        } = req.body;

        // Validate required fields
        if (!packageId || !startDate || !endDate || !numberOfPeople || !emergencyContact) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Fetch package details
        const Package = (await import('../models/Package.js')).default;
        const Booking = (await import('../models/Booking.js')).default;
        const packageData = await Package.findById(packageId);
        if (!packageData) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        // Calculate total price
        let basePrice = packageData.price * numberOfPeople;
        let extraCosts = 0;
        switch (accommodationPreference) {
            case 'Luxury': extraCosts += 5000 * numberOfPeople; break;
            case 'Tented Camp': extraCosts += 2000 * numberOfPeople; break;
            case 'Eco Lodge': extraCosts += 3000 * numberOfPeople; break;
            default: break;
        }
        switch (transportationPreference) {
            case 'Private Vehicle': extraCosts += 3000 * numberOfPeople; break;
            case 'Shared Vehicle': extraCosts += 1000 * numberOfPeople; break;
            default: break;
        }
        const totalPrice = basePrice + extraCosts;

        // Create booking record
        const bookingData = {
            userId: req.user._id,
            packageId,
            packageDetails: {
                title: packageData.title,
                duration: packageData.duration,
                location: packageData.location,
                category: packageData.category,
                basePrice: packageData.price
            },
            bookingDetails: {
                startDate,
                endDate,
                numberOfPeople,
                specialRequests,
                emergencyContact,
                dietaryRestrictions,
                accommodationPreference,
                transportationPreference
            },
            totalPrice,
            paymentMethod: 'COD',
            payment: false,
            status: 'Pending'
        };
        const newBooking = new Booking(bookingData);
        await newBooking.save();
        res.json({ success: true, booking: newBooking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

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

// User update booking details
bookingRouter.put('/:bookingId', auth, updateBookingDetails);

// Admin routes (require authentication and admin role)
bookingRouter.post('/admin/assign-driver/:bookingId', auth, assignDriverToBooking);
bookingRouter.post('/admin/assign-guide/:bookingId', auth, assignGuideToBooking);
bookingRouter.post('/admin/complete/:bookingId', auth, completeBookingByAdmin);

export default bookingRouter;
