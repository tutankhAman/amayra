import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"

//middleware check if the user is authenticated
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        //accessing cookies (here, access token cookie)
        const token = req.cookies?.accessToken ||
            //in case user send a custom header (in case of mobile devices)
            req.header("Authorization")?.replace("Bearer ", "")
    
        if (!token) {
            throw new apiError(401, "Unauthorized request")
        }
    
        //verifying the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        //fetching the user from database
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    
        if (!user) {
            throw new apiError(401, "Invalid access token")
        }
    
        req.user = user;
        next()

    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token")
    }
})