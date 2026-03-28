const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization) {
        if (req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else {
            token = req.headers.authorization;
        }
    }

    if (!token) {
        console.warn("Auth failed: No token provided in headers.");
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        next();
    } catch (error) {
        console.error("Auth failed: Token verification error:", error.message);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

