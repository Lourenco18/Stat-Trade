import express from "express";
import pool from "../config/database.js";

const router = express.Router();

const evaluateStatus = ({ account, totalPnl, currentDrawdown, dailyPnl }) => {
  const profitTarget = parseFloat(account.profit_target) || 0;
  const maxDrawdown = parseFloat(account.max_drawdown) || 0;
  const maxLossLimit = parseFloat(account.max_loss_limit) || 0;
  const dailyLossLimit = parseFloat(account.daily_loss_limit) || 0;

  let nextStatus = account.status || "active";

  const failedByDrawdown =
    (maxDrawdown > 0 && currentDrawdown >= maxDrawdown) ||
    (maxLossLimit > 0 && currentDrawdown >= maxLossLimit);
  const failedByDaily = dailyLossLimit > 0 && dailyPnl <= -dailyLossLimit;

  if (nextStatus !== "failed" && (failedByDrawdown || failedByDaily)) {
    nextStatus = "failed";
  }

  const passedTarget = profitTarget > 0 && totalPnl >= profitTarget;
  if (nextStatus === "active" && passedTarget) {
    nextStatus = "passed";
  }

  return nextStatus;
};

// Get all accounts for user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.user;

    const result = await pool.query(
      `SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// Get single account by ID
router.get("/:id", async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM accounts WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching account:", error);
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

// Get account statistics
router.get("/:id/stats", async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    // Verify account belongs to user
    const accountCheck = await pool.query(
      `SELECT * FROM accounts WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    const account = accountCheck.rows[0];

    // Get trades statistics for this account
    const tradesStats = await pool.query(
      `SELECT 
                COUNT(*) as total_trades,
                COUNT(*) FILTER (WHERE profit_loss > 0) as winning_trades,
                COUNT(*) FILTER (WHERE profit_loss < 0) as losing_trades,
                COALESCE(SUM(profit_loss), 0) as total_pnl,
                COALESCE(MAX(profit_loss), 0) as max_profit,
                COALESCE(MIN(profit_loss), 0) as max_loss,
                COALESCE(AVG(CASE WHEN profit_loss > 0 THEN profit_loss END), 0) as avg_win,
                COALESCE(AVG(CASE WHEN profit_loss < 0 THEN profit_loss END), 0) as avg_loss
            FROM trades 
            WHERE account_id = $1`,
      [id]
    );

    const stats = tradesStats.rows[0];
    const totalTrades = parseInt(stats.total_trades);
    const winRate =
      totalTrades > 0
        ? (parseInt(stats.winning_trades) / totalTrades) * 100
        : 0;

    // Calculate current drawdown
    const totalPnl = parseFloat(stats.total_pnl);
    const currentBalance = parseFloat(account.current_balance);
    const initialBalance = parseFloat(account.initial_balance);
    const maxDrawdown = parseFloat(account.max_drawdown) || 0;
    const dailyLossLimit = parseFloat(account.daily_loss_limit) || 0;

    const currentDrawdown = initialBalance - currentBalance;
    const drawdownPercent = (currentDrawdown / initialBalance) * 100;

    // Check if limits breached
    const maxDrawdownBreached =
      maxDrawdown > 0 && currentDrawdown >= maxDrawdown;

    // Get today's P&L
    const todayPnl = await pool.query(
      `SELECT COALESCE(SUM(profit_loss), 0) as daily_pnl
            FROM trades 
            WHERE account_id = $1 AND DATE(entry_date) = CURRENT_DATE`,
      [id]
    );

    const dailyPnl = parseFloat(todayPnl.rows[0].daily_pnl);
    const dailyLimitBreached =
      dailyLossLimit > 0 && dailyPnl <= -dailyLossLimit;

    // Calculate progress to profit target
    const profitTarget = parseFloat(account.profit_target) || 0;
    const profitProgress =
      profitTarget > 0 ? (totalPnl / profitTarget) * 100 : 0;

    const nextStatus = evaluateStatus({
      account,
      totalPnl,
      currentDrawdown,
      dailyPnl,
    });

    let latestAccount = account;
    if (nextStatus !== account.status) {
      const statusUpdate = await pool.query(
        `UPDATE accounts
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [nextStatus, id, userId]
      );

      if (statusUpdate.rows.length > 0) {
        latestAccount = statusUpdate.rows[0];
      }
    }

    res.json({
      account: latestAccount,
      stats: {
        totalTrades,
        winningTrades: parseInt(stats.winning_trades),
        losingTrades: parseInt(stats.losing_trades),
        winRate: winRate.toFixed(2),
        totalPnl: totalPnl.toFixed(2),
        maxProfit: parseFloat(stats.max_profit).toFixed(2),
        maxLoss: parseFloat(stats.max_loss).toFixed(2),
        avgWin: parseFloat(stats.avg_win).toFixed(2),
        avgLoss: parseFloat(stats.avg_loss).toFixed(2),
      },
      drawdown: {
        current: currentDrawdown.toFixed(2),
        percent: drawdownPercent.toFixed(2),
        max: maxDrawdown.toFixed(2),
        breached: maxDrawdownBreached,
      },
      daily: {
        pnl: dailyPnl.toFixed(2),
        limit: dailyLossLimit.toFixed(2),
        breached: dailyLimitBreached,
      },
      profit: {
        target: profitTarget.toFixed(2),
        current: totalPnl.toFixed(2),
        progress: profitProgress.toFixed(2),
      },
      balance: {
        initial: initialBalance.toFixed(2),
        current: currentBalance.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error fetching account stats:", error);
    res.status(500).json({ error: "Failed to fetch account statistics" });
  }
});

// Create new account
router.post("/", async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      name,
      propFirm,
      accountType,
      stage,
      initialBalance,
      profitTarget,
      dailyLossLimit,
      maxLossLimit,
      maxDrawdown,
      pricePaid = 0,
      leverage,
      startDate,
      endDate,
      notes,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO accounts (
                user_id, name, prop_firm, account_type, stage,
                initial_balance, current_balance, profit_target,
                daily_loss_limit, max_loss_limit, max_drawdown,
                price_paid, leverage, start_date, end_date, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *`,
      [
        userId,
        name,
        propFirm,
        accountType,
        stage,
        initialBalance,
        initialBalance,
        profitTarget,
        dailyLossLimit,
        maxLossLimit,
        maxDrawdown,
        pricePaid,
        leverage,
        startDate,
        endDate,
        notes,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Update account
router.put("/:id", async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const {
      name,
      propFirm,
      accountType,
      stage,
      initialBalance,
      currentBalance,
      profitTarget,
      dailyLossLimit,
      maxLossLimit,
      maxDrawdown,
      pricePaid = 0,
      leverage,
      startDate,
      endDate,
      status,
      notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE accounts SET
                name = $1, prop_firm = $2, account_type = $3, stage = $4,
                initial_balance = $5, current_balance = $6, profit_target = $7,
                daily_loss_limit = $8, max_loss_limit = $9, max_drawdown = $10,
                price_paid = $11, leverage = $12, start_date = $13, end_date = $14, status = $15, notes = $16,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = $17 AND user_id = $18
            RETURNING *`,
      [
        name,
        propFirm,
        accountType,
        stage,
        initialBalance,
        currentBalance,
        profitTarget,
        dailyLossLimit,
        maxLossLimit,
        maxDrawdown,
        pricePaid,
        leverage,
        startDate,
        endDate,
        status,
        notes,
        id,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ error: "Failed to update account" });
  }
});

// Update account balance (after trade)
router.post("/:id/update-balance", async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { profitLoss } = req.body;

    const accountRes = await pool.query(
      `SELECT * FROM accounts WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (accountRes.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    const account = accountRes.rows[0];

    const updatedRes = await pool.query(
      `UPDATE accounts SET
                current_balance = current_balance + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND user_id = $3
            RETURNING *`,
      [profitLoss, id, userId]
    );

    const updatedAccount = updatedRes.rows[0];

    const tradeAgg = await pool.query(
      `SELECT
            COALESCE(SUM(profit_loss), 0) AS total_pnl,
            COALESCE(SUM(profit_loss) FILTER (WHERE DATE(entry_date) = CURRENT_DATE), 0) AS daily_pnl
         FROM trades
         WHERE account_id = $1`,
      [id]
    );

    const totalPnl = parseFloat(tradeAgg.rows[0].total_pnl);
    const dailyPnl = parseFloat(tradeAgg.rows[0].daily_pnl);
    const currentDrawdown =
      parseFloat(updatedAccount.initial_balance) -
      parseFloat(updatedAccount.current_balance);

    const nextStatus = evaluateStatus({
      account: updatedAccount,
      totalPnl,
      currentDrawdown,
      dailyPnl,
    });

    if (nextStatus !== updatedAccount.status) {
      const statusUpdate = await pool.query(
        `UPDATE accounts
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
        [nextStatus, id, userId]
      );

      return res.json(statusUpdate.rows[0]);
    }

    res.json(updatedAccount);
  } catch (error) {
    console.error("Error updating account balance:", error);
    res.status(500).json({ error: "Failed to update account balance" });
  }
});

// Delete account
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM accounts WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
