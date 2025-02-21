import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CartContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ products: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the cart
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/cart`, { withCredentials: true });
      setCart(response.data.data || { products: [], totalPrice: 0 });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch cart';
      setError(errorMsg);
      setCart({ products: [], totalPrice: 0 }); // Reset cart on error
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Add item to cart
  const addToCart = async (productData) => {
    setLoading(true);
    try {
      console.log('Adding to cart:', productData); // Debug log
      const response = await axios.post(
        `${API_URL}/cart/add`,
        {
          productId: productData.productId,
          quantity: productData.quantity,
          size: productData.size
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.data) {
        setCart(response.data.data);
        toast.success('Item added to cart');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Cart error details:', error.response || error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add item';
      toast.error(errorMessage);
      throw error; // Re-throw to handle in the component
    } finally {
      setLoading(false);
    }
  };

  // Update cart item
  const updateCart = async (productData) => {
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/cart/update`, productData, { withCredentials: true });
      setCart(response.data.data);
      toast.success('Cart updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productData) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${API_URL}/cart/delete`, {
        data: productData,
        withCredentials: true,
      });
      setCart(response.data.data);
      toast.success('Item removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.totalPrice;
  const itemCount = cart.products.length;

  return (
    <CartContext.Provider value={{ cart, loading, error, cartTotal, itemCount, addToCart, updateCart, removeFromCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
