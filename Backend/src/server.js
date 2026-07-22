import express from "express"
import dotenv from "dotenv"
import pool from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "../src/routes/auth.route.js"
import userRouter from "../src/routes/user.route.js"
import patternRouter from "../src/routes/pattern.route.js"
import { errorHandler } from "./middleware/errorHandler.middleware.js"
import verifyAdmin from "./middleware/admin.middleware.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/patterns", patternRouter);
app.use(errorHandler);
app.use(verifyAdmin)

app.router.get("/health-check", (req, res) => {
  return res.status(200).json({ message: "server is live" });
})

async function testConnection() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("Connected to PostgreSQL database");
        console.log("Current timestamp:", result.rows[0].now);
    } catch (error) {
        console.error("Error connecting to PostgreSQL database", error);
    }
}

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    testConnection();
})