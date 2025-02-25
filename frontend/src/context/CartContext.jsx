import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { cartService } from '../utils/api';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleError = (error) => {
        setError(error);
        console.error('Cart error:', error);
        // toast.error(error.response?.data?.message || 'Operation failed');
    };

    // Fetch cart data function
    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            const response = await cartService.get();
            setCart(response.data.data);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial cart fetch
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Add item to cart
    const addToCart = async (productId, quantity = 1, size = "Free Size") => {
        try {
            setLoading(true);
            await cartService.add({ productId, quantity, size });
            await fetchCart(); // Fetch updated cart
            toast.success('Item added to cart');
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    // Update cart item
    const updateCartItem = async (productId, quantity, size) => {
        try {
            setLoading(true);
            await cartService.update({ productId, quantity, size });
            await fetchCart(); // Fetch updated cart
            toast.success('Cart updated');
        } catch (error) {
            handleError(error);
            await fetchCart(); // Refresh cart on error
        } finally {
            setLoading(false);
        }
    };

    // Remove item from cart
    const removeFromCart = async (productId, size) => {
        try {
            setLoading(true);
            await cartService.remove({ productId, size });
            await fetchCart(); // Fetch updated cart
            toast.success('Item removed from cart');
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            setLoading(true);
            await cartService.clear();
            await fetchCart(); // Fetch updated cart
            toast.success('Cart cleared');
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate cart totals
    const getCartTotals = () => {
        if (!cart?.items?.length) return { totalItems: 0, totalAmount: 0 };
        
        return {
            totalItems: cart.totalItems,
            totalAmount: cart.items.reduce((sum, item) => sum + item.subtotal, 0)
        };
    };

    // Memoized context value
    const value = useMemo(() => ({
        cart,
        loading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartTotals,
        fetchCart // Add this
    }), [cart, loading, error, fetchCart]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;