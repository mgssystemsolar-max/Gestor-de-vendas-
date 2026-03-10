import { useState } from 'react';
import { UploadSection } from './components/UploadSection';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ManualInput } from './components/ManualInput';
import { SolarAnalysisResult } from './services/geminiService';
import { Zap, LayoutDashboard, Calculator, MessageCircle, Wrench } from 'lucide-react';
import { CRM } from './components/CRM';
import { WhatsAppIntegrationModal } from './components/WhatsAppIntegrationModal';
import { MaintenanceDashboard } from './components/MaintenanceDashboard';

export interface ActiveLead {
  id: string;
  nome: string;
  telefone: string;
  consumo: number;
}

function App() {
  const [analysisResult, setAnalysisResult] = useState<SolarAnalysisResult | null>(null);
  const [currentView, setCurrentView] = useState<'calculator' | 'crm' | 'maintenance'>('crm');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [activeLead, setActiveLead] = useState<ActiveLead | null>(null);

  const handleNavigateToCalculator = (lead: ActiveLead) => {
    setActiveLead(lead);
    setCurrentView('calculator');
    setAnalysisResult(null); // Reset previous analysis
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#1a1a1b] to-[#333333] border-b-[3px] border-[#3b82f6] text-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] sticky top-0 z-50">
        <div className="p-5 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex-1 text-left flex items-center gap-4">
            <img src="/logo-icon.svg" alt="MgS Solar Command Logo" className="h-12 w-auto" />
            <div>
              <h1 className="m-0 text-[#3b82f6] font-sans text-[1.4rem] tracking-[2px] uppercase font-black" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
                MGS SOLAR COMMAND
              </h1>
              <p className="mt-[5px] text-white text-[0.75rem] opacity-80 font-light">
                SISTEMA DE GESTÃO E ENGENHARIA V.4.0
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowWhatsAppModal(true)}
            className="hidden sm:flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            Integração WhatsApp
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-center space-x-1 bg-[#121212] py-2 overflow-x-auto px-2 custom-scrollbar">
          <button
            onClick={() => setCurrentView('calculator')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'calculator'
                ? 'bg-[#3b82f6] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            }`}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculadora Solar
          </button>
          <button
            onClick={() => setCurrentView('crm')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'crm'
                ? 'bg-[#3b82f6] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            CRM / Leads
          </button>
          <button
            onClick={() => setCurrentView('maintenance')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'maintenance'
                ? 'bg-[#3b82f6] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            }`}
          >
            <Wrench className="w-4 h-4 mr-2" />
            O&M (Manutenção)
          </button>
          <button 
            onClick={() => setShowWhatsAppModal(true)}
            className="sm:hidden flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors text-[#25D366] hover:bg-[#333] whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </button>
        </div>
      </header>

      <main className={`flex-grow ${currentView !== 'calculator' ? 'bg-[#121212]' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}`}>
        {currentView === 'crm' ? (
          <CRM onNavigateToCalculator={handleNavigateToCalculator} />
        ) : currentView === 'maintenance' ? (
          <MaintenanceDashboard />
        ) : (
          <>
            {!analysisResult ? (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                    Transforme sua conta de luz em <span className="text-blue-600">investimento</span>.
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

                  <ManualInput onAnalysisComplete={setAnalysisResult} activeLead={activeLead} />
                </div>
              </div>
            ) : (
              <ResultsDashboard 
                data={analysisResult} 
                onReset={() => {
                  setAnalysisResult(null);
                  setActiveLead(null);
                }} 
                activeLead={activeLead}
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

      {showWhatsAppModal && (
        <WhatsAppIntegrationModal onClose={() => setShowWhatsAppModal(false)} />
      )}
    </div>
  );
}

export default App;
