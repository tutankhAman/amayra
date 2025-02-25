import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Check cookies first, then Authorization header
        let token = req.cookies?.accessToken;
        
        if (!token) {
            // Try Authorization header if cookie not found
            const authHeader = req.header("Authorization");
            if (authHeader?.startsWith("Bearer ")) {
                token = authHeader.replace("Bearer ", "");
            }
        }
        
        if (!token) {
            throw new Error("Unauthorized request");
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (!user) {
            throw new Error("Invalid Access Token");
        }
        
        req.user = user;
        next();
    } catch (error) {
        throw new Error(error?.message || "Invalid access token");
    }
});