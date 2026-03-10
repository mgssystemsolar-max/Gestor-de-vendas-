import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MessageCircle, User, Filter, BellRing, X, Calculator, CalendarPlus } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { WhatsAppModal } from './WhatsAppModal';
import { ActiveLead } from '../App';

interface Lead {
  id: string;
  nome: string;
  consumo: number;
  telefone: string;
  status: "Novo" | "Agendado" | "Proposta" | "Vistoria" | "Fechado";
  source: "WhatsApp" | "Website" | "Manual" | string;
  data_criacao: string;
  ultimo_contato: string;
  contacted?: boolean;
  valor_sistema: number;
  notas?: string;
  historico?: { data: string; acao: string }[];
  prioridade?: "NORMAL" | "URGENTE";
  ultima_mensagem?: string;
}

// Mock data
const initialLeads: Lead[] = [
  { id: '1', nome: 'João Silva', consumo: 450, telefone: '5511999999999', status: 'Novo', source: 'WhatsApp', data_criacao: new Date().toISOString(), ultimo_contato: new Date().toISOString(), valor_sistema: 12500, notas: "Cliente interessado em financiamento.", historico: [{ data: new Date().toISOString(), acao: "Lead criado via WhatsApp" }], prioridade: "URGENTE", ultima_mensagem: "Gostei da proposta, podemos fechar hoje?" },
  { id: '2', nome: 'Maria Oliveira', consumo: 800, telefone: '5511988888888', status: 'Proposta', source: 'Website', data_criacao: new Date(Date.now() - 86400000 * 4).toISOString(), ultimo_contato: new Date(Date.now() - 86400000 * 3).toISOString(), valor_sistema: 22000, historico: [{ data: new Date(Date.now() - 86400000 * 4).toISOString(), acao: "Lead criado via Website" }, { data: new Date(Date.now() - 86400000 * 3).toISOString(), acao: "Proposta enviada" }] },
  { id: '3', nome: 'Carlos Souza', consumo: 1200, telefone: '5511977777777', status: 'Vistoria', source: 'Manual', data_criacao: new Date(Date.now() - 86400000 * 10).toISOString(), ultimo_contato: new Date(Date.now() - 86400000 * 5).toISOString(), valor_sistema: 35000, notas: "Telhado colonial, verificar estrutura.", historico: [{ data: new Date(Date.now() - 86400000 * 10).toISOString(), acao: "Lead criado Manualmente" }, { data: new Date(Date.now() - 86400000 * 5).toISOString(), acao: "Vistoria agendada" }] },
  { id: '4', nome: 'Ana Santos', consumo: 350, telefone: '5511966666666', status: 'Fechado', source: 'WhatsApp', data_criacao: new Date(Date.now() - 86400000 * 35).toISOString(), ultimo_contato: new Date(Date.now() - 86400000 * 20).toISOString(), valor_sistema: 10500, historico: [{ data: new Date(Date.now() - 86400000 * 35).toISOString(), acao: "Lead criado via WhatsApp" }, { data: new Date(Date.now() - 86400000 * 20).toISOString(), acao: "Contrato assinado" }] },
  { id: '5', nome: 'Pedro Rocha', consumo: 600, telefone: '5511955555555', status: 'Novo', source: 'Website', data_criacao: new Date().toISOString(), ultimo_contato: new Date().toISOString(), valor_sistema: 18000, historico: [{ data: new Date().toISOString(), acao: "Lead criado via Website" }] },
];

export function CRM({ onNavigateToCalculator }: { onNavigateToCalculator?: (lead: ActiveLead) => void }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const isInitialLoad = useRef(true);
  const [newLeadAlert, setNewLeadAlert] = useState<{nome: string, source: string} | null>(null);
  
  // WhatsApp Modal State
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waModalData, setWaModalData] = useState({ phone: '', message: '', name: '' });
  
  // New Lead Modal State
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({ nome: '', telefone: '', consumo: '' });

  
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    
    const unsubscribe = onSnapshot(collection(db, 'leads_solar'), (snapshot) => {
      if (!snapshot.empty) {
        setIsFirebaseConnected(true);
        
        if (!isInitialLoad.current) {
          const addedDocs = snapshot.docChanges().filter(change => change.type === 'added');
          if (addedDocs.length > 0) {
            const newLeadData = addedDocs[0].doc.data();
            const nome = newLeadData.nome || 'Novo Lead';
            const source = newLeadData.origem || newLeadData.source || 'Website';
            
            setNewLeadAlert({ nome, source });
            
            // Push Notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Novo Lead Recebido!', {
                body: `${nome} acabou de chegar via ${source}.`,
                icon: '/logo-icon.svg'
              });
            }
            
            // Auto hide after 5 seconds
            setTimeout(() => {
              setNewLeadAlert(null);
            }, 5000);
            
            // Play sound
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(e => console.log('Audio play prevented by browser', e));
            } catch (e) {}
          }
        }
        
        const firebaseLeads: Lead[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nome: data.nome || 'Sem Nome',
            consumo: data.consumo_kwh || 0,
            telefone: data.telefone || doc.id,
            status: data.status || 'Novo',
            source: data.origem || data.source || 'Website',
            data_criacao: data.data_criacao || new Date().toISOString(),
            ultimo_contato: data.ultimo_contato || new Date().toISOString(),
            contacted: data.contacted || false,
            valor_sistema: data.valor_fatura ? data.valor_fatura * 12 : (data.valor_sistema || 0), // Estimativa se não tiver valor_sistema
            notas: data.notas || '',
            historico: data.historico || [],
            prioridade: data.prioridade || 'NORMAL',
            ultima_mensagem: data.ultima_mensagem || ''
          } as Lead;
        });
        setLeads(firebaseLeads);
        
        if (isInitialLoad.current) {
          isInitialLoad.current = false;
        }
      }
    }, (error) => {
      console.error("Erro ao buscar leads do Firebase:", error);
    });

    return () => unsubscribe();
  }, []);
  
  // Filters state
  const [filterMinKwh, setFilterMinKwh] = useState<string>('');
  const [filterMaxKwh, setFilterMaxKwh] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('All');
  const [filterDate, setFilterDate] = useState<string>('All Time');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  const columns = ["Novo", "Agendado", "Proposta", "Vistoria", "Fechado"] as const;

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.nome || !newLeadForm.telefone) return;

    const newLead = {
      nome: newLeadForm.nome,
      telefone: newLeadForm.telefone,
      consumo_kwh: parseInt(newLeadForm.consumo) || 0,
      status: 'Novo',
      origem: 'WhatsApp',
      data_criacao: new Date().toISOString(),
      ultimo_contato: new Date().toISOString(),
      contacted: true,
      historico: [{ data: new Date().toISOString(), acao: "Lead captado via WhatsApp (Manual)" }]
    };

    if (isFirebaseConnected && db) {
      try {
        await addDoc(collection(db, 'leads_solar'), newLead);
      } catch (error) {
        console.error("Erro ao criar lead:", error);
      }
    } else {
      const localLead: Lead = {
        id: Date.now().toString(),
        nome: newLead.nome,
        telefone: newLead.telefone,
        consumo: newLead.consumo_kwh,
        status: 'Novo',
        source: 'WhatsApp',
        data_criacao: newLead.data_criacao,
        ultimo_contato: newLead.ultimo_contato,
        contacted: true,
        valor_sistema: 0,
        historico: newLead.historico
      };
      setLeads(prev => [localLead, ...prev]);
    }

    setShowNewLeadModal(false);
    setNewLeadForm({ nome: '', telefone: '', consumo: '' });
  };

  const abrirNoWhats = async (telefone: string, id: string) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    setWaModalData({
      phone: telefone,
      message: `Olá ${lead.nome}, tudo bem? Sou da MgS Solar Command e vi que você tem interesse em energia solar.`,
      name: lead.nome
    });
    setWaModalOpen(true);
    
    if (lead.contacted) return;

    const newHistorico = lead.historico ? [...lead.historico] : [];
    newHistorico.push({ data: new Date().toISOString(), acao: "Marcado como Contato Realizado via WhatsApp" });

    if (isFirebaseConnected && db) {
      try {
        await updateDoc(doc(db, 'leads_solar', id), {
          contacted: true,
          historico: newHistorico
        });
      } catch (error) {
        console.error("Erro ao atualizar contato:", error);
      }
    } else {
      setLeads(prev => prev.map(l => 
        l.id === id ? { ...l, contacted: true, historico: newHistorico } : l
      ));
    }
  };

  const enviarOnboardingMGS = (telefone: string, nomeCliente: string) => {
    const textoBoasVindas = `*PARABÉNS! VOCÊ AGORA É MGS SOLAR!* ☀️\n\n` +
        `Olá ${nomeCliente}, ficamos muito felizes em iniciar sua jornada rumo à liberdade energética!\n\n` +
        `Para darmos entrada no processo de *Homologação junto à Concessionária*, preciso que me envie fotos dos seguintes documentos:\n` +
        `1️⃣ RG ou CNH (Frente e Verso)\n` +
        `2️⃣ Cópia do IPTU (Folha onde consta a área construída)\n` +
        `3️⃣ Foto do Padrão de Entrada (Onde fica o relógio)\n\n` +
        `Assim que enviar, nosso setor de engenharia já inicia o projeto técnico! 🚀`;

    setWaModalData({
      phone: telefone,
      message: textoBoasVindas,
      name: nomeCliente
    });
    setWaModalOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: Lead['status']) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    const newHistorico = lead.historico ? [...lead.historico] : [];
    newHistorico.push({ data: new Date().toISOString(), acao: `Movido para ${newStatus}` });
    
    if (isFirebaseConnected && db) {
      try {
        await updateDoc(doc(db, 'leads_solar', id), {
          status: newStatus,
          ultimo_contato: new Date().toISOString(),
          historico: newHistorico
        });
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
      }
    } else {
      setLeads(prev => prev.map(l => {
        if (l.id === id) {
          return { ...l, status: newStatus, ultimo_contato: new Date().toISOString(), historico: newHistorico };
        }
        return l;
      }));
    }
  };

  const handleSaveNote = async (id: string, nota: string) => {
    if (isFirebaseConnected && db) {
      try {
        await updateDoc(doc(db, 'leads_solar', id), {
          notas: nota
        });
      } catch (error) {
        console.error("Erro ao salvar nota:", error);
      }
    } else {
      setLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, notas: nota } : lead
      ));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLeadId(prev => prev === id ? null : id);
  };

  const togglePriority = async (id: string) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    const newPriority = lead.prioridade === "URGENTE" ? "NORMAL" : "URGENTE";
    const newHistorico = lead.historico ? [...lead.historico] : [];
    newHistorico.push({ data: new Date().toISOString(), acao: `Prioridade alterada para ${newPriority}` });

    if (isFirebaseConnected && db) {
      try {
        await updateDoc(doc(db, 'leads_solar', id), {
          prioridade: newPriority,
          historico: newHistorico
        });
      } catch (error) {
        console.error("Erro ao alterar prioridade:", error);
      }
    } else {
      setLeads(prev => prev.map(l => {
        if (l.id === id) {
          return { ...l, prioridade: newPriority, historico: newHistorico };
        }
        return l;
      }));
    }
  };

  const toggleContacted = async (id: string) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    const newContacted = !lead.contacted;
    const newHistorico = lead.historico ? [...lead.historico] : [];
    newHistorico.push({ data: new Date().toISOString(), acao: newContacted ? "Marcado como Contato Realizado" : "Marcado como Não Contatado" });

    if (isFirebaseConnected && db) {
      try {
        await updateDoc(doc(db, 'leads_solar', id), {
          contacted: newContacted,
          historico: newHistorico
        });
      } catch (error) {
        console.error("Erro ao alterar status de contato:", error);
      }
    } else {
      setLeads(prev => prev.map(l => 
        l.id === id ? { ...l, contacted: newContacted, historico: newHistorico } : l
      ));
    }
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

  const totalEmPropostas = leads
    .filter(l => l.status === "Proposta")
    .reduce((acc, lead) => acc + (lead.valor_sistema || 0), 0);

  const totalFechado = leads
    .filter(l => l.status === "Fechado")
    .reduce((acc, lead) => acc + (lead.valor_sistema || 0), 0);

  const conversao = totalEmPropostas + totalFechado > 0 
    ? ((totalFechado / (totalEmPropostas + totalFechado)) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="flex flex-col bg-[#121212] min-h-[calc(100vh-64px)] relative">
      
      {/* Toast Notification */}
      {newLeadAlert && (
        <div className="absolute top-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#1e1e1e] border-2 border-[#3b82f6] rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] p-4 flex items-start gap-4 max-w-sm">
            <div className="bg-[#3b82f6]/20 p-2 rounded-full text-[#3b82f6] animate-pulse">
              <BellRing size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-lg m-0">Novo Lead Recebido!</h4>
              <p className="text-gray-300 text-sm mt-1">
                <strong className="text-[#3b82f6]">{newLeadAlert.nome}</strong> acabou de chegar via {newLeadAlert.source}.
              </p>
            </div>
            <button 
              onClick={() => setNewLeadAlert(null)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Summary */}
      <div className="flex flex-wrap justify-around p-5 bg-[#1c1c1c] border-b-2 border-[#3b82f6] shadow-md relative">
        <div className="text-center px-4 py-2">
          <p className="text-[#bbb] m-0 text-sm uppercase tracking-wider font-semibold">Pipeline Ativo (Propostas)</p>
          <h2 className="text-[#3b82f6] text-3xl font-bold mt-1">R$ {totalEmPropostas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
        <div className="text-center px-4 py-2">
          <p className="text-[#bbb] m-0 text-sm uppercase tracking-wider font-semibold">Vendas do Mês (Fechado)</p>
          <h2 className="text-[#25D366] text-3xl font-bold mt-1">R$ {totalFechado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
        <div className="text-center px-4 py-2">
          <p className="text-[#bbb] m-0 text-sm uppercase tracking-wider font-semibold">Conversão</p>
          <h2 className="text-white text-3xl font-bold mt-1">{conversao}%</h2>
        </div>
        
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setShowNewLeadModal(true)}
            className="bg-[#25D366] hover:bg-[#1da851] text-white px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 transition-colors shadow-lg"
          >
            <MessageCircle size={16} />
            Novo Lead (WhatsApp)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1e1e1e] p-4 m-5 rounded-lg border border-[#333] flex flex-wrap gap-4 items-end shadow-md">
        <div className="flex items-center gap-2 text-[#3b82f6] font-semibold mr-4">
          <Filter size={20} />
          <span>Filtros</span>
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Consumo Min (kWh)</label>
          <input 
            type="number" 
            value={filterMinKwh}
            onChange={(e) => setFilterMinKwh(e.target.value)}
            className="bg-[#2a2a2a] border border-[#444] text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#3b82f6] w-28"
            placeholder="Ex: 300"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Consumo Max (kWh)</label>
          <input 
            type="number" 
            value={filterMaxKwh}
            onChange={(e) => setFilterMaxKwh(e.target.value)}
            className="bg-[#2a2a2a] border border-[#444] text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#3b82f6] w-28"
            placeholder="Ex: 1000"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Origem</label>
          <select 
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-[#2a2a2a] border border-[#444] text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#3b82f6] w-32"
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
            className="bg-[#2a2a2a] border border-[#444] text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#3b82f6] w-32"
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
            className="bg-[#2a2a2a] border border-[#444] text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#3b82f6] w-32"
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
              <h3 className="text-[#3b82f6] text-center border-b border-[#333] pb-2 mb-4 font-bold uppercase tracking-wider flex justify-between items-center px-2">
                {status}
                <span className="bg-[#333] text-white text-xs py-0.5 px-2 rounded-full">
                  {columnLeads.length}
                </span>
              </h3>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {columnLeads.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-4 italic">Nenhum lead encontrado</div>
                ) : (
                  columnLeads.map(lead => {
                    const dataEnvio = new Date(lead.ultimo_contato);
                    const hoje = new Date();
                    const horasPassadas = Math.abs(hoje.getTime() - dataEnvio.getTime()) / 36e5;
                    const taParado = horasPassadas > 48 && lead.status === "Proposta";
                    const isQuente = lead.prioridade === "URGENTE";

                    let cardClasses = "p-4 rounded-md text-white transition-colors border relative group ";
                    if (taParado) {
                      cardClasses += "bg-[#4a0000] border-[#ff0000] animate-pulse shadow-sm";
                    } else if (isQuente) {
                      cardClasses += "bg-[#222] border-[#3b82f6] border-2 shadow-[0_0_15px_rgba(59,130,246,0.5)]";
                    } else if (lead.contacted) {
                      cardClasses += "bg-[#1a2e1f] border-[#25D366] hover:bg-[#1f3825] shadow-sm";
                    } else {
                      cardClasses += "bg-[#2a2a2a] border-[#333] hover:bg-[#333] shadow-sm";
                    }

                    const isExpanded = expandedLeadId === lead.id;

                    return (
                    <div key={lead.id} className={cardClasses}>
                      {isQuente && (
                        <span className="absolute -top-3 -right-3 bg-[#3b82f6] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md z-10">
                          🔥 INTERESSE DETECTADO
                        </span>
                      )}
                      <div 
                        className="flex items-center gap-2 mb-2 cursor-pointer"
                        onClick={() => toggleExpand(lead.id)}
                      >
                        <div className="bg-[#3b82f6] p-1 rounded-full text-white">
                          <User size={14} />
                        </div>
                        <strong className="text-lg truncate pr-16 hover:text-[#3b82f6] transition-colors">{lead.nome}</strong>
                      </div>
                      
                      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-500">{formatDate(lead.data_criacao)}</span>
                        {lead.contacted && !taParado && (
                          <span className="text-[10px] bg-[#25D366]/20 text-[#25D366] px-1.5 py-0.5 rounded border border-[#25D366]/30">
                            Contato Realizado
                          </span>
                        )}
                      </div>

                      <div className="pl-8 mb-4 space-y-1">
                        <p className="text-sm text-gray-400">Consumo: <span className="text-gray-200">{lead.consumo} kWh</span></p>
                        <p className="text-sm text-gray-400">Origem: <span className="text-gray-200">{lead.source}</span></p>
                        <p className="text-sm text-gray-400">Valor: <span className="text-[#3b82f6] font-medium">R$ {lead.valor_sistema.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                        
                        {lead.ultima_mensagem && (
                          <p className="text-sm text-gray-300 italic mt-2 border-l-2 border-[#3b82f6] pl-2">"{lead.ultima_mensagem}"</p>
                        )}

                        <div className="mt-3 pt-3 border-t border-[#444] flex items-center gap-2">
                          <span className="text-xs text-gray-500">Mover para:</span>
                          <select 
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                            className="bg-[#1e1e1e] border border-[#555] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#3b82f6] flex-1"
                          >
                            {columns.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>

                        {taParado && (
                          <p className="text-xs text-[#ff6b6b] font-medium mt-2">
                            ⚠️ Parado há {Math.floor(horasPassadas / 24)} dias
                          </p>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#444] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Prioridade</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePriority(lead.id);
                              }}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${
                                isQuente 
                                  ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/30' 
                                  : 'bg-[#333] border-[#555] text-gray-300 hover:bg-[#444]'
                              }`}
                            >
                              {isQuente ? '🔥 URGENTE' : 'Marcar como Urgente'}
                            </button>
                          </div>

                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Status de Contato</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleContacted(lead.id);
                              }}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${
                                lead.contacted 
                                  ? 'bg-[#25D366]/20 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/30' 
                                  : 'bg-[#333] border-[#555] text-gray-300 hover:bg-[#444]'
                              }`}
                            >
                              {lead.contacted ? '✅ Contato Realizado' : 'Marcar como Contatado'}
                            </button>
                          </div>

                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Notas do Lead</label>
                            <textarea 
                              className="w-full bg-[#1e1e1e] border border-[#555] text-white text-sm rounded p-2 focus:outline-none focus:border-[#3b82f6] min-h-[60px] resize-y"
                              placeholder="Adicione notas sobre o cliente..."
                              defaultValue={lead.notas || ''}
                              onBlur={(e) => handleSaveNote(lead.id, e.target.value)}
                            />
                            <p className="text-[10px] text-gray-500 mt-1 text-right">Salva automaticamente ao sair do campo</p>
                          </div>

                          <div>
                            <label className="text-xs text-gray-500 mb-2 block">Histórico de Atividades</label>
                            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                              {lead.historico && lead.historico.length > 0 ? (
                                lead.historico.slice().reverse().map((item, index) => (
                                  <div key={index} className="flex flex-col bg-[#1e1e1e] p-2 rounded border border-[#333]">
                                    <span className="text-[10px] text-gray-500">{formatDate(item.data)}</span>
                                    <span className="text-xs text-gray-300">{item.acao}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-500 italic">Nenhum histórico registrado.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-2 mt-4">
                        {lead.status === 'Novo' && (
                          <button 
                            onClick={() => handleStatusChange(lead.id, 'Vistoria')}
                            className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                          >
                            <CalendarPlus size={16} />
                            Agendar Vistoria
                          </button>
                        )}
                        
                        {(lead.status === 'Novo' || lead.status === 'Vistoria' || lead.status === 'Agendado') && (
                          <button 
                            onClick={() => onNavigateToCalculator?.({
                              id: lead.id,
                              nome: lead.nome,
                              telefone: lead.telefone,
                              consumo: lead.consumo
                            })}
                            className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                          >
                            <Calculator size={16} />
                            Gerar Proposta (Calculadora)
                          </button>
                        )}

                        {lead.status === 'Fechado' && (
                          <button 
                            onClick={() => enviarOnboardingMGS(lead.telefone, lead.nome)} 
                            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                          >
                            <MessageCircle size={16} />
                            Enviar Onboarding
                          </button>
                        )}
                        <button 
                          onClick={() => abrirNoWhats(lead.telefone, lead.id)} 
                          className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                        >
                          <MessageCircle size={16} />
                          {taParado ? 'COBRAR AGORA (WhatsApp)' : 'Abrir Chat'}
                        </button>
                      </div>
                    </div>
                  )})
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <WhatsAppModal 
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        phone={waModalData.phone}
        defaultMessage={waModalData.message}
        contactName={waModalData.name}
      />

      {/* New Lead Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#25D366] p-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Novo Lead via WhatsApp
              </h3>
              <button 
                onClick={() => setShowNewLeadModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLead} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1 block">Nome do Cliente *</label>
                <input 
                  type="text" 
                  required
                  value={newLeadForm.nome}
                  onChange={e => setNewLeadForm({...newLeadForm, nome: e.target.value})}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-white focus:outline-none focus:border-[#25D366] text-sm"
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1 block">Telefone (WhatsApp) *</label>
                <input 
                  type="tel" 
                  required
                  value={newLeadForm.telefone}
                  onChange={e => setNewLeadForm({...newLeadForm, telefone: e.target.value})}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-white focus:outline-none focus:border-[#25D366] text-sm"
                  placeholder="Ex: 5511999999999"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium mb-1 block">Consumo Estimado (kWh) - Opcional</label>
                <input 
                  type="number" 
                  value={newLeadForm.consumo}
                  onChange={e => setNewLeadForm({...newLeadForm, consumo: e.target.value})}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-white focus:outline-none focus:border-[#25D366] text-sm"
                  placeholder="Ex: 450"
                />
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#333] transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#25D366] hover:bg-[#1da851] text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg"
                >
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
