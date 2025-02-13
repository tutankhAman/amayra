import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getSalesAnalytics,
    getProductAnalytics
} from "../controllers/analytics.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getSalesAnalytics)
router.route("/product/:productId").post(verifyJWT, getProductAnalytics)

export default router;