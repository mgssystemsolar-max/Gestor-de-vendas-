import { jsPDF } from "jspdf";
import { SolarAnalysisResult } from "./geminiService";

export const gerarPropostaMGS = (dados: SolarAnalysisResult & { nome?: string }) => {
  const doc = new jsPDF();
  const nomeCliente = dados.nome || "Cliente";

  // Cabeçalho MGS SOLAR COMMAND
  doc.setFontSize(22);
  doc.setTextColor(255, 171, 0); // O laranja/dourado da sua marca
  doc.text("MGS SYSTEM SOLAR - PROPOSTA", 10, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Cliente: ${nomeCliente}`, 10, 40);
  doc.text(`Consumo Estimado: ${dados.consumo_kwh} kWh`, 10, 50);
  doc.text(`Potência Sugerida: ${dados.potencia_sugerida_kwp} kWp`, 10, 60);
  doc.text(`Investimento Estimado: R$ ${dados.investimento_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 10, 70);
  doc.text(`Economia Mensal: R$ ${dados.economia_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 10, 80);
  doc.text(`Payback Estimado: ${dados.payback_estimado}`, 10, 90);
  
  // Linha de Rodapé
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Engenharia de precisão para sua economia.", 10, 110);
  doc.text("MGS SOLAR COMMAND - Sistema de Gestão e Engenharia V.4.0", 10, 115);
  
  doc.save(`Proposta_MGS_${nomeCliente}.pdf`);
};
