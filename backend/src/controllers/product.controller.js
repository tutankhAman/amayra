import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Product } from "../models/product.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const createProduct = asyncHandler(async (req, res) => {
    //get details from frontend
    const { name, productId, description, price, category, sizes, stock } = req.body

    //validation
    if (
        [name, productId, price, category, stock].some((field) => field?.trim() === "")
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



export {createProduct}