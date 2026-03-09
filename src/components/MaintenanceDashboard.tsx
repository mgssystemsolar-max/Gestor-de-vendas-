import React, { useState } from 'react';
import { Wrench, Activity, AlertTriangle } from 'lucide-react';

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

const StatusManutencao: React.FC<{ lead: MaintenanceLead }> = ({ lead }) => {
  // Simulação de lógica: Se não houver log há 24h, fica vermelho
  const isOffline = lead.lastUpdate < Date.now() - 86400000; 

  const abrirMonitoramento = (link: string) => {
    window.open(link, '_blank');
  };

  const enviarTecnico = (telefone: string) => {
    const texto = encodeURIComponent(`Olá ${lead.nome}, identificamos uma instabilidade na comunicação do seu inversor ${lead.modeloInversor}. Nossa equipe técnica entrará em contato para agendar uma verificação.`);
    window.open(`https://wa.me/${telefone}?text=${texto}`, '_blank');
  };

  const enviarRotaAoTecnico = (enderecoCliente: string, nomeTecnico: string = "Técnico") => {
    // Número placeholder para o técnico. Na vida real, poderia vir de um select ou input.
    const telefoneTecnico = "5511900000000"; 
    const urlMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCliente)}`;
    const mensagemZap = `MGS COMMAND: Olá ${nomeTecnico}, nova manutenção em: ${urlMaps}`;
    
    // Abre o WhatsApp do técnico com a localização do cliente
    window.open(`https://wa.me/${telefoneTecnico}?text=${encodeURIComponent(mensagemZap)}`, '_blank');
  };

  return (
    <div style={{ padding: '20px', borderRadius: '12px', background: isOffline ? '#4a0e0e' : '#1a2e1a', border: `1px solid ${isOffline ? '#ff4d4d' : '#4dff88'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
      <div className="flex justify-between items-start mb-3">
        <h4 style={{ color: '#fff', margin: '0', fontSize: '1.2rem', fontWeight: 'bold' }}>{lead.nome}</h4>
        {isOffline ? (
          <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 font-bold tracking-wide uppercase">
            <AlertTriangle size={14} /> Offline
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 font-bold tracking-wide uppercase">
            <Activity size={14} /> Online
          </span>
        )}
      </div>
      
      <div className="space-y-1 mb-4">
        <p style={{ fontSize: '14px', color: '#ccc', margin: '0' }}>Inversor: <span className="text-white font-medium">{lead.modeloInversor}</span></p>
        <p style={{ fontSize: '14px', color: '#ccc', margin: '0' }}>Endereço: <span className="text-white font-medium">{lead.endereco}</span></p>
        <p style={{ fontSize: '12px', color: '#888', margin: '0', marginTop: '4px' }}>
          Última atualização: {new Date(lead.lastUpdate).toLocaleString('pt-BR')}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => abrirMonitoramento(lead.linkPortal)} 
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 text-sm font-bold transition-transform hover:scale-105 active:scale-95"
          style={{ background: '#FFAB00', color: '#000', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
        >
          👁️ Ver Gráfico
        </button>
        <button 
          onClick={() => enviarTecnico(lead.telefone)} 
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 text-sm font-bold transition-transform hover:scale-105 active:scale-95"
          style={{ background: '#25D366', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
        >
          🛠️ Falar c/ Cliente
        </button>
        <button 
          onClick={() => enviarRotaAoTecnico(lead.endereco, 'Equipe Técnica')} 
          className="w-full flex items-center justify-center gap-2 text-sm font-bold transition-transform hover:scale-105 active:scale-95 mt-1"
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
        >
          📍 Enviar Rota ao Técnico
        </button>
      </div>
    </div>
  );
};

export function MaintenanceDashboard() {
  const [leads] = useState<MaintenanceLead[]>(mockMaintenanceLeads);

  const offlineCount = leads.filter(l => l.lastUpdate < Date.now() - 86400000).length;
  const onlineCount = leads.length - offlineCount;

  return (
    <div className="flex flex-col bg-[#121212] min-h-[calc(100vh-64px)] p-6">
      <div className="mb-8 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#FFAB00] flex items-center gap-2 mb-2">
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
        {leads.map(lead => (
          <StatusManutencao key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
