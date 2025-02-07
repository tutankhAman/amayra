import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { adminAuth } from "../middlewares/admin.middleware.js"
import { addToCart, getCart } from "../controllers/cart.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getCart)
router.route("/add").post(verifyJWT, addToCart)

export default router;