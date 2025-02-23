import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { orderService } from '../utils/api';
import OrderSkeleton from '../components/OrderSkeleton';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getUserOrders();
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Ready for Pickup': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getOrderTimeline = (status) => {
    const steps = ['Pending', 'Ready for Pickup', 'Completed'];
    const currentStep = steps.indexOf(status) + 1;
    
    return (
      <div className="flex items-center justify-between w-full mt-4 mb-6">
        {steps.map((step, idx) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              idx + 1 <= currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`}>
              <span className="text-white text-sm">{idx + 1}</span>
            </div>
            <p className="text-xs mt-1 text-center">{step}</p>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 w-full mt-4 ${
                idx + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-5xl font-bold my-8 text-gray-800">My Orders</h1>
        <div className="grid gap-6">
          {[1, 2].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-5xl font-bold my-8 text-gray-800">My Orders</h1>
      
      <AnimatePresence>
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-16 px-4 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-64 h-64 mx-auto mb-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-full h-full text-tertiary opacity-90"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  fill="none"
                />
                <circle cx="12" cy="6" r="1" fill="currentColor" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 14h6m-3-3v6"
                  className="text-primary"
                />
              </svg>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Your order history is empty</h2>
              <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
                Looks like you haven't made any orders yet. Start shopping to discover our amazing products!
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-medium rounded-lg hover:from-primary hover:to-tertiary transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span className="mr-2">Explore Products</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                    <div>
                      <h3 className="subheading text-lg font-semibold text-gray-800">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className="subheading text-sm text-gray-500">
                        Placed on {format(new Date(order.createdAt), 'PPP')}
                      </p>
                    </div>
                    <span className={`mt-2 md:mt-0 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {order.orderStatus !== 'Cancelled' && getOrderTimeline(order.orderStatus)}

                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <Link
                        key={item._id}
                        to={`/product/${item.product._id}`}
                        className="flex items-center space-x-4 p-3 rounded-lg transition-all hover:bg-gray-50 group border border-transparent hover:border-gray-100"
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative w-20 h-20 overflow-hidden rounded-lg"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                            {item.product.name}
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              Size: {item.size}
                            </span>
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 mt-2">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-800">₹{order.totalPrice}</p>
                      </div>
                      {order.orderStatus === 'Pending' && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancelOrder(order._id)}
                          className="w-full md:w-auto px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Cancel Order
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
