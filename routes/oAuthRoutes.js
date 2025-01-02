const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware'); // Adjust the path based on your project structure
const { generateAuthUrl, getTokens } = require('../utils/authUtils');
const User = require('../models/User');
const mongoose = require('mongoose');

const router = express.Router();

// Use authenticateJWT to protect routes
router.get("/google", authenticateJWT, (req, res) => {
  const userId = req.user.id; // Assuming user data is added by authenticateJWT middleware
  const authUrl = generateAuthUrl(userId);  // Pass userId to the auth URL
  res.redirect(authUrl);
});

// Callback endpoint to handle Google OAuth
router.get("/oauth2callback", async (req, res) => {
  const { code, state } = req.query; // Capture 'state' which should be the userId

  // Log the state to debug its value
  console.log("State parameter:", state); 

  try {
    // Validate the state parameter
    if (!state || !mongoose.Types.ObjectId.isValid(state)) {
      return res.status(400).json({ error: "Invalid or missing user ID in state" });
    }

    // Retrieve tokens from Google OAuth callback
    const tokens = await getTokens(code);

    // Use the valid userId from state to find the user
    const user = await User.findById(state);

    // Check if user is found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Save the Google Calendar token to the user's record
    user.googleCalendarToken = tokens.access_token;
    await user.save();

    // Send a success response to the client
    res.status(200).json({ message: "Google Calendar connected successfully" });
  } catch (error) {
    // Log and handle errors in the OAuth process
    console.error("Error in OAuth callback:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

module.exports = router;
