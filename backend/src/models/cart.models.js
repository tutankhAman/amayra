import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
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
    size: {
        type: String,
        enum: ["S", "M", "L", "XL", "Free Size"],
        required: true,
        default: "Free Size"
    },
    price: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true,
        default: function () {
            return this.quantity * this.price;
        }
    }
});

// Cart Schema
const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [cartItemSchema],
        totalItems: {
            type: Number,
            required: true,
            default: 0
        }
    },
    { timestamps: true }
);

cartSchema.pre("save", function (next) {
    this.totalAmount = this.items.reduce((acc, item) => acc + item.subtotal, 0);
    this.totalItems = this.items.length;
    next();
});

export const Cart = mongoose.model("Cart", cartSchema);
