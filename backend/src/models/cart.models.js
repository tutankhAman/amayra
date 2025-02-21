import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
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
                    required: true,
                    enum: ["S", "M", "L", "XL", "Free Size"]  // Match product model's size enum
                }
            }
        ],
        totalPrice: {
            type: Number,
            default: 0
        },
    },
    { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);