import React, { createContext, useContext, useState } from 'react';

const OrderStatusContext = createContext();

export const OrderStatusProvider = ({ children }) => {
    const [ordersEnabled, setOrdersEnabled] = useState(true);

    const toggleOrderStatus = () => {
        setOrdersEnabled(prev => !prev);
    };

    return (
        <OrderStatusContext.Provider value={{ ordersEnabled, toggleOrderStatus }}>
            {children}
        </OrderStatusContext.Provider>
    );
};

export const useOrderStatus = () => {
    const context = useContext(OrderStatusContext);
    if (!context) {
        throw new Error('useOrderStatus must be used within an OrderStatusProvider');
    }
    return context;
};
