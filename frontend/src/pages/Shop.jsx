import React, { useState, useEffect } from 'react';
import { productService } from '../utils/api';
import ProductCard from '../components/cards/productCard';
import debounce from 'lodash/debounce';
import { FiFilter, FiX, FiCheck } from 'react-icons/fi'; // Add FiCheck
import { useSearchParams } from 'react-router-dom';

const Shop = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        type: '',
        minPrice: '',
        maxPrice: '',
        sizes: [],
        sortBy: 'newest',
        page: 1,
        limit: 12
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0); // Add new state for active filter count

    // Constants for filter options
    const categories = ["Kurta", "Pajama", "Lehenga", "Sherwani", "Saree",  "Indo-Western", "Others"];
    const types = ['Men', 'Women', 'Kids']; 
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
                type: filters.type || undefined, 
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
            setError(err?.response?.data?.message || 'No Products Found');
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

    useEffect(() => {
        const typeFromUrl = searchParams.get('type');
        const categoryFromUrl = searchParams.get('category');
        
        if (typeFromUrl || categoryFromUrl) {
            setFilters(prev => ({
                ...prev,
                type: typeFromUrl || prev.type,
                category: categoryFromUrl || prev.category
            }));
        }
    }, [searchParams]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => {
            const newFilters = {
                ...prev,
                [key]: value,
                page: 1
            };
            // Count active filters
            const count = Object.entries(newFilters).reduce((acc, [k, v]) => {
                if (k === 'sizes' && v.length > 0) return acc + 1;
                if (k !== 'page' && k !== 'limit' && v) return acc + 1;
                return acc;
            }, 0);
            setActiveFiltersCount(count);
            return newFilters;
        });
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

    // Modify FiltersContent to work in bottom sheet
    const FiltersContent = () => (
        <div className="h-[80vh] flex flex-col">
            {/* Fixed Header */}
            <div className="sticky top-0 bg-white px-4 py-3 border-b flex justify-between items-center z-10
                shadow-sm backdrop-blur-md">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <FiX size={24} />
                </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6 pb-24">
                    {/* Type Filter */}
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-gray-100">
                        <h3 className="text-base font-medium text-gray-800 mb-2">Type</h3>
                        <div className="flex flex-wrap gap-2">
                            {types.map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleFilterChange('type', type === filters.type ? '' : type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                                        ${filters.type === type 
                                            ? 'bg-primary text-white shadow-sm' 
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-gray-100">
                        <h3 className="text-base font-medium text-gray-800 mb-2">Categories</h3>
                        <div className="space-y-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleFilterChange('category', category === filters.category ? '' : category)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200
                                        ${filters.category === category 
                                            ? 'bg-primary text-white' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-gray-100">
                        <h3 className="text-base font-medium text-gray-800 mb-2">Price Range</h3>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary/30 focus:border-primary"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center text-gray-400">-</div>
                            <div className="flex-1">
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary/30 focus:border-primary"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Size Filter */}
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-gray-100">
                        <h3 className="text-base font-medium text-gray-800 mb-2">Sizes</h3>
                        <div className="flex flex-wrap gap-2">
                            {availableSizes.map(size => (
                                <button
                                    key={size}
                                    className={`w-12 h-12 rounded-lg font-medium text-sm transition-all duration-200
                                        ${filters.sizes.includes(size)
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    onClick={() => handleSizeToggle(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-gray-100">
                        <h3 className="text-base font-medium text-gray-800 mb-2">Sort By</h3>
                        <select
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50
                                focus:ring-1 focus:ring-primary/30 focus:border-primary"
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
            </div>

            {/* Fixed Footer */}
            <div className="sticky bottom-0 bg-white border-t shadow-lg p-4">
                <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-3 bg-primary text-white rounded-lg font-medium
                        flex items-center justify-center gap-2"
                >
                    <FiCheck size={20} />
                    Apply Filters
                </button>
            </div>
        </div>
    );

    // Add new component for desktop filters
    const DesktopFilters = () => (
        <div className="hidden md:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl shadow-sm overflow-hidden max-h-[calc(100vh-120px)] flex flex-col">
                {/* Fixed Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                    <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                    <p className="text-sm text-gray-500 mt-1">Refine your search</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
                    <div className="p-6 space-y-8">
                        {/* Type Filter */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Type</h3>
                            <div className="flex flex-wrap gap-2">
                                {types.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => handleFilterChange('type', type === filters.type ? '' : type)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                                            ${filters.type === type 
                                                ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20' 
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Categories</h3>
                            <div className="space-y-2">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => handleFilterChange('category', category === filters.category ? '' : category)}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200
                                            ${filters.category === category 
                                                ? 'bg-primary text-white font-medium' 
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Price Range</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full p-2.5 text-sm border border-gray-200 rounded-lg 
                                            focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    />
                                </div>
                                <span className="text-gray-400">to</span>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full p-2.5 text-sm border border-gray-200 rounded-lg 
                                            focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Size Filter */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Sizes</h3>
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map(size => (
                                    <button
                                        key={size}
                                        className={`w-12 h-12 rounded-xl font-medium text-sm transition-all duration-200
                                            ${filters.sizes.includes(size)
                                                ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20' 
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        onClick={() => handleSizeToggle(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Sort By</h3>
                            <select
                                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50
                                    focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
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
                </div>

                {/* Fixed Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={() => setFilters({
                            category: '',
                            type: '',
                            minPrice: '',
                            maxPrice: '',
                            sizes: [],
                            sortBy: 'newest',
                            page: 1,
                            limit: 12
                        })}
                        className="w-full py-2 text-sm text-gray-600 hover:text-primary transition-colors duration-200"
                    >
                        Reset Filters
                    </button>
                </div>
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
                    <DesktopFilters />
                    
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
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                    {products.map(product => (
                                        <div key={product._id} className="transform transition-transform duration-300 hover:-translate-y-1">
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>

                                {products.length === 0 && (
                                    <div className="text-center py-16 px-4">
                                        <div className="text-gray-400 text-7xl mb-4">🔍</div>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-6">
                                            No products found
                                        </h3>
                                        <p className="text-gray-500 mb-5">
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

            {/* Single Mobile Filter Bottom Sheet */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div 
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="absolute inset-x-0 bottom-0 transform transition-transform duration-300 ease-out">
                        <div className="bg-white rounded-t-3xl shadow-xl">
                            <FiltersContent />
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Filter Button - Mobile Only */}
            <button
                onClick={() => setIsFilterOpen(true)}
                className="fixed md:hidden bottom-6 right-6 z-50 bg-primary text-white 
                    px-6 py-3 rounded-full shadow-lg flex items-center gap-2 
                    hover:bg-primary/90 transition-all duration-300"
            >
                <FiFilter size={20} />
                <span className="font-medium">Filters</span>
                {activeFiltersCount > 0 && (
                    <span className="bg-white text-primary w-6 h-6 rounded-full 
                        flex items-center justify-center text-sm font-bold">
                        {activeFiltersCount}
                    </span>
                )}
            </button>
        </div>
    );
};

export default Shop;
