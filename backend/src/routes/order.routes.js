import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { adminAuth } from "../middlewares/admin.middleware.js"
import {
    createOrder, 
    getUserOrders, 
    getOrderById, 
    updateOrderStatus,
    cancelOrder,
    getAllOrders 
} from "../controllers/order.controller.js"

const router = Router();

// Admin routes first to prevent parameter conflicts
router.get("/all", verifyJWT, adminAuth, getAllOrders);
router.patch("/:orderId/status", verifyJWT, adminAuth, updateOrderStatus);

// User routes
router.post("/create", verifyJWT, createOrder);
router.patch("/:orderId/cancel", verifyJWT, cancelOrder);
router.get("/user-orders", verifyJWT, getUserOrders);
router.get("/:orderId", verifyJWT, getOrderById);

export default router;