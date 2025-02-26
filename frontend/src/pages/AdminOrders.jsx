import React, { useState, useEffect } from 'react';
import { orderService } from '../utils/api';
import { toast } from 'react-hot-toast';
import { FiSearch, FiFilter, FiRefreshCcw } from 'react-icons/fi';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    const fetchOrders = async () => {
        try {
            const response = await orderService.getAll();
            setOrders(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setUpdatingStatus(orderId);
            await orderService.updateStatus(orderId, { 
                orderStatus: newStatus,
                adminNotes: `Status updated to ${newStatus} by admin`
            });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders(); // Refresh orders
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter and search orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user?.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    return (
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 font-['Lora']">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold">Order Management</h1>
                <button 
                    onClick={fetchOrders}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                    <FiRefreshCcw /> Refresh
                </button>
            </div>

            {/* Filters and Search Section */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="relative w-full">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <FiFilter className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                        {filteredOrders.length} orders found
                    </div>
                </div>
            </div>

            {/* Orders Table/Cards */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Order ID", "Customer", "Items", "Total", "Status", "Actions"].map((header) => (
                                            <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{order._id.slice(-6)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {order.user?.name || 'Unknown User'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.user?.phone || 'No phone'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="text-sm text-gray-900">
                                                        {item.product.productId} × {item.quantity}
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ₹{order.totalPrice}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    order.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    order.orderStatus === 'Ready for Pickup' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    className={`text-sm border rounded-lg px-3 py-1.5 ${
                                                        updatingStatus === order._id ? 'opacity-50' : ''
                                                    }`}
                                                    value={order.orderStatus}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    disabled={updatingStatus === order._id}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Ready for Pickup">Ready for Pickup</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View - Fixed Structure */}
                    <div className="sm:hidden space-y-4">
                        {currentOrders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-medium">#{order._id.slice(-6)}</div>
                                        <div className="text-sm text-gray-500">
                                            {order.user?.name || 'Unknown User'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {order.user?.phone || 'No phone'}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        order.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                        order.orderStatus === 'Ready for Pickup' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.orderStatus}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 mb-3">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="text-sm">
                                            {item.product.productId} × {item.quantity}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <div className="font-medium">₹{order.totalPrice}</div>
                                    <select
                                        className={`text-sm border rounded-lg px-3 py-1.5 ${
                                            updatingStatus === order._id ? 'opacity-50' : ''
                                        }`}
                                        value={order.orderStatus}
                                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        disabled={updatingStatus === order._id}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Ready for Pickup">Ready for Pickup</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                        <div className="text-sm text-gray-500 text-center sm:text-left">
                            Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === i + 1
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminOrders;
