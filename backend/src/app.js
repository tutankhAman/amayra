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


//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/product", productRouter)

export { app }