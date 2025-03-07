import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Product } from "../models/product.models.js";
import { Cart } from "../models/cart.models.js";

const addToCart = asyncHandler(async (req, res) => {
    //fetching from body, size and quantity set to default values
    const { productId, quantity = 1, size = "Free Size" } = req.body;
    const userId = req.user._id;

    //checking if product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new apiError(404, "Product not found");
    }

    //size validation
    if (!product.sizes.includes(size)) {
        throw new apiError(400, "Selected size not available");
    }

    //quantity validation
    if (product.stock < quantity) {
        throw new apiError(400, "Insufficient stock");
    }

    //checking if cart exists
    let cart = await Cart.findOne({ user: userId });
    
    //creating cart if not exists
    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [{
                product: productId,
                quantity,
                size,
                price: product.sellingPrice, // Use sellingPrice instead of price
            }]
        });
    } else {
        //checking if item already exists in cart
        const existingItem = cart.items.find(
            item => item.product.toString() === productId && item.size === size
        );

        //updating quantity and subtotal if item exists
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.price = product.sellingPrice; // Update to sellingPrice
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                size,
                price: product.sellingPrice, // Use sellingPrice
            });
        }
        await cart.save();
    }

    return res.status(200).json(
        new apiResponse(200, cart, "Item added to cart successfully")
    );
});

const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate({
            path: 'items.product',
            select: 'name productId price discount type category sizes images stock'
        });

    if (!cart) {
        throw new apiError(404, "Cart not found");
    }

    return res.status(200).json(
        new apiResponse(200, cart, "Cart retrieved successfully")
    );
});

const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, quantity, size } = req.body;
    
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new apiError(404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId && item.size === size
    );

    if (itemIndex === -1) {
        throw new apiError(404, "Item not found in cart");
    }

    if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
    } else {
        const product = await Product.findById(productId);
        if (!product) {
            throw new apiError(404, "Product not found");
        }
        
        if (product.stock < quantity) {
            throw new apiError(400, "Insufficient stock");
        }
        
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].price = product.sellingPrice; // Use sellingPrice
        cart.items[itemIndex].subtotal = quantity * product.sellingPrice;
    }

    await cart.save();
    
    // Populate the cart before sending response
    cart = await Cart.findOne({ user: req.user._id })
        .populate({
            path: 'items.product',
            select: 'name productId price discount type category sizes images stock'
        });

    return res.status(200).json(
        new apiResponse(200, cart, "Cart updated successfully")
    );
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { productId, size } = req.query;
    
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new apiError(404, "Cart not found");
    }

    cart.items = cart.items.filter(
        item => !(item.product.toString() === productId && item.size === size)
    );
    
    await cart.save();

    // Populate cart before sending response
    cart = await Cart.findOne({ user: req.user._id })
        .populate({
            path: 'items.product',
            select: 'name productId price discount type category sizes images stock'
        });

    return res.status(200).json(
        new apiResponse(200, cart, "Item removed from cart successfully")
    );
});

const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new apiError(404, "Cart not found");
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json(
        new apiResponse(200, cart, "Cart cleared successfully")
    );
});

export {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
}

