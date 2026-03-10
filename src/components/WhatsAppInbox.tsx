import React, { useState } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Send, Phone, Video, Info, Check, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  agent: string;
  messages: Message[];
}

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    name: 'João Silva (Lead)',
    avatar: 'https://i.pravatar.cc/150?u=1',
    lastMessage: 'Gostaria de um orçamento para 500kWh',
    time: '10:30',
    unread: 2,
    agent: 'Vendedor 1',
    messages: [
      { id: 'm1', text: 'Olá, bom dia!', sender: 'them', time: '10:28' },
      { id: 'm2', text: 'Gostaria de um orçamento para 500kWh', sender: 'them', time: '10:30' },
    ]
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    avatar: 'https://i.pravatar.cc/150?u=2',
    lastMessage: 'Ok, aguardo o contrato.',
    time: 'Ontem',
    unread: 0,
    agent: 'Vendedor 2',
    messages: [
      { id: 'm1', text: 'O contrato já foi enviado para o seu email.', sender: 'me', time: '15:00', status: 'read' },
      { id: 'm2', text: 'Ok, aguardo o contrato.', sender: 'them', time: '15:05' },
    ]
  },
  {
    id: '3',
    name: 'Carlos Santos',
    avatar: 'https://i.pravatar.cc/150?u=3',
    lastMessage: 'A equipe de instalação chega que horas?',
    time: 'Ontem',
    unread: 1,
    agent: 'Suporte',
    messages: [
      { id: 'm1', text: 'A equipe de instalação chega que horas?', sender: 'them', time: '18:20' },
    ]
  }
];

const AGENTS = ['Todos', 'Vendedor 1', 'Vendedor 2', 'Suporte'];

export function WhatsAppInbox() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<string>('Todos');
  const [messageText, setMessageText] = useState('');

  const filteredChats = MOCK_CHATS.filter(chat => 
    activeAgent === 'Todos' || chat.agent === activeAgent
  );

  const currentChat = MOCK_CHATS.find(c => c.id === activeChat);

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#111b21] text-[#e9edef] overflow-hidden">
      {/* Sidebar */}
      <div className="w-[30%] min-w-[300px] border-r border-[#222d34] flex flex-col bg-[#111b21]">
        {/* Header */}
        <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 py-2 border-b border-[#222d34]">
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/150?u=admin" alt="Profile" className="w-10 h-10 rounded-full" />
            <span className="font-semibold">WhatsApp Inbox</span>
          </div>
          <div className="flex gap-4 text-[#aebac1]">
            <MoreVertical className="w-5 h-5 cursor-pointer" />
          </div>
        </div>

        {/* Agent Filter */}
        <div className="bg-[#111b21] p-2 border-b border-[#222d34]">
          <select 
            className="w-full bg-[#202c33] text-[#e9edef] text-sm rounded-lg p-2 outline-none border border-[#222d34]"
            value={activeAgent}
            onChange={(e) => setActiveAgent(e.target.value)}
          >
            {AGENTS.map(agent => (
              <option key={agent} value={agent}>{agent === 'Todos' ? 'Todos os Atendentes' : `Atendente: ${agent}`}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-[#222d34]">
          <div className="bg-[#202c33] rounded-lg flex items-center px-3 py-1.5">
            <Search className="w-4 h-4 text-[#aebac1] mr-3" />
            <input 
              type="text" 
              placeholder="Pesquisar ou começar uma nova conversa" 
              className="bg-transparent border-none outline-none text-sm w-full text-[#e9edef] placeholder-[#aebac1]"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`flex items-center px-3 py-3 cursor-pointer hover:bg-[#202c33] transition-colors ${activeChat === chat.id ? 'bg-[#2a3942]' : ''}`}
            >
              <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full mr-3" />
              <div className="flex-1 border-b border-[#222d34] pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-[15px]">{chat.name}</span>
                  <span className={`text-xs ${chat.unread > 0 ? 'text-[#00a884]' : 'text-[#aebac1]'}`}>{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#aebac1] truncate max-w-[180px]">{chat.lastMessage}</span>
                  {chat.unread > 0 && (
                    <span className="bg-[#00a884] text-[#111b21] text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {currentChat ? (
        <div className="flex-1 flex flex-col bg-[#0b141a] relative">
          {/* Chat Header */}
          <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 py-2 border-b border-[#222d34] z-10">
            <div className="flex items-center gap-3">
              <img src={currentChat.avatar} alt={currentChat.name} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-medium">{currentChat.name}</div>
                <div className="text-xs text-[#aebac1]">Atendido por: {currentChat.agent}</div>
              </div>
            </div>
            <div className="flex gap-4 text-[#aebac1]">
              <Search className="w-5 h-5 cursor-pointer" />
              <MoreVertical className="w-5 h-5 cursor-pointer" />
            </div>
          </div>

          {/* Messages Background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QZ3O2M2K.png")', backgroundRepeat: 'repeat' }}></div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 custom-scrollbar">
            {currentChat.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[65%] rounded-lg px-3 py-1.5 relative ${msg.sender === 'me' ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#202c33] text-[#e9edef]'}`}>
                  <span className="text-[14.2px] leading-relaxed">{msg.text}</span>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[11px] text-[#8696a0]">{msg.time}</span>
                    {msg.sender === 'me' && (
                      <span className="text-[#53bdeb]">
                        <CheckCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="min-h-[62px] bg-[#202c33] flex items-end px-4 py-2.5 gap-3 z-10">
            <div className="flex gap-3 text-[#aebac1] pb-2">
              <Smile className="w-6 h-6 cursor-pointer" />
              <Paperclip className="w-6 h-6 cursor-pointer" />
            </div>
            <div className="flex-1 bg-[#2a3942] rounded-lg">
              <textarea 
                rows={1}
                placeholder="Digite uma mensagem"
                className="w-full bg-transparent text-[#e9edef] px-4 py-2.5 outline-none resize-none max-h-32"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
            <div className="text-[#aebac1] pb-2">
              {messageText.trim() ? (
                <div className="bg-[#00a884] p-2 rounded-full text-[#111b21] cursor-pointer">
                  <Send className="w-5 h-5 ml-0.5" />
                </div>
              ) : (
                <div className="p-2">
                  <Phone className="w-6 h-6 cursor-pointer" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#222d34] border-b-[6px] border-[#00a884]">
          <div className="text-center max-w-md">
            <MessageCircle className="w-24 h-24 text-[#aebac1] mx-auto mb-6 opacity-20" />
            <h2 className="text-3xl font-light text-[#e9edef] mb-4">WhatsApp Integrado</h2>
            <p className="text-[#8696a0] text-sm leading-relaxed">
              Envie e receba mensagens sem precisar manter seu celular conectado.
              <br/>
              Use o filtro lateral para separar os atendimentos de cada vendedor.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
