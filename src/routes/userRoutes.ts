import express from 'express';
const router = express.Router ();
import authController = require ('../controllers/authController');
import userController = require ('../controllers/userController');
import multer from 'multer';
const upload = multer ();

router.post ('/sign-up', upload.none (), authController.signup);
router.post ('/log-in', upload.none (), authController.login);

router.post ('/forgot-password', upload.none(), authController.forgotPassword);
router.patch ('/reset-password/:token', upload.none(), authController.resetPassword);

router.use (authController.protect);

router.patch('/update-password', upload.none (), authController.updatePassword);

router.patch ('/update-me', upload.none (), userController.updateMe);
router.delete ('/delete-me', userController.deleteMe);

router.use (authController.restrictTo ('admin'));

router.route ('/').get (userController.getAllUsers).post (userController.createUser);
router.route ('/:id').get (userController.getUser).patch (userController.updateUser).delete (userController.deleteUser);

export default router;