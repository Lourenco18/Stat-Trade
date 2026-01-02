import cron from "node-cron";
import { query } from "../config/database.js";
import tradingViewService from "./tradingViewService.js";

/**
 * Serviço de sincronização automática de dados
 */

// Sincronizar análise técnica a cada 4 horas
export const scheduleTechnicalAnalysisUpdate = () => {
  cron.schedule("0 */4 * * *", async () => {
    try {
      console.log("Atualizando análise técnica...");

      // Obter símbolos populares
      const result = await query(
        "SELECT DISTINCT symbol FROM trades ORDER BY symbol"
      );

      const symbols = result.rows.map((row) => row.symbol);

      for (const symbol of symbols) {
        try {
          const analysis = await tradingViewService.getTechnicalAnalysis(
            symbol
          );

          // Guardar análise na base de dados (opcional)
          console.log(
            `Análise atualizada para ${symbol}:`,
            analysis.recommendation
          );
        } catch (error) {
          console.error(`Erro ao obter análise para ${symbol}:`, error.message);
        }
      }
    } catch (error) {
      console.error("Erro na sincronização de análise técnica:", error);
    }
  });
};

// Gerar IA Insights a cada dia
export const scheduleInsightsGeneration = () => {
  cron.schedule("0 2 * * *", async () => {
    try {
      console.log("Gerando IA Insights...");

      // Obter todos os utilizadores
      const result = await query("SELECT id FROM users");

      for (const user of result.rows) {
        try {
          await generateUserInsights(user.id);
        } catch (error) {
          console.error(
            `Erro ao gerar insights para utilizador ${user.id}:`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error("Erro na geração de IA Insights:", error);
    }
  });
};

async function generateUserInsights(userId) {
  try {
    // Obter últimos trades do utilizador
    const tradesResult = await query(
      "SELECT * FROM trades WHERE user_id = $1 ORDER BY entry_date DESC LIMIT 20",
      [userId]
    );

    const trades = tradesResult.rows;

    if (trades.length < 3) {
      return; // Não há dados suficientes
    }

    // Calcular métricas
    const winRate =
      trades.filter((t) => t.profit_loss > 0).length / trades.length;
    const avgWin =
      trades
        .filter((t) => t.profit_loss > 0)
        .reduce((sum, t) => sum + t.profit_loss, 0) /
      Math.max(trades.filter((t) => t.profit_loss > 0).length, 1);
    const avgLoss =
      trades
        .filter((t) => t.profit_loss < 0)
        .reduce((sum, t) => sum + Math.abs(t.profit_loss), 0) /
      Math.max(trades.filter((t) => t.profit_loss < 0).length, 1);

    const insights = [];

    // Regra 1: Win rate baixo
    if (winRate < 0.45) {
      insights.push({
        type: "warning",
        message: `Sua taxa de vitória é ${(winRate * 100).toFixed(
          1
        )}%. Considere revisar sua estratégia de entrada.`,
        data: { winRate },
      });
    }

    // Regra 2: Profit factor baixo
    const profitFactor = avgWin / Math.max(avgLoss, 1);
    if (profitFactor < 1.5) {
      insights.push({
        type: "warning",
        message: `Seu profit factor é ${profitFactor.toFixed(
          2
        )}. Tente aumentar ganhos ou reduzir perdas.`,
        data: { profitFactor },
      });
    }

    // Regra 3: Performance excelente
    if (winRate > 0.55 && profitFactor > 2) {
      insights.push({
        type: "positive",
        message: "Excelente desempenho! Mantenha sua estratégia atual.",
        data: { winRate, profitFactor },
      });
    }

    // Guardar insights
    for (const insight of insights) {
      await query(
        "INSERT INTO insights (user_id, type, message, data, created_at) VALUES ($1, $2, $3, $4, NOW())",
        [userId, insight.type, insight.message, JSON.stringify(insight.data)]
      );
    }
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
  }
}

// Exportar insights antigos
export const scheduleOldInsightsCleanup = () => {
  cron.schedule("0 3 * * 0", async () => {
    try {
      console.log("Limpando insights antigos...");

      await query(
        "DELETE FROM insights WHERE created_at < NOW() - INTERVAL '30 days'"
      );

      console.log("Insights antigos removidos");
    } catch (error) {
      console.error("Erro ao limpar insights:", error);
    }
  });
};

// Inicializar todos os agendamentos
export const initializeScheduledTasks = () => {
  console.log("Inicializando tarefas agendadas...");
  scheduleTechnicalAnalysisUpdate();
  scheduleInsightsGeneration();
  scheduleOldInsightsCleanup();
  console.log("Tarefas agendadas iniciadas");
};
