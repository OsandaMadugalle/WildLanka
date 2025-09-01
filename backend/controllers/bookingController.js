// User updates their booking details
const updateBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        // Only allow user to update their own booking and only if not cancelled/completed
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not allowed' });
        }
        if (booking.status === 'Cancelled' || booking.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Cannot update cancelled or completed booking.' });
        }
        // Update allowed fields
        const fields = [
            'startDate', 'endDate', 'numberOfPeople', 'specialRequests', 'emergencyContact',
            'dietaryRestrictions', 'accommodationPreference', 'transportationPreference'
        ];
        for (const field of fields) {
            if (req.body[field] !== undefined) {
                booking.bookingDetails[field] = req.body[field];
            }
        }
        await booking.save();
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// User requests cancellation for confirmed booking
const requestCancellation = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        // Only allow if user owns booking and status is confirmed
        if (booking.userId.toString() !== req.user._id.toString() || booking.status !== 'Confirmed') {
            return res.status(403).json({ success: false, message: "Not allowed" });
        }
        // Mark booking as cancellation requested
        booking.cancellationRequested = true;
        await booking.save();
        res.json({ success: true, message: "Cancellation request sent to admin." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import User from '../models/User.js';
import Stripe from "stripe";

// Initialize Stripe
let stripe = null;

const initializeStripe = () => {
    if (stripe) return stripe; // Already initialized
    
    try {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        console.log('Initializing Stripe with key length:', stripeKey ? stripeKey.length : 'undefined');
        
        if (!stripeKey) {
            console.error('STRIPE_SECRET_KEY is not defined in environment variables');
            return null;
        } else if (stripeKey.length < 100) {
            console.error('STRIPE_SECRET_KEY appears to be truncated or malformed');
            return null;
        } else {
            stripe = new Stripe(stripeKey);
            console.log('Stripe initialized successfully');
            return stripe;
        }
    } catch (error) {
        console.error('Failed to initialize Stripe:', error.message);
        return null;
    }
};

// Create Stripe checkout session for booking
const createStripeCheckout = async (req, res) => {
    try {
        // Initialize Stripe if not already done
        const stripeInstance = initializeStripe();
        if (!stripeInstance) {
            console.error('Failed to initialize Stripe. Environment variables:', {
                STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Present' : 'Missing',
                STRIPE_SECRET_KEY_LENGTH: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0
            });
            return res.status(500).json({
                success: false,
                message: "Payment service is not available. Please check server configuration."
            });
        }

        const {
            bookingId,
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

        let booking;
        let totalPrice;
        let packageData;

        if (bookingId) {
            // Use existing booking for pending payment
            booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }
            if (booking.payment) {
                return res.status(400).json({ success: false, message: "Booking already paid" });
            }
            packageData = await Package.findById(booking.packageId);
            totalPrice = booking.totalPrice;
        } else {
            // Validate required fields for new booking
            if (!packageId || !startDate || !endDate || !numberOfPeople || !emergencyContact) {
                return res.status(400).json({ success: false, message: "Missing required fields" });
            }
            packageData = await Package.findById(packageId);
            if (!packageData) {
                return res.status(404).json({ success: false, message: "Package not found" });
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
            totalPrice = basePrice + extraCosts;
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
                paymentMethod: "Stripe",
                payment: false
            };
            booking = new Booking(bookingData);
            await booking.save();
            console.log('✅ Booking saved to database:', {
                bookingId: booking._id,
                userId: booking.userId,
                packageId: booking.packageId,
                totalPrice: booking.totalPrice,
                status: booking.status,
                payment: booking.payment
            });
        }

        // Create Stripe checkout session
        const line_items = [{
            price_data: {
                currency: 'lkr',
                product_data: {
                    name: `${packageData.title} - Safari Package`,
                    description: `${packageData.duration} Safari in ${packageData.location}`,
                    images: packageData.image?.url ? [packageData.image.url] : []
                },
                unit_amount: totalPrice * 100 // Convert to cents
            },
            quantity: 1
        }];

        // Add accommodation upgrade if selected (only for new booking)
        if (!bookingId && accommodationPreference !== 'Standard') {
            const accommodationCost = (() => {
                switch (accommodationPreference) {
                    case 'Luxury': return 5000 * numberOfPeople;
                    case 'Tented Camp': return 2000 * numberOfPeople;
                    case 'Eco Lodge': return 3000 * numberOfPeople;
                    default: return 0;
                }
            })();
            line_items.push({
                price_data: {
                    currency: 'lkr',
                    product_data: {
                        name: `${accommodationPreference} Accommodation Upgrade`
                    },
                    unit_amount: accommodationCost * 100
                },
                quantity: 1
            });
        }

        // Add transportation upgrade if selected (only for new booking)
        if (!bookingId && transportationPreference !== 'Included') {
            const transportationCost = (() => {
                switch (transportationPreference) {
                    case 'Private Vehicle': return 3000 * numberOfPeople;
                    case 'Shared Vehicle': return 1000 * numberOfPeople;
                    default: return 0;
                }
            })();
            line_items.push({
                price_data: {
                    currency: 'lkr',
                    product_data: {
                        name: `${transportationPreference} Transportation`
                    },
                    unit_amount: transportationCost * 100
                },
                quantity: 1
            });
        }

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/booking-success?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/booking-cancelled?success=false&session_id={CHECKOUT_SESSION_ID}`,
            line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            }
        });

        console.log('✅ Stripe checkout session created:', {
            sessionId: session.id,
            checkoutUrl: session.url,
            metadata: session.metadata
        });

        // Update booking with Stripe session ID
        booking.stripeSessionId = session.id;
        await booking.save();

        console.log('✅ Booking updated with Stripe session ID:', {
            bookingId: booking._id,
            stripeSessionId: booking.stripeSessionId
        });

        res.json({
            success: true,
            session_url: session.url,
            bookingId: booking._id
        });

    } catch (error) {
        console.log("Create Stripe checkout error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Verify Stripe payment
const verifyStripePayment = async (req, res) => {
    try {
        // Initialize Stripe if not already done
        const stripeInstance = initializeStripe();
        if (!stripeInstance) {
            return res.status(500).json({
                success: false,
                message: "Payment service is not available. Please try again later."
            });
        }

        const { session_id } = req.body;
        console.log('🔍 Verifying payment for session:', session_id);
        
        const session = await stripeInstance.checkout.sessions.retrieve(session_id);
        console.log('📋 Stripe session retrieved:', {
            sessionId: session.id,
            paymentStatus: session.payment_status,
            metadata: session.metadata
        });
        
        if (session.payment_status === "paid") {
            const bookingId = session.metadata.bookingId;
            const booking = await Booking.findById(bookingId);
            
            if (booking) {
                booking.payment = true;
                booking.status = 'Payment Confirmed';
                booking.stripePaymentIntentId = session.payment_intent;
                await booking.save();
                
                console.log('✅ Payment confirmed and booking updated:', {
                    bookingId: booking._id,
                    paymentStatus: booking.payment,
                    bookingStatus: booking.status,
                    stripePaymentIntentId: booking.stripePaymentIntentId
                });
                
                res.json({ 
                    success: true, 
                    message: "Payment verified successfully",
                    booking: booking
                });
            } else {
                console.log('❌ Booking not found for payment verification:', { bookingId });
                res.status(404).json({ 
                    success: false, 
                    message: "Booking not found" 
                });
            }
        } else {
            console.log('❌ Payment not completed:', { 
                sessionId: session.id, 
                paymentStatus: session.payment_status 
            });
            res.status(400).json({ 
                success: false, 
                message: "Payment not completed" 
            });
        }
    } catch (error) {
        console.log("Verify Stripe payment error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get user bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookings = await Booking.find({ userId })
            .populate('packageId', 'title image location category')
            .populate('driverId', 'firstName lastName phone role')
            .populate('guideId', 'firstName lastName phone role')
            .sort({ createdAt: -1 });
        res.json({ 
            success: true, 
            bookings: bookings 
        });
    } catch (error) {
        console.log("Get user bookings error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get all bookings (for admin/staff)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'firstName lastName email')
            .populate('packageId', 'title location category')
            .sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            bookings: bookings 
        });
    } catch (error) {
        console.log("Get all bookings error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get booking details
const getBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user._id;
        
        const booking = await Booking.findById(bookingId)
            .populate('userId', 'firstName lastName email phone')
            .populate('packageId');
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }
        
        // Check if user owns this booking or is admin/staff
        if (booking.userId._id.toString() !== userId.toString() && req.user.role === 'user') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied" 
            });
        }
        
        // Attach package details for frontend (both top-level and booking.packageDetails)
        let packageDetails = null;
        if (booking.packageId) {
            let galleryArr = [];
            if (Array.isArray(booking.packageId.gallery) && booking.packageId.gallery.length > 0) {
                galleryArr = booking.packageId.gallery;
            } else if (booking.packageId.image && booking.packageId.image.url) {
                galleryArr = [booking.packageId.image];
            }
            packageDetails = {
                title: booking.packageId.title,
                description: booking.packageId.description,
                image: booking.packageId.image,
                location: booking.packageId.location,
                category: booking.packageId.category,
                duration: booking.packageId.duration,
                maxGroupSize: booking.packageId.maxGroupSize,
                price: booking.packageId.price,
                originalPrice: booking.packageId.originalPrice,
                discount: booking.packageId.discount,
                highlights: booking.packageId.highlights,
                features: booking.packageId.features,
                isPopular: booking.packageId.isPopular,
                gallery: galleryArr,
                included: booking.packageId.included,
                notIncluded: booking.packageId.notIncluded,
                requirements: booking.packageId.requirements,
                rating: booking.packageId.rating,
                reviews: booking.packageId.reviews
            };
        }
        const bookingObj = booking.toObject();
        bookingObj.packageDetails = packageDetails;
        res.json({ 
            success: true, 
            booking: {
                ...bookingObj,
                packageDetails
            }
        });
    } catch (error) {
        console.log("Get booking details error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update booking status (for admin/staff)
const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Allow user to cancel their own booking only if not yet confirmed
        if (req.user.role === 'user') {
            console.log('Cancel booking debug:', {
                bookingId,
                bookingUserId: booking.userId.toString(),
                requestUserId: req.user._id.toString(),
                bookingStatus: booking.status,
                requestedStatus: status
            });
            if (status === 'Cancelled' && booking.userId.toString() === req.user._id.toString() && booking.status !== 'Confirmed') {
                booking.status = 'Cancelled';
                await booking.save();
                return res.json({ success: true, booking });
            } else {
                return res.status(403).json({ success: false, message: "Access denied" });
            }
        }

        // Prevent status update for cancelled bookings
        if (booking.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: 'Cannot update status of a cancelled booking.' });
        }
        // Admin/staff can update status as before
        booking.status = status;
        await booking.save();
        res.json({ success: true, booking });
    } catch (error) {
        console.log("Update booking status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get pending bookings for drivers
// Includes: (1) global available bookings (unassigned) and (2) bookings assigned by admin to this driver but not yet accepted
const getPendingBookingsForDriver = async (req, res) => {
    try {
        const driverId = req.user._id;
        
        // Verify the user is a driver
        if (req.user.role !== 'driver') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only drivers can view pending bookings." 
            });
        }
        
        const pendingBookings = await Booking.find({ 
            $or: [
                // Unassigned, paid bookings (self-assignable)
                { status: 'Payment Confirmed', driverId: null },
                // Admin-assigned to this driver and not yet accepted (regardless of status)
                { driverId: driverId, driverAccepted: false }
            ]
        })
        .populate('userId', 'firstName lastName email phone')
        .populate('packageId', 'title location category duration')
        .sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            bookings: pendingBookings 
        });
    } catch (error) {
        console.log("Get pending bookings for driver error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get driver's accepted bookings
const getDriverAcceptedBookings = async (req, res) => {
    try {
        const driverId = req.user._id;
        
        // Verify the user is a driver
        if (req.user.role !== 'driver') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only drivers can view their bookings." 
            });
        }
        
        const acceptedBookings = await Booking.find({ 
            driverId: driverId,
            driverAccepted: true
        })
        .populate('userId', 'firstName lastName email phone')
        .populate('packageId', 'title location category duration')
        .sort({ startDate: 1 });
        
        res.json({ 
            success: true, 
            bookings: acceptedBookings 
        });
    } catch (error) {
        console.log("Get driver accepted bookings error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Driver accepts a booking
// Supports two cases:
// 1) Driver self-assigns an unassigned booking (Payment Confirmed, driverId null)
// 2) Driver accepts an admin-assigned booking (Driver Assigned, driverId == driver, not yet accepted)
const acceptBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const driverId = req.user._id;
        
        // Verify the user is a driver
        if (req.user.role !== 'driver') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only drivers can accept bookings." 
            });
        }
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }
        
        // Case 1: Unassigned, available booking
        const canSelfAssign = booking.status === 'Payment Confirmed' && booking.driverId === null;
        
        // Case 2: Admin-assigned to this driver, not yet accepted
        const isAssignedToThisDriver = booking.driverId 
            && booking.driverId.toString() === driverId.toString() 
            && !booking.driverAccepted;
        
        if (!canSelfAssign && !isAssignedToThisDriver) {
            return res.status(400).json({ 
                success: false, 
                message: "Booking is not available for you to accept" 
            });
        }
        
        // Update booking with driver acceptance
        if (canSelfAssign) {
            booking.driverId = driverId;
        }
        booking.driverAccepted = true;
        booking.driverAcceptedAt = new Date();
        booking.status = 'Driver Assigned';
        await booking.save();
        
        res.json({ 
            success: true, 
            message: "Booking accepted successfully",
            booking: booking 
        });
    } catch (error) {
        console.log("Accept booking error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Driver completes a booking
const completeBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const driverId = req.user._id;
        
        // Verify the user is a driver
        if (req.user.role !== 'driver') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only drivers can complete bookings." 
            });
        }
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }
        
        // Check if booking belongs to this driver
        if (booking.driverId.toString() !== driverId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. You can only complete your own bookings." 
            });
        }
        
        // Update booking status to completed
        booking.status = 'Completed';
        await booking.save();
        
        res.json({ 
            success: true, 
            message: "Booking completed successfully",
            booking: booking 
        });
    } catch (error) {
        console.log("Complete booking error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Test endpoint to check driver authentication
const testDriverAuth = async (req, res) => {
    try {
        console.log('Test driver auth - User:', req.user);
        console.log('Test driver auth - User role:', req.user?.role);
        
        res.json({ 
            success: true, 
            message: "Driver authentication test",
            user: req.user,
            isDriver: req.user?.role === 'driver'
        });
    } catch (error) {
        console.log("Test driver auth error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get all available bookings for tour guides
// Includes: (1) unassigned paid bookings, and (2) admin-assigned to this guide but not yet accepted
const getAvailableBookingsForGuide = async (req, res) => {
    try {
        const guideId = req.user._id;
        
        // Verify the user is a tour guide
        if (req.user.role !== 'tour_guide') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only tour guides can view available bookings." 
            });
        }
        
        const availableBookings = await Booking.find({
            $or: [
                // Unassigned, paid bookings (self-assignable)
                { status: 'Payment Confirmed', guideId: null },
                // Admin-assigned to this guide and not yet accepted (regardless of status)
                { guideId: guideId, guideAccepted: false }
            ]
        })
        .populate('userId', 'firstName lastName email phone')
        .populate('packageId', 'title location category duration')
        .sort({ startDate: 1 });
        
        res.json({ 
            success: true, 
            bookings: availableBookings 
        });
    } catch (error) {
        console.log("Get available bookings for guide error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get tour guide's accepted bookings
const getGuideAcceptedBookings = async (req, res) => {
    try {
        const guideId = req.user._id;
        
        // Verify the user is a tour guide
        if (req.user.role !== 'tour_guide') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only tour guides can view their bookings." 
            });
        }
        
        const acceptedBookings = await Booking.find({ 
            guideId: guideId,
            guideAccepted: true,
            status: { $nin: ['Completed', 'Cancelled'] }
        })
        .populate('userId', 'firstName lastName email phone')
        .populate('packageId', 'title location category duration')
        .sort({ startDate: 1 });
        
        res.json({ 
            success: true, 
            bookings: acceptedBookings 
        });
    } catch (error) {
        console.log("Get guide accepted bookings error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get tour guide's completed bookings
const getGuideCompletedBookings = async (req, res) => {
    try {
        const guideId = req.user._id;
        
        // Verify the user is a tour guide
        if (req.user.role !== 'tour_guide') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only tour guides can view their completed bookings." 
            });
        }
        
        const completedBookings = await Booking.find({ 
            guideId: guideId,
            guideAccepted: true,
            status: 'Completed'
        })
        .populate('userId', 'firstName lastName email phone')
        .populate('packageId', 'title location category duration')
        .sort({ endDate: -1 });
        
        res.json({ 
            success: true, 
            bookings: completedBookings 
        });
    } catch (error) {
        console.log("Get guide completed bookings error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Tour guide accepts a booking
// Supports two cases:
// 1) Self-assign unassigned paid booking
// 2) Accept admin-assigned booking for this guide (not yet accepted)
const acceptBookingAsGuide = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const guideId = req.user._id;
        
        // Verify the user is a tour guide
        if (req.user.role !== 'tour_guide') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only tour guides can accept bookings." 
            });
        }
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }
        
        const canSelfAssign = booking.status === 'Payment Confirmed' && booking.guideId === null;
        const isAssignedToThisGuide = booking.guideId
            && booking.guideId.toString() === guideId.toString()
            && !booking.guideAccepted;

        if (!canSelfAssign && !isAssignedToThisGuide) {
            return res.status(400).json({
                success: false,
                message: "Booking is not available for you to accept"
            });
        }

        if (canSelfAssign) {
            booking.guideId = guideId;
        }
        booking.guideAccepted = true;
        booking.guideAcceptedAt = new Date();
        booking.status = 'Guide Assigned';
        await booking.save();
        
        res.json({ 
            success: true, 
            message: "Booking accepted successfully",
            booking: booking 
        });
    } catch (error) {
        console.log("Accept booking as guide error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Tour guide completes a tour
const completeTourAsGuide = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const guideId = req.user._id;
        
        // Verify the user is a tour guide
        if (req.user.role !== 'tour_guide') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only tour guides can complete tours." 
            });
        }
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }
        
        // Check if booking belongs to this guide
        if (booking.guideId.toString() !== guideId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. You can only complete your own tours." 
            });
        }
        
        // Update booking status to completed
        booking.status = 'Completed';
        await booking.save();
        
        res.json({ 
            success: true, 
            message: "Tour completed successfully",
            booking: booking 
        });
    } catch (error) {
        console.log("Complete tour as guide error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Admin assigns driver to booking
const assignDriverToBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { driverId } = req.body;
        
        // Verify the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only admins can assign drivers." 
            });
        }
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }
        
        // Prevent assignment for cancelled bookings
        if (booking.status === 'Cancelled') {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot assign driver to a cancelled booking" 
            });
        }
        // Check if booking is in a state where driver can be assigned
        if (booking.status !== 'Payment Confirmed' && booking.status !== 'Pending') {
            return res.status(400).json({ 
                success: false, 
                message: "Booking is not in a state where driver can be assigned" 
            });
        }
        
        // Update booking with driver assignment
        booking.driverId = driverId;
        booking.driverAccepted = false;
        booking.driverAcceptedAt = null;
        booking.status = 'Driver Assigned';
        await booking.save();
        
        res.json({ 
            success: true, 
            message: "Driver assigned successfully",
            booking: booking 
        });
    } catch (error) {
        console.log("Assign driver error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Admin assigns guide to booking
const assignGuideToBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { guideId } = req.body;
        
        // Verify the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only admins can assign guides." 
            });
        }
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }
        
        // Prevent assignment for cancelled bookings
        if (booking.status === 'Cancelled') {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot assign guide to a cancelled booking" 
            });
        }
        // Check if booking is in a state where guide can be assigned
        if (booking.status !== 'Payment Confirmed' && booking.status !== 'Pending' && booking.status !== 'Driver Assigned') {
            return res.status(400).json({ 
                success: false, 
                message: "Booking is not in a state where guide can be assigned" 
            });
        }
        
        // Update booking with guide assignment
        booking.guideId = guideId;
        booking.guideAccepted = false;
        booking.guideAcceptedAt = null;
        booking.status = 'Guide Assigned';
        await booking.save();
        
        res.json({ 
            success: true, 
            message: "Guide assigned successfully",
            booking: booking 
        });
    } catch (error) {
        console.log("Assign guide error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Admin completes booking (only when both driver and guide have accepted)
const completeBookingByAdmin = async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        // Verify the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only admins can complete bookings." 
            });
        }
        
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }
        
        // Check if both driver and guide have accepted
        if (!booking.driverAccepted || !booking.guideAccepted) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot complete booking. Both driver and guide must accept first." 
            });
        }
        
        // Update booking status to confirmed
        booking.status = 'Confirmed';
        await booking.save();
        
        res.json({ 
            success: true, 
            message: "Booking completed successfully",
            booking: booking 
        });
    } catch (error) {
        console.log("Complete booking by admin error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export { 
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
    requestCancellation,
    acceptBookingAsGuide,
    completeTourAsGuide,
    assignDriverToBooking,
    assignGuideToBooking,
    completeBookingByAdmin,
    updateBookingDetails
};
