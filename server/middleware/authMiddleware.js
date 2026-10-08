const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        // Expected:
        // Authorization: Bearer <token>

        const parts = authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer" ||
            !parts[1]
        ) {
            return res.status(401).json({
                message: "Invalid authorization format"
            });
        }

        const token = parts[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("DECODED TOKEN:", decoded);

        /*
         * Your login JWT currently has:
         *
         * {
         *     id: result.id,
         *     username: result.username,
         *     result: userData
         * }
         *
         * So the actual user information is inside decoded.result.
         */

        const user = decoded.result;

        if (!user || !user.id) {
            return res.status(401).json({
                message: "Invalid token payload"
            });
        }

        req.user = {
            ...user,
            id: decoded.id || user.id
        };

        console.log("AUTHENTICATED USER:", req.user);

        next();

    } catch (error) {

        console.error(
            "AUTH MIDDLEWARE ERROR:",
            error.message
        );

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired"
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        return res.status(401).json({
            message: "Authentication failed"
        });
    }
};

module.exports = verifyToken;