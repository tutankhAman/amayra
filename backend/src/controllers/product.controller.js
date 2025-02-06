import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Product } from "../models/product.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const createProduct = asyncHandler(async (req, res) => {
    //get details from frontend
    const { name, productId, description, price, discount, type, category, sizes, stock } = req.body

    //validation
    if (
        [name, productId, price, category, stock, type].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    //check if productId already exists
    const productExistance = await Product.findOne({
        productId
    })
    if (productExistance) {
        throw new apiError(400, `Product with id ${productId} already exists`)
    }

    //handling file upload
    const images = [];
    if (req.files?.images) {
        for (const file of req.files.images) {
            const uploadResult = await uploadOnCloudinary(file.path);

            if (uploadResult) {
                images.push(uploadResult.url); // Only push the URL
            }
        }
    }

    //create an entry in db
    const newProduct = await Product.create({
        name,
        productId,
        description,
        price,
        discount,
        type,
        category,
        sizes,
        images,
        stock
    })

    //check if product created
    const creationCheck = await Product.findById(newProduct._id)

    if (!creationCheck) {
        throw new apiError(500, "Product creation failed")
    }

    //return a res
    return res.status(201).json(
        new apiResponse(200, creationCheck, "Product created successfully")
    )
})

const getProduct = asyncHandler(async (req, res) => {
    try {
        //fetching query parameters from req body
        const { category, minPrice, sizes, maxPrice, sortBy, page = 1, limit = 20 } = req.query;

        const min = minPrice ? Number(minPrice) : 0;
        const max = maxPrice ? Number(maxPrice) : Infinity;
        const pageNumber = Number(page) || 1
        const limitNumber = Number(limit) || 20

        //adding filters for sorting
        const filters = {}
        if (category) filters.category = category
        if (sizes) filters.sizes = {
            $in: sizes.split(",")
        }
        filters.price = {
            $gte: min,
            $lte: max
        }

        //sorting logic
        const sortOptions = {
            priceLowToHigh: { price: 1 },
            priceHighToLow: { price: -1 },
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 }
        }

        //default sort is newest
        // use: /api/products?sortBy=priceLowToHigh
        const sort = sortBy && sortOptions[sortBy] ? sortOptions[sortBy] : { createdAt: -1 };

        //fetching from database based on filters
        const products = await Product.find(filters)
            .sort(sort)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limit)

        //existance check
        if (products.length === 0) {
            throw new apiError(404, "No products found")
        }

        return res.status(200).json(new apiResponse(200, products, "Products fetched successfully"))

    } catch (error) {
        throw new apiError(400, err?.message || "Something went wrong while fecthing products")
    }
})



export { createProduct, getProduct }