import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

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
    // Get data from request body and validate
    const { name, email, phone, password } = req.body;
    
    console.log("Registration attempt:", { name, email, phone }); // Debug log
    
    if ([name, email, phone, password].some((field) => !field?.trim())) {
        throw new apiError(400, "All fields (name, email, phone, password) are required");
    }

    // Check for existing user by email or phone
    const existingUser = await User.findOne({
        $or: [{ email }, { phone }]
    });

    if (existingUser) {
        throw new apiError(409, "User with this email or phone already exists");
    }

    // Create new user
    const newUser = await User.create({
        name,
        email,
        phone,
        password
    });

    // Generate tokens
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
    const { phone, password } = req.body
    if (!phone && !password) {
        throw new apiError(400, "phone no. or password is required")
    }

    //find user in db
    const user = await User.findOne({ phone })

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
         secure: true,
         sameSite:"None"
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

    if(!name || !phone){
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

const updateUserAvatar = asyncHandler(async (req, res) => {
    // Debug logging
    console.log("Files received:", req.files);
    console.log("Single file:", req.file);

    if (!req.file) {
        throw new apiError(400, "No avatar file uploaded");
    }

    const avatarLocalPath = req.file.path;
    console.log("Local file path:", avatarLocalPath);

    // Get current user and their avatar
    const user = await User.findById(req.user?._id);
    
    // // Delete old avatar from cloudinary if exists
    // if (user?.avatar) {
    //     // Extract public_id from the URL
    //     const publicId = user.avatar.split('/').pop().split('.')[0];
    //     if (publicId) {
    //         console.log("Attempting to delete old avatar with public ID:", publicId);
    //         await deleteFromCloudinary(publicId);
    //     }
    // }

    // Upload new avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar || !avatar.url) {
        throw new apiError(400, "Error while uploading avatar");
    }

    // Update user with new avatar URL
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new apiResponse(200, updatedUser, "Avatar updated successfully"));
});

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
    const productId = req.params.productId

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
    await user.populate("wishlist", "name price images discount")

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