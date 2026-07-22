import pool from "../config/db.js";

export async function getUser(req, res, next) {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: "Invalid username" });
    }
  
    const result = await pool.query("SELECT id, username, email, role, about, address, total_xp, profile_pic FROM users WHERE username=$1", [username]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "user does not exist" });
    }
    return res.status(200).json({ user, message: "user fetched successfully" });
  } catch (err) {
    next(err);
  }
}

export async function updateUserData(req, res, next) {
  try {
    const { username, about, address } = req.body || {};
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    const updates = [];
    const values = [];
    let index = 1;

    if (username !== undefined) {
      updates.push(`username = $${index++}`);
      values.push(username);
    }

    if (about !== undefined) {
      updates.push(`about = $${index++}`);
      values.push(about);
    }

    if (address !== undefined) {
      updates.push(`address = $${index++}`);
      values.push(address);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: "No fields provided to update",
      });
    }
    values.push(userId);

    const result = await pool.query(
      `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${index}
      RETURNING id, username, email, about, address, total_xp, profile_pic
      `,
      values
    );

    return res.status(200).json({
      user: result.rows[0],
      message: "User updated successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserProfilePic(req, res, next) {
  try {
    const profile_pic = req.body?.profilePic;
    const userId = req.user?.id;
    
    if (typeof profile_pic !== "string" || profile_pic.trim() === "") {
      return res.status(400).json({
        message: "Profile picture is required",
      });
    }
    
    if (!userId) {
      return res.status(400).json({ message: "Unauthorized" });
    }
  
    const result = await pool.query(
      `
      UPDATE users
      SET profile_pic = $1
      WHERE id = $2
      RETURNING id, username, email, about, address, total_xp, profile_pic
      `,
      [profile_pic, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
  
    return res.status(200).json({ user: result.rows[0], message: "profile picture updated successfully" });
  } catch (err) {
    next(err);
  }

}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params || undefined;
    const { role } = req.body || undefined;
    console.log(id, role);
    if (!id || !role || (role !== 'admin' && role !== 'user')) {
      return res.status(400).json({ message: "All fields are required and role should contain a proper value" });
    }
    const { rows } = await pool.query("UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, about, address, total_xp, role", [role, id]);
    return res.status(200).json({ user: rows[0], message: "user role updated successfully" });
  } catch (err) {
    next(err);
  }
} 

export async function deleteUser(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING username", [userId]);
    if (result.rows.length == 0) {
      return res.status(400).json({ message: "user does not exist" });
    }
    return res.status(200).json({ user: result.rows[0], message: "user deleted successfully" });
  } catch (err) {
    next(err);
  }
}