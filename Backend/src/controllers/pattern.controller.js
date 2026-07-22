import pool from "../config/db.js";

export async function getPatterns(req, res, next) {
  try {
    const result = await pool.query("SELECT * FROM patterns ORDER BY display_order ASC");
    return res.status(200).json({ patterns: result.rows, message: "patterns fetched successfully" });
  } catch (err) {
    next(err);
  }
}

export async function getPatternById(req, res, next) {
  try {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const result = await pool.query("SELECT * FROM patterns WHERE id=$1", [id]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "pattern does not exist" });
    }

    return res.status(200).json({ pattern: result.rows[0], message: "pattern fetched successfully" });
  } catch (err) {
    next(err);
  }
}

export async function createPattern(req, res, next) {
  let client;
  let transactionBegin = false;
  try {
    const { name, description, display_order } = req.body || {};
    
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanDesc = typeof description === 'string' ? description.trim() : '';
    const orderNum = Number(display_order);
    
    if (!cleanName || !cleanDesc) {
      const err = new Error("Name, description are required.");
      err.statusCode = 400;
      throw err;
    }
    
    client = await pool.connect();
    await client.query("BEGIN");
    transactionBegin = true;

    await client.query("LOCK TABLE patterns IN EXCLUSIVE MODE");

    const maxRes = await client.query("SELECT COALESCE(MAX(display_order), 0) AS max_order FROM patterns");
    const maxOrder = Number(maxRes.rows[0].max_order) || 0;
    
    // Clamp requested order so it can't exceed max + 1
    let targetOrder;
    if (!Number.isInteger(orderNum) || orderNum < 1) {
      targetOrder = maxOrder + 1;
    } else {
      targetOrder = Math.min(orderNum, maxOrder + 1);
    }
    
    // Only shift if inserting into an existing position
    if (targetOrder <= maxOrder) {
      await client.query(
        "UPDATE patterns SET display_order = display_order + 1 WHERE display_order >= $1",
        [targetOrder]
      );
    }
    
    const result = await client.query("INSERT INTO patterns (name, description, display_order) VALUES ($1, $2, $3) RETURNING id, name, description, display_order", [cleanName, cleanDesc, targetOrder]);
    
    await client.query("COMMIT");
    transactionBegin = false;
    
    return res.status(201).json({ pattern: result.rows[0], message: "pattern created successfully" });
  } catch (err) {
    if (transactionBegin && client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    
    if (err.code === '23505' && err.constraint?.includes('name')) {
      err.message = "Name already exists";
      err.statusCode = 400;
    }
    
    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function updatePattern(req, res, next) {
  let client;
  let transactionBegin = false;
  try {
    const patternId = Number(req.params?.id);
    const { name, description, display_order } = req.body || {};

    const cleanName =
      typeof name === "string" ? name.trim() : undefined;
    
    const cleanDescription =
      typeof description === "string" ? description.trim() : undefined;
    
    if (cleanName === undefined && cleanDescription === undefined && display_order === undefined) {
      return res.status(400).json({ message: "Atleast one field is required" });
    }
        
    if (!Number.isInteger(patternId) || patternId < 1) {
      const err = new Error("id is required and must be a valid integer");
      err.statusCode = 400;
      throw err;
    }

    const updates = [];
    const values = [];
    let index = 1;

    if (cleanName !== undefined) {
      if (!cleanName) {
        const err = new Error("name cannot be empty");
        err.statusCode = 400;
        throw err;
      }
      updates.push(`name = $${index++}`);
      values.push(cleanName);
    }

    if (cleanDescription !== undefined) {
      if (!cleanDescription) {
        const err = new Error("description cannot be empty");
        err.statusCode = 400;
        throw err;
      }
      updates.push(`description = $${index++}`);
      values.push(cleanDescription);
    }

    if (display_order !== undefined) {
      if (!Number.isInteger(display_order) || display_order < 1) {
        const err = new Error("display_order must be a positive integer");
        err.statusCode = 400;
        throw err;
      }
    }
    
    client = await pool.connect();
    await client.query("BEGIN");
    transactionBegin = true;
     
    await client.query("LOCK TABLE patterns IN EXCLUSIVE MODE");

    if (display_order !== undefined) {
      const pattern = await client.query("SELECT display_order FROM patterns WHERE id=$1", [patternId]);
      if (pattern.rowCount === 0) {
        const err = new Error("pattern does not exist.");
        err.statusCode = 404;
        throw err;
      }
    
      const existingOrderNum = Number(pattern.rows[0].display_order);

      const maxRes = await client.query("SELECT COALESCE(MAX(display_order), 0) AS max_order FROM patterns");
      const maxOrderNum = Number(maxRes.rows[0].max_order) || 0;
    
      const targetOrderNum = Math.min(display_order, maxOrderNum);
    
      if (targetOrderNum < existingOrderNum) {
        await client.query(
          "UPDATE patterns SET display_order = display_order + 1 WHERE display_order >= $1 AND display_order < $2",
          [targetOrderNum, existingOrderNum]
        );
      } else if (targetOrderNum > existingOrderNum) {
        await client.query(
          "UPDATE patterns SET display_order = display_order - 1 WHERE display_order > $1 AND display_order <= $2",
          [existingOrderNum, targetOrderNum]
        );
      }

      updates.push(`display_order = $${index++}`);
      values.push(targetOrderNum);
    }

    values.push(patternId);
    
    const result = await client.query(`UPDATE patterns SET ${updates.join(", ")} WHERE id=$${index} RETURNING id, name, description, display_order`, values);

    if (result.rowCount === 0) {
      const err = new Error("pattern does not exist.");
      err.statusCode = 404;
      throw err;
    }
    
    await client.query("COMMIT");
    transactionBegin = false;
    
    return res.status(200).json({ pattern: result.rows[0], message: "pattern updated successfully" });
  } catch (err) {
    if (transactionBegin && client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("Rollback failed in updatePattern:", rollbackErr);
      }
    }

    if (err.code === '23505' && err.constraint?.includes('name')) {
      err.message = "Name already exists";
      err.statusCode = 400;
    }
    
    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function deletePattern(req, res, next) {
  let client;
  let transactionBegin = false;
  try {
    const patternId = Number(req.params?.id);

    if (!Number.isInteger(patternId) || patternId < 1) {
      return res.status(400).json({ message: "id is required and must be a valid integer" });
    }

    client = await pool.connect();
    await client.query("BEGIN");
    transactionBegin = true;

    await client.query("LOCK TABLE patterns IN EXCLUSIVE MODE");

    const { rows } = await client.query("SELECT display_order FROM patterns WHERE id = $1", [patternId]);
    if (rows.length === 0) {
      const err = new Error("pattern does not exist");
      err.statusCode = 404;
      throw err;
    }
    const existingOrderNum = rows[0].display_order;

    const { rows: patternRows } = await client.query("DELETE FROM patterns WHERE id = $1 RETURNING name", [patternId]);
    
    await client.query("UPDATE patterns SET display_order = display_order - 1 WHERE display_order > $1", [existingOrderNum])

    await client.query("COMMIT");
    transactionBegin = false;

    return res.status(200).json({pattern: patternRows[0], message: "pattern deleted successfully" });
  } catch (err) {
    if (client && transactionBegin) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("ROLLBACK failed in deletePattern:", rollbackErr);
      }
    }
    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
}