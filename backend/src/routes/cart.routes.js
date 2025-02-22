import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getCart)
router.route("/add").post(verifyJWT, addToCart)
router.route("/update").put(verifyJWT, updateCartItem)
router.route("/delete").delete(verifyJWT, removeFromCart)
router.route("/clear").delete(verifyJWT, clearCart)

export default router;