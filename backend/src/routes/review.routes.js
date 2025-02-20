import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addReview, getReview, deleteReview, updateReview } from "../controllers/review.controller.js";

const router = Router();

// Make getReview accessible without authentication but pass through auth middleware optionally
router.route("/").post(verifyJWT, getReview);
router.route("/add").post(verifyJWT, addReview);
router.route("/delete").delete(verifyJWT, deleteReview);
router.route("/update").put(verifyJWT, updateReview);

export default router;