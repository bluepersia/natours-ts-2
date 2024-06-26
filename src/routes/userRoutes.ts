import express from 'express';
const router = express.Router ();
import reviewRouter from './reviewRoutes';
import authController = require ('../controllers/authController');
import userController = require ('../controllers/userController');
import multer from 'multer';
const upload = multer ();

router.use ('/:userId/reviews', reviewRouter);

router.post ('/sign-up', upload.none (), authController.signup);
router.post ('/log-in', upload.none (), authController.login);

router.post ('/forgot-password', upload.none(), authController.forgotPassword);
router.patch ('/reset-password/:token', upload.none(), authController.resetPassword);

router.use (authController.protect);

router.patch('/update-password', upload.none (), authController.updatePassword);

router.patch ('/update-me', userController.uploadPhoto, userController.processPhoto, userController.updateMe);
router.delete ('/delete-me', userController.deleteMe);
router.get ('/me', userController.getMe);

router.use (authController.restrictTo ('admin'));

router.route ('/').get (userController.getAllUsers).post (userController.createUser);
router.route ('/:id').get (userController.getUser).patch (userController.updateUser).delete (userController.deleteUser);

export default router;