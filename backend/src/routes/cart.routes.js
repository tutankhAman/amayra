import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addToCart, getCart, removeFromCart, updateCart } from "../controllers/cart.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getCart)
router.route("/add").post(verifyJWT, addToCart)
router.route("/delete").delete(verifyJWT, removeFromCart)
router.route("/update").delete(verifyJWT, updateCart)

export default router;