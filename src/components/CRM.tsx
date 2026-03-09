import React, { useState, useMemo } from 'react';
import { MessageCircle, User, Filter } from 'lucide-react';

interface Lead {
  id: string;
  nome: string;
  consumo: number;
  telefone: string;
  status: "Novo" | "Proposta" | "Vistoria" | "Fechado";
  source: "WhatsApp" | "Website" | "Manual";
  data_criacao: string;
}

// Mock data
const initialLeads: Lead[] = [
  { id: '1', nome: 'João Silva', consumo: 450, telefone: '5511999999999', status: 'Novo', source: 'WhatsApp', data_criacao: new Date().toISOString() },
  { id: '2', nome: 'Maria Oliveira', consumo: 800, telefone: '5511988888888', status: 'Proposta', source: 'Website', data_criacao: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '3', nome: 'Carlos Souza', consumo: 1200, telefone: '5511977777777', status: 'Vistoria', source: 'Manual', data_criacao: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: '4', nome: 'Ana Santos', consumo: 350, telefone: '5511966666666', status: 'Fechado', source: 'WhatsApp', data_criacao: new Date(Date.now() - 86400000 * 35).toISOString() },
  { id: '5', nome: 'Pedro Rocha', consumo: 600, telefone: '5511955555555', status: 'Novo', source: 'Website', data_criacao: new Date().toISOString() },
];

export function CRM() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  
  // Filters state
  const [filterMinKwh, setFilterMinKwh] = useState<string>('');
  const [filterMaxKwh, setFilterMaxKwh] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('All');
  const [filterDate, setFilterDate] = useState<string>('All Time');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const columns = ["Novo", "Proposta", "Vistoria", "Fechado"] as const;

  const abrirNoWhats = (telefone: string) => {
    window.open(`https://wa.me/${telefone}`, '_blank');
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Consumption
      if (filterMinKwh && lead.consumo < parseInt(filterMinKwh)) return false;
      if (filterMaxKwh && lead.consumo > parseInt(filterMaxKwh)) return false;
      
      // Source
      if (filterSource !== 'All' && lead.source !== filterSource) return false;
      
      // Status
      if (filterStatus !== 'All' && lead.status !== filterStatus) return false;
      
      // Date
      if (filterDate !== 'All Time') {
        const leadDate = new Date(lead.data_criacao);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - leadDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (filterDate === 'Today' && diffDays > 1) return false;
        if (filterDate === 'This Week' && diffDays > 7) return false;
        if (filterDate === 'This Month' && diffDays > 30) return false;
      }
      
      return true;
    });
  }, [leads, filterMinKwh, filterMaxKwh, filterSource, filterDate, filterStatus]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col bg-[#121212] min-h-[calc(100vh-64px)]">
      
      {/* Filter Bar */}
      <div className="bg-[#1e1e1e] p-4 m-5 rounded-lg border border-[#333] flex flex-wrap gap-4 items-end shadow-md">
        <div className="flex items-center gap-2 text-[#FFAB00] font-semibold mr-4">
          <Filter size={20} />
          <span>Filtros</span>
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Consumo Min (kWh)</label>
          <input 
            type="number" 
            value={filterMinKwh}
            onChange={(e) => setFilterMinKwh(e.target.value)}
            className="bg-[#2a2a2a] border border-[#444] text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#FFAB00] w-28"
            placeholder="Ex: 300"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Consumo Max (kWh)</label>
          <input 
            type="number" 
            value={filterMaxKwh}
            onChange={(e) => setFilterMaxKwh(e.target.value)}
            className="bg-[#2a2a2a] border border-[#444] text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#FFAB00] w-28"
            placeholder="Ex: 1000"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Origem</label>
          <select 
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-[#2a2a2a] border border-[#444] text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#FFAB00] w-32"
          >
            <option value="All">Todas</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Website">Website</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Data de Criação</label>
          <select 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-[#2a2a2a] border border-[#444] text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#FFAB00] w-32"
          >
            <option value="All Time">Todo Período</option>
            <option value="Today">Hoje</option>
            <option value="This Week">Esta Semana</option>
            <option value="This Month">Este Mês</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Status</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#2a2a2a] border border-[#444] text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#FFAB00] w-32"
          >
            <option value="All">Todos</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
        
        <div className="ml-auto flex items-center">
          <button 
            onClick={() => {
              setFilterMinKwh('');
              setFilterMaxKwh('');
              setFilterSource('All');
              setFilterDate('All Time');
              setFilterStatus('All');
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex flex-col md:flex-row gap-5 px-5 pb-5 flex-1 overflow-x-auto">
        {columns.map(status => {
          // If a specific status is filtered, hide the other columns
          if (filterStatus !== 'All' && filterStatus !== status) return null;
          
          const columnLeads = filteredLeads.filter(l => l.status === status);
          
          return (
            <div key={status} className="flex-1 min-w-[280px] bg-[#1e1e1e] rounded-lg p-3 border border-[#333] flex flex-col">
              <h3 className="text-[#FFAB00] text-center border-b border-[#333] pb-2 mb-4 font-bold uppercase tracking-wider flex justify-between items-center px-2">
                {status}
                <span className="bg-[#333] text-white text-xs py-0.5 px-2 rounded-full">
                  {columnLeads.length}
                </span>
              </h3>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {columnLeads.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-4 italic">Nenhum lead encontrado</div>
                ) : (
                  columnLeads.map(lead => (
                    <div key={lead.id} className="bg-[#2a2a2a] p-4 rounded-md text-white shadow-sm hover:bg-[#333] transition-colors border border-[#333] relative group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-[#FFAB00] p-1 rounded-full text-black">
                          <User size={14} />
                        </div>
                        <strong className="text-lg truncate pr-16">{lead.nome}</strong>
                      </div>
                      
                      <div className="absolute top-4 right-4 text-xs text-gray-500">
                        {formatDate(lead.data_criacao)}
                      </div>

                      <div className="pl-8 mb-4 space-y-1">
                        <p className="text-sm text-gray-400">Consumo: <span className="text-gray-200">{lead.consumo} kWh</span></p>
                        <p className="text-sm text-gray-400">Origem: <span className="text-gray-200">{lead.source}</span></p>
                      </div>
                      
                      <button 
                        onClick={() => abrirNoWhats(lead.telefone)} 
                        className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-medium py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <MessageCircle size={16} />
                        Abrir Chat
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
