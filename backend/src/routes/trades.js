import express from "express";
import { query } from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const ensureAccountOwnership = async (accountId, userId) => {
  if (!accountId) return true;
  const result = await query(
    `SELECT id FROM accounts WHERE id = $1 AND user_id = $2`,
    [accountId, userId]
  );
  return result.rows.length > 0;
};

// Get all trades for user
router.get("/", async (req, res) => {
  try {
    const { accountId } = req.query;

    if (
      accountId &&
      !(await ensureAccountOwnership(accountId, req.user.userId))
    ) {
      return res.status(403).json({ error: "Account not found" });
    }

    const params = [req.user.userId];
    let sql = `SELECT * FROM trades WHERE user_id = $1`;

    if (accountId) {
      params.push(accountId);
      sql += ` AND account_id = $2`;
    }

    sql += ` ORDER BY entry_date DESC`;

    const result = await query(sql, params);
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
      accountId,
      stopLoss,
      takeProfit,
    } = req.body;
    const tradeId = uuidv4();

    if (
      accountId &&
      !(await ensureAccountOwnership(accountId, req.user.userId))
    ) {
      return res.status(403).json({ error: "Account not found" });
    }

    const profitLoss =
      (exitPrice - entryPrice) * quantity * (side === "SELL" ? -1 : 1);
    const roi = ((exitPrice - entryPrice) / entryPrice) * 100;

    const result = await query(
      `INSERT INTO trades 
       (id, user_id, symbol, entry_price, exit_price, entry_date, exit_date, quantity, side, profit_loss, roi, notes, emotion, account_id, stop_loss, take_profit, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
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
        accountId || null,
        stopLoss || null,
        takeProfit || null,
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
      accountId,
      stopLoss,
      takeProfit,
    } = req.body;

    if (
      accountId &&
      !(await ensureAccountOwnership(accountId, req.user.userId))
    ) {
      return res.status(403).json({ error: "Account not found" });
    }

    const profitLoss =
      (exitPrice - entryPrice) * quantity * (side === "SELL" ? -1 : 1);
    const roi = ((exitPrice - entryPrice) / entryPrice) * 100;

    const result = await query(
      `UPDATE trades SET 
       symbol = $2, entry_price = $3, exit_price = $4, entry_date = $5, 
       exit_date = $6, quantity = $7, side = $8, profit_loss = $9, roi = $10, 
       notes = $11, emotion = $12, account_id = $13, stop_loss = $14, take_profit = $15, updated_at = NOW()
       WHERE id = $1 AND user_id = $16
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
        accountId || null,
        stopLoss || null,
        takeProfit || null,
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
