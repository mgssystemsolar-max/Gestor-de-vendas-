import React, { useState, useEffect } from 'react';
import { MessageCircle, Monitor, Smartphone, Copy, X, Check } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  defaultMessage?: string;
  contactName?: string;
}

export function WhatsAppModal({ isOpen, onClose, phone, defaultMessage = '', contactName }: WhatsAppModalProps) {
  const [message, setMessage] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessage(defaultMessage);
      setCopied(false);
    }
  }, [isOpen, defaultMessage]);

  if (!isOpen) return null;

  // Limpa o número de telefone (remove tudo que não for número)
  const cleanPhone = phone.replace(/\D/g, '');
  // Garante que tem o código do país (55 para Brasil)
  const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : (cleanPhone.length >= 10 ? `55${cleanPhone}` : cleanPhone);

  const encodedMessage = encodeURIComponent(message);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const openWeb = () => {
    window.open(`https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodedMessage}`, '_blank');
    onClose();
  };

  const openApp = () => {
    window.open(`whatsapp://send?phone=${finalPhone}&text=${encodedMessage}`, '_blank');
    onClose();
  };

  const openApi = () => {
    window.open(`https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodedMessage}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#25D366] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <MessageCircle className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">Enviar WhatsApp</h3>
              <p className="text-white/80 text-sm">
                {contactName ? `Para: ${contactName} (${finalPhone})` : finalPhone}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm font-medium">Mensagem:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 bg-[#121212] border border-[#333] rounded-xl p-3 text-white focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] resize-none text-sm"
              placeholder="Digite sua mensagem aqui..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <button
              onClick={openWeb}
              className="flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#333] text-white py-3 px-4 rounded-xl border border-[#444] transition-all font-medium text-sm group"
            >
              <Monitor className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" />
              WhatsApp Web
            </button>
            <button
              onClick={openApp}
              className="flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#333] text-white py-3 px-4 rounded-xl border border-[#444] transition-all font-medium text-sm group"
            >
              <Smartphone className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" />
              App Desktop/Mobile
            </button>
            <button
              onClick={openApi}
              className="flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#333] text-white py-3 px-4 rounded-xl border border-[#444] transition-all font-medium text-sm group sm:col-span-2"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" />
              Padrão (API Oficial)
            </button>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Mensagem'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
