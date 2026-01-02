import express from "express";
import { query } from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Get all trades for user
router.get("/", async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM trades WHERE user_id = $1 ORDER BY entry_date DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create trade
router.post("/", async (req, res) => {
  try {
    const {
      symbol,
      entryPrice,
      exitPrice,
      entryDate,
      exitDate,
      quantity,
      side,
      notes,
      emotion,
    } = req.body;
    const tradeId = uuidv4();

    const profitLoss =
      (exitPrice - entryPrice) * quantity * (side === "SELL" ? -1 : 1);
    const roi = ((exitPrice - entryPrice) / entryPrice) * 100;

    const result = await query(
      `INSERT INTO trades 
       (id, user_id, symbol, entry_price, exit_price, entry_date, exit_date, quantity, side, profit_loss, roi, notes, emotion, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING *`,
      [
        tradeId,
        req.user.userId,
        symbol,
        entryPrice,
        exitPrice,
        entryDate,
        exitDate,
        quantity,
        side,
        profitLoss,
        roi,
        notes,
        emotion,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update trade
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      symbol,
      entryPrice,
      exitPrice,
      entryDate,
      exitDate,
      quantity,
      side,
      notes,
      emotion,
    } = req.body;

    const profitLoss =
      (exitPrice - entryPrice) * quantity * (side === "SELL" ? -1 : 1);
    const roi = ((exitPrice - entryPrice) / entryPrice) * 100;

    const result = await query(
      `UPDATE trades SET 
       symbol = $2, entry_price = $3, exit_price = $4, entry_date = $5, 
       exit_date = $6, quantity = $7, side = $8, profit_loss = $9, roi = $10, 
       notes = $11, emotion = $12, updated_at = NOW()
       WHERE id = $1 AND user_id = $13
       RETURNING *`,
      [
        id,
        symbol,
        entryPrice,
        exitPrice,
        entryDate,
        exitDate,
        quantity,
        side,
        profitLoss,
        roi,
        notes,
        emotion,
        req.user.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trade not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete trade
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM trades WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trade not found" });
    }

    res.json({ message: "Trade deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import trades from CSV
router.post("/import", async (req, res) => {
  try {
    const { trades } = req.body;
    const insertedTrades = [];

    for (const trade of trades) {
      const tradeId = uuidv4();
      const profitLoss = (trade.exitPrice - trade.entryPrice) * trade.quantity;
      const roi =
        ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100;

      const result = await query(
        `INSERT INTO trades 
         (id, user_id, symbol, entry_price, exit_price, entry_date, exit_date, quantity, side, profit_loss, roi, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         RETURNING *`,
        [
          tradeId,
          req.user.userId,
          trade.symbol,
          trade.entryPrice,
          trade.exitPrice,
          trade.entryDate,
          trade.exitDate,
          trade.quantity,
          trade.side || "BUY",
          profitLoss,
          roi,
          trade.notes || "",
        ]
      );

      insertedTrades.push(result.rows[0]);
    }

    res.status(201).json({
      message: `${insertedTrades.length} trades imported`,
      trades: insertedTrades,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
