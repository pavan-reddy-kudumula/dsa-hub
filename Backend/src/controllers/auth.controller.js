import bcrypt from "bcryptjs"
import pool from "../config/db.js"
import {generateToken} from "../lib/utils.js"

export async function signup(req, res, next) {
  try {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    if (password.length < 8) {
      return res.status(400).json({ message: "password must be at least 8 characters" });
    }
  
    const {rows} = await pool.query("SELECT email, username FROM users WHERE email=$1 OR username=$2", [email, username]);
  
    if (rows.length > 0) {
      if (rows.some((user) => user.email === email)) {
        return res.status(400).json({ message: "email already exists" });
      }
      if (rows.some((user) => user.username === username)) {
        return res.status(400).json({ message: "username already exists" });
      }
    }
  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const result = await pool.query("INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, about, address, total_xp, profile_pic", [username, email, hashedPassword]);
    const newUser = result.rows[0];
    generateToken(newUser.id, res);
    return res.status(201).json({
      ...newUser,
      message: "user created successfully"
    })
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  
    const existingUser = result.rows[0];
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password_hash);
    if(!isPasswordCorrect){
        return res.status(400).json({message: "Invalid credentials"})
    }
  
    generateToken(existingUser.id, res);
    return res.status(200).json({
      id: existingUser.id,
      username: existingUser.username,
      email: existingUser.email
    })
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
} 

export async function getCurrentUser(req, res, next) {
  try {
    const currentUser = req.user;
  
    if (!currentUser) {
      return res.status(400).json({ message: "user does not exist" });
    }

    return res.status(200).json({ user: currentUser, message: "user details fetched succesfully" });
  } catch (err) {
    next(err);
  }
}