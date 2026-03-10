import React, { useState, useEffect } from 'react';
import { Wrench, Activity, AlertTriangle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { WhatsAppModal } from './WhatsAppModal';

interface MaintenanceLead {
  id: string;
  nome: string;
  telefone: string;
  modeloInversor: string;
  linkPortal: string;
  lastUpdate: number;
  endereco: string;
}

const mockMaintenanceLeads: MaintenanceLead[] = [
  { id: '1', nome: 'João Silva', telefone: '5511999999999', modeloInversor: 'Growatt MIN 5000TL-X', linkPortal: 'https://server.growatt.com', lastUpdate: Date.now() - 3600000, endereco: 'Av. Paulista, 1000, São Paulo - SP' },
  { id: '2', nome: 'Maria Oliveira', telefone: '5511988888888', modeloInversor: 'Deye SUN-5K-G', linkPortal: 'https://www.solarmanpv.com', lastUpdate: Date.now() - 90000000, endereco: 'Rua Augusta, 500, São Paulo - SP' },
  { id: '3', nome: 'Carlos Souza', telefone: '5511977777777', modeloInversor: 'Fronius Primo 5.0-1', linkPortal: 'https://www.solarweb.com', lastUpdate: Date.now() - 7200000, endereco: 'Av. Brigadeiro Faria Lima, 2000, São Paulo - SP' },
  { id: '4', nome: 'Ana Santos', telefone: '5511966666666', modeloInversor: 'Solis 4K-2G', linkPortal: 'https://www.soliscloud.com', lastUpdate: Date.now() - 150000000, endereco: 'Rua Oscar Freire, 100, São Paulo - SP' },
];

const StatusManutencao: React.FC<{ lead: MaintenanceLead, onOpenWhatsApp: (phone: string, message: string, name: string) => void }> = ({ lead, onOpenWhatsApp }) => {
  // Simulação de lógica: Se não houver log há 24h, fica vermelho
  const isOffline = lead.lastUpdate < Date.now() - 86400000; 
  
  // Calcula horas offline
  const horasOffline = isOffline ? Math.floor((Date.now() - lead.lastUpdate) / 3600000) : 0;

  const abrirMonitoramento = (link: string) => {
    window.open(link, '_blank');
  };

  const enviarTecnico = (telefone: string) => {
    const texto = `Olá ${lead.nome}, identificamos uma instabilidade na comunicação do seu inversor ${lead.modeloInversor}. Nossa equipe técnica entrará em contato para agendar uma verificação.`;
    onOpenWhatsApp(telefone, texto, lead.nome);
  };

  const enviarRotaAoTecnico = (enderecoCliente: string, nomeTecnico: string = "Técnico") => {
    // Número placeholder para o técnico. Na vida real, poderia vir de um select ou input.
    const telefoneTecnico = "5511900000000"; 
    const urlMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCliente)}`;
    const mensagemZap = `MGS COMMAND: Olá ${nomeTecnico}, nova manutenção em: ${urlMaps}`;
    
    onOpenWhatsApp(telefoneTecnico, mensagemZap, nomeTecnico);
  };

  return (
    <div className={`relative p-5 rounded-xl shadow-lg transition-all duration-300 flex flex-col h-full ${isOffline ? 'bg-gradient-to-br from-[#2a0808] to-[#1a0505] border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'bg-gradient-to-br from-[#1a2e1a] to-[#0d1a0d] border border-[#4dff88]/30'}`}>
      
      {isOffline && (
        <div className="absolute -top-3 -right-3 z-10">
          <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse uppercase tracking-wider border-2 border-[#121212]">
            <AlertTriangle size={12} strokeWidth={3} /> Offline {horasOffline}h
          </span>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <h4 className="text-white m-0 text-lg font-bold truncate pr-4">{lead.nome}</h4>
        {!isOffline && (
          <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 font-bold tracking-wide uppercase shrink-0">
            <Activity size={12} /> Online
          </span>
        )}
      </div>
      
      <div className="space-y-3 mb-6 flex-grow">
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Inversor</span>
          <span className="text-gray-200 font-medium text-sm">{lead.modeloInversor}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Endereço</span>
          <span className="text-gray-200 font-medium text-sm line-clamp-2" title={lead.endereco}>{lead.endereco}</span>
        </div>
        <div className="flex flex-col pt-1">
          <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Última Comunicação</span>
          <span className={`${isOffline ? 'text-red-400 font-semibold' : 'text-gray-400'} text-xs`}>
            {new Date(lead.lastUpdate).toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex gap-2">
          <button 
            onClick={() => abrirMonitoramento(lead.linkPortal)} 
            className="flex-1 flex items-center justify-center gap-2 text-xs font-bold transition-all hover:brightness-110 active:scale-95 bg-[#3b82f6] text-white py-2.5 px-3 rounded-lg shadow-md"
          >
            👁️ Portal
          </button>
          <button 
            onClick={() => enviarTecnico(lead.telefone)} 
            className="flex-1 flex items-center justify-center gap-2 text-xs font-bold transition-all hover:brightness-110 active:scale-95 bg-[#25D366] text-white py-2.5 px-3 rounded-lg shadow-md"
          >
            💬 Cliente
          </button>
        </div>
        <button 
          onClick={() => enviarRotaAoTecnico(lead.endereco, 'Equipe Técnica')} 
          className={`w-full flex items-center justify-center gap-2 text-xs font-bold transition-all hover:brightness-110 active:scale-95 text-white py-2.5 px-3 rounded-lg shadow-md ${isOffline ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}`}
        >
          📍 Enviar Rota ao Técnico
        </button>
      </div>
    </div>
  );
};

export function MaintenanceDashboard() {
  const [leads, setLeads] = useState<MaintenanceLead[]>(mockMaintenanceLeads);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waModalData, setWaModalData] = useState({ phone: '', message: '', name: '' });

  const handleOpenWhatsApp = (phone: string, message: string, name: string) => {
    setWaModalData({ phone, message, name });
    setWaModalOpen(true);
  };

  useEffect(() => {
    if (!db) return;
    
    const unsubscribe = onSnapshot(collection(db, 'maintenance_solar'), (snapshot) => {
      if (!snapshot.empty) {
        const firebaseLeads: MaintenanceLead[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nome: data.nome || 'Sem Nome',
            telefone: data.telefone || '',
            modeloInversor: data.modeloInversor || 'Desconhecido',
            linkPortal: data.linkPortal || '#',
            lastUpdate: data.lastUpdate || Date.now(),
            endereco: data.endereco || 'Endereço não informado'
          } as MaintenanceLead;
        });
        setLeads(firebaseLeads);
      }
    }, (error) => {
      console.error("Erro ao buscar dados de manutenção do Firebase:", error);
    });

    return () => unsubscribe();
  }, []);

  const offlineCount = leads.filter(l => l.lastUpdate < Date.now() - 86400000).length;
  const onlineCount = leads.length - offlineCount;

  const sortedLeads = [...leads].sort((a, b) => {
    const aOffline = a.lastUpdate < Date.now() - 86400000;
    const bOffline = b.lastUpdate < Date.now() - 86400000;
    if (aOffline && !bOffline) return -1;
    if (!aOffline && bOffline) return 1;
    return a.lastUpdate - b.lastUpdate; // Sort by oldest update first if both are same status
  });

  return (
    <div className="flex flex-col bg-[#121212] min-h-[calc(100vh-64px)] p-6">
      <div className="mb-8 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#3b82f6] flex items-center gap-2 mb-2">
          <Wrench className="w-6 h-6" />
          Monitoramento e Manutenção (O&M)
        </h2>
        <p className="text-gray-400 text-sm">
          Acompanhe o status de comunicação dos inversores dos seus clientes em tempo real.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-7xl mx-auto w-full">
        <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-5 flex-1 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Plantas Monitoradas</p>
            <h3 className="text-white text-3xl font-black">{leads.length}</h3>
          </div>
          <Activity className="text-gray-500 w-10 h-10 opacity-30" />
        </div>
        <div className="bg-[#1a2e1a] border border-[#4dff88]/30 rounded-xl p-5 flex-1 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-green-400 text-xs uppercase tracking-wider font-semibold mb-1">Sistemas Online</p>
            <h3 className="text-green-400 text-3xl font-black">{onlineCount}</h3>
          </div>
          <Activity className="text-green-500 w-10 h-10 opacity-30" />
        </div>
        <div className="bg-[#4a0e0e] border border-[#ff4d4d]/30 rounded-xl p-5 flex-1 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-red-400 text-xs uppercase tracking-wider font-semibold mb-1">Sistemas Offline</p>
            <h3 className="text-red-400 text-3xl font-black">{offlineCount}</h3>
          </div>
          <AlertTriangle className="text-red-500 w-10 h-10 opacity-30" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        {sortedLeads.map(lead => (
          <StatusManutencao key={lead.id} lead={lead} onOpenWhatsApp={handleOpenWhatsApp} />
        ))}
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
