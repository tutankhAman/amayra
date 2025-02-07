import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Product } from "../models/product.models.js"
import { Cart } from "../models/cart.models.js"
import jwt from "jsonwebtoken"
import { verifyJWT } from "../middlewares/auth.middleware.js";

//add
const addToCart = asyncHandler(async (req, res) => {
    try {
        //extract user id
        const userId = req.user._id
        // console.log("Full request body:", req.body)
    
        //extract product id and qty
        const { productId, quantity } = req.body
    
        //check if product exists
        const product = await Product.findOne({ productId: productId })
        // console.log("Found product:", product) // Debug log

        if (!product) {
            throw new apiError(404, "Product not found")
        }
    
        //fetch user's cart
        //populating the cart based on the cart schema
        let cart = await Cart.findOne({ user: userId }).populate({
            path: "products.product",
            select: "name productId quantity price images"
        })
    
        //creating a cart in case it doesnt exist
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                products: [{
                    product: product._id,
                    quantity,
                    price: product.price
                }],
                totalPrice: product.price * quantity
            })
        }
    
        //check if product already in cart
        const isProductAlreadyInCart = cart.products.findIndex(
            p => p.product._id?.toString() === product._id.toString()
        )
    
        if (isProductAlreadyInCart !== -1) {
            //if product exists increase the quantity
            cart.products[isProductAlreadyInCart].quantity += quantity
        } else {
            //add product to cart
            cart.products.push({
                product: product._id,
                quantity,
                price: product.price
            })
        }
    
        //calculating total price
        cart.totalPrice = cart.products.reduce((total, p) => total + p.quantity * p.price, 0)
    
        //save the updated cart
        await cart.save()
    
        res.status(200).json(new apiResponse(200, cart, "Product added to cart successfully"));

    } catch (error) {
        throw new apiError(500, error?.message || "Something went wrong while adding product to cart")
    }
})

//get
const getCart = asyncHandler(async (req, res) => {
    try {
        //extract the user id from request
        const userId = req.user._id
    
        //find cart based on userid
        const cart = await Cart.findOne({user: userId}).populate({
            path: "products.product",
            select: "name productId quantity price"
        })
        .select ("products totalPrice")
    
        //return cart data
        res.status(200).json(new apiResponse(200, cart, "Cart fetched successfully"))
    } catch (error) {
        throw new apiError(500, error?.message ||"Something went wrong while fetching the cart")
    }
})

//remove
const removeFromCart = asyncHandler(async (req, res) => {
    //fetching user id
    const userId = req.user._id

    //extracting productid
    const {productId} = req.body
})

//update

export {addToCart, getCart}