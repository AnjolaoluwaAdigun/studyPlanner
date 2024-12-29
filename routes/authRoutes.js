const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Authentication routes
router.post('/register', registerUser); // Route for user registration
router.post('/login', loginUser); // Route for user login

module.exports = router;
