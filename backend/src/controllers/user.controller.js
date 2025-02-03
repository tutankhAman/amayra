import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";

//internal method to generate refresh and access tokens
const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        //finding user and generation
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //saving in db
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //getting details
    const { name, email, password } = req.body
    console.log("email:", email);

    //validation
    if (
        [name, email, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    //checking for user existance
    const userExistance = await User.findOne({
        $or: [{ email }]
    })
    if (userExistance) {
        throw new apiError(409, "Email already exists!")
    }


    //avatar upload
    //checks if file is uplaoded on server and extracts its path
    // const avatarLocalPath = req.files?.avatar[0]?.path;

    // const avatar = await uploadOnCloudinary(avatarLocalPath)

    //user object: create entry in db
    const newUser = await User.create({
        name,
        email,
        password
    })

    //remove pass and refresh token from response
    const creationCheck = await User.findById(newUser._id).select(
        "-password -refreshToken"
    )

    //check for user creation
    if (!creationCheck) {
        throw new apiError(500, "something went wrong while registering the user")
    }

    //return response
    return res.status(201).json(
        new apiResponse(200, creationCheck, "User regitsered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    //req body from data
    const { email, password } = req.body
    if (!email && !password) {
        throw new apiError(400, "email or password is required")
    }

    //find user in db
    const user = await User.findOne({ email })

    if (!user) {
        throw new apiError(404, "User does not exist. Please Register!");
    }

    //passwordcheck
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials")
    }

    //access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //remove password and refresh token form response
    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    //additional security
    const options = {
        httpOnly: true,
        secure: true
    }

    //send cookie
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})

export { registerUser }