import express from "express";
import { query } from "../config/database.js";

const router = express.Router();

// Get user settings
router.get("/", async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM user_settings WHERE user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        tradingStyle: "day_trading",
        riskPercentage: 2,
        dailyLossLimit: null,
        tradingHours: { start: "09:30", end: "16:00" },
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user settings
router.put("/", async (req, res) => {
  try {
    const {
      tradingStyle,
      riskPercentage,
      dailyLossLimit,
      tradingHours,
      brokerApiKey,
    } = req.body;

    const result = await query(
      `INSERT INTO user_settings (user_id, trading_style, risk_percentage, daily_loss_limit, trading_hours, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         trading_style = $2,
         risk_percentage = $3,
         daily_loss_limit = $4,
         trading_hours = $5,
         updated_at = NOW()
       RETURNING *`,
      [
        req.user.userId,
        tradingStyle,
        riskPercentage,
        dailyLossLimit,
        JSON.stringify(tradingHours),
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
