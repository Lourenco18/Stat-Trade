import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

class TradingViewAPI {
  constructor() {
    this.apiKey = process.env.TRADINGVIEW_API_KEY;
    this.baseURL =
      process.env.TRADINGVIEW_API_URL || "https://api.tradingview.com";
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  /**
   * Obter análise técnica de um símbolo
   * @param {string} symbol - Símbolo (ex: AAPL)
   * @param {string} timeframe - Timeframe (ex: 1m, 5m, 15m, 1h, 4h, 1d)
   */
  async getTechnicalAnalysis(symbol, timeframe = "1d") {
    try {
      const response = await this.client.get(`/analysis/${symbol}`, {
        params: {
          timeframe,
          fields: [
            "recommendation",
            "oscillators",
            "moving_averages",
            "summary",
          ],
        },
      });

      return {
        symbol,
        timeframe,
        recommendation: response.data.recommendation,
        summary: response.data.summary,
        oscillators: response.data.oscillators,
        movingAverages: response.data.moving_averages,
      };
    } catch (error) {
      console.error("Error fetching TradingView analysis:", error);
      throw error;
    }
  }

  /**
   * Obter dados históricos de preço
   */
  async getHistoricalData(symbol, timeframe = "1d", limit = 100) {
    try {
      const response = await this.client.get(`/history/${symbol}`, {
        params: {
          timeframe,
          limit,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw error;
    }
  }

  /**
   * Obter dados de ordem importante (suporte/resistência)
   */
  async getKeyLevels(symbol, timeframe = "1d") {
    try {
      const response = await this.client.get(`/key-levels/${symbol}`, {
        params: { timeframe },
      });

      return {
        symbol,
        support: response.data.support_levels,
        resistance: response.data.resistance_levels,
        pivotPoints: response.data.pivot_points,
      };
    } catch (error) {
      console.error("Error fetching key levels:", error);
      throw error;
    }
  }

  /**
   * Obter recomendação de força do sinal
   */
  async getSignalStrength(symbol, timeframe = "1d") {
    try {
      const analysis = await this.getTechnicalAnalysis(symbol, timeframe);

      const strengthMap = {
        strong_buy: 5,
        buy: 4,
        neutral: 3,
        sell: 2,
        strong_sell: 1,
      };

      return {
        symbol,
        recommendation: analysis.recommendation,
        strength: strengthMap[analysis.recommendation.toLowerCase()] || 3,
        oscillators: analysis.oscillators,
        movingAverages: analysis.movingAverages,
      };
    } catch (error) {
      console.error("Error getting signal strength:", error);
      throw error;
    }
  }

  /**
   * Comparar símbolos para encontrar oportunidades
   */
  async compareSymbols(symbols, timeframe = "1d") {
    try {
      const analyses = await Promise.all(
        symbols.map((symbol) => this.getTechnicalAnalysis(symbol, timeframe))
      );

      return analyses.sort((a, b) => {
        const strengthMap = {
          strong_buy: 5,
          buy: 4,
          neutral: 3,
          sell: 2,
          strong_sell: 1,
        };
        return (
          strengthMap[b.recommendation.toLowerCase()] -
          strengthMap[a.recommendation.toLowerCase()]
        );
      });
    } catch (error) {
      console.error("Error comparing symbols:", error);
      throw error;
    }
  }
}

export default new TradingViewAPI();
