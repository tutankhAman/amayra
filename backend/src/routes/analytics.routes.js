import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getSalesAnalytics,
    getProductAnalytics,
    getTop3Products
} from "../controllers/analytics.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getSalesAnalytics);
router.route("/product/:productId").get(verifyJWT, getProductAnalytics); // Changed from post to get
router.route("/top-products").get(getTop3Products)

export default router;