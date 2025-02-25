import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Get token from multiple sources
        let token = '';
        
        // Check Authorization header first (for API clients)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        
        // If no token in auth header, check cookies (for browser clients)
        if (!token && req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        
        // Last resort: check body (for testing/development)
        if (!token && req.body?.accessToken) {
            token = req.body.accessToken;
        }

        if (!token) {
            throw new apiError(401, "Authentication token missing");
        }

        // Verify token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new apiError(401, "Token has expired");
            }
            throw new apiError(401, "Invalid token");
        }

        // Get user from database
        const user = await User.findById(decodedToken?._id)
            .select("-password -refreshToken")
            .lean(); // Use lean() for better performance

        if (!user) {
            throw new apiError(401, "Invalid access token - User not found");
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error instanceof jwt.JsonWebTokenError) {
            throw new apiError(401, "Invalid token format");
        }
        
        // If it's already an apiError, throw it directly
        if (error instanceof apiError) {
            throw error;
        }

        // For any other unexpected errors
        throw new apiError(500, "Authentication error: " + error.message);
    }
});