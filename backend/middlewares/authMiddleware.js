import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if(!token) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const actualToken = token.startsWith("Bearer") ? token.split(" ")[1] : token;
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        console.warn("Verifytoken warning:", error.name, error.message);
        const message = error.name === "TokenExpiredError" ? "Token Expired" : error.name === "JsonWebTokenError" ? "Invalid token signature" : "Invalid token";
        return res.status(401).json({
            message
        });
    }
}

// to make sure that the logged-in user is an admin

export const isAdmin = (req, res, next) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({
            message: "Access Denided"
        });
    }

    next();
}