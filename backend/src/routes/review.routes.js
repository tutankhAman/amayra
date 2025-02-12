import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addReview, getReview, deleteReview, updateReview } from "../controllers/review.controller.js"

const router = Router();

router.route("/add").post(verifyJWT, addReview)
router.route("/").get(verifyJWT, getReview)

router.route("/delete").delete(verifyJWT, deleteReview)
router.route("/update").put(verifyJWT, updateReview)

export default router;