import {asyncHandler} from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //getting details
    const {name, email, password} = req.body
    console.log("email:", email);

    //validation
    if (
        [name, email, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    //checking for user existance
    const userExistance = User.findOne({
        $or: [{name}]
    })
    if (userExistance) {
        throw new apiError(409, "Email already exists!")
    }


    //avatar upload
    //checks if file is uplaoded on server and extracts its path
    // const avatarLocalPath = req.files?.avatar[0]?.path;

    // const avatar = await uploadOnCloudinary(avatarLocalPath)

    //user object: create entry in db

    User.create({
        name,
        email,
        password
    })

    //remove pass and refresh token from response
    const creationCheck = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation
    if(!creationCheck){
        throw new apiError(500, "something went wrong while registering the user")
    }

    //return response
    return res.status(201).json(
        new apiResponse(200, creationCheck, "User regitsered successfully")
    )
})

export {registerUser}