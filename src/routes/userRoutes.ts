import express from 'express';
const router = express.Router ();
import authController = require ('../controllers/authController');
import multer from 'multer';
const upload = multer ();

router.post ('/sign-up', upload.none (), authController.signup);
router.post ('/log-in', upload.none (), authController.login);

router.post ('/forgot-password', upload.none(), authController.forgotPassword);
router.patch ('/reset-password/:token', upload.none(), authController.resetPassword);

export default router;