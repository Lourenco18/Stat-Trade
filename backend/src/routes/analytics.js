import express from "express";
import { query } from "../config/database.js";

const router = express.Router();

// Get performance analytics
router.get("/performance", async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN profit_loss < 0 THEN 1 ELSE 0 END) as losing_trades,
        SUM(profit_loss) as total_profit_loss,
        AVG(roi) as average_roi,
        MAX(profit_loss) as max_profit,
        MIN(profit_loss) as max_loss,
        AVG(CASE WHEN profit_loss > 0 THEN profit_loss ELSE NULL END) as avg_win,
        AVG(CASE WHEN profit_loss < 0 THEN profit_loss ELSE NULL END) as avg_loss
       FROM trades WHERE user_id = $1`,
      [userId]
    );

    const stats = result.rows[0];
    const winRate =
      stats.total_trades > 0
        ? ((stats.winning_trades / stats.total_trades) * 100).toFixed(2)
        : 0;

    const profitFactor =
      stats.avg_loss !== null && stats.avg_loss !== 0
        ? Math.abs(stats.avg_win / stats.avg_loss)
        : 0;

    res.json({
      totalTrades: parseInt(stats.total_trades),
      winningTrades: parseInt(stats.winning_trades) || 0,
      losingTrades: parseInt(stats.losing_trades) || 0,
      winRate: parseFloat(winRate),
      totalProfitLoss: parseFloat(stats.total_profit_loss) || 0,
      averageROI: parseFloat(stats.average_roi) || 0,
      maxProfit: parseFloat(stats.max_profit) || 0,
      maxLoss: parseFloat(stats.max_loss) || 0,
      averageWin: parseFloat(stats.avg_win) || 0,
      averageLoss: parseFloat(stats.avg_loss) || 0,
      profitFactor: parseFloat(profitFactor.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get equity curve data
router.get("/equity-curve", async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT 
        entry_date,
        SUM(profit_loss) OVER (ORDER BY entry_date) as cumulative_profit
       FROM trades 
       WHERE user_id = $1 
       ORDER BY entry_date ASC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trades by symbol
router.get("/by-symbol", async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT 
        symbol,
        COUNT(*) as total,
        SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as wins,
        SUM(profit_loss) as total_profit,
        AVG(roi) as avg_roi
       FROM trades 
       WHERE user_id = $1
       GROUP BY symbol
       ORDER BY total DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly statistics
router.get("/monthly", async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT 
        DATE_TRUNC('month', entry_date) as month,
        COUNT(*) as total_trades,
        SUM(profit_loss) as monthly_profit,
        AVG(roi) as avg_roi
       FROM trades 
       WHERE user_id = $1
       GROUP BY DATE_TRUNC('month', entry_date)
       ORDER BY month DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
