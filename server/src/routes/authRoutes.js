const express = require('express');
const router = express.Router();
const { loginAdmin, requestOtp, verifyOtp, registerHR } = require('../controllers/authController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.post('/login', loginAdmin);

router.post('/register-hr', protect, restrictTo('ADMIN'), registerHR); 

router.post('/otp-request', requestOtp);
router.post('/otp-verify', verifyOtp);

module.exports = router;