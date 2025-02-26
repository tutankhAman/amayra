import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCartPlus } from "react-icons/fa";
import { useOrderStatus } from '../../context/OrderStatusContext';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { ordersEnabled } = useOrderStatus();

    const handleCardClick = () => {
        if (ordersEnabled) {
            console.log('Navigating to product:', product._id);
            navigate(`/product/${product._id}`);
        }
    };

    return (
        <div 
            onClick={handleCardClick}
            className="group relative bg-white/80 backdrop-blur-sm rounded-xl shadow-sm 
                hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        >
            {/* Discount Badge */}
            <div className="absolute top-3 left-3 z-10">
                <div className="subheading px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white 
                    rounded-lg text-sm font-medium shadow-lg">
                    ₹{product.discount} OFF!
                </div>
            </div>

            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
                <img
                    src={product.images}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* <button 
                    onClick={handleCartClick}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-primary p-3 
                        rounded-full shadow-lg transform translate-y-12 opacity-0 group-hover:translate-y-0 
                        group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                    <FaCartPlus className="text-xl" />
                </button> */}
            </div>

            {/* Product Details */}
            <div className="p-4">
                <h3 className="font-semibold text-xl text-gray-900 group-hover:text-primary transition-colors duration-300">
                    {product.name}
                </h3>
                <p className="subheading text-sm text-gray-500 mt-1">{product.productId}</p>
                
                <div className="mt-3 flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="subheading text-lg font-bold text-primary">
                            ₹{product.price - product.discount}
                        </span>
                        <div className="subheading text-sm text-gray-400 line-through">
                            ₹{product.price}
                        </div>
                    </div>
                    <div className="subheading text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                        {Math.round((product.discount / product.price) * 100)}% OFF
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;