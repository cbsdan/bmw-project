const User = require('../models/User');
const jwt = require("jsonwebtoken");

exports.isAuthenticatedUser = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing. Login first to access this resource.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is missing. Login first to access this resource.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
            return res.status(401).json({ message: 'User not found. Login first to access this resource.' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token. Login first to access this resource.' });
    }
};
