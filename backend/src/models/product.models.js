import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            index: true
        },
        productId:{
            type: String,
            required:true,
            unique:true,
            trim: true,
            index:true
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true
        },
        discount:{
            type: Number,
        },
        type: {
            type: String,
            enum: ["Men", "Women", "Kids"],
            default: "Men",
            required: true
        },
        category: {
            type: String,
            enum: ["Sherwani", "Kurta", "Lehenga", "Saree", "Others"],
            required: true,
        },
        sizes: {
            type: [String], 
            enum: ["S", "M", "L", "XL", "Free Size"],
            default: ["Free Size"],
        },
        images: {
            type: [String],
            required: true
        },
        stock: {
            type:Number,
            required: true,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        reviews: [
            {
              user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
              rating: { type: Number, required: true, min: 1, max: 5 },
              comment: { type: String },
              createdAt: { type: Date, default: Date.now },
            },
        ],

    }, {timestamps: true}
);

export const Product = mongoose.model("Product", productSchema)