import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addReview } from "../controllers/reviews.controller.js"

const router = Router();

router.route("/add").post(verifyJWT, addReview)
// router.route("/").get(verifyJWT)

// router.route("/delete").delete(verifyJWT)
// router.route("/update").delete(verifyJWT)

export default router;