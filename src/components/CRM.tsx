import React, { useState } from 'react';
import { MessageCircle, User } from 'lucide-react';

interface Lead {
  id: string;
  nome: string;
  consumo: number;
  telefone: string;
  status: "Novo" | "Proposta" | "Vistoria" | "Fechado";
}

// Mock data
const initialLeads: Lead[] = [
  { id: '1', nome: 'João Silva', consumo: 450, telefone: '5511999999999', status: 'Novo' },
  { id: '2', nome: 'Maria Oliveira', consumo: 800, telefone: '5511988888888', status: 'Proposta' },
  { id: '3', nome: 'Carlos Souza', consumo: 1200, telefone: '5511977777777', status: 'Vistoria' },
  { id: '4', nome: 'Ana Santos', consumo: 350, telefone: '5511966666666', status: 'Fechado' },
  { id: '5', nome: 'Pedro Rocha', consumo: 600, telefone: '5511955555555', status: 'Novo' },
];

export function CRM() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const columns = ["Novo", "Proposta", "Vistoria", "Fechado"] as const;

  const abrirNoWhats = (telefone: string) => {
    window.open(`https://wa.me/${telefone}`, '_blank');
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 p-5 bg-[#121212] min-h-[calc(100vh-64px)] overflow-x-auto">
      {columns.map(status => (
        <div key={status} className="flex-1 min-w-[250px] bg-[#1e1e1e] rounded-lg p-3 border border-[#333]">
          <h3 className="text-[#FFAB00] text-center border-b border-[#333] pb-2 mb-4 font-bold uppercase tracking-wider flex justify-between items-center px-2">
            {status}
            <span className="bg-[#333] text-white text-xs py-0.5 px-2 rounded-full">
              {leads.filter(l => l.status === status).length}
            </span>
          </h3>
          
          <div className="space-y-3">
            {leads.filter(l => l.status === status).map(lead => (
              <div key={lead.id} className="bg-[#2a2a2a] p-4 rounded-md text-white shadow-sm hover:bg-[#333] transition-colors border border-[#333]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#FFAB00] p-1 rounded-full text-black">
                    <User size={14} />
                  </div>
                  <strong className="text-lg">{lead.nome}</strong>
                </div>
                <p className="text-sm text-gray-400 mb-4 pl-8">Consumo: {lead.consumo} kWh</p>
                <button 
                  onClick={() => abrirNoWhats(lead.telefone)} 
                  className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-medium py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <MessageCircle size={16} />
                  Abrir Chat
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
