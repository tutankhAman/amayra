import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Shop from '../pages/Shop';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import Product from '../pages/Product';
import Login from '../pages/Login';
import SignUp from '../pages/Signup';
import Cart from '../pages/Cart';
import Profile from '../pages/Profile';
import Wishlist from '../pages/Wishlist';
import Orders from '../pages/Orders';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path='/wishlist' element={<Wishlist />} />
            <Route path='/orders' element={<Orders />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
