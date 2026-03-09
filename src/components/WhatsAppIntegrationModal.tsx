import React, { useState } from 'react';
import { Button } from './ui/Button';
import { MessageCircle, Copy, Check, X } from 'lucide-react';

export function WhatsAppIntegrationModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  // Use the specific Vercel URL for the iframe source
  const appUrl = "https://gestor-de-vendas-93wk-8xwbkcggk-marcio-s-projects-9de18685.vercel.app";

  const scriptCode = `javascript:(function() {
  // Remove iframe antigo se existir
  const oldIframe = document.getElementById('mgs-solar-iframe');
  if (oldIframe) oldIframe.remove();
  const oldBtn = document.getElementById('mgs-solar-close');
  if (oldBtn) oldBtn.remove();

  const gestorURL = "https://gestor-de-vendas-93wk-8xwbkcggk-marcio-s-projects-9de18685.vercel.app/";
  
  // Criar o Iframe que aparece ao lado do chat do cliente
  const iframeMGS = document.createElement('iframe');
  iframeMGS.id = 'mgs-solar-iframe';
  iframeMGS.src = \`\${gestorURL}?origem=extensao&venda=true\`;
  iframeMGS.style.cssText = "width:400px; height:100%; border:none; border-left:2px solid #FFAB00; position:fixed; right:0; top:0; z-index:9999; box-shadow:-5px 0 15px rgba(0,0,0,0.2); background-color:#121212;";
  
  // Botão de fechar
  const closeBtn = document.createElement('button');
  closeBtn.id = 'mgs-solar-close';
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = "position:fixed; top:10px; right:410px; z-index:10000; background:#FFAB00; color:#000; border:none; border-radius:50%; width:30px; height:30px; cursor:pointer; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.3);";
  
  closeBtn.onclick = () => {
    iframeMGS.remove();
    closeBtn.remove();
  };

  document.body.appendChild(iframeMGS);
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
