import { useState, useEffect } from 'react';
import { productService } from '../utils/api';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '', productId: '', description: '', price: '',
    discount: '', type: '', category: '', sizes: [], stock: '',
    images: [], tags: []
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '', productId: '', description: '', price: '',
    discount: 0, type: 'Men', category: '', sizes: [],
    stock: 0, images: [], tags: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    inStock: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data.data);
    } catch (error) {
      showAlert('Error fetching products', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      productId: product.productId,
      description: product.description,
      price: product.price,
      discount: product.discount,
      type: product.type,
      category: product.category,
      sizes: product.sizes,
      stock: product.stock,
      images: [],
      tags: product.tags || []
    });
    setOpenDialog(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      
      // Add all non-file fields
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          // Skip images array here, we'll handle files separately
          return;
        } else if (key === 'sizes') {
          form.append('sizes', formData.sizes.join(','));
        } else if (key === 'tags') {
          form.append('tags', formData.tags.join(','));
        } else {
          form.append(key, formData[key]);
        }
      });

      // Add image files if any new ones were selected
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(image => {
          form.append('images', image);
        });
      } else {
        // If no new images, send empty array to keep existing images
        form.append('images', '[]');
      }

      await productService.update(editProduct.productId, form);
      setOpenDialog(false);
      showAlert('Product updated successfully', 'success');
      fetchProducts();
    } catch (error) {
      console.error('Update error:', error);
      showAlert('Error updating product', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      if (!deleteId) {
        showAlert('Product ID is required', 'error');
        return;
      }
      
      console.log('Deleting product with ID:', deleteId);
      await productService.delete(deleteId);
      setOpenDeleteDialog(false);
      setDeleteId(null);
      showAlert('Product deleted successfully', 'success');
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
      showAlert(error?.response?.data?.message || 'Error deleting product', 'error');
    }
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      images: Array.from(e.target.files)
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      
      // Add text fields
      form.append('name', createFormData.name);
      form.append('productId', createFormData.productId);
      form.append('description', createFormData.description);
      form.append('price', createFormData.price);
      form.append('discount', createFormData.discount);
      form.append('type', createFormData.type);
      form.append('category', createFormData.category);
      form.append('stock', createFormData.stock);
      
      // Add sizes as a comma-separated string
      if (createFormData.sizes.length > 0) {
        form.append('sizes', createFormData.sizes.join(','));
      }
      
      // Add tags as a comma-separated string
      if (createFormData.tags.length > 0) {
        form.append('tags', createFormData.tags.join(','));
      }

      // Add images
      if (createFormData.images.length > 0) {
        createFormData.images.forEach(image => {
          form.append('images', image);
        });
      }

      // Log form data for debugging
      for (let [key, value] of form.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await productService.create(form);
      
      if (response.data.success) {
        setOpenCreateDialog(false);
        setCreateFormData({
          name: '', productId: '', description: '', price: '',
          discount: 0, type: 'Men', category: '', sizes: [],
          stock: 0, images: [], tags: []
        });
        showAlert('Product created successfully', 'success');
        fetchProducts();
      } else {
        throw new Error(response.data.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Creation error:', error);
      showAlert(error.response?.data?.message || 'Error creating product', 'error');
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.type || product.type === filters.type;
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesStock = !filters.inStock || product.stock > 0;
    return matchesSearch && matchesType && matchesCategory && matchesStock;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-lato">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-lg shadow">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Manage Products
          </h1>
          <button
            onClick={() => setOpenCreateDialog(true)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg 
              hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2 
              text-sm sm:text-base font-medium"
          >
            <span>+ Add New Product</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 
              focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 
              focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="Sherwani">Sherwani</option>
            <option value="Kurta">Kurta</option>
            <option value="Lehenga">Lehenga</option>
            <option value="Saree">Saree</option>
            <option value="Pajama">Pajama</option>
            <option value="Indo-Western">Indo-Western</option>
          </select>

          <button
            onClick={() => setFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
            className={`px-4 py-2 rounded-lg border ${
              filters.inStock 
                ? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
                : 'border-gray-300 text-gray-700'
            }`}
          >
            In Stock Only
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Product Card */}
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden 
              hover:-translate-y-1 transition-transform duration-200">
              <div className="aspect-w-3 aspect-h-2 sm:aspect-w-4 sm:aspect-h-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-2">ID: {product.productId}</p>
              
              <div className="mb-4">
                <p className="text-xl font-bold text-indigo-600">₹{product.price}</p>
                {product.discount > 0 && (
                  <div className="mt-1">
                    <p className="text-red-500 text-sm">Discount: ₹{product.discount}</p>
                    <p className="font-semibold">Final Price: ₹{product.sellingPrice}</p>
                  </div>
                )}
              </div>

              <div className={`mb-4 px-3 py-1.5 rounded-full text-sm inline-block
                ${product.stock > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }`}
              >
                {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setDeleteId(product.productId);
                    setOpenDeleteDialog(true);
                  }}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                  <span>Delete</span>
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {openDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
            <div className="bg-white w-full min-h-screen sm:min-h-0 sm:rounded-lg sm:max-w-3xl sm:my-8 sm:mx-4 overflow-hidden">
              <div className="sticky top-0 bg-white z-10 px-4 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Product
                </h2>
                <button 
                  onClick={() => setOpenDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="px-4 py-6 space-y-6 max-h-[calc(100vh-120px)] sm:max-h-[600px] overflow-y-auto">
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Name field - full width */}
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Two columns for ID and Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product ID
                      </label>
                      <input
                        type="text"
                        value={formData.productId}
                        onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>

                    {/* Category and Sizes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Sherwani">Sherwani</option>
                        <option value="Kurta">Kurta</option>
                        <option value="Lehenga">Lehenga</option>
                        <option value="Saree">Saree</option>
                        <option value="Pajama">Pajama</option>
                        <option value="Indo-Western">Indo-Western</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sizes
                      </label>
                      <select
                        multiple
                        value={formData.sizes}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          sizes: Array.from(e.target.selectedOptions, option => option.value)
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="Free Size">Free Size</option>
                      </select>
                    </div>

                    {/* Description - full width */}
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Price fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          price: e.target.value,
                          sellingPrice: e.target.value - (prev.discount || 0)
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount
                      </label>
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          discount: e.target.value,
                          sellingPrice: prev.price - e.target.value
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Stock and Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Images
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 
                        border-dashed rounded-lg hover:border-indigo-500 transition-colors">
                        <div className="space-y-1 text-center">
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium 
                              text-indigo-600 hover:text-indigo-500">
                              <span>Upload files</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                          {formData.images.length > 0 && (
                            <p className="text-sm text-indigo-600 font-medium">
                              {formData.images.length} new images selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tags selection - full width */}
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {['Trending', 'Best Seller', 'New Arrival', 'Top Rated', 'Sale', 'Eid Collection'].map((tag) => (
                          <div 
                            key={tag} 
                            className={`px-3 py-1.5 rounded-full text-sm cursor-pointer border
                              ${formData.tags.includes(tag) 
                                ? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
                                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                              }`}
                            onClick={() => {
                              if (formData.tags.includes(tag)) {
                                setFormData(prev => ({
                                  ...prev,
                                  tags: prev.tags.filter(t => t !== tag)
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  tags: [...prev.tags, tag]
                                }));
                              }
                            }}
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Click to select/deselect tags</p>
                    </div>
                  </div>
                </form>
              </div>

              <div className="sticky bottom-0 bg-white px-4 py-4 border-t mt-auto">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                      rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                      focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg 
                      hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                      focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {openDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
                <p className="text-red-600 font-medium mb-6">
                  Product ID: {deleteId}
                </p>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setOpenDeleteDialog(false);
                      setDeleteId(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg 
                      hover:bg-red-700 transition-colors"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Product Modal */}
        {openCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white w-full sm:rounded-lg sm:max-w-3xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 px-4 py-3 sm:p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Add New Product
                  </h2>
                  <button 
                    onClick={() => setOpenCreateDialog(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <form onSubmit={handleCreate} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg 
                          focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product ID *
                      </label>
                      <input
                        type="text"
                        value={createFormData.productId}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, productId: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        value={createFormData.type}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={createFormData.category}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Sherwani">Sherwani</option>
                        <option value="Kurta">Kurta</option>
                        <option value="Lehenga">Lehenga</option>
                        <option value="Saree">Saree</option>
                        <option value="Pajama">Pajama</option>
                        <option value="Indo-Western">Indo-Western</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sizes
                      </label>
                      <select
                        multiple
                        value={createFormData.sizes}
                        onChange={(e) => setCreateFormData(prev => ({
                          ...prev,
                          sizes: Array.from(e.target.selectedOptions, option => option.value)
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="Free Size">Free Size</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple sizes</p>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={createFormData.description}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        value={createFormData.price}
                        onChange={(e) => setCreateFormData(prev => ({ 
                          ...prev, 
                          price: Number(e.target.value),
                          sellingPrice: Number(e.target.value) - (prev.discount || 0)
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        required
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount
                      </label>
                      <input
                        type="number"
                        value={createFormData.discount}
                        onChange={(e) => setCreateFormData(prev => ({ 
                          ...prev, 
                          discount: Number(e.target.value),
                          sellingPrice: prev.price - Number(e.target.value)
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock *
                      </label>
                      <input
                        type="number"
                        value={createFormData.stock}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-indigo-500 focus:border-transparent"
                        required
                        min="0"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Images *
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 
                        border-dashed rounded-lg hover:border-indigo-500 transition-colors">
                        <div className="space-y-1 text-center">
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium 
                              text-indigo-600 hover:text-indigo-500 focus-within:outline-none 
                              focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                              <span>Upload files</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => setCreateFormData(prev => ({
                                  ...prev,
                                  images: Array.from(e.target.files)
                                }))}
                                required
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB each
                          </p>
                          {createFormData.images.length > 0 && (
                            <p className="text-sm text-indigo-600 font-medium">
                              {createFormData.images.length} images selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tags selection */}
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {['Trending', 'Best Seller', 'New Arrival', 'Top Rated', 'Sale', 'Eid Collection'].map((tag) => (
                          <div 
                            key={tag} 
                            className={`px-3 py-1.5 rounded-full text-sm cursor-pointer border
                              ${createFormData.tags.includes(tag) 
                                ? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
                                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                              }`}
                            onClick={() => {
                              if (createFormData.tags.includes(tag)) {
                                setCreateFormData(prev => ({
                                  ...prev,
                                  tags: prev.tags.filter(t => t !== tag)
                                }));
                              } else {
                                setCreateFormData(prev => ({
                                  ...prev,
                                  tags: [...prev.tags, tag]
                                }));
                              }
                            }}
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Click to select/deselect tags</p>
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-white -mx-4 px-4 sm:mx-0 sm:px-0 py-3 sm:py-4 border-t mt-6">
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setOpenCreateDialog(false)}
                        className="w-full sm:w-auto px-4 py-2.5 text-gray-700 bg-white border border-gray-300 
                          hover:bg-gray-50 rounded-lg text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg 
                          hover:bg-indigo-700 transition-colors text-sm font-medium"
                        disabled={!createFormData.name || !createFormData.productId || !createFormData.images.length}
                      >
                        Create Product
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {alert.open && (
          <div className={`fixed bottom-4 right-4 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg
            ${alert.severity === 'success' ? 'bg-green-500' : 'bg-red-500'} 
            text-white text-sm sm:text-base max-w-[90vw] sm:max-w-md`}
          >
            {alert.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
