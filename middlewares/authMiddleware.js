const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;  // Ensure JWT_SECRET is set in your .env file

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Get the token from the Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach the decoded user information to the request object
        next(); // Pass control to the next middleware/route handler
    } catch (err) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateJWT;
