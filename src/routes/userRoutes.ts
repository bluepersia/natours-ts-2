import express from 'express';
const router = express.Router ();
import authController = require ('../controllers/authController');
import multer from 'multer';
const upload = multer ();

router.post ('/sign-up', upload.none (), authController.signup);


export default router;