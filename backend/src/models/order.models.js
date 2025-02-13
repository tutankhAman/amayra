import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        products: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true }
            },
        ],
        totalPrice: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            default: 0
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending"
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paymentMethod: {
            type: String,
            enum: ["Cash", "UPI"],
            required: true
        },
        orderStatus: {
            type: String,
            enum: ["Pending", "Ready for Pickup", "Completed", "Cancelled"],
            default: "Pending"
        },
        adminNotes: {
            type: String,
            default: ""
        }
    }, 
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema)