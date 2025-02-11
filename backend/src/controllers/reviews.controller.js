import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Review } from "../models/review.models.js"
import { Product } from "../models/product.models.js";

const addReview = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { productId, comment, rating } = req.body

    //product check
    const product = await Product.findOne({ productId: productId })

    if (!product) {
        throw new apiError(404, "Product doesn't exist")
    }

    //check if already reviewed
    const existingReview = await Review.findOne({ product: product._id, user: userId })

    if (existingReview) {
        throw new apiError(400, `User: ${userId} has already reviewed the product ${productId}`)
    }

    //rating validation
    if (rating < 1 || rating > 5) {
        throw new apiError(400, "Rating must range from 1 to 5")
    }

    //creating a review
    const review = await Review.create
        ({
            product: product._id,
            user: userId,
            rating: rating,
            comment: comment
        })

    //pushing to reviews array
    product.reviews.push(review)

    //recalculating average rating
    const totalRatings = product.reviews.length;
    const sumOfRatings = product.reviews.reduce((acc, r) => acc + r.rating, 0)
    product.averageRating = (sumOfRatings / totalRatings).toFixed(1)

    //saving review
    await product.save()

    res.status(201).json(new apiResponse(201, review, "Review added successfully"))
})

export {addReview}
