import { Router } from "express";

import {
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
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)


//----------secured routes------------//
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(verifyJWT, refreshAccessToken)

router.route("/current-user").get(verifyJWT, getCurrentUser)

//account update operations
router.route("/change-password").patch(verifyJWT, changeCurrentPassword)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

//wishlist operations
router.route("/wishlist").get(verifyJWT, getWishlist)
router.route("/wishlist").post(verifyJWT, addToWishlist)
router.route("/wishlist").delete(verifyJWT, removeFromWishlist)
router.route("/wishlist/:productId").delete(verifyJWT, removeFromWishlist)

export default router