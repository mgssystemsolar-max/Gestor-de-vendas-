import React, { useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { analyzeEnergyBill, SolarAnalysisResult } from '../services/geminiService';

interface UploadSectionProps {
  onAnalysisComplete: (result: SolarAnalysisResult) => void;
}

export function UploadSection({ onAnalysisComplete }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, envie apenas arquivos de imagem (JPG, PNG).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        
        try {
          const result = await analyzeEnergyBill(base64Data, file.type);
          onAnalysisComplete(result);
        } catch (err) {
          setError('Falha ao analisar a fatura. Tente novamente ou use a entrada manual.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Erro ao processar o arquivo.');
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-dashed border-2 border-slate-300 bg-slate-50/50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div
          className={`w-full h-64 flex flex-col items-center justify-center rounded-lg transition-colors ${
            isDragging ? 'bg-blue-50 border-blue-500' : ''
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <div className="space-y-1">
                <p className="text-lg font-medium text-slate-900">Analisando Fatura...</p>
                <p className="text-sm text-slate-500">Nossa IA está extraindo os dados de consumo.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Arraste sua fatura de energia aqui
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Suportamos JPG e PNG. Nossa IA identificará automaticamente o consumo e tarifas.
              </p>
              <div className="relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              </div>
            </>
          )}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
