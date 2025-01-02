const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure correct path to the User model

// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ;

// Register a new user
const registerUser = async (req, res) => {
    try {
      const { name, email, password, googleCalendarToken } = req.body;
  
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create the new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        googleCalendarToken, // Add the token here (optional field)
      });
  
      await user.save();
  
      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

// Login a user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Send the token in the response
        res.status(200).json({
            message: 'Login successful',
            token, // Return the token to the client
            user: { id: user._id, email: user.email } // Optionally, you can return user data excluding sensitive information like password
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from "Authorization: Bearer <token>"
    
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach the decoded payload (e.g., user ID) to the request
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
module.exports = {
    registerUser,
    loginUser,
    verifyToken
};
