import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Order } from "../models/order.models.js";
import { Cart } from "../models/cart.models.js";
import { sendOrderNotification } from "../services/emailService.js";

const createOrder = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId })
            .populate('items.product');

        if (!cart?.items?.length) {
            throw new apiError(400, "Cart is empty");
        }

        // Validate items and calculate totals
        let subtotal = 0;
        const orderItems = cart.items.map(item => {
            const itemTotal = item.quantity * item.product.sellingPrice;
            subtotal += itemTotal;
            
            return {
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.sellingPrice,
                size: item.size
            };
        });

        // Create order
        const order = await Order.create({
            user: userId,
            items: orderItems,
            subtotal,
            totalPrice: subtotal
        });

        // Clear the cart
        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [], totalPrice: 0 } }
        );

        // Get populated order data - Update populate to include productId
        const populatedOrder = await Order.findById(order._id)
            .populate('items.product', 'name productId images price sellingPrice')
            .populate('user', 'name email')
            .lean();

        // Log data for debugging
        console.log('Populated Order Items:', JSON.stringify(populatedOrder.items, null, 2));

        // Send email notification with correct product data mapping
        try {
            await sendOrderNotification({
                orderId: order._id,
                customerName: populatedOrder.user.name,
                totalAmount: populatedOrder.totalPrice,
                items: populatedOrder.items.map(item => ({
                    productId: item.product.productId,  // Make sure this exists in populated data
                    quantity: item.quantity,
                    size: item.size,
                    price: item.product.sellingPrice || item.price // Use sellingPrice if available
                }))
            });
            console.log('Order notification email sent successfully');
        } catch (emailError) {
            console.error('Failed to send order email:', emailError);
        }

        return res.status(201).json(
            new apiResponse(201, populatedOrder, "Order created successfully")
        );

    } catch (error) {
        console.error("Order creation error:", error);
        throw new apiError(500, error?.message || "Error creating order");
    }
});

const getUserOrders = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await Order.find({ user: userId })
            .populate({
                path: "items.product",
                select: "name productId images price"
            })
            .sort("-createdAt");

        res.status(200).json(
            new apiResponse(200, orders, "Orders fetched successfully")
        );

    } catch (error) {
        throw new apiError(500, error?.message || "Error fetching orders");
    }
});

const getOrderById = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;
        const order = await Order.findOne({
            _id: orderId,
            user: userId
        }).populate({
            path: "items.product",
            select: "name productId images price"
        });

        if (!order) {
            throw new apiError(404, "Order not found");
        }

        res.status(200).json(
            new apiResponse(200, order, "Order details fetched successfully")
        );

    } catch (error) {
        throw new apiError(500, error?.message || "Error fetching order details");
    }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus, adminNotes } = req.body;

        if (!["Pending", "Ready for Pickup", "Completed", "Cancelled"].includes(orderStatus)) {
            throw new apiError(400, "Invalid order status");
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                orderStatus,
                adminNotes: adminNotes || "",
                isPaid: orderStatus === "Completed" ? true : false,
                paymentStatus: orderStatus === "Completed" ? "Paid" : "Pending"
            },
            { new: true }
        );

        if (!order) {
            throw new apiError(404, "Order not found");
        }

        res.status(200).json(
            new apiResponse(200, order, "Order status updated successfully")
        );

    } catch (error) {
        throw new apiError(500, error?.message || "Error updating order status");
    }
});

const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
        _id: orderId,
        user: userId
    });

    if (!order) {
        throw new apiError(404, "Order not found");
    }

    if (order.orderStatus !== "Pending") {
        throw new apiError(400, "Only pending orders can be cancelled");
    }

    order.orderStatus = "Cancelled";
    await order.save();

    return res.status(200).json(
        new apiResponse(200, order, "Order cancelled successfully")
    );
});

const getAllOrders = asyncHandler(async (req, res) => {
    try {
        console.log("Fetching all orders...");
        const orders = await Order.find()
            .populate({
                path: "items.product",
                select: "name productId images price"
            })
            .populate({
                path: "user",
                select: "name email phone"
            })
            .sort("-createdAt")
            .lean();

        console.log(`Found ${orders.length} orders`);
        return res.status(200).json(
            new apiResponse(200, orders, "All orders fetched successfully")
        );

    } catch (error) {
        console.error("Error in getAllOrders:", error);
        throw new apiError(500, error?.message || "Error fetching orders");
    }
});

export {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
};