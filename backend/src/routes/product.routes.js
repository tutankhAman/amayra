import { Router } from "express"
import {
    createProduct,
    getProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProduct
} from "../controllers/product.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { adminAuth } from "../middlewares/admin.middleware.js"

const router = Router();


router.route("/").get(getProduct)
router.route("/:productId").get(getProductById)
router.route("/search").get(searchProduct);


//----------secured routes----------//
router.route("/create-product").post(
    upload.fields([
        {
            name: "images",
            maxCount: 5
        }
    ]), verifyJWT, adminAuth, createProduct
)
router.route("/update/:productId").put(upload.array("images", 5), verifyJWT, adminAuth, updateProduct)
router.route("/delete/:productId").delete(verifyJWT, adminAuth, deleteProduct)


export default router;