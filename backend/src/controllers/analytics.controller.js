import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Order } from "../models/order.models.js";
import { Product } from "../models/product.models.js";  // Add this import
import mongoose from "mongoose";

// Helper function to create date filter
const getDateFilter = (startDate, endDate) => {
    if (!startDate || !endDate) {
        // Default to last 30 days if no dates provided
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return {
            createdAt: {
                $gte: start,
                $lte: end
            }
        };
    }
    return {
        createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59))
        }
    };
};

// Get overall sales summary
const getOverallSales = async (dateFilter) => {
    // console.log("Getting sales with filter:", dateFilter);
    const totalSales = await Order.aggregate([
        { 
            $match: { 
                ...dateFilter,
                orderStatus: { $exists: true } // Changed this to catch all orders initially
            } 
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalPrice" },
                totalOrders: { $sum: 1 },
                averageOrderValue: { $avg: "$totalPrice" }
            }
        }
    ]);

    // console.log("Raw sales data:", totalSales);
    return totalSales[0] || { 
        totalRevenue: 0, 
        totalOrders: 0, 
        averageOrderValue: 0 
    };
};

// Get daily sales breakdown
const getDailySales = async (dateFilter) => {
    return Order.aggregate([
        { 
            $match: { 
                ...dateFilter,
                orderStatus: { $nin: ["Cancelled"] }
            } 
        },
        {
            $group: {
                _id: { 
                    date: { 
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$createdAt",
                            timezone: "Asia/Kolkata"  // Add timezone for correct date grouping
                        } 
                    }
                },
                dailyRevenue: { $sum: "$totalPrice" },
                numberOfOrders: { $sum: 1 }
            }
        },
        { 
            $sort: { "_id.date": 1 } 
        }
    ]);
};

// Get top selling products
const getTopProducts = async (dateFilter, limit = 5) => {  // Reduced limit for better visibility
    return Order.aggregate([
        { 
            $match: dateFilter 
        },
        { $unwind: "$items" },  // Using items instead of products
        {
            $lookup: {
                from: "products",
                localField: "items.product",  // Changed to match order model
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" },
        {
            $group: {
                _id: "$items.product",
                productId: { $first: "$productDetails.productId" }, // Added productId
                productName: { $first: "$productDetails.name" },
                totalQuantitySold: { $sum: "$items.quantity" },
                totalProductRevenue: { 
                    $sum: { 
                        $multiply: ["$items.quantity", "$items.price"] 
                    } 
                }
            }
        },
        { $sort: { totalQuantitySold: -1 } },
        { $limit: limit }
    ]);
};

// Get order status distribution
const getOrderStatusDistribution = async (dateFilter) => {
    const result = await Order.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: "$orderStatus",
                totalOrders: { $sum: 1 }
            }
        },
        { 
            $sort: { 
                "_id": 1 
            } 
        }
    ]);
    // console.log("Order Status Distribution:", result); // Debug log
    return result;
};

// Main analytics controller
const getSalesAnalytics = asyncHandler(async (req, res) => {
    try {
        // First, verify we have orders
        const orderCount = await Order.countDocuments({});
        // console.log("Total orders in database:", orderCount);

        const dateFilter = getDateFilter(req.query.startDate, req.query.endDate);
        // console.log("Using date filter:", dateFilter);

        // Get a sample order to verify structure
        const sampleOrder = await Order.findOne({}).lean();
        // console.log("Sample order structure:", JSON.stringify(sampleOrder, null, 2));

        const [overview, dailySales, topProducts, orderStatus] = await Promise.all([
            getOverallSales(dateFilter),
            getDailySales(dateFilter),
            getTopProducts(dateFilter),
            getOrderStatusDistribution(dateFilter)
        ]);

        const analytics = {
            overview,
            dailySales: dailySales.length ? dailySales : [{ 
                _id: { date: new Date().toISOString().split('T')[0] },
                dailyRevenue: 0,
                numberOfOrders: 0
            }],
            topProducts: topProducts.length ? topProducts : [],
            orderStatus: orderStatus.length ? orderStatus : [
                { _id: "Pending", totalOrders: 0 },
                { _id: "Processing", totalOrders: 0 },
                { _id: "Completed", totalOrders: 0 },
                { _id: "Cancelled", totalOrders: 0 }
            ]
        };

        // console.log("Final analytics:", JSON.stringify(analytics, null, 2));

        return res.status(200).json(
            new apiResponse(200, analytics, "Analytics fetched successfully")
        );

    } catch (error) {
        console.error("Analytics Error:", error);
        throw new apiError(500, error?.message || "Failed to fetch analytics");
    }
});

// Get specific product performance
const getProductAnalytics = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        const dateFilter = getDateFilter(req.query.startDate, req.query.endDate);
        const productObjectId = new mongoose.Types.ObjectId(productId);

        // Get product overview
        const productStats = await Order.aggregate([
            { 
                $match: { 
                    orderStatus: "Completed",
                    "products.product": productObjectId,
                    ...dateFilter 
                } 
            },
            { $unwind: "$products" },
            { 
                $match: { 
                    "products.product": productObjectId 
                } 
            },
            {
                $group: {
                    _id: null,
                    unitsSold: { $sum: "$products.quantity" },
                    totalRevenue: { 
                        $sum: { 
                            $multiply: ["$products.quantity", "$products.price"] 
                        } 
                    },
                    averagePrice: { $avg: "$products.price" }
                }
            }
        ]);

        // Get daily sales history
        const salesHistory = await Order.aggregate([
            { 
                $match: { 
                    orderStatus: "Completed",
                    "products.product": productObjectId,
                    ...dateFilter 
                } 
            },
            //splitting the product into seperate documents
            { $unwind: "$products" },
            { 
                $match: { 
                    "products.product": productObjectId 
                } 
            },
            {
                //sales data per product
                $group: {
                    _id: { 
                        date: { 
                            $dateToString: { 
                                format: "%Y-%m-%d", 
                                date: "$createdAt" 
                            } 
                        }
                    },
                    dailyUnits: { $sum: "$products.quantity" },
                    dailyRevenue: { 
                        $sum: { 
                            $multiply: ["$products.quantity", "$products.price"] 
                        } 
                    }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        const productAnalytics = {
            overview: productStats[0] || { 
                unitsSold: 0, 
                totalRevenue: 0, 
                averagePrice: 0 
            },
            salesHistory
        };

        res.status(200).json(
            new apiResponse(
                200, 
                productAnalytics, 
                "Product analytics fetched successfully"
            )
        );

    } catch (error) {
        throw new apiError(
            500, 
            error?.message || "Failed to fetch product analytics"
        );
    }
});

const getTop3Products = asyncHandler(async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { 
                $match: { orderStatus: "Completed" } 
            },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product",
                    totalQuantitySold: { $sum: "$products.quantity" }
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    _id: "$productDetails._id",
                    name: "$productDetails.name",
                    price: "$productDetails.price",
                    discount: "$productDetails.discount",
                    images: "$productDetails.images",
                    productId: "$productDetails.productId",
                    category: "$productDetails.category",
                    type: "$productDetails.type",
                    stock: "$productDetails.stock"
                }
            }
        ]);

        if (!topProducts?.length) {
            const defaultProducts = await Product.find({
                _id: {
                    $in: [
                        '67b30bfb6220ecc15cd8c7cf',
                        '67b30c496220ecc15cd8c7d4',
                        '67b30c9f6220ecc15cd8c7d9'
                    ].map(id => new mongoose.Types.ObjectId(id))
                }
            }).select('name price discount images productId category type stock');

            if (!defaultProducts?.length) {
                throw new apiError(404, "Default products not found");
            }

            return res.status(200).json(
                new apiResponse(200, defaultProducts, "Default products fetched successfully")
            );
        }

        return res.status(200).json(
            new apiResponse(200, topProducts, "Top selling products fetched successfully")
        );

    } catch (error) {
        throw new apiError(
            error.statusCode || 500, 
            error?.message || "Failed to fetch top products"
        );
    }
});

export {
    getSalesAnalytics,
    getProductAnalytics,
    getTop3Products
};