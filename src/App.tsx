import { useState } from 'react';
import { UploadSection } from './components/UploadSection';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ManualInput } from './components/ManualInput';
import { SolarAnalysisResult } from './services/geminiService';
import { Zap } from 'lucide-react';

function App() {
  const [analysisResult, setAnalysisResult] = useState<SolarAnalysisResult | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              MgS <span className="text-orange-500">SOLAR</span> COMMAND
            </span>
          </div>
          <div className="text-xs sm:text-sm text-slate-400 font-medium">
            Engenharia de Vendas Sênior
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!analysisResult ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Transforme sua conta de luz em <span className="text-orange-600">investimento</span>.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Utilize nossa inteligência artificial para analisar sua fatura, dimensionar seu sistema fotovoltaico
                e descobrir o retorno real do seu investimento com segurança e precisão técnica.
              </p>
            </div>

            <div className="space-y-8">
              <UploadSection onAnalysisComplete={setAnalysisResult} />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-50 px-2 text-slate-500">Opções de entrada</span>
                </div>
              </div>

              <ManualInput onAnalysisComplete={setAnalysisResult} />
            </div>
          </div>
        ) : (
          <ResultsDashboard 
            data={analysisResult} 
            onReset={() => setAnalysisResult(null)} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} MgS SYSTEM SOLAR. Todos os direitos reservados.</p>
          <p className="mt-2 text-xs">
            As análises são estimativas baseadas em dados médios de mercado e insolação (HSP 5.0). 
            Consulte um engenheiro para projeto final.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
