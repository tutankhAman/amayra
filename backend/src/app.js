import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

//route import
import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"
import cartRouter from "./routes/cart.routes.js"
import reviewRouter from "./routes/review.routes.js"
import orderRouter from "./routes/order.routes.js"
import analyticsRouter from "./routes/analytics.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/product", productRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/order', orderRouter)
app.use('/api/v1/analytics', analyticsRouter)

//server health check
app.get('/health', (req, res) => {
    res.status(200).send('Server is running!');
  });
  

export { app }