import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { adminAuth } from "../middlewares/admin.middleware.js"
import {
    createOrder, 
    getUserOrders, 
    getOrderById, 
    updateOrderStatus, 
} from "../controllers/order.controller.js"

const router = Router();


// User routes
router.post("/create", verifyJWT, createOrder);
router.get("/user-orders", verifyJWT, getUserOrders);
router.get("/:orderId", verifyJWT, getOrderById);

// Admin routes
router.patch("/:orderId/status", verifyJWT, adminAuth, updateOrderStatus);

export default router;