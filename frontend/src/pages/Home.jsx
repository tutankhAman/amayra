import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Shop from '../components/buttons/Shop'
import ProductCard from '../components/cards/productCard'
import { analyticsService, productService } from '../utils/api'

const Home = () => {
    const navigate = useNavigate();
    const [bestSellers, setBestSellers] = useState([]);
    const [eidCollection, setEidCollection] = useState([]);

    // Add this useEffect to scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch best sellers
                const bestSellersResponse = await analyticsService.getTopProducts();
                setBestSellers(bestSellersResponse.data.data);

                // Fetch Eid Collection products
                const eidResponse = await productService.getAll({ tags: 'Eid Collection' });
                setEidCollection(eidResponse.data.data);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };

        fetchProducts();
    }, []);

    const handleCategoryNavigation = (category) => {
        navigate(`/shop?category=${category}`);
    };

    const handleShopClick = () => {
        navigate('/shop');
    };

    return (
        <div className='flex flex-col items-center w-full'>
            <div className="w-full max-w-[1200px] px-4 sm:px-6 md:px-8">
                <div
                    className="w-full h-[200px] sm:h-[400px] md:h-[500px] lg:h-[600px] 
                    mt-14 sm:mt-20 lg:mt-12 mb-8 lg:mb-14 rounded-lg bg-cover bg-center bg-no-repeat relative overflow-hidden"
                    style={{
                        backgroundImage: `url('https://res.cloudinary.com/dh0xbfq7w/image/upload/f_auto,q_auto/v1/website%20assets/dbko7tw2n5ilobzpbxgu')`,
                        objectFit: 'cover'
                    }}
                >
                    <div className="absolute bottom-6 left-6 sm:bottom-12 sm:left-12 md:bottom-16 md:left-16 lg:bottom-20 lg:left-24 scale-75 sm:scale-100">
                        <Shop onClick={handleShopClick} />
                    </div>
                    <span className="absolute bottom-2 right-4 text-[10px] sm:text-xs text-gray-900 opacity-70">
                        @www.candidshutters.com
                    </span>
                </div>
            </div>
            
            <div className='w-full max-w-[1200px] mb-8 h-auto sm:h-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 px-4 sm:px-6 md:px-8 py-4 sm:py-0'>
                <h2 className='heading text-2xl sm:text-4xl font-bold'>Our collection:</h2>
                <div className='w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0'>
                    <div className='flex w-max sm:w-auto'>
                        {['Kurta', 'Pajama', 'Indo-Western', 'Sherwani', 'Lehenga'].map((item) => (
                            <button 
                                key={item} 
                                onClick={() => handleCategoryNavigation(item)}
                                className='px-4 border-x border-gray-500 h-10 font-semibold whitespace-nowrap transition-colors duration-300 hover:bg-tertiary/80 bg-tertiary/50 sm:bg-transparent'
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Eid Collection Section */}
            <div className='w-full max-w-[1200px] px-3 sm:px-6 md:px-8 mb-12 sm:mb-16'>
                <h2 className='heading text-2xl sm:text-3xl lg:text-5xl font-bold mb-6 sm:mb-10 mt-6 sm:mt-8 text-center'>
                — Eid Collection —
                </h2>
                <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6'>
                    {eidCollection.slice(0, 6).map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
                {eidCollection.length > 6 && (
                    <div className='flex justify-center mt-8'>
                        <button
                            onClick={() => navigate('/shop?tags=Eid Collection')}
                            className='px-6 py-2 bg-tertiary/50 hover:bg-tertiary/80 transition-colors duration-300 rounded-lg font-medium'
                        >
                            View All Eid Collection
                        </button>
                    </div>
                )}
            </div>

            {/* Best Sellers Section */}
            <div className='w-full max-w-[1200px] px-3 sm:px-6 md:px-8 mb-12 sm:mb-16'>
                <h2 className='heading text-2xl sm:text-3xl lg:text-5xl font-bold mb-6 sm:mb-10 mt-6 sm:mt-8 text-center'>
                — Our Best Sellers —
                </h2>
                <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6'>
                    {bestSellers.slice(0, 6).map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </div>

            <div className='mb-6 sm:mb-8 scale-90 sm:scale-100'>
                <Shop onClick={handleShopClick} />
            </div>
        </div>        
    )
}

export default Home