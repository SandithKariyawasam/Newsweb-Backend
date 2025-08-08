const express = require('express');
const router = express.Router();
const axios = require('axios');
const bcrypt = require('bcrypt');
const User = require("../models/Users");
const qs = require('querystring');

// CAPTCHA verification function to reuse in both routes
async function verifyCaptcha(token) {
  const verifyURL = 'https://www.google.com/recaptcha/api/siteverify';
  const verifyBody = qs.stringify({
    secret: process.env.RECAPTCHA_SECRET_KEY,
    response: token,
  });

  const { data: captchaRes } = await axios.post(verifyURL, verifyBody, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return captchaRes.success;
}

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { username, password, captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ message: 'Please complete the CAPTCHA' });
    }

    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password, captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ message: 'Please complete the CAPTCHA' });
    }

    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Use role from user document
    const role = user.role || 'user';

    // Send role along with login success response
    res.status(200).json({
      message: 'Login successful',
      role,
      token: 'your-jwt-token' // you can replace with real JWT token generation
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});



module.exports = router;
