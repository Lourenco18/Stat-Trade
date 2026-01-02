import express from "express";
import { query } from "../config/database.js";
import axios from "axios";

const router = express.Router();

// Get AI insights based on trading data
router.get("/suggestions", async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get trading data
    const tradesResult = await query(
      `SELECT * FROM trades WHERE user_id = $1 ORDER BY entry_date DESC LIMIT 50`,
      [userId]
    );

    const trades = tradesResult.rows;

    if (trades.length === 0) {
      return res.json({
        insights: [],
        recommendations: ["Start trading to generate insights"],
      });
    }

    // Calculate basic metrics for insights
    const winRate =
      trades.filter((t) => t.profit_loss > 0).length / trades.length;
    const avgRoi = trades.reduce((sum, t) => sum + t.roi, 0) / trades.length;
    const symbols = [...new Set(trades.map((t) => t.symbol))];

    // Generate insights
    const insights = [];

    if (winRate < 0.45) {
      insights.push({
        type: "warning",
        message:
          "Your win rate is below 45%. Consider reviewing your entry strategy.",
      });
    }

    if (avgRoi > 2) {
      insights.push({
        type: "positive",
        message: "Great average ROI! Keep up your current strategy.",
      });
    }

    // Identify best performing symbols
    const symbolStats = await query(
      `SELECT symbol, COUNT(*) as count, AVG(roi) as avg_roi
       FROM trades WHERE user_id = $1
       GROUP BY symbol ORDER BY avg_roi DESC LIMIT 3`,
      [userId]
    );

    const recommendations = symbolStats.rows.map(
      (s) =>
        `${s.symbol} has performed well (${
          s.count
        } trades, avg ROI: ${s.avg_roi.toFixed(2)}%)`
    );

    res.json({
      insights,
      recommendations,
      performanceLevel:
        winRate > 0.55
          ? "Excellent"
          : winRate > 0.5
          ? "Good"
          : "Needs improvement",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get TradingView chart suggestions
router.get("/tradingview-analysis/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    // This would integrate with TradingView API
    // For now, returning mock data
    const tvAnalysis = {
      symbol,
      recommendation: "BUY",
      strength: 75,
      technicalAnalysis: {
        trend: "Uptrend",
        support: 100.5,
        resistance: 105.0,
      },
      indicators: {
        rsi: 65,
        macd: "Positive",
        movingAverages: "Bullish",
      },
    };

    res.json(tvAnalysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
