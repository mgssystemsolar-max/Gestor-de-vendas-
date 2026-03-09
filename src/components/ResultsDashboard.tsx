import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { SolarAnalysisResult } from '../services/geminiService';
import { Zap, DollarSign, Sun, TrendingUp, CheckCircle2, FileDown, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { gerarPropostaMGS } from '../services/pdfService';
import { Button } from './ui/Button';

interface ResultsDashboardProps {
  data: SolarAnalysisResult;
  onReset: () => void;
}

export function ResultsDashboard({ data, onReset }: ResultsDashboardProps) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cliente = params.get('cliente');
    if (cliente) {
      setNome(cliente);
    }
  }, []);

  const chartData = [
    { name: 'Atual', valor: data.valor_fatura, color: '#94a3b8' },
    { name: 'Com Solar', valor: data.valor_fatura - data.economia_mensal, color: '#ea580c' },
  ];

  const handleSaveLead = async () => {
    if (!telefone) {
      setSaveMessage('Telefone é obrigatório para salvar o lead.');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
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
    } catch (error) {
      setSaveMessage('Erro de conexão ao salvar lead.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 text-white border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Potência Sugerida</span>
              <Sun className="w-5 h-5 text-orange-500" />
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
        <Card className="lg:col-span-2 border-l-4 border-l-orange-600">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckCircle2 className="w-6 h-6 text-orange-600 mr-2" />
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
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input 
                  type="tel" 
                  placeholder="Telefone (ex: 5511999999999)" 
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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

            <div className="mt-6 flex justify-end">
              <Button onClick={() => gerarPropostaMGS({ ...data, nome })} className="w-full sm:w-auto">
                <FileDown className="w-4 h-4 mr-2" />
                Baixar Proposta PDF
              </Button>
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
          className="text-slate-500 hover:text-orange-600 font-medium text-sm flex items-center transition-colors"
        >
          ← Realizar Nova Análise
        </button>
      </div>
    </div>
  );
}
