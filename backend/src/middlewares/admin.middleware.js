import {User} from "../models/user.models"
import { apiError } from "../utils/apiError"
import { asyncHandler } from "../utils/asyncHandler"

export const adminAuth = asyncHandler(async (req,res, next) => {
    try {        
        //comparing the role with admin
        if (user.role !== "admin") {
            throw new apiError(403, "Admin access denied")
        }

        next()

    } catch (error) {
        throw new apiError(401, error?.message)
    }
})

