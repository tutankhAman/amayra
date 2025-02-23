import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../utils/api';
import { FiHeart, FiShoppingBag, FiGrid, FiTrash2, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const WishlistItem = ({ product, onRemove }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    try {
      await onRemove(product._id);
    } finally {
      setRemoving(false);
    }
  };

  const discountedPrice = product.price ? Math.max(0, product.price - (product.discount || 0)) : 0;
  const discountPercentage = product.price && product.discount ? 
    Math.round((product.discount / product.price) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex flex-row">
        {/* Product Image - Left Side */}
        <Link 
          to={`/product/${product._id}`} 
          className="relative w-32 sm:w-48"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover aspect-square"
          />
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2">
              <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                {discountPercentage}% OFF
              </div>
            </div>
          )}
        </Link>

        {/* Product Details - Right Side */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <Link 
              to={`/product/${product._id}`}
              className="block font-medium text-lg text-gray-900 hover:text-primary transition-colors mb-2"
            >
              {product.name}
            </Link>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">
                  ₹{discountedPrice.toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.price?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4 sm:mt-0">
            <Link
              to={`/product/${product._id}`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full
                hover:bg-primary hover:text-white transition-all duration-300"
            >
              <FiShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">View Product</span>
            </Link>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-full
                hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              <FiTrash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyWishlist = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-12 sm:py-24 px-4"
  >
    <div className="relative inline-block">
      <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl transform animate-pulse" />
      <div className="relative bg-white rounded-full p-6 shadow-xl">
        <FiHeart className="w-12 h-12 text-primary mx-auto" />
      </div>
    </div>
    <h3 className="text-2xl font-medium text-gray-900 mt-6 mb-3">Your wishlist is empty</h3>
    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
      Discover and save your favorite items for later
    </p>
    <Link
      to="/shop"
      className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full 
        font-medium hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/25"
    >
      <FiGrid className="w-5 h-5" />
      Explore Products
    </Link>
  </motion.div>
);

const WishlistSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((n) => (
      <div key={n} className="bg-white rounded-lg overflow-hidden animate-pulse flex">
        <div className="w-32 sm:w-48 bg-gray-200" />
        <div className="flex-1 p-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="flex justify-end gap-3">
            <div className="h-10 w-20 bg-gray-200 rounded-full" />
            <div className="h-10 w-20 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await userService.getWishlist();
      setWishlist(response.data.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError(error.response?.data?.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await userService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item._id !== productId));
      toast.success('Item removed from wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 sm:mb-12"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {wishlist.length}
              </span>
              <p className="text-gray-500">
                {wishlist.length === 1 ? 'item saved' : 'items saved'}
              </p>
            </div>
          </div>
          
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white text-primary 
              rounded-full font-medium hover:bg-primary hover:text-white transition-all duration-300 
              shadow-sm hover:shadow-md"
          >
            <FiGrid className="w-5 h-5" />
            <span className="hidden sm:inline">Shop More</span>
          </Link>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <WishlistSkeleton />
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-8 text-center mx-3 sm:mx-0"
            >
              <p className="text-gray-500 mb-4">{error}</p>
              <button 
                onClick={fetchWishlist}
                className="text-primary hover:underline font-medium"
              >
                Try Again
              </button>
            </motion.div>
          ) : wishlist.length === 0 ? (
            <EmptyWishlist />
          ) : (
            <motion.div layout className="space-y-4">
              <AnimatePresence>
                {wishlist.map(product => (
                  <WishlistItem
                    key={product._id}
                    product={product}
                    onRemove={handleRemoveFromWishlist}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;