import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone: {
        type: String
    },
    address:{
        type: String
    },
    role: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    wishlist: [{
        type:mongoose.Schema.ObjectId,
        ref: "Product"
    }],
    orderHistory: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order" 
    }]

},{timestamps: true})

export const User = mongoose.model("User", userSchema)