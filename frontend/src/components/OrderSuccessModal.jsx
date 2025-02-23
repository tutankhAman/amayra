import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiClock, FiPhone, FiMapPin } from 'react-icons/fi';

const OrderSuccessModal = ({ isOpen, onClose, orderId }) => {
    const storeInfo = {
        address: "Amayra Ethnic Collections, Near Ramzan Pull, infront of Haider Nursing Home, Churipatti Road, Kishanganj, Bihar - 855108",
        timings: "10:00 AM - 9:00 PM (Monday to Sunday)",
        contact: "+91 9876543210"
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
                >
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <FiCheckCircle className="w-16 h-16 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                        <p className="text-gray-600">Your order has been confirmed</p>
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Order ID:</p>
                            <p className="font-mono font-medium text-primary">{orderId}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <FiMapPin className="mt-1 text-primary" />
                            <div>
                                <p className="font-medium text-gray-900">Pickup Location</p>
                                <p className="text-sm text-gray-600 mt-1">{storeInfo.address}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FiClock className="mt-1 text-primary" />
                            <div>
                                <p className="font-medium text-gray-900">Store Timings</p>
                                <p className="text-sm text-gray-600 mt-1">{storeInfo.timings}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FiPhone className="mt-1 text-primary" />
                            <div>
                                <p className="font-medium text-gray-900">Contact</p>
                                <p className="text-sm text-gray-600 mt-1">{storeInfo.contact}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={onClose}
                            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium
                                hover:bg-primary/90 active:scale-95 transition-all duration-300"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OrderSuccessModal;
