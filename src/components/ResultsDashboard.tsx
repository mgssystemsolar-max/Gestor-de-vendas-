import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { SolarAnalysisResult } from '../services/geminiService';
import { Zap, DollarSign, Sun, TrendingUp, CheckCircle2, FileDown, Save, MessageCircle, Mic } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { gerarPropostaMGS } from '../services/pdfService';
import { Button } from './ui/Button';
import { WhatsAppModal } from './WhatsAppModal';
import { ActiveLead } from '../App';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ResultsDashboardProps {
  data: SolarAnalysisResult;
  onReset: () => void;
  activeLead?: ActiveLead | null;
}

export function ResultsDashboard({ data, onReset, activeLead }: ResultsDashboardProps) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [querMandarAudio, setQuerMandarAudio] = useState(false);
  
  // WhatsApp Modal State
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waModalData, setWaModalData] = useState({ phone: '', message: '', name: '' });

  useEffect(() => {
    if (activeLead) {
      setNome(activeLead.nome);
      setTelefone(activeLead.telefone);
    } else {
      const params = new URLSearchParams(window.location.search);
      const cliente = params.get('cliente') || params.get('name');
      const phone = params.get('phone');
      if (cliente) {
        setNome(cliente);
      }
      if (phone) {
        setTelefone(phone);
      }
    }
  }, [activeLead]);

  const chartData = [
    { name: 'Atual', valor: data.valor_fatura, color: '#94a3b8' },
    { name: 'Com Solar', valor: data.valor_fatura - data.economia_mensal, color: '#2563eb' },
  ];

  const handleSaveLead = async () => {
    if (!telefone) {
      setSaveMessage('Telefone é obrigatório para salvar o lead.');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      if (activeLead && db) {
        // Update existing lead in CRM
        await updateDoc(doc(db, 'leads_solar', activeLead.id), {
          status: 'Proposta',
          valor_sistema: data.investimento_estimado,
          ultimo_contato: new Date().toISOString(),
          historico: [
            { data: new Date().toISOString(), acao: "Proposta gerada via Calculadora" }
          ]
        });
        setSaveMessage('Proposta vinculada ao lead com sucesso!');
        alert("MGS COMMAND: Proposta salva no CRM!");
        gerarPropostaMGS({ ...data, nome });
      } else {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nome,
            phone: telefone,
            kwh: data.consumo_kwh,
            value: data.valor_fatura,
            type: data.tipo_ligacao,
            payback: data.payback_estimado
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setSaveMessage('Lead salvo com sucesso no CRM!');
          alert("MGS COMMAND: Lead sincronizado com o Dashboard!");
          gerarPropostaMGS({ ...data, nome });
          setNome('');
          setTelefone('');
        } else {
          setSaveMessage(result.error || 'Erro ao salvar lead.');
        }
      }
    } catch (error) {
      setSaveMessage('Erro de conexão ao salvar lead.');
    } finally {
      setIsSaving(false);
    }
  };

  const enviarTudoTexto = () => {
    if (!telefone) {
      alert("Preencha o telefone do cliente primeiro.");
      return;
    }
    const texto = `Olá ${nome || 'Cliente'}, segue a análise do seu sistema solar...\n\n` +
      `Potência Sugerida: ${data.potencia_sugerida_kwp} kWp\n` +
      `Economia Mensal: R$ ${data.economia_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Investimento Estimado: R$ ${data.investimento_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Payback: ${data.payback_estimado}\n\n` +
      `Qualquer dúvida estou à disposição!`;
      
    setWaModalData({
      phone: telefone,
      message: texto,
      name: nome
    });
    setWaModalOpen(true);
  };

  const enviarDadosPosAudio = () => {
    if (!telefone) {
      alert("Preencha o telefone do cliente primeiro.");
      return;
    }
    const texto = `Conforme conversamos, aqui estão os dados do seu sistema:\n\n` +
      `Potência Sugerida: ${data.potencia_sugerida_kwp} kWp\n` +
      `Economia Mensal: R$ ${data.economia_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Investimento Estimado: R$ ${data.investimento_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Payback: ${data.payback_estimado}`;
      
    setWaModalData({
      phone: telefone,
      message: texto,
      name: nome
    });
    setWaModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 text-white border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Potência Sugerida</span>
              <Sun className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{data.potencia_sugerida_kwp} <span className="text-lg font-normal text-slate-400">kWp</span></div>
            <div className="mt-2 text-xs text-slate-400">Sistema ideal para seu consumo</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Economia Mensal</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">R$ {data.economia_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="mt-2 text-xs text-green-600 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Redução estimada na fatura
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Payback Estimado</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{data.payback_estimado}</div>
            <div className="mt-2 text-xs text-slate-500">Retorno sobre o investimento</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium">Investimento</span>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">R$ {data.investimento_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="mt-2 text-xs text-slate-500">Valor aproximado de mercado</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Technical Analysis */}
        <Card className="lg:col-span-2 border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-600 mr-2" />
              Análise do Engenheiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <div className="bg-slate-50 p-6 rounded-lg text-slate-700 leading-relaxed whitespace-pre-line">
                {data.analise_tecnica}
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-white border p-3 rounded-md">
                <span className="block text-slate-500 text-xs uppercase tracking-wider">Consumo Médio</span>
                <span className="font-semibold text-slate-900">{data.consumo_kwh} kWh/mês</span>
              </div>
              <div className="bg-white border p-3 rounded-md">
                <span className="block text-slate-500 text-xs uppercase tracking-wider">Tipo de Ligação</span>
                <span className="font-semibold text-slate-900">{data.tipo_ligacao}</span>
              </div>
              <div className="bg-white border p-3 rounded-md">
                <span className="block text-slate-500 text-xs uppercase tracking-wider">Tarifa</span>
                <span className="font-semibold text-slate-900">R$ {data.tarifa_unitaria.toFixed(2)}/kWh</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Salvar no CRM</h4>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input 
                  type="text" 
                  placeholder="Nome do Cliente" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="tel" 
                  placeholder="Telefone (ex: 5511999999999)" 
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  onClick={handleSaveLead} 
                  disabled={isSaving || !telefone}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Lead'}
                </Button>
              </div>
              {saveMessage && (
                <p className={`mt-2 text-sm ${saveMessage.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveMessage}
                </p>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Ações de Contato</h4>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 mb-4">
                  <input 
                    type="checkbox" 
                    checked={querMandarAudio}
                    onChange={(e) => setQuerMandarAudio(e.target.checked)} 
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  /> 
                  Vou mandar áudio?
                </label>

                {querMandarAudio ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm border border-blue-100 flex items-start gap-2">
                      <Mic className="w-5 h-5 shrink-0 mt-0.5" />
                      <p><strong>Roteiro Sugerido:</strong> Fala {nome || '[Nome]'}, Márcio aqui. Analisei sua fatura e vi que você pode economizar R$ {data.economia_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês. Vou te mandar os dados do sistema aqui embaixo...</p>
                    </div>
                    <Button onClick={enviarDadosPosAudio} className="w-full bg-[#25D366] hover:bg-[#1da851] text-white">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Enviar Dados (Pós-Áudio)
                    </Button>
                  </div>
                ) : (
                  <Button onClick={enviarTudoTexto} className="w-full bg-[#25D366] hover:bg-[#1da851] text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar Texto Completo Agora
                  </Button>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => gerarPropostaMGS({ ...data, nome })} className="w-full sm:w-auto" variant="outline">
                  <FileDown className="w-4 h-4 mr-2" />
                  Baixar Proposta PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Custos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor Mensal']}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="text-slate-500 hover:text-blue-600 font-medium text-sm flex items-center transition-colors"
        >
          ← Realizar Nova Análise
        </button>
      </div>

      <WhatsAppModal 
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        phone={waModalData.phone}
        defaultMessage={waModalData.message}
        contactName={waModalData.name}
      />
    </div>
  );
}
