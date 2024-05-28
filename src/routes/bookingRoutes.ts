import express from 'express';
const router = express.Router ();
import bookingController = require ('../controllers/bookingController');
import authController = require ('../controllers/authController');

router.use (authController.protect);

router.get ('/my-bookings', bookingController.getMyBookings);

router.get ('/stripe-checkout-session/:tourId', bookingController.getStripeCheckoutSession);

router.use (authController.restrictTo('admin', 'lead-guide'));

router.route ('/').get (bookingController.getAllBookings).post (bookingController.createBooking);
router.route ('/:id').get (bookingController.getBooking).patch (bookingController.updateBooking).delete (bookingController.deleteBooking);

export default router;