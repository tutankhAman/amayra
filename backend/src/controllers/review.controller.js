
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

const getReview = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user?._id; // Will be undefined for non-authenticated users

    const product = await Product.findOne({ productId });

    if (!product) {
        throw new apiError(404, `Product with productId ${productId} doesn't exist`);
    }
    
    // Fetch reviews and populate user details, handling deleted users
    const productReviews = await Review.find({ product: product._id })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 });

    // Map reviews and handle deleted users
    const reviewsWithOwnership = productReviews.map(review => {
        const reviewObj = review.toObject();
        
        // Handle deleted users
        if (review.isDeletedUser || !reviewObj.user) {
            reviewObj.user = {
                name: 'Deleted User',
                avatar: '/default-avatar.png'
            };
            reviewObj.isOwner = false;
        } else {
            reviewObj.isOwner = userId ? reviewObj.user._id.toString() === userId.toString() : false;
        }

        return reviewObj;
    });

    res.status(200).json(
        new apiResponse(200, reviewsWithOwnership, "Reviews fetched successfully")
    );
});

const deleteReview = asyncHandler(async (req, res) => {
    // Getting reviewId from request body
    const { reviewId } = req.body; 
    const userId = req.user._id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new apiError(404, "Review not found");
    }

    // Check if review is from a deleted user
    if (review.isDeletedUser) {
        throw new apiError(410, "This review belongs to a deleted user account");
    }

    // Check if the user is the owner of the review
    if (review.user.toString() !== userId.toString()) {
        throw new apiError(403, "Unauthorized to delete this review");
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Update the product's average rating
    const product = await Product.findById(review.product);
    if (product) {
        const remainingReviews = await Review.find({ product: product._id });

        if (remainingReviews.length > 0) {
            const newAvgRating =
                remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length;
            product.avgRating = newAvgRating;
        } else {
            product.avgRating = 0;
        }

        await product.save();
    }

    res.status(200).json(new apiResponse(200, null, "Review deleted successfully"));
});

const updateReview = asyncHandler(async (req, res) => {
    const { reviewId, rating, comment } = req.body; // Getting reviewId, rating, and comment from request body
    const userId = req.user._id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new apiError(404, "Review not found");
    }

    // Check if review is from a deleted user
    if (review.isDeletedUser) {
        throw new apiError(410, "This review belongs to a deleted user account");
    }

    // Check if the user is the owner of the review
    if (review.user.toString() !== userId.toString()) {
        throw new apiError(403, "Unauthorized to update this review");
    }

    // Update rating and/or comment
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    // Update the product's average rating
    const product = await Product.findById(review.product);
    if (product) {
        const allReviews = await Review.find({ product: product._id });

        if (allReviews.length > 0) {
            const newAvgRating =
                allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            product.avgRating = newAvgRating;
        } else {
            product.avgRating = 0;
        }

        await product.save();
    }

    res.status(200).json(new apiResponse(200, review, "Review updated successfully"));
});



export {addReview, getReview, deleteReview, updateReview}
