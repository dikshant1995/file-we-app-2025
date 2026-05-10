import { LINGUISTIC_GENOME } from './linguisticGenome.js';

export const neuralExplainerService = {
  generateInsight: (aiResult, bankResults, formData) => {
    try {
      const salary = parseFloat(formData.basicSalary) || parseFloat(formData.monthlyIncome) || 0;
      const salaryK = (salary / 1000).toFixed(0);
      const company = formData.companyName || 'your company';
      const score = parseInt(formData.creditScore) || 700;
      const eligibleBanks = (bankResults || []).filter(r => r.eligible);
      const bestBank = eligibleBanks.length > 0 ? eligibleBanks[0] : null;

      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const G = LINGUISTIC_GENOME.structures;

      // 🧬 DNA CONSTRUCTION
      let greeting = pick(G.greetings);
      
      let scoreGroup = score >= 750 ? G.empathy_markers.high_score : 
                       score < 650 ? G.empathy_markers.low_score : 
                       G.empathy_markers.mid_score;
      let scorePart = pick(scoreGroup).replace('{score}', score);
      
      let industryPart = pick(G.contextual_hooks).replace('{company}', company);
      let salaryPart = pick(G.salary_logic).replace('{salary}', salaryK);
      
      let suggestion = "";

      // Comparative Intelligence
      const hasChola = eligibleBanks.find(b => b.bankName.toLowerCase().includes('chola'));
      const hasKotak = eligibleBanks.find(b => b.bankName.toLowerCase().includes('kotak'));

      if (hasKotak && hasChola) {
        suggestion = pick(G.comparative_advice.kotak_vs_chola).replace('{company}', company);
      } else if (bestBank) {
        suggestion = `Based on current patterns, I'd strongly recommend **${bestBank.bankName}**. They are showing the highest "Approval Confidence" for your specific profile today. `;
      } else {
        suggestion = `Even though standard rules are saying no, my intuition says adding a co-applicant or waiting 90 days would flip this to a "Yes." `;
      }

      let closing = pick(G.closing_encouragement);

      return {
        message: `${greeting}${scorePart}${industryPart}${salaryPart}${suggestion}${closing}`,
        tone: score >= 750 ? 'premium' : 'encouraging'
      };
    } catch (err) {
      console.error('❌ DNA Processing Error:', err);
      return {
        message: "I've analyzed your unique financial profile. You have a very distinct footprint that our specialists are ready to review with you.",
        tone: 'encouraging'
      };
    }
  }
};
