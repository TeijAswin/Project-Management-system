const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validations/authValidation');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', logout);

module.exports = router;
