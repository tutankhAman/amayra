import {Router} from "express"
import {
    createProduct
} from "../controllers/product.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {adminAuth} from "../middlewares/admin.middleware.js"

const router = Router();

router.route("/create-product").post(
    upload.fields([
       {
            name: "images",
            maxCount: 5
        }
    ]), verifyJWT, adminAuth, createProduct
)
export default router;