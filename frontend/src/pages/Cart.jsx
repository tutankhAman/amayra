import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    return (
        <div className="flex gap-4 py-4 border-b">
            {/* Product Image */}
            <Link to={`/product/${item.product._id}`} className="w-24 h-24">
                <img 
                    src={item.product.images[0]} 
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded-md"
                />
            </Link>

            {/* Product Details */}
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Link 
                        to={`/product/${item.product._id}`}
                        className="text-lg font-medium text-gray-900 hover:text-primary"
                    >
                        {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                    <p className="text-sm text-gray-500">Price: ₹{item.price}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onUpdateQuantity(item.product._id, item.quantity - 1, item.size)}
                        className="p-1 rounded-md hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                    >
                        <FiMinus className="text-lg" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.product._id, item.quantity + 1, item.size)}
                        className="p-1 rounded-md hover:bg-gray-100"
                        disabled={item.quantity >= item.product.stock}
                    >
                        <FiPlus className="text-lg" />
                    </button>
                </div>

                {/* Subtotal and Remove */}
                <div className="flex items-center gap-4">
                    <p className="font-medium">₹{item.subtotal}</p>
                    <button
                        onClick={() => onRemove(item.product._id, item.size)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove item"
                    >
                        <FiTrash2 />
                    </button>
                </div>
            </div>
        </div>
    );
};

const OrderSummary = ({ subtotal, tax = 0 }) => {
    const total = subtotal + tax;

    return (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹{tax}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-base font-medium">
                        <span>Total</span>
                        <span>₹{total}</span>
                    </div>
                </div>
            </div>

            <Link
                to="/checkout"
                className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-md
                    font-medium hover:bg-primary/90 active:scale-95 transition-all duration-300"
            >
                <FiShoppingBag className="text-xl" />
                Proceed to Checkout
            </Link>
        </div>
    );
};

const EmptyCart = () => (
    <div className="text-center py-12">
        <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add items to your cart to proceed with checkout</p>
        <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white py-3 px-8 rounded-md
                font-medium hover:bg-primary/90 active:scale-95 transition-all duration-300"
        >
            Continue Shopping
        </Link>
    </div>
);

const Cart = () => {
    const { 
        cart, 
        loading, 
        updateCartItem, 
        removeFromCart, 
        clearCart,
        getCartTotals 
    } = useCart();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!cart?.items?.length) {
        return <EmptyCart />;
    }

    const { totalAmount: subtotal } = getCartTotals();
    const tax = Math.round(subtotal * 0.18); // 18% tax

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Shopping Cart</h1>
                    <button
                        onClick={clearCart}
                        className="text-sm text-red-500 hover:text-red-600"
                    >
                        Clear Cart
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 divide-y">
                        {cart?.items?.map((item) => (
                            <CartItem
                                key={`${item.product?._id || item.product}-${item.size}`}
                                item={item}
                                onUpdateQuantity={updateCartItem}
                                onRemove={removeFromCart}
                            />
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <OrderSummary subtotal={subtotal} tax={tax} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;