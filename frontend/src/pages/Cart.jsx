import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiMapPin, FiPackage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    if (!item?.product) return null;

    const productImage = item.product?.images?.[0] || '/placeholder-image.jpg';
    const productName = item.product?.name || 'Product Name Unavailable';
    const productId = item.product?._id;
    const productStock = item.product?.stock || 0;

    const stockStatus = productStock > 10
        ? { color: 'text-green-500', text: 'In Stock' }
        : productStock > 0
            ? { color: 'text-orange-500', text: `Only ${productStock} left` }
            : { color: 'text-red-500', text: 'Out of Stock' };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="flex gap-6">
                <Link to={`/product/${productId}`} className="w-32 h-32 overflow-hidden rounded-xl group">
                    <div className="relative w-full h-full">
                        <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <Link
                                    to={`/product/${productId}`}
                                    className="text-xl font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2"
                                >
                                    {productName}
                                </Link>
                                <div className="subheading flex items-center gap-3 mt-2">
                                    <span className="text-sm text-gray-500">Size: {item.size}</span>
                                    <span className={`text-sm ${stockStatus.color} flex items-center gap-1`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                        {stockStatus.text}
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onRemove(productId, item.size)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                title="Remove item"
                            >
                                <FiTrash2 size={20} />
                            </motion.button>
                        </div>

                        <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                            <div className="flex items-center bg-gray-50 rounded-lg p-1 shadow-sm">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onUpdateQuantity(productId, item.quantity - 1, item.size)}
                                    className="p-2 rounded-md hover:bg-white disabled:opacity-50 transition-all"
                                    disabled={item.quantity <= 1}
                                >
                                    <FiMinus />
                                </motion.button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onUpdateQuantity(productId, item.quantity + 1, item.size)}
                                    className="p-2 rounded-md hover:bg-white disabled:opacity-50 transition-all"
                                    disabled={item.quantity >= productStock}
                                >
                                    <FiPlus />
                                </motion.button>
                            </div>
                            <div className="subheading flex items-baseline gap-2">
                                <span className="text-sm text-gray-500">Price:</span>
                                <span className="text-2xl font-medium text-primary">₹{item.subtotal}</span>
                                <span className="text-sm text-gray-500">
                                    (₹{item.price} × {item.quantity})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const OrderSummary = ({ subtotal, itemCount }) => {
    const storeAddress = "Amayra Ethnic Collections, Near Ramzan Pull, infront of Haider Nursing Home, Churipatti Road, Kishanganj, Bihar - 855108";

    return (
        <div className="bg-white rounded-xl p-6 space-y-6 shadow-sm divide-y divide-gray-100">
            <div className="space-y-2">
                <h3 className="text-xl font-semibold">Order Summary</h3>
                <p className="subheading text-sm text-gray-500">({itemCount} items)</p>
            </div>

            <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="subheading font-medium text-xl">₹{subtotal}</span>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="flex items-start gap-3 text-gray-600">
                        <FiMapPin className="mt-1 flex-shrink-0 text-primary" />
                        <div>
                            <p className="font-medium text-gray-900">Store Pickup Location</p>
                            <p className="subheading text-sm mt-1">{storeAddress}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-gray-900">
                        <FiPackage className="text-primary" />
                        <p className="font-medium">Important Information</p>
                    </div>
                    <ul className="text-sm space-y-2 text-gray-600 pl-6">
                        <li className="list-disc">Pay on store only</li>
                        <li className="list-disc">Please bring the Order ID with you</li>
                    </ul>
                </div>

                <div className="pt-6">
                    <Link
                        to="/checkout"
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 px-6 rounded-lg
                    font-medium hover:bg-primary/90 active:scale-95 transition-all duration-300 shadow-sm"
                    >
                        <FiShoppingBag className="text-xl" />
                        Continue to Store Pickup
                    </Link>
                </div>
            </div>
        </div>
    );
};

const EmptyCart = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4"
        >
            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm">
                <FiShoppingBag className="w-20 h-20 text-primary/20 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Time to fill it with amazing products!</p>
                <Link
                    to="/shop"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-white py-4 px-8 rounded-lg
                        font-medium hover:bg-primary/90 active:scale-95 transition-all duration-300 w-full sm:w-auto"
                >
                    Explore Shop
                </Link>
            </div>
        </motion.div>
    );
};

const Cart = () => {
    const { cart, loading, updateCartItem, removeFromCart, clearCart, getCartTotals } = useCart();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-16 w-16 border-4 border-primary border-t-transparent"
                />
            </div>
        );
    }

    if (!cart?.items?.length) {
        return <EmptyCart />;
    }

    const { totalAmount: subtotal } = getCartTotals();
    const itemCount = cart?.items?.length || 0;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl mt-4 font-bold text-gray-900">Shopping Cart</h1>
                        <p className="subheading text-gray-500 mt-1">({itemCount} items)</p>
                    </div>
                    {/* <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearCart}
                        className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-2
                            px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
                    >
                        <FiTrash2 /> Clear Cart
                    </motion.button> */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence>
                            {cart?.items?.filter(item => item?.product)?.map((item) => (
                                <CartItem
                                    key={`${item.product._id}-${item.size}`}
                                    item={item}
                                    onUpdateQuantity={updateCartItem}
                                    onRemove={removeFromCart}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="lg:sticky lg:top-4">
                        <OrderSummary subtotal={subtotal} itemCount={itemCount} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;