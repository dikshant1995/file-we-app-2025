/**
 * 🧠 LAXMI CREDIT: AI PREDICTION SERVICE
 * -------------------------------------
 * This service runs the Neural Brain inside the browser.
 * It uses the weights learned from 3 Crore examples to provide 
 * instant predictive intelligence.
 */

class AIPredictionService {
  constructor() {
    this.weights = null;
    this.isReady = false;
  }

  /**
   * 📡 Load the Brain from the public directory
   */
  async initialize() {
    try {
      const response = await fetch('/data/laxmi_brain_weights.json');
      this.weights = await response.json();
      this.isReady = true;
      console.log('🧠 AI Brain initialized and ready.');
    } catch (err) {
      console.error('❌ Failed to load AI weights:', err);
    }
  }

  sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

  /**
   * 🔮 Predict Loan Eligibility & Amount
   */
  predict(salary, score, tenure) {
    if (!this.isReady) return null;

    // 1. Normalization (Must match the trainer's logic exactly)
    const inputs = [
      salary / 200000,
      (score - 300) / 600,
      tenure / 7
    ];

    // 2. Hidden Layer Calculation
    let h = this.weights.b_h.map((b, i) => 
      this.sigmoid(inputs.reduce((acc, v, j) => acc + v * this.weights.w_ih[i][j], b))
    );

    // 3. Output Layer Calculation
    let o = this.weights.b_o.map((b, i) => 
      this.sigmoid(h.reduce((acc, v, j) => acc + v * this.weights.w_ho[i][j], b))
    );

    // 4. Denormalization
    const predictedAmount = o[0] * 5000000;
    
    return {
      predictedAmount: Math.round(predictedAmount),
      confidence: 100 - (o[0] < 0.1 ? 20 : 0) // Placeholder confidence logic
    };
  }
}

export const aiPredictionService = new AIPredictionService();
