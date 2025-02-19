import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

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
    //getting infor from request body
    const { name, email, password } = req.body;
    
    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    //user existance check
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new apiError(409, "Email already exists!");
    }

    const newUser = await User.create({
        name,
        email,
        password
    });

    // Generate tokens right after user creation
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(newUser._id);

    // Get user without sensitive data
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user");
    }

    const options = {
        httpOnly: true,
        secure: true
    };

    // Return response with cookies set
    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                201, 
                {
                    user: createdUser,
                    accessToken,
                    refreshToken
                },
                "User registered successfully"
            )
        );
});

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

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        path: '/'  // Add path to ensure cookies are cleared properly
    };
    
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    //accessing refresh token form cookie
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request")
    }

   try {
     //verifying token
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
 
     //fetching user form db
     const user = User.findById(decodedToken?._id)
 
     if(!user) {
         throw new apiError(401, "Invalid refresh token")
     }
 
     if(incomingRefreshToken !== user?.refreshToken) {
         throw new apiError(401, "Refresh token is used or expired")
     }
 
     const options = {
         httpOnly: true,
         secure: true
     }
 
     //generating tokens again
     const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
 
     //returning cookies
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(
          new apiResponse(
             200,
             {accessToken, refreshRoken: newRefreshToken},
             "Access token refreshed"
          )
     )
   } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
   }
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    //fetching from frontend
    const {oldPassword, newPassword}= req.body

    //fetching user from database
    const user= await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid old password")
    }

    //setting new password
    user.password = newPassword

    //updating the db
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed succesfully"))

})

//fetching current user using auth middleware
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) {
        throw new apiError(404, "User not found");
    }
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            { user },
            "Current user fetched successfully"
        )
    );
});

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {name, email, address, phone} = req.body

    if(!name || !email){
        throw new apiError(400, "All fields are required")
    }

    //finding the user and updating their details
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name, email, address, phone
            }
        },
        //returning the updated user
        {new: true}
    ).select("-password")

    if (!user) {
        throw new apiError(404, "User not found");
    }

    return res
    .status(200)
    .json(new apiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req,res) => {
    const avatarLocalPath = req.file?.avatarLocalPath

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new apiError(400, "error while uploading file")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user, "Avatar updated successfully"))
})

//wishlist
const addToWishlist = asyncHandler(async (req, res) => {
    //fetch user id
    const user = await User.findById(req.user._id)

    if(!user) {
        throw new apiError(400, "User not found")
    }

    //fetch product id
    const productId = req.body.productId

    //validating product id
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new apiError(400, "Invalid Product ID");
    } 

    //check if product already there in wishlist
    const isInWishlist = user.wishlist.includes(productId);

    if (isInWishlist) {
        throw new apiError(400, "Product is already in wishlist")
    }

    //push to wishlist array
    user.wishlist.push(productId)

    //save the wishlist state
    await user.save();  
    res.status(200).json(new apiResponse(200, user.wishlist, "Wishlist succesfully updated"))  
})

const removeFromWishlist = asyncHandler(async (req, res) => {
    //fetching user
    const user = await User.findById(req.user._id)

    if(!user) {
        throw new apiError(400, "User not found")
    }

    //fetching product
    const productId = req.body.productId

    if(!mongoose.Types.ObjectId.isValid(productId)) {
        throw new apiError(400, "Product id is invalid")
    }

    //checking if product already exists
    const isInWishlist = user.wishlist.includes(productId)
    if (!isInWishlist) {
        throw new apiError(400, "Product not in wishlist")
    }

    //removing product logic
    user.wishlist.pull(productId);

    //saving the wishlist state
    await user.save();

    res.status(200).json(new apiResponse(200, user.wishlist, "Item successfully deleted from wishlist"))
})

const getWishlist = asyncHandler(async (req, res) => {
    //fetching user id
    const user = await User.findById(req.user._id)
    if(!user) {
        throw new apiError(400, "User not found")
    }

    //populating so wishlist shows the attributes of product
    await user.populate("wishlist", "name price images")

    //returning wishlist
    res.status(200).json(new apiResponse(200, user.wishlist, "Wishlist fetched succesfully"))
})

//orderhistory

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    addToWishlist,
    removeFromWishlist, 
    getWishlist
}