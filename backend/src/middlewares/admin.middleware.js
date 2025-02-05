import {User} from "../models/user.models.js"
import { apiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const adminAuth = asyncHandler(async (req,res, next) => {
    try {        
        //comparing the role with admin
        if (req.user.role !== "admin") {
            throw new apiError(403, "Admin access denied")
        }

        next()

    } catch (error) {
        throw new apiError(401, error?.message)
    }
})

