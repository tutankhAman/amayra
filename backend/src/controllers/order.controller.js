import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Order } from "../models/order.models.js";
import { Cart } from "../models/cart.models.js";

const createOrder = asyncHandler(async (req, res) => {
    try {
        //fetching user id
        const userId = req.user._id;

        //fetching the cart for that user
        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        
        if (!cart?.products?.length) {
            throw new apiError(400, "Cart is empty");
        }

        //total price calculation
        const subtotal = cart.totalPrice;
        const tax = subtotal * 0.18;
        const totalPrice = subtotal + tax;

        //creating the order in database
        const order = await Order.create({
            user: userId,
            products: cart.products.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal,
            tax,
            totalPrice,
            paymentMethod: "Cash",
            orderStatus: "Pending"
        });
        
        //reset the cart after order
        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { products: [], totalPrice: 0 } }
        );

        res.status(201).json(
            new apiResponse(201, order, "Order created successfully")
        );

    } catch (error) {
        throw new apiError(500, error?.message || "Error creating order");
    }
});

const getUserOrders = asyncHandler(async (req, res) => {
    try {
        //get user id
        const userId = req.user._id;
        
        //find order of that user
        const orders = await Order.find({ user: userId })
            .populate({
                path: "products.product",
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
        //fetch userid and orderid
        const { orderId } = req.params;
        const userId = req.user._id;

        //find order based on that id
        const order = await Order.findOne({
            _id: orderId,
            user: userId
        }).populate({
            path: "products.product",
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
        //get orderid, orderstatus and admin notes
        const { orderId } = req.params;
        const { orderStatus, adminNotes } = req.body;

        //order status check
        if (!["Pending", "Ready for Pickup", "Completed", "Cancelled"].includes(orderStatus)) {
            throw new apiError(400, "Invalid order status");
        }

        //find and update the order
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                orderStatus,
                adminNotes: adminNotes || "",
                isPaid: orderStatus === "Completed" ? true : false, // Mark as paid when completed
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

export {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus
};