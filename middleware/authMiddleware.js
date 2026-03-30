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

        const decoded = jwt.verify(token, "secret123");

        req.user = decoded;

        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid token"
        });

    }
};

module.exports = protect;