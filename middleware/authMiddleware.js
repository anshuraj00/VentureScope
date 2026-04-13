const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    try {

        const token = authHeader.split(" ")[1];  // ✅ FIX HERE
        const secret = process.env.JWT_SECRET || "secret123";

        const decoded = jwt.verify(token, secret);

        req.user = decoded;

        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid token"
        });

    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

module.exports = { protect, admin };