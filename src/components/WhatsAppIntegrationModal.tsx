import React, { useState } from 'react';
import { Button } from './ui/Button';
import { MessageCircle, Copy, Check, X } from 'lucide-react';

export function WhatsAppIntegrationModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  // Use the current app URL for the iframe source
  const appUrl = window.location.origin;

  const scriptCode = `javascript:(function() {
  // MGS Solar - WhatsApp Web Extension
  const getWhatsAppContact = () => {
    // Tenta pegar o nome do contato ativo no WhatsApp Web
    const nameEl = document.querySelector('header [title]');
    return nameEl ? nameEl.getAttribute('title') : 'Cliente';
  };

  const getWhatsAppPhone = () => {
    // Tenta pegar o número do telefone se disponível (pode não estar visível dependendo da tela)
    // Em muitos casos no WhatsApp Web, o número fica no painel de info do contato
    return ''; // Deixe em branco para o usuário preencher ou adicione lógica avançada aqui
  };

  const clienteNome = encodeURIComponent(getWhatsAppContact());
  const clienteTelefone = encodeURIComponent(getWhatsAppPhone());

  // Remove iframe antigo se existir
  const oldIframe = document.getElementById('mgs-solar-iframe');
  if (oldIframe) oldIframe.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'mgs-solar-iframe';
  iframe.src = \`${appUrl}/?name=\${clienteNome}&phone=\${clienteTelefone}\`;
  
  // Estilos para posicionar o iframe no lado direito do WhatsApp Web
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.right = '0';
  iframe.style.width = '380px';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.borderLeft = '2px solid #FFAB00';
  iframe.style.zIndex = '9999';
  iframe.style.boxShadow = '-5px 0 15px rgba(0,0,0,0.2)';
  iframe.style.backgroundColor = '#121212';

  // Botão de fechar
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.position = 'fixed';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '390px';
  closeBtn.style.zIndex = '10000';
  closeBtn.style.background = '#FFAB00';
  closeBtn.style.color = '#000';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.width = '30px';
  closeBtn.style.height = '30px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontWeight = 'bold';
  closeBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
  
  closeBtn.onclick = () => {
    iframe.remove();
    closeBtn.remove();
  };

  document.body.appendChild(iframe);
  document.body.appendChild(closeBtn);
})();`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-[#333] bg-[#121212]">
          <h2 className="text-[#FFAB00] font-bold text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Integração WhatsApp Web
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <p className="text-gray-300 mb-4 text-sm leading-relaxed">
            Para usar o MGS Solar diretamente dentro do WhatsApp Web, você pode criar um <strong>Favorito (Bookmarklet)</strong> no seu navegador com o código abaixo. Ao clicar no favorito enquanto estiver no WhatsApp Web, o sistema abrirá em uma barra lateral, já puxando o nome do contato ativo!
          </p>

          <div className="bg-[#121212] rounded-lg border border-[#333] overflow-hidden relative">
            <div className="flex justify-between items-center px-4 py-2 bg-[#2a2a2a] border-b border-[#333]">
              <span className="text-xs text-gray-400 font-mono">bookmarklet.js</span>
              <button 
                onClick={handleCopy}
                className="text-xs flex items-center gap-1 text-[#FFAB00] hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar Código'}
              </button>
            </div>
            <pre className="p-4 text-xs text-gray-300 font-mono overflow-x-auto">
              <code>{scriptCode}</code>
            </pre>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-white font-semibold text-sm">Como instalar:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
              <li>Copie o código acima.</li>
              <li>No seu navegador (Chrome, Edge, etc), crie um novo Favorito (Bookmark).</li>
              <li>Nomeie como "MGS WhatsApp".</li>
              <li>No campo "URL" ou "Endereço", cole o código copiado.</li>
              <li>Abra o WhatsApp Web, selecione uma conversa e clique no favorito!</li>
            </ol>
          </div>
        </div>
        
        <div className="p-4 border-t border-[#333] bg-[#121212] flex justify-end">
          <Button onClick={onClose} className="bg-[#333] hover:bg-[#444] text-white">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
