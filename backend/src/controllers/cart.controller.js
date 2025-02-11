import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Product } from "../models/product.models.js"
import { Cart } from "../models/cart.models.js"

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
            select: "images name productId quantity price"
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
    try {
        //fetching user id
        const userId = req.user._id
    
        //extracting productid
        const {productId} = req.body
        console.log("ProductId:", productId);
        
        //finding user's cart
        const cart = await Cart.findOne({user: userId})
        console.log("Cart products:", cart?.products);
    
        if (!cart) {
            throw new apiError(404, "Cart not found")
        }
    
        //finding the product inside cart
        const productInCart = cart.products.find(
            p => {
                console.log("Comparing:", p.product.toString(), productId)
                return p.product.toString() === productId
            }
        );

        if (!productInCart) {
            throw new apiError(404, "Product not found in cart");
        }

    
        const productPrice = productInCart.price;
    
        //decreasing the quantity
        if(productInCart.quantity > 1) {
            await Cart.findOneAndUpdate(
                {user:userId, "products.product": productId},
                {
                    $inc: {
                        "products.$.quantity": -1,
                        //recalculate total price
                        totalPrice: -productPrice
                    }
                },
                {new:true}
            )
        } else {
            //remove product if quantity 1
            await Cart.findOneAndUpdate(
                {user:userId},
                {
                    $pull: {
                        products : {product: productId}
                    },
                    //recalculate total price
                    $inc: { 
                        totalPrice: -productPrice
                    }
                },
                {new:true}
            )
        }
    
        //save and return updated cart
        res.status(200).json(new apiResponse(200, cart, "Product removed from cart successfully"));
    } catch (error) {
        throw new apiError(500, error?.message || "Something went wrong while removing product from cart")
    }
})

//update
const updateCart = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            throw new apiError(400, "Quantity must be at least 1");
        }

        // Find the user's cart & check if the product exists
        const cart = await Cart.findOne({ user: userId, "products.product": productId });

        if (!cart) {
            throw new apiError(404, "Cart not found or product not in cart");
        }

        const productInCart = cart.products.find(p => p.product.toString() === productId);
        if (!productInCart) {
            throw new apiError(404, "Product not found in cart");
        }

        const productPrice = productInCart.price; // Get the product price for total price update

        // Update the product quantity & total price
        const updatedCart = await Cart.findOneAndUpdate(
            { user: userId, "products.product": productId },
            {
                // Update the quantity
                $set: { "products.$.quantity": quantity }, 
                // Adjust total price
                $inc: { totalPrice: (quantity - productInCart.quantity) * productPrice } 
            },
            { new: true }
        );

        res.status(200).json(new apiResponse(200, updatedCart, "Cart updated successfully"));

    } catch (error) {
        throw new apiError(500, error?.message || "Something went wrong while updating cart");
    }
});

export {addToCart, getCart, removeFromCart, updateCart}