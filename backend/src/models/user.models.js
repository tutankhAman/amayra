import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required:true,
        unique:true
    },   
    password:{
        type:String,
        required:true
    },
    avatar:{
        type: String,
        default: 'https://res.cloudinary.com/dh0xbfq7w/image/upload/v1740070547/zro6ynfqi5a3foycxhtc.png'
    },
    email:{
        type:String,
        required: true,
        unique: true,
        sparse: true
    },
    address:{
        type: String
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    wishlist: [{
        type:mongoose.Schema.ObjectId,
        ref: "Product"
    }],
    orderHistory: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order" 
    }],
    refreshToken: {
        type: String
    }

},{timestamps: true})

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)