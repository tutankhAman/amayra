import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        size: {
            type: String,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["Pending", "Ready for Pickup", "Completed", "Cancelled"],
        default: "Pending"
    },
    paymentMethod: {
        type: String,
        enum: ["Cash"],
        default: "Cash"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },
    adminNotes: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);