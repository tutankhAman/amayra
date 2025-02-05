import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env", // Corrected .env path
});

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;
        const server = app.listen(PORT, () => {
            console.log(`Server is now running at port: ${PORT}`);
        });

        //handling EADDRINUSE error
        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.log(`Port ${PORT} is already in use. Trying a different port...`);
                server.close(() => {
                    //allocation of a free server in case another in use
                    const newServer = app.listen(0, () => {
                        console.log(`Server restarted on port ${newServer.address().port}`);
                    });
                });
            } else {
                console.error(err);
            }
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed", err);
    });
