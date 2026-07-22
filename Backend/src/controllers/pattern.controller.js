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
    console.log(patternId, 60);
    const { display_order } = req.body || 0;

    const orderNum = Number(display_order);
        
    if (!Number.isInteger(patternId) || patternId < 1) {
      const err = new Error("id is required and must be a valid integer");
      err.statusCode = 400;
      throw err;
    }

    if (!Number.isInteger(orderNum) || orderNum < 1) {
      const err = new Error("display_order is required and must be a valid integer");
      err.statusCode = 400;
      throw err;
    }
    
    client = await pool.connect();
    await client.query("BEGIN");
    transactionBegin = true;
     
    await client.query("LOCK TABLE patterns IN EXCLUSIVE MODE");

    const pattern = await client.query("SELECT display_order FROM patterns WHERE id=$1", [patternId]);
    if (pattern.rows.length === 0) {
      const err = new Error("pattern does not exist.");
      err.statusCode = 404;
      throw err;
    }
    
    const existingOrderNum = Number(pattern.rows[0].display_order);

    const maxRes = await client.query("SELECT COALESCE(MAX(display_order), 0) AS max_order FROM patterns");
    const maxOrderNum = Number(maxRes.rows[0].max_order) || 0;
    
    const targetOrderNum = Math.min(orderNum, maxOrderNum);
    
    if (targetOrderNum < existingOrderNum) {
      await client.query(
        "UPDATE patterns SET display_order = display_order + 1 WHERE display_order >= $1 AND display_order < $2",
        [targetOrderNum, existingOrderNum]
      ); 
    } else if(targetOrderNum > existingOrderNum) {
      await client.query(
        "UPDATE patterns SET display_order = display_order - 1 WHERE display_order > $1 AND display_order <= $2",
        [existingOrderNum, targetOrderNum]
      ); 
    }
    
    const result = await client.query("UPDATE patterns SET display_order=$1 WHERE id=$2 RETURNING id, name, description, display_order", [targetOrderNum, patternId]);
    
    await client.query("COMMIT");
    transactionBegin = false;
    
    return res.status(200).json({ pattern: result.rows[0], message: "pattern updated successfully" });
  } catch (err) {
    if (transactionBegin && client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    
    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function deletePattern(req, res, next) {
  try {
    const patternId = Number(req.params?.id);

    if (!Number.isInteger(patternId) || patternId < 1) {
      return res.status(400).json({ message: "id is required and must be a valid integer" });
    }

    const { rows } = await pool.query("DELETE FROM patterns WHERE id = $1 RETURNING name", [patternId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "pattern does not exist" });
    }

    return res.status(200).json({pattern: rows[0], message: "pattern deleted successfully" });
  } catch (err) {
    next(err);
  }
}