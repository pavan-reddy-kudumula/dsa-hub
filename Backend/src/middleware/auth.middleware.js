import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export default async function protectRoute(req, res, next) {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await pool.query(
      "SELECT id, username, email, about, address, total_xp, profile_pic FROM users WHERE id = $1",
      [decoded.userId],
    );
    if (rows.length == 0) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (
          error instanceof jwt.JsonWebTokenError ||
          error instanceof jwt.TokenExpiredError
        ) {
          return res.status(401).json({
            message: "Unauthorized - Invalid or expired token",
          });
        }
    console.error("error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}