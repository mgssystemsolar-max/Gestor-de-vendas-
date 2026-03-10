import { useState } from 'react';
import { Zap, LayoutDashboard, MessageCircle, Wrench, FileText } from 'lucide-react';
import { CRM } from './components/CRM';
import { MaintenanceDashboard } from './components/MaintenanceDashboard';
import { MGSSolarPro } from './components/MGSSolarPro';
import { WhatsAppInbox } from './components/WhatsAppInbox';

export interface ActiveLead {
  id: string;
  nome: string;
  telefone: string;
  consumo: number;
}

function App() {
  const [currentView, setCurrentView] = useState<'crm' | 'maintenance' | 'pro' | 'whatsapp'>('crm');
  const [activeLead, setActiveLead] = useState<ActiveLead | null>(null);

  const handleNavigateToPro = (lead: ActiveLead) => {
    setActiveLead(lead);
    setCurrentView('pro');
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
        </div>
        
        {/* Navigation */}
        <div className="flex justify-center space-x-1 bg-[#121212] py-2 overflow-x-auto px-2 custom-scrollbar">
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
            onClick={() => setCurrentView('whatsapp')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-[0_0_10px_rgba(37,211,102,0.5)]'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            }`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
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
            onClick={() => setCurrentView('pro')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'pro'
                ? 'bg-[#8b5cf6] text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            MGS Solar PRO
          </button>
        </div>
      </header>

      <main className={`flex-grow ${currentView !== 'pro' && currentView !== 'whatsapp' ? 'bg-[#121212]' : currentView === 'whatsapp' ? 'bg-[#111b21]' : 'bg-white'}`}>
        {currentView === 'crm' ? (
          <CRM onNavigateToPro={handleNavigateToPro} />
        ) : currentView === 'whatsapp' ? (
          <WhatsAppInbox />
        ) : currentView === 'maintenance' ? (
          <MaintenanceDashboard />
        ) : currentView === 'pro' ? (
          <MGSSolarPro />
        ) : null}
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
