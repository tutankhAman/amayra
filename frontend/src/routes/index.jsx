import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Shop from '../pages/Shop';
import Home from '../pages/Home';
import Admin from '../pages/Admin';
import NotFound from '../pages/NotFound';
import Product from '../pages/Product';
import Login from '../pages/Login';
import SignUp from '../pages/Signup';
import Cart from '../pages/Cart';
import Profile from '../pages/Profile';
import Wishlist from '../pages/Wishlist';
import Orders from '../pages/Orders';
import AdminOrders from '../pages/AdminOrders';
import AdminProducts from '../pages/AdminProducts';
import PrivateRoute from '../components/PrivateRoute';

const AppRoutes = () => {
    const { user, loading } = useUser();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/" element={user?.role === 'admin' ? <Admin /> : <Home />} />
            <Route path="/shop" element={<Shop />} />
            
            {/* Public routes - redirect to home if already logged in */}
            <Route 
                path="/login" 
                element={!user ? <Login /> : <Navigate to="/" replace />} 
            />
            <Route 
                path="/signup" 
                element={!user ? <SignUp /> : <Navigate to="/" replace />} 
            />
            
            {/* Protected routes */}
            <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
            
            {/* Public routes */}
            <Route path="/product/:id" element={<Product />} />
            
            {/* Admin routes */}
            <Route 
                path="/order/all" 
                element={
                    <PrivateRoute>
                        {user?.role === 'admin' ? <AdminOrders /> : <NotFound />}
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/admin/products" 
                element={
                    <PrivateRoute>
                        {user?.role === 'admin' ? <AdminProducts /> : <NotFound />}
                    </PrivateRoute>
                } 
            />
            
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
