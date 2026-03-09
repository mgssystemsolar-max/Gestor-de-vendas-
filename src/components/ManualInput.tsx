import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { calculateManual, SolarAnalysisResult } from '../services/geminiService';
import { Loader2 } from 'lucide-react';

interface ManualInputProps {
  onAnalysisComplete: (result: SolarAnalysisResult) => void;
}

export function ManualInput({ onAnalysisComplete }: ManualInputProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    consumo: '',
    tarifa: '',
    tipo: 'Monofásico' as 'Monofásico' | 'Bifásico' | 'Trifásico',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await calculateManual({
        consumo: parseFloat(formData.consumo),
        tarifa: parseFloat(formData.tarifa.replace(',', '.')),
        tipo: formData.tipo,
      });
      onAnalysisComplete(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-lg text-slate-700">Ou insira os dados manualmente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Consumo Médio (kWh)</label>
              <input
                required
                type="number"
                placeholder="Ex: 450"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.consumo}
                onChange={(e) => setFormData({ ...formData, consumo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tarifa (R$/kWh)</label>
              <input
                required
                type="text"
                placeholder="Ex: 0.95"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.tarifa}
                onChange={(e) => setFormData({ ...formData, tarifa: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tipo de Ligação</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
              >
                <option value="Monofásico">Monofásico</option>
                <option value="Bifásico">Bifásico</option>
                <option value="Trifásico">Trifásico</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculando Viabilidade...
              </>
            ) : (
              'Gerar Análise'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
