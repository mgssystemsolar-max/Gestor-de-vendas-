import { useState } from 'react';
import { UploadSection } from './components/UploadSection';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ManualInput } from './components/ManualInput';
import { SolarAnalysisResult } from './services/geminiService';
import { Zap, LayoutDashboard, Calculator } from 'lucide-react';
import { CRM } from './components/CRM';

function App() {
  const [analysisResult, setAnalysisResult] = useState<SolarAnalysisResult | null>(null);
  const [currentView, setCurrentView] = useState<'calculator' | 'crm'>('calculator');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#1a1a1b] to-[#333333] border-b-[3px] border-[#FFAB00] text-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] sticky top-0 z-50">
        <div className="p-5">
          <h1 className="m-0 text-[#FFAB00] font-sans text-[1.4rem] tracking-[2px] uppercase font-black" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            MGS SOLAR COMMAND
          </h1>
          <p className="mt-[5px] text-white text-[0.75rem] opacity-80 font-light">
            SISTEMA DE GESTÃO E ENGENHARIA V.4.0
          </p>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-center space-x-1 bg-[#121212] py-2">
          <button
            onClick={() => setCurrentView('calculator')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === 'calculator'
                ? 'bg-[#FFAB00] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            }`}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculadora Solar
          </button>
          <button
            onClick={() => setCurrentView('crm')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === 'crm'
                ? 'bg-[#FFAB00] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            CRM / Leads
          </button>
        </div>
      </header>

      <main className={`flex-grow ${currentView === 'crm' ? 'bg-[#121212]' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}`}>
        {currentView === 'crm' ? (
          <CRM />
        ) : (
          <>
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
          </>
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
