import express from "express";
import { query } from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Create diary entry
router.post("/", async (req, res) => {
  try {
    const { title, content, emotion, tradeId } = req.body;
    const entryId = uuidv4();

    const result = await query(
      `INSERT INTO diary_entries (id, user_id, title, content, emotion, trade_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [entryId, req.user.userId, title, content, emotion, tradeId || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all diary entries
router.get("/", async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get diary entry by id
router.get("/:id", async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM diary_entries WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update diary entry
router.put("/:id", async (req, res) => {
  try {
    const { title, content, emotion } = req.body;

    const result = await query(
      `UPDATE diary_entries SET title = $2, content = $3, emotion = $4, updated_at = NOW()
       WHERE id = $1 AND user_id = $5
       RETURNING *`,
      [req.params.id, title, content, emotion, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete diary entry
router.delete("/:id", async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM diary_entries WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
