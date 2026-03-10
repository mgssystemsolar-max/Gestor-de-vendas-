import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI features will not work.");
      // We still create the instance, but it might fail on actual calls
      aiInstance = new GoogleGenAI({ apiKey: "missing-key" });
    } else {
      aiInstance = new GoogleGenAI({ apiKey });
    }
  }
  return aiInstance;
}

export interface SolarAnalysisResult {
  consumo_kwh: number;
  tarifa_unitaria: number;
  tipo_ligacao: "Monofásico" | "Bifásico" | "Trifásico";
  valor_fatura: number;
  payback_estimado: string; // "X anos" ou "X meses"
  potencia_sugerida_kwp: number;
  investimento_estimado: number;
  economia_mensal: number;
  analise_tecnica: string;
}

export async function analyzeEnergyBill(
  imageBase64: string,
  mimeType: string
): Promise<SolarAnalysisResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Analise esta fatura de energia elétrica e extraia os dados para dimensionamento de um sistema de energia solar fotovoltaica.
    
    DIRETRIZES DE CÁLCULO:
    - Dimensionamento (P_wp): P_wp = (Consumo_Mensal / 30) / (5.0 * 0.80). (HSP=5.0, PR=0.80).
    - Custo de Disponibilidade (Taxa Mínima): Monofásico (30 kWh), Bifásico (50 kWh), Trifásico (100 kWh).
    - Economia Mensal = (Consumo_Mensal - Custo_Disponibilidade) * Tarifa.
    - Investimento Estimado: R$ 3500 por kWp instalado.
    - Payback = Investimento / Economia Mensal (em meses, converta para anos se > 12).
    - Análise Técnica: Escreva um texto consultivo (max 3 parágrafos) como Engenheiro de Vendas Sênior da MgS SYSTEM SOLAR. Explique que não existe "conta zero" devido ao custo de disponibilidade e iluminação pública.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            consumo_kwh: { type: Type.NUMBER, description: "Consumo médio em kWh" },
            tarifa_unitaria: { type: Type.NUMBER, description: "Tarifa unitária em R$/kWh" },
            tipo_ligacao: { type: Type.STRING, description: "Monofásico, Bifásico ou Trifásico" },
            valor_fatura: { type: Type.NUMBER, description: "Valor total da fatura em Reais" },
            payback_estimado: { type: Type.STRING, description: "Tempo estimado de retorno, ex: '3.5 anos'" },
            potencia_sugerida_kwp: { type: Type.NUMBER, description: "Potência do sistema em kWp" },
            investimento_estimado: { type: Type.NUMBER, description: "Valor estimado do investimento em Reais" },
            economia_mensal: { type: Type.NUMBER, description: "Economia mensal estimada em Reais" },
            analise_tecnica: { type: Type.STRING, description: "Texto consultivo e profissional explicando os resultados" }
          },
          required: ["consumo_kwh", "tarifa_unitaria", "tipo_ligacao", "valor_fatura", "payback_estimado", "potencia_sugerida_kwp", "investimento_estimado", "economia_mensal", "analise_tecnica"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta do Gemini");

    return JSON.parse(text) as SolarAnalysisResult;
  } catch (error) {
    console.error("Erro na análise da fatura:", error);
    throw error;
  }
}

export async function calculateManual(data: {
  consumo: number;
  tarifa: number;
  tipo: "Monofásico" | "Bifásico" | "Trifásico";
}): Promise<SolarAnalysisResult> {
    // Fallback calculation logic for manual input, using the same persona logic but locally or via AI if needed.
    // For consistency, let's use AI to generate the "Consultative" text, but we can do math locally.
    
    const hsp = 5.0;
    const pr = 0.80;
    const custoDisponibilidadeMap = {
        "Monofásico": 30,
        "Bifásico": 50,
        "Trifásico": 100
    };
    const custoDisp = custoDisponibilidadeMap[data.tipo];
    
    const p_wp = (data.consumo / 30) / (hsp * pr);
    const economia = (data.consumo - custoDisp) * data.tarifa;
    const investimento = p_wp * 3500; // Estimativa média R$ 3500/kWp
    const paybackMeses = investimento / economia;
    const paybackAnos = paybackMeses / 12;

    const prompt = `
        Você é o Engenheiro de Vendas Sênior da MgS SYSTEM SOLAR.
        Gere uma análise técnica consultiva e autoritária para um cliente com:
        - Consumo: ${data.consumo} kWh
        - Sistema sugerido: ${p_wp.toFixed(2)} kWp
        - Economia estimada: R$ ${economia.toFixed(2)}
        - Payback: ${paybackAnos.toFixed(1)} anos
        
        Use termos como "Eficiência Energética" e "Segurança do Investimento".
        Explique que não existe "conta zero" devido ao custo de disponibilidade (${custoDisp} kWh) e iluminação pública.
        Seja breve (max 3 parágrafos).
    `;

    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });

    return {
        consumo_kwh: data.consumo,
        tarifa_unitaria: data.tarifa,
        tipo_ligacao: data.tipo,
        valor_fatura: data.consumo * data.tarifa, // Aproximado
        payback_estimado: `${paybackAnos.toFixed(1)} anos`,
        potencia_sugerida_kwp: parseFloat(p_wp.toFixed(2)),
        investimento_estimado: parseFloat(investimento.toFixed(2)),
        economia_mensal: parseFloat(economia.toFixed(2)),
        analise_tecnica: response.text || "Análise indisponível no momento."
    };
}
