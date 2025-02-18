import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../utils/api';
import { FiMinus, FiPlus, FiHeart, FiShare2 } from 'react-icons/fi';
import ProductCard from '../components/cards/productCard';

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
                        className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300
                            ${mainImage === img ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                    >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
            
            {/* Main Image */}
            <div className="col-span-10">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
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
                    className={`py-3 rounded-lg font-medium transition-all duration-300
                        ${selectedSize === size 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                >
                    {size}
                </button>
            ))}
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

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await productService.getById(id);
                setProduct(response.data.data);
                
                // Fetch related products
                const relatedResponse = await productService.getAll({ 
                    category: response.data.data.category,
                    limit: 4
                });
                setRelatedProducts(relatedResponse.data.data.filter(p => p._id !== id));
            } catch (err) {
                console.error('Error details:', err); // Add detailed error logging
                setError(err?.response?.data?.message || 'Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        if (id) { // Only fetch if id exists
            fetchProduct();
        }
    }, [id]);

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
            <div className="max-w-7xl mx-auto px-4 py-8">
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
                            <p className="text-lg text-gray-500 mt-2">{product?.productId}</p>
                            
                            <div className="flex items-center gap-4 mt-6">
                                <span className="text-3xl font-bold text-primary">
                                    ₹{product?.price - product?.discount}
                                </span>
                                {product?.discount > 0 && (
                                    <>
                                        <span className="text-xl text-gray-400 line-through">
                                            ₹{product?.price}
                                        </span>
                                        <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
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
                            <h3 className="text-lg font-semibold mb-4">Select Size</h3>
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
                            <button className="flex-1 bg-primary text-white px-8 py-4 rounded-xl font-medium
                                hover:bg-primary/90 active:scale-95 transition-all duration-300">
                                Add to Cart
                            </button>
                            <button className="p-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                                <FiHeart className="text-xl" />
                            </button>
                            <button className="p-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
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
            </div>
        </div>
    );
};

export default Product;
