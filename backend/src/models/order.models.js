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
              product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
              quantity: { type: Number, required: true, min: 1 },
              price: { type: Number, required: true }
            },
        ],
        totalPrice: {
            type: Number,
            required: true
        },
        paymentSatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending"
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "Credit Card", "UPI"],
            required: true
        },
        orderStatus: {
            type: String,
            enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Processing"
        },
        deliveryAddress: {
            street: String,
            city: String,
            state: String,
            zip: String,
            country: {
                type: String,
                default: "India"
            },
        }
    }, 
    
    {timestamps: true}
);

module.exports = mongoose.model("Order", orderSchema)