import { GoogleGenAI } from "@google/genai";

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
  const model = "gemini-2.5-flash";

  const prompt = `
    Perfil: Você é o Engenheiro de Vendas Sênior da MgS SYSTEM SOLAR.
    Missão: Analisar faturas de energia e extrair dados para o sistema MGS SOLAR COMMAND.
    
    Regras: 
    1. Extraia Consumo Médio (kWh), Valor da Fatura e Tipo de Ligação.
    2. Calcule o kWp necessário e o Payback estimado.
    3. Se receber uma imagem, responda obrigatoriamente em formato JSON para integração com o Firebase.
    4. Seja consultivo e profissional.

    DIRETRIZES DE CÁLCULO ADICIONAIS:
    - Dimensionamento (P_wp): P_wp = (Consumo_Mensal / 30) / (5.0 * 0.80). (HSP=5.0, PR=0.80).
    - Custo de Disponibilidade (Taxa Mínima): Monofásico (30 kWh), Bifásico (50 kWh), Trifásico (100 kWh).
    - Economia Mensal = (Consumo_Mensal - Custo_Disponibilidade) * Tarifa.
    - Investimento Estimado: Estime um valor de mercado realista para o Brasil (aprox. R$ 3.000 a R$ 4.000 por kWp instalado).
    - Payback = Investimento / Economia Mensal.
    - Nunca prometa "conta zero". Explique o Custo de Disponibilidade (Fio B) e Iluminação Pública na análise técnica.

    SAÍDA ESPERADA (JSON PURO):
    Retorne APENAS um objeto JSON com a seguinte estrutura:
    {
      "consumo_kwh": number,
      "tarifa_unitaria": number,
      "tipo_ligacao": "Monofásico" | "Bifásico" | "Trifásico",
      "valor_fatura": number,
      "payback_estimado": string,
      "potencia_sugerida_kwp": number,
      "investimento_estimado": number,
      "economia_mensal": number,
      "analise_tecnica": "Texto consultivo e profissional explicando os resultados..."
    }
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
        model: "gemini-2.5-flash",
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
