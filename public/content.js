// MGS SOLAR COMMAND - WhatsApp Integration
// Injected Sidebar and CRM Linker

// Função para criar a Barra Lateral do MGS SOLAR COMMAND
function injectMGSPanel() {
  if (document.getElementById('mgs-solar-sidebar')) return;

  const sidebar = document.createElement('div');
  sidebar.id = 'mgs-solar-sidebar';
  sidebar.style.cssText = `
    position: fixed; right: 0; top: 0; width: 350px; height: 100%;
    background: #f0f2f5; z-index: 9999; border-left: 2px solid #ffaa00;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1); display: flex; flex-direction: column;
  `;

  // Cabeçalho do Painel
  sidebar.innerHTML = `
    <div style="background:#1c1c1c; color:#ffaa00; padding:15px; font-weight:bold; text-align:center; font-family: sans-serif;">
      MGS SOLAR COMMAND ☀️
    </div>
    <iframe id="mgs-iframe" src="https://mg-s-solar-pro.vercel.app/crm" style="flex:1; border:none;"></iframe>
  `;

  document.body.appendChild(sidebar);
  
  // Ajusta o layout do WhatsApp para não cobrir o painel (opcional)
  document.body.style.marginRight = "350px";
}

// Captura o número do cliente toda vez que você muda de chat
setInterval(() => {
  const header = document.querySelector('header');
  if (header) {
    const titleElement = header.querySelector('span[title]');
    if (titleElement) {
      const clientName = titleElement.title;
      const iframe = document.getElementById('mgs-iframe');
      
      // Aqui você envia o nome/número para o seu Vercel
      // O seu sistema no Vercel deve estar preparado para receber o parâmetro 'cliente'
      const targetUrl = `https://mg-s-solar-pro.vercel.app/crm?cliente=${encodeURIComponent(clientName)}`;
      
      if (iframe && iframe.src !== targetUrl) {
        iframe.src = targetUrl;
        console.log("MGS COMMAND: Carregando dados de", clientName);
      }
    }
  }
}, 3000);

// Tenta injetar imediatamente e também ao carregar
injectMGSPanel();
window.addEventListener('load', injectMGSPanel);

// Função para o MGS COMMAND escrever e enviar mensagens sozinho
function mgsSendMessage(texto) {
    const chatInput = document.querySelector('div[contenteditable="true"][data-tab="10"]');
    if (chatInput) {
        chatInput.focus();
        document.execCommand('insertText', false, texto);
        
        // Espera um pouco para o WhatsApp processar o texto e clica no botão de enviar
        setTimeout(() => {
            const sendBtn = document.querySelector('span[data-icon="send"]');
            if (sendBtn) sendBtn.click();
        }, 300);
    } else {
        console.error("MGS COMMAND: Não foi possível encontrar a caixa de texto do WhatsApp.");
    }
}

// Listener para receber comandos do popup ou background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PASTE_PROPOSAL") {
    mgsSendMessage(request.data);
    sendResponse({ status: "success" });
  }
});
