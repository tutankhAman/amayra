import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService, reviewService } from '../utils/api';
import { FiMinus, FiPlus, FiHeart, FiShare2, FiStar, FiEdit2, FiTrash2, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProductCard from '../components/cards/productCard';
import { useCart } from '../context/CartContext';

const ImageGallery = ({ images }) => {
    const [mainImage, setMainImage] = useState(images?.[0]);

    return (
        <div className="grid grid-cols-12 gap-4">
            {/* Thumbnail Column */}
            <div className="col-span-2 space-y-4">
                {images?.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setMainImage(img)}
                        className={`w-full aspect-square rounded-md overflow-hidden border-0 transition-all duration-300
                            ${mainImage === img ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                    >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
            
            {/* Main Image */}
            <div className="col-span-10">
                <div className="aspect-[4/5] rounded-md overflow-hidden bg-gray-100">
                    <img
                        src={mainImage}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

const SizeGuide = ({ sizes, selectedSize, onSelectSize }) => {
    return (
        <div className="grid grid-cols-4 gap-3">
            {sizes?.map((size) => (
                <button
                    key={size}
                    onClick={() => onSelectSize(size)}
                    className={`py-3 rounded-md font-medium transition-all duration-300
                        ${selectedSize === size 
                            ? 'bg-tertiary text-primary' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                >
                    {size}
                </button>
            ))}
        </div>
    );
};

const RatingStars = ({ rating, size = "text-lg" }) => {
    return (
        <div className={`flex items-center gap-1 ${size}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                    key={star}
                    className={`${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
            ))}
        </div>
    );
};

const ReviewSection = ({ productId, existingReviews = [] }) => {
    const [reviews, setReviews] = useState(existingReviews);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await reviewService.add({
                productId,
                ...newReview
            });
            
            // Update reviews list with new review
            setReviews(prev => [response.data.data, ...prev]);
            setNewReview({ rating: 5, comment: '' });
            toast.success('Review added successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditReview = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await reviewService.update({
                reviewId: editingReview._id,
                rating: newReview.rating,
                comment: newReview.comment
            });
            
            // Update the reviews list with edited review
            setReviews(prev => prev.map(r => 
                r._id === editingReview._id ? response.data.data : r
            ));
            setEditingReview(null);
            setNewReview({ rating: 5, comment: '' });
            toast.success('Review updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        
        try {
            await reviewService.delete(reviewId);
            setReviews(prev => prev.filter(r => r._id !== reviewId));
            toast.success('Review deleted successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete review');
        }
    };

    const startEdit = (review) => {
        setEditingReview(review);
        setNewReview({
            rating: review.rating,
            comment: review.comment
        });
        // Scroll to form
        document.getElementById('reviewForm').scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingReview(null);
        setNewReview({ rating: 5, comment: '' });
    };

    const reviewStats = {
        average: reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0,
        total: reviews.length,
        distribution: reviews.reduce((acc, r) => {
            acc[r.rating] = (acc[r.rating] || 0) + 1;
            return acc;
        }, {})
    };

    return (
        <div className="space-y-12">
            {/* Review Statistics */}
            <div className="bg-gray-50 rounded-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Overall Rating */}
                    <div className="text-center md:text-left">
                        <h3 className="text-4xl font-bold text-gray-900 mb-2">
                            {reviewStats.average.toFixed(1)}
                        </h3>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                            <RatingStars rating={reviewStats.average} size="text-xl" />
                            <span className="text-gray-500">({reviewStats.total} reviews)</span>
                        </div>
                    </div>
                    
                    {/* Right: Rating Distribution */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => (
                            <div key={rating} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-20">
                                    <span className="text-sm text-gray-600">{rating}</span>
                                    <FiStar className="text-yellow-400 fill-yellow-400" />
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                        style={{ 
                                            width: `${(reviewStats.distribution[rating] || 0) / reviewStats.total * 100}%` 
                                        }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 w-12">
                                    {reviewStats.distribution[rating] || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Write Review Button */}
            <button
                onClick={() => document.getElementById('reviewForm').scrollIntoView({ behavior: 'smooth' })}
                className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-lg font-medium
                    hover:bg-primary/90 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
                <FiMessageCircle className="text-xl" />
                Write a Review
            </button>

            {/* Reviews List */}
            <div className="divide-y divide-gray-100">
                {reviews.map((review) => (
                    <div key={review._id} className="py-8 first:pt-0 last:pb-0 group">
                        <div className="flex items-start gap-4">
                            <img
                                src={review.user?.avatar || '/default-avatar.png'}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{review.user?.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <RatingStars rating={review.rating} />
                                            <span className="text-sm text-gray-500">
                                                • {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    {review.isOwner && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(review)}
                                                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 
                                                    hover:text-primary transition-all"
                                                title="Edit review"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review._id)}
                                                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 
                                                    hover:text-red-500 transition-all"
                                                title="Delete review"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {reviews.length === 0 && (
                    <div className="text-center py-12">
                        <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Reviews Yet</h3>
                        <p className="text-gray-500">Be the first to review this product</p>
                    </div>
                )}
            </div>

            {/* Review Form */}
            <div id="reviewForm" className="bg-white border rounded-xl shadow-sm p-8 mt-8">
                <h3 className="text-xl font-semibold mb-6">
                    {editingReview ? 'Edit Your Review' : 'Write a Review'}
                </h3>
                <form 
                    id="reviewForm"
                    onSubmit={editingReview ? handleEditReview : handleSubmitReview} 
                    className="bg-gray-50 p-6 rounded-lg"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                        className="text-2xl focus:outline-none"
                                    >
                                        <FiStar 
                                            className={`${star <= newReview.rating 
                                                ? "fill-yellow-400 text-yellow-400" 
                                                : "text-gray-300"}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                            <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                className="w-full p-3 border rounded-md focus:ring-primary focus:border-primary"
                                rows="4"
                                placeholder="Share your thoughts about this product..."
                                required
                            />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-primary text-white py-3 rounded-md font-medium
                                    hover:bg-primary/90 active:scale-95 transition-all duration-300
                                    disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
                            </button>
                            {editingReview && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-6 py-3 rounded-md font-medium border border-gray-300
                                        hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Product = () => {
    const { id } = useParams(); // Changed from productId to id to match route parameter
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const { addToCart, loading: cartLoading } = useCart();
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await productService.getById(id);
                setProduct(response.data.data);
                
                // Updated to send productId directly
                const reviewsResponse = await reviewService.get(response.data.data.productId);
                setReviews(reviewsResponse.data.data);
                
                // Fetch related products
                const relatedResponse = await productService.getAll({ 
                    category: response.data.data.category,
                    limit: 4
                });
                setRelatedProducts(relatedResponse.data.data.filter(p => p._id !== id));
            } catch (err) {
                console.error('Error details:', err); 
                setError(err?.response?.data?.message || 'Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        // Scroll to top when component mounts or product ID changes
        window.scrollTo(0, 0);

        // Only fetch if id exists
        if (id) { 
            fetchProduct();
        }
    }, [id]);

    const handleAddToCart = async () => {
        if (!selectedSize) {
            toast.error('Please select a size');
            return;
        }

        if (quantity < 1) {
            toast.error('Please select a valid quantity');
            return;
        }

        if (quantity > (product?.stock || 0)) {
            toast.error('Selected quantity exceeds available stock');
            return;
        }

        setAddingToCart(true);
        try {
            await addToCart(product._id, quantity, selectedSize);
            setQuantity(1);
            setSelectedSize('');
        } catch (error) {
            console.error('Add to cart error:', error);
            // Error handling is already managed by CartContext
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Link to="/shop" className="text-primary hover:underline">
                        Return to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-20">
                {/* Product Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column - Image Gallery */}
                    <div>
                        <ImageGallery images={product?.images || []} />
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="space-y-8">
                        {/* Basic Info */}
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">{product?.name}</h1>
                            <p className="subheading text-lg text-gray-500 mt-2">{product?.productId}</p>
                            
                            {/* Rating Display */}
                            <div className="flex items-center gap-2 mt-3">
                                <RatingStars rating={product?.averageRating || 0} />
                                <span className="text-gray-500">
                                    ({product?.reviews?.length || 0} reviews)
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mt-6">
                                <span className="subheading text-3xl font-bold text-primary">
                                    ₹{product?.price - product?.discount}
                                </span>
                                {product?.discount > 0 && (
                                    <>
                                        <span className="subheading text-xl text-gray-400 line-through">
                                            ₹{product?.price}
                                        </span>
                                        <span className="subheading px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                                            {Math.round((product?.discount / product?.price) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-lg">
                            <p className="text-gray-600">{product?.description}</p>
                        </div>

                        {/* Size Selection */}
                        <div>
                            <h3 className="text-lg rounded-sm font-semibold mb-4">Select Size</h3>
                            <SizeGuide 
                                sizes={product?.sizes} 
                                selectedSize={selectedSize}
                                onSelectSize={setSelectedSize}
                            />
                        </div>

                        {/* Quantity Selector */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quantity</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <FiMinus />
                                </button>
                                <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product?.stock || 10, quantity + 1))}
                                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button 
                                onClick={handleAddToCart}
                                disabled={addingToCart || cartLoading}
                                className="flex-1 bg-primary text-white px-8 py-4 rounded-md font-medium
                                    hover:bg-primary/90 active:scale-95 transition-all duration-300
                                    disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {(addingToCart || cartLoading) ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                                        Adding...
                                    </div>
                                ) : (
                                    'Add to Cart'
                                )}
                            </button>
                            <button className="p-4 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
                                <FiHeart className="text-xl" />
                            </button>
                            <button className="p-4 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
                                <FiShare2 className="text-xl" />
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="border-t pt-8 mt-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-gray-500">Category</h4>
                                    <p className="mt-1 text-gray-900">{product?.category}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-500">Type</h4>
                                    <p className="mt-1 text-gray-900">{product?.type}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-500">Stock</h4>
                                    <p className="mt-1 text-gray-900">{product?.stock} units</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24">
                        <h2 className="text-2xl font-bold mb-8">You may also like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="mt-24">
                    <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
                    <ReviewSection productId={product?.productId} existingReviews={reviews} />
                </div>
            </div>
        </div>
    );
};

export default Product;
