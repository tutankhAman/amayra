import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Shop from '../pages/Shop';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import Product from '../pages/Product';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Shop />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
