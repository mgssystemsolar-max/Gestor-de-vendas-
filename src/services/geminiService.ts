import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    Você é o Engenheiro de Vendas Sênior da MgS SYSTEM SOLAR.
    Sua função é analisar faturas de energia e calcular dimensionamentos fotovoltaicos.

    DIRETRIZES DE CÁLCULO (Siga Rigorosamente):
    1. Consumo Médio: Extraia a média dos últimos 12 meses. Se não houver histórico, use o consumo do mês atual.
    2. Dimensionamento (P_wp): P_wp = (Consumo_Mensal / 30) / (5.0 * 0.80). (HSP=5.0, PR=0.80).
    3. Custo de Disponibilidade (Taxa Mínima):
       - Monofásico: 30 kWh
       - Bifásico: 50 kWh
       - Trifásico: 100 kWh
    4. Economia Mensal = (Consumo_Mensal - Custo_Disponibilidade) * Tarifa.
    5. Investimento Estimado: Estime um valor de mercado realista para o Brasil (aprox. R$ 3.000 a R$ 4.000 por kWp instalado).
    6. Payback = Investimento / Economia Mensal.

    REGRAS DE NEGÓCIO:
    - Nunca prometa "conta zero".
    - Explique o Custo de Disponibilidade (Fio B) e Iluminação Pública na análise técnica.
    - Seja consultivo, autoritário e use termos como "Eficiência Energética" e "Segurança do Investimento".

    SAÍDA ESPERADA (JSON PURO):
    Retorne APENAS um objeto JSON com a seguinte estrutura, sem markdown code blocks:
    {
      "consumo_kwh": number,
      "tarifa_unitaria": number,
      "tipo_ligacao": "Monofásico" | "Bifásico" | "Trifásico",
      "valor_fatura": number,
      "payback_estimado": string,
      "potencia_sugerida_kwp": number,
      "investimento_estimado": number,
      "economia_mensal": number,
      "analise_tecnica": "Texto consultivo e autoritário explicando os resultados..."
    }
  `;

  try {
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
