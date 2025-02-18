import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Product } from "../models/product.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js"

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
        const { category, minPrice, maxPrice, sizes, sortBy, page = 1, limit = 20 } = req.query;

        // Build filter object
        const filters = {};
        
        // Category filter
        if (category) filters.category = category;
        
        // Size filter
        if (sizes) {
            filters.sizes = { $in: sizes.split(',') };
        }
        
        // Price filter
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = Number(minPrice);
            if (maxPrice) filters.price.$lte = Number(maxPrice);
        }

        // Sort configuration
        let sortConfig = { createdAt: -1 }; // default sort
        if (sortBy) {
            switch (sortBy) {
                case 'priceLowToHigh':
                    sortConfig = { price: 1 };
                    break;
                case 'priceHighToLow':
                    sortConfig = { price: -1 };
                    break;
                case 'newest':
                    sortConfig = { createdAt: -1 };
                    break;
            }
        }

        const products = await Product.find(filters)
            .sort(sortConfig)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        if (!products.length) {
            throw new apiError(404, "No products found");
        }

        return res.status(200).json(
            new apiResponse(200, products, "Products fetched successfully")
        );

    } catch (error) {
        throw new apiError(400, error?.message || "Error while fetching products");
    }
});

const getProductById = asyncHandler(async (req, res) => {
    //fetch id
    const { productId } = req.params

    //validate the id
    if (!productId) {
        throw new apiError(400, "Id field is required")
    }

    //fetch product form db based on that id
    const product = await Product.findOne({ productId: productId })

    if (!product) {
        throw new apiError(404, "Id not found")
    }

    //return response
    return res.status(200).json(new apiResponse(200, product, "Product fetched succesfully"))
})

const updateProduct = asyncHandler(async (req, res) => {
    //fetching details from frontend
    const { name, productId, description, price, discount, type, category, sizes, stock } = req.body

    if (!productId) {
        throw new apiError(400, "Product Id is required")
    }

    //validating if product exists
    const productExistance = await Product.findOne({
        //params used to fetch the older product id
        productId: req.params.productId
    })
    if (!productExistance) {
        throw new apiError(404, `Product with id ${req.params.productId} doesn't exist`)
    }

    //searching for the new product Id in the db
    const productIdExists = await Product.findOne({
        productId
    });

    if (productIdExists && productIdExists.productId !== req.params.productId) {
        throw new apiError(400, `Product with id ${productId} already exists`);
    }

    //file update logic
    let imageUrls = [...productExistance.images]

    if (req.files && req.files.images && req.files.images.length > 0) {
        imageUrls = []  // Reset if uploading new images

        for (const file of req.files.images) {
            const uploadResult = await uploadOnCloudinary(file.path)
            if (uploadResult && uploadResult.url) {
                imageUrls.push(uploadResult.url)
            }
        }

        if (imageUrls.length > 0 && productExistance.images.length > 0) {
            for (const oldImageUrl of productExistance.images) {
                try {
                    const publicId = oldImageUrl.split("/").pop().split(".")[0]
                    await deleteFromCloudinary(publicId)
                } catch (error) {
                    console.error("Error deleting old image:", error)
                }
            }
        }
    }

    //updating the data
    const product = await Product.findByIdAndUpdate(
        productExistance._id,
        {
            $set: {
                name, productId, description, price, discount, type, category, sizes, stock, images: imageUrls
            }
        },
        { new: true }
    )

    //returning updated data
    res.status(200).json(new apiResponse(200, product, "Product Updated Succesfully"))
})

const deleteProduct = asyncHandler(async (req, res) => {
    try {
        //extract product id
        const { productId } = req.params

        //check if product exists
        const product = await Product.findOne({ productId })

        if (!product) {
            throw new apiError(404, `product with the id ${productId}doesn't exists`)
        }

        //delete images from cloudinary
        for (image of product.images) {
            const publicId = image.split("/").pop().split(".")[0];
            await deleteFromCloudinary(publicId)
        }

        //delete product from db
        const productDeletion = await Product.findOneAndDelete({ productId })

        if (!productDeletion) {
            throw new apiError(500, "Failed to delete product")
        }
        //return success response
        res.status(200).json(new apiResponse(200, productDeletion, "Product deleted succesfully"))
    } catch (error) {
        throw new apiError(400, error?.message || "Something went wrong while deleting the product")
    }
})

const searchProduct = asyncHandler(async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;

        if (!search?.trim()) {
            throw new apiError(400, "Search query is required");
        }

        const searchQuery = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { productId: { $regex: search, $options: "i" } }
            ]
        };

        const products = await Product.find(searchQuery)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        if (!products.length) {
            throw new apiError(404, "No products found matching your search");
        }

        return res.status(200).json(
            new apiResponse(200, products, products.length ? "Search results found successfully" : "No products found")
        );

    } catch (error) {
        throw new apiError(500, error?.message || "Search operation failed");
    }
});

export { createProduct, getProduct, getProductById, updateProduct, deleteProduct, searchProduct }