import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Product } from "../models/product.models.js";
import { Cart } from "../models/cart.models.js";

const addToCart = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity = 1, size } = req.body;
        
        console.log('Raw request body:', req.body); // Debug log

        // Validate input
        if (!productId || !size) {
            throw new apiError(400, "Product ID and size are required");
        }

        const normalizedSize = size.toUpperCase(); // Normalize size
        console.log('Normalized size:', normalizedSize); // Debug log

        // Find product first
        const product = await Product.findById(productId);
        if (!product) {
            throw new apiError(404, "Product not found");
        }

        // Calculate price
        const finalPrice = product.price - (product.discount || 0);

        // Prepare cart item
        const cartItem = {
            product: productId,
            quantity: quantity,
            size: normalizedSize,
            price: finalPrice
        };

        console.log('Cart item to be added:', cartItem); // Debug log

        // Find or create cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Create new cart explicitly
            cart = await Cart.create({
                user: userId,
                products: [cartItem],
                totalPrice: finalPrice * quantity
            });
        } else {
            // Check if product with same size exists
            const existingProductIndex = cart.products.findIndex(
                p => p.product.toString() === productId && p.size === size
            );

            if (existingProductIndex !== -1) {
                // Update existing product
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                // Add new product
                cart.products.push({
                    product: productId,
                    quantity,
                    size,
                    price: finalPrice
                });
            }

            // Update total price
            cart.totalPrice = cart.products.reduce((total, item) => 
                total + (item.price * item.quantity), 0
            );
        }

        // Populate and return
        const populatedCart = await Cart.findById(cart._id)
            .populate('products.product')
            .select('-__v');

        return res.status(200).json(
            new apiResponse(200, populatedCart, "Product added to cart successfully")
        );

    } catch (error) {
        console.error("Cart Error Details:", {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        throw error;
    }
});

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
        const userId = req.user._id;
        const { productId, size } = req.body;

        if (!size) {
            throw new apiError(400, "Size is required");
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new apiError(404, "Cart not found");
        }

        const productInCart = cart.products.find(
            p => p.product.toString() === productId && p.size === size
        );

        if (!productInCart) {
            throw new apiError(404, "Product with selected size not found in cart");
        }

        const productPrice = productInCart.price;

        if (productInCart.quantity > 1) {
            await Cart.findOneAndUpdate(
                { user: userId, "products.product": productId, "products.size": size },
                {
                    $inc: {
                        "products.$.quantity": -1,
                        totalPrice: -productPrice
                    }
                },
                { new: true }
            );
        } else {
            await Cart.findOneAndUpdate(
                { user: userId },
                {
                    $pull: {
                        products: { product: productId, size }
                    },
                    $inc: { totalPrice: -productPrice }
                },
                { new: true }
            );
        }

        res.status(200).json(new apiResponse(200, cart, "Product removed from cart successfully"));
    } catch (error) {
        throw new apiError(500, error?.message || "Something went wrong while removing product from cart");
    }
});


//update
const updateCart = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity, size } = req.body;

        if (quantity < 1) {
            throw new apiError(400, "Quantity must be at least 1");
        }
        if (!size) {
            throw new apiError(400, "Size is required");
        }

        const cart = await Cart.findOne({ user: userId, "products.product": productId, "products.size": size });

        if (!cart) {
            throw new apiError(404, "Cart not found or product not in cart");
        }

        const productInCart = cart.products.find(p => p.product.toString() === productId && p.size === size);
        if (!productInCart) {
            throw new apiError(404, "Product with selected size not found in cart");
        }

        const productPrice = productInCart.price;

        const updatedCart = await Cart.findOneAndUpdate(
            { user: userId, "products.product": productId, "products.size": size },
            {
                $set: { "products.$.quantity": quantity },
                $inc: { totalPrice: (quantity - productInCart.quantity) * productPrice }
            },
            { new: true }
        );

        res.status(200).json(new apiResponse(200, updatedCart, "Cart updated successfully"));

    } catch (error) {
        throw new apiError(500, error?.message || "Something went wrong while updating cart");
    }
});


export { addToCart, getCart, removeFromCart, updateCart };