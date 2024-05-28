import express from 'express';
const router = express.Router ();
import bookingController = require ('../controllers/bookingController');
import authController = require ('../controllers/authController');

router.use (authController.protect);

router.get ('/stripe-checkout-session/:tourId', bookingController.getStripeCheckoutSession);


export default router;