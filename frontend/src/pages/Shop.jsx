import React, { useState, useEffect } from 'react';
import { productService } from '../utils/api';
import ProductCard from '../components/cards/productCard';
import debounce from 'lodash/debounce';
import { FiFilter, FiX } from 'react-icons/fi'; // Import icons

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        type: '', // Add type filter
        minPrice: '',
        maxPrice: '',
        sizes: [],
        sortBy: 'newest',
        page: 1,
        limit: 12
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Constants for filter options
    const categories = ['Sherwani', 'Kurta', 'Lehenga', 'Saree', 'Others'];
    const types = ['Men', 'Women', 'Kids']; // Add types constant with the available options
    const availableSizes = ['S', 'M', 'L', 'XL'];
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'priceLowToHigh', label: 'Price: Low to High' },
        { value: 'priceHighToLow', label: 'Price: High to Low' }
    ];

    // Updated fetchProducts function to properly format params
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const queryParams = {
                category: filters.category || undefined,
                type: filters.type || undefined, // Add type to query params
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
                sizes: filters.sizes.length > 0 ? filters.sizes.join(',') : undefined,
                sortBy: filters.sortBy || 'newest',
                page: filters.page,
                limit: filters.limit
            };

            // Clean undefined values
            const cleanParams = Object.fromEntries(
                Object.entries(queryParams).filter(([_, v]) => v !== undefined)
            );

            const response = await productService.getAll(cleanParams);
            
            if (response.data?.data) {
                setProducts(response.data.data);
                setError(null);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to fetch products');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Update the debouncedSearch function
    const performSearch = async (query) => {
        try {
            setLoading(true);
            const response = await productService.search({
                search: query.trim(),
                page: 1,
                limit: filters.limit
            });
            
            if (response?.data?.data) {
                setProducts(response.data.data);
                setError(null);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('No products found matching your search');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = debounce(performSearch, 500);

    useEffect(() => {
        if (searchQuery.trim()) {
            debouncedSearch(searchQuery);
        } else {
            fetchProducts();
        }
        
        // Cleanup function for debounce
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery]);

    // Separate useEffect for filters
    useEffect(() => {
        if (!searchQuery.trim()) {
            fetchProducts();
        }
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }));
    };

    const handleSizeToggle = (size) => {
        setFilters(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size],
            page: 1
        }));
    };

    const FiltersContent = () => (
        <div className="space-y-6">
            {/* Type Filter - Add this new section */}
            <div className="bg-white p-4 rounded-sm shadow">
                <h3 className="text-xl font-semibold mb-3">Type</h3>
                <select
                    className="subheading w-full p-2 border rounded-md"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                    <option value="">All Types</option>
                    {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Category Filter */}
            <div className="bg-white p-4 rounded-sm shadow">
                <h3 className="text-xl font-semibold mb-3">Categories</h3>
                <select
                    className="subheading w-full p-2 border rounded-md"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </div>

            {/* Price Range */}
            <div className="bg-white p-4 rounded-sm shadow">
                <h3 className="text-xl font-semibold mb-3">Price Range</h3>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        className="subheading w-1/2 p-2 border rounded-md"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        className="subheading w-1/2 p-2 border rounded-md"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                </div>
            </div>

            {/* Size Filter */}
            <div className="bg-white p-4 rounded-sm shadow">
                <h3 className="text-xl font-semibold mb-3">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                        <button
                            key={size}
                            className={`px-3 py-1 rounded-sm ${
                                filters.sizes.includes(size)
                                    ? 'bg-primary text-white'
                                    : 'bg-tertiary hover:bg-primary'
                            }`}
                            onClick={() => handleSizeToggle(size)}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sort Options */}
            <div className="bg-white p-4 rounded-sm shadow">
                <h3 className="text-xl font-semibold mb-3">Sort By</h3>
                <select
                    className="subheading w-full p-2 border rounded-md"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/60">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 bg-gradient-to-b from-white to-gray-50/60">
                <div className="flex items-center justify-between py-8">
                    <div>
                        <h1 className="text-4xl mt-4 md:text-5xl font-bold text-gray-900">Our Collection</h1>
                        <p className="mt-2 text-gray-600 text-lg">Discover your perfect style</p>
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="md:hidden px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <FiFilter className="text-gray-700" />
                        <span className="text-gray-700 font-medium">Filters</span>
                    </button>
                </div>
            </div>

            {/*Search Bar*/}
            <div className="sticky top-14 bg-white/80 backdrop-blur-sm border-b border-gray-200/80 shadow-sm z-20">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for products..."
                            className="w-full p-4 pl-12 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm
                                focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300
                                placeholder:text-gray-400 text-gray-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Desktop Filters Sidebar - Enhanced */}
                    <div className="hidden md:block w-72 flex-shrink-0 space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Filters</h2>
                            <FiltersContent />
                        </div>
                    </div>

                    {/* Mobile Filters Slide-over - Enhanced */}
                    {isFilterOpen && (
                        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
                                onClick={() => setIsFilterOpen(false)} 
                            />
                            <div className="absolute inset-y-0 right-0 max-w-full flex">
                                <div className="w-screen max-w-md">
                                    <div className="h-full flex flex-col bg-white/95 backdrop-blur-sm shadow-xl rounded-l-2xl">
                                        {/* ...existing filter content... */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Grid Container */}
                    <div className="flex-1">
                        {error && (
                            <div className="text-red-500 text-center py-4 bg-red-50 rounded-xl">
                                {error}
                            </div>
                        )}
                        
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {products.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {products.length === 0 && (
                                    <div className="text-center py-16 px-4">
                                        <div className="text-gray-400 text-7xl mb-4">🔍</div>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                            No products found
                                        </h3>
                                        <p className="text-gray-500">
                                            Try adjusting your search or filters
                                        </p>
                                    </div>
                                )}

                                {/* Enhanced Pagination */}
                                <div className="mt-12 flex justify-center gap-2">
                                    <button
                                        className="px-6 py-3 border border-gray-300 rounded-lg disabled:opacity-50 
                                            hover:bg-gray-50 transition-all duration-300 font-medium text-gray-700
                                            disabled:hover:bg-transparent"
                                        disabled={filters.page === 1}
                                        onClick={() => handleFilterChange('page', filters.page - 1)}
                                    >
                                        Previous
                                    </button>
                                    <span className="px-6 py-3 bg-primary/10 rounded-lg font-medium text-primary">
                                        Page {filters.page}
                                    </span>
                                    <button
                                        className="px-6 py-3 border border-gray-300 rounded-lg
                                            hover:bg-gray-50 transition-all duration-300 font-medium text-gray-700"
                                        onClick={() => handleFilterChange('page', filters.page + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
