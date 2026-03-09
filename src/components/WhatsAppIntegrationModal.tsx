import React, { useState } from 'react';
import { Button } from './ui/Button';
import { MessageCircle, Copy, Check, X } from 'lucide-react';

export function WhatsAppIntegrationModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  // Use the specific AI Studio Shared App URL for the iframe source
  const appUrl = "https://ais-pre-wy73vu6wzi75idzzfgoc75-48065362790.us-east1.run.app";

  const scriptCode = `javascript:(function() {
  const gestorURL = "https://ais-pre-wy73vu6wzi75idzzfgoc75-48065362790.us-east1.run.app/";
  
  // Tenta extrair o nome do contato ativo no WhatsApp Web (opcional)
  let contatoNome = "";
  try {
    const headerEl = document.querySelector('header');
    if (headerEl) {
      const titleEl = headerEl.querySelector('span[dir="auto"]');
      if (titleEl) contatoNome = titleEl.textContent;
    }
  } catch(e) {}

  const urlComParametros = \`\${gestorURL}?origem=extensao&venda=true\${contatoNome ? '&nome=' + encodeURIComponent(contatoNome) : ''}\`;
  
  // Abre o MGS Solar Command em uma janela popup lateral
  const width = 450;
  const height = window.screen.height;
  const left = window.screen.width - width;
  
  window.open(urlComParametros, 'MGS_Solar_Command', \`width=\${width},height=\${height},left=\${left},top=0,menubar=no,toolbar=no,location=no,status=no\`);
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
